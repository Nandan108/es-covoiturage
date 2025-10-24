<?php

namespace App\Models;

use Database\Factories\EventFactory;
use Deligoez\LaravelModelHashId\Traits\HasHashId;
use Deligoez\LaravelModelHashId\Traits\HasHashIdRouting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use PHPHtmlParser\Dom;

/**
 * @property int    $id
 * @property string $name
 * @property string $type
 * @property int    $days
 * @property int    $image_id
 * @property string $loc_name
 * @property string $loc_address
 * @property float  $loc_lat
 * @property float  $loc_lng
 * @property int    $original_event_id
 * @property string $start_date
 * @property string $loc_original_link
 * @property bool   $private
 * @property Image  $picture
 * @property string $image_url
 */
final class Event extends Model
{
    use HasHashId;
    use HasHashIdRouting;
    /** @use HasFactory<EventFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'days',
        'image_id',
        'loc_name',
        'loc_address',
        'loc_lat',
        'loc_lng',
        'original_event_id',
        'start_date',
        'loc_original_link',
        'private',
    ];

    protected $appends = [
        'hashId',
        'image_url',
    ];

    protected $with = [
        'picture',
    ];

    protected $hidden = [
        'picture',
    ];

    #[\Override]
    public function getCasts(): array
    {
        return [
            'days'              => 'integer',
            'image_id'          => 'integer',
            'loc_lat'           => 'float',
            'loc_lng'           => 'float',
            'original_event_id' => 'integer',
            'start_date'        => 'date',
            'private'           => 'boolean',
        ];
    }

    /** @psalm-suppress PossiblyUnusedMethod */
    public function getImageUrlAttribute(): string
    {
        return $this->picture->publicPath();
    }

    /** @psalm-suppress PossiblyUnusedMethod */
    public function picture(): BelongsTo
    {
        return $this->belongsTo(Image::class, 'image_id');
    }

    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
    }

    /**
     * Scope to filter out expired events.
     *
     * @psalm-suppress PossiblyUnusedMethod
     */
    public function scopeUpcoming(Builder $query): void
    {
        $query->where('start_date', '>=', date('Y-m-d', time() + 2 * 24 * 60 * 60))
            ->where('private', 0);
    }

    public static function fetchRawDataFromMainSite(): Collection
    {
        $sourceEventsDom = Cache::remember('es-calendar-source', 60 * 60 * 24, function () {
            return file_get_contents('https://eveilspirituel.net/calendrier-activites.asp', false, stream_context_create([
                'http' => [
                    'method'  => 'POST',
                    'header'  => 'Content-Type: application/x-www-form-urlencoded',
                    'content' => 'etypes=15&etypes=8&etypes=17',
                ],
            ]));
        });

        $dom = new Dom();
        $dom->loadStr($sourceEventsDom);
        $eventData = [];
        foreach ($dom->find('div.element-item') ?? [] as $ed) {
            $eventData[] = [
                'pic_url'           => $ed->find('img')[0]->getAttribute('src'), // "/img/client/activites/unir-salomon-screau.jpg",
                'date'              => $ed->find('span.date')[0]->text, // "27 au 29 octobre 2023",
                'name'              => $ed->find('h5 a')[0]->text, // "Unir le ciel et la terre en soi",
                'original_event_id' => (int) explode('=', $ed->find('h5 a')[0]->getAttribute('href'))[1], // 368,
                'type'              => $ed->find('ul span')[1]->text, // "Rencontre en résidentiel",
                'map_link'          => $ed->find('ul a')[0]->getAttribute('href'), // "https://goo.gl/maps/UAw2vUj68sD36RVh7",
                'loc_name'          => $ed->find('ul a')[0]->text, // "Riaillé, près de Nantes"
            ];
        }

        return collect($eventData);
    }

    /**
     * Scrappes and imports events from the main site.
     *
     * @param non-empty-string|int|null $id
     *
     * @throws \RuntimeException
     */
    public static function importEventsFromMainSite(string|int|null $id = null): void
    {
        $scrappedEvents = self::fetchRawDataFromMainSite();

        $ch = curl_init();
        if (!$ch instanceof \CurlHandle) {
            throw new \RuntimeException('cURL initialization failed');
        }
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 0);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

        $cliCall = 'cli' === php_sapi_name();
        $errors = [];

        if ($cliCall) {
            $count = count($scrappedEvents);
            echo "Importing $count events from main site...\n";
        }

        foreach ($scrappedEvents as $eventData) {
            // parse "<day> au <day> <month>" date and convert it to "Y-m-d" + days (duration)
            $monthNumByFrMonth = array_flip(
                explode(',', ',janvier,fevrier,mars,avril,mai,juin,juillet,aout,septembre,octobre,novembre,decembre'),
            );
            preg_match(
                '/(?<fD>\d+)[a-z]*( (?<fM>[a-z]+))? au (?<tD>\d+)[a-z]* (?<tM>[a-z]+)( (?<Y>\d+))?/',
                strtr($eventData['date'], ['é' => 'e', 'û' => 'u']),
                $matches,
            );
            // echo "$eventData[date] => ".json_encode($matches)."\n";
            $year = $matches['Y'] ?? date('Y');
            if (!isset($matches['tM'])) {
                dd($eventData);
            }
            /** @var lowercase-string $tM */
            $tM = $matches['tM'];
            /** @var lowercase-string $fM */
            $fM = $matches['fM'] ?? $tM ?: $tM;

            $fromMonth = $monthNumByFrMonth[$fM];
            $fromTime = strtotime("$year-$fromMonth-$matches[fD]");
            $toMonth = $monthNumByFrMonth[$tM];
            $toTime = strtotime("$year-$toMonth-$matches[tD]");
            /** @psalm-suppress RiskyTruthyFalsyComparison */
            if (!is_int($fromTime) || !is_int($toTime)) {
                echo "\nInvalid date for event $eventData[original_event_id] ($eventData[name]): $eventData[date]\n";
                continue;
            }
            $days = round((float) ($toTime - $fromTime) / (float) (60 * 60 * 24) + 1.0);
            $startDate = date('Y-m-d', $fromTime);

            $keyData = [
                'original_event_id' => $eventData['original_event_id'],
                'start_date'        => $startDate,
            ];
            $event = Event::where($keyData)->first();

            // if an ID or hash was provided, and we're not on the right event, skip to the next one
            if (null !== $id && $id && (!$event || !in_array($id, [$event->id, $event->hashId]))) {
                continue;
            }

            // helper to import event image
            $importImage = function () use ($eventData): Image {
                $imgUrl = config('app.main_site').$eventData['pic_url'];
                // if $imgUrl doesn't start with https://eveilspirituel.net/, prepend it
                if (!preg_match('/^https?:\/\/eveilspirituel\.net\//', $imgUrl)) {
                    $imgUrl = 'https://eveilspirituel.net'.$eventData['pic_url'];
                }
                $imgContent = file_get_contents($imgUrl);
                if (false === $imgContent) {
                    throw new \RuntimeException("Failed to fetch image from $imgUrl");
                }

                return Image::create([
                    'name' => basename($eventData['pic_url']),
                    'file' => base64_encode($imgContent),
                ]);
            };

            // find Image, or create it if it doesn't already exist
            try {
                $img = Image::where('name', '=', basename($eventData['pic_url']))
                    ->firstOr($importImage);
                $img->ensureStoredLocally();
            } catch (\RuntimeException $e) {
                echo $e->getMessage()."\n";
                continue;
            }

            // map type to one of "retreat", "seminar" or "silent retreat"
            $type = match (true) {
                str_contains($eventData['type'], 'silence')        => 'silent-retreat',
                str_contains($eventData['type'], 'en résidentiel') => 'retreat',
                default                                            => 'seminar',
            };

            $eventIdentifier = $event ? "$event->id/$event->hashId" : "NEW EVENT ($eventData[original_event_id])";

            // if url contains "goo.gl", we can't get adress/latitude/longitude from URL, it's likely a goo.gl compressed URL
            if (preg_match('/goo\.gl/', $loc_url = $eventData['map_link'])) {
                // get map's real http location from headers
                curl_setopt($ch, CURLOPT_URL, $loc_url);
                $header = curl_exec($ch);
                if (true === is_bool($header)) {
                    echo "\n$eventIdentifier: cURL error (".curl_errno($ch).'): '.curl_error($ch)."\n";
                    continue;
                }
                if (preg_match('/location: ([^\n\r]+)/', $header, $locHeaderMatch)) {
                    $loc_url = $locHeaderMatch[1];
                } else {
                    echo "Unable to get real map URL for $eventData[original_event_id] ".
                        "($eventData[loc_name], $eventData[date]) from $loc_url\n";
                    continue;
                }
            }

            $mapInfo = [];
            // Now attempt to extract place, latitude and longitude from map URL, and fail if we can't.
            preg_match('/www\.google\.\w+\/maps\/place\/(?<address>[^\/]+)/', $loc_url, $mapInfo['addr']);
            $map_address = urldecode($mapInfo['addr']['address'] ?? '');
            // get place's and map's coordinates
            preg_match('/3d(?<lat>-?\d+\.\d+)!4d(?<lng>-?\d+\.\d+)/', $loc_url, $mapInfo['place']);
            preg_match('/@(?<lat>-?\d+\.\d+),(?<lng>-?\d+\.\d+)/', $loc_url, $mapInfo['map']);
            /** @var float|null $lat */
            $lat = $mapInfo['place']['lat'] ?? $mapInfo['map']['lat'] ?? null;
            /** @var float|null $lng */
            $lng = $mapInfo['place']['lng'] ?? $mapInfo['map']['lng'] ?? null;

            /** @psalm-suppress RiskyTruthyFalsyComparison */
            if (!($lat && $lng)) {
                echo "\n$eventIdentifier: Could not get event location for $eventData[original_event_id] ".
                        "($eventData[loc_name], $eventData[date]) from URL: $loc_url\n";
                continue;
            }

            if (!$mapInfo['place']) {
                echo "\n$eventIdentifier: Unable to get place coordinates. ";
                if ($event) {
                    echo 'Check at '.route('my-events.edit', $event->hashId);
                    // if we already have an event, don't overwrite existing coordinates
                    /** @psalm-suppress PossiblyUndefinedArrayOffset */
                    [$lat, $lng] = array_values($event->only('loc_lat', 'loc_lng'));
                }
            }

            $data = [
                'name'              => $eventData['name'],
                'type'              => $type,
                'days'              => $days,
                'image_id'          => $img->id,
                'loc_name'          => $eventData['loc_name'],
                'loc_address'       => $map_address,
                'loc_original_link' => $eventData['map_link'],
                'loc_lat'           => $lat,
                'loc_lng'           => $lng,
            ];

            // create event in DB
            if ($event) {
                try {
                    // dump(["Updating event", 'event' => $event->toArray(), 'New data' => $data]);
                    $event->update($data);
                } catch (\Exception $e) {
                    $errors[] = $e->getMessage();
                }
            } else {
                $event = Event::create($keyData + $data);
                echo 'N';
            }

            echo "{$event->id}";
            echo $cliCall ? '.' : '<br/>';
        }
        echo "\n";
        if (!$cliCall && $errors) {
            echo json_encode(['errors' => $errors], JSON_PRETTY_PRINT);
            http_response_code(500);
        }
    }
}
