<?php

namespace App\Services\EventImport;

use App\Models\Event;
use App\Services\EventImport\Dto\ScrapedEvent;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

final class EventImporter
{
    /** @psalm-suppress PossiblyUnusedMethod */
    public function __construct(
        private readonly MainSiteCalendarClient $client,
        private readonly DomEventParser $parser,
        private readonly EventDateRangeParser $dateParser,
        private readonly GoogleMapsLinkParser $mapsParser,
        private readonly EventImageResolver $imageResolver,
    ) {
    }

    /**
     * @param array<int, string|int>|string|int|null $ids
     * @param callable|null                          $onProgress receives ($type, array $payload)
     */
    public function import(array|string|int|null $ids = null, ?callable $onProgress = null): EventImportSummary
    {
        $filters = $this->normalizeIds($ids);

        $summary = new EventImportSummary();
        $html = $this->client->fetchCalendar();
        $scrapedEvents = $this->parser->parse($html);

        /** @var ScrapedEvent $scraped */
        foreach ($scrapedEvents as $scraped) {
            try {
                $dateRange = $this->dateParser->parse($scraped->date);
            } catch (\Throwable $e) {
                $errorInfo = $summary->recordError($scraped->originalEventId, $scraped->name, $e->getMessage());
                $this->notify($onProgress, 'error', $errorInfo);
                continue;
            }

            $keyData = [
                'original_event_id' => $scraped->originalEventId,
                'start_date'        => $dateRange->startDate->toDateString(),
            ];

            $event = Event::where($keyData)->first();

            if ([] !== $filters && !$this->matchesRequestedId($filters, $event)) {
                $skipInfo = $summary->recordSkipped(
                    $scraped->originalEventId,
                    $dateRange->startDate->toDateString(),
                    'Filtered out',
                    $scraped->name,
                );
                $this->notify($onProgress, 'skipped', $skipInfo);
                continue;
            }

            try {
                $image = $this->imageResolver->resolve($scraped->imagePath);
            } catch (\Throwable $e) {
                $errorInfo = $summary->recordError($scraped->originalEventId, $scraped->name, $e->getMessage());
                $this->notify($onProgress, 'error', $errorInfo);
                continue;
            }

            $type = $this->normalizeType($scraped->type);

            try {
                $location = $this->mapsParser->parse($scraped->mapLink);
            } catch (\Throwable $e) {
                $errorInfo = $summary->recordError($scraped->originalEventId, $scraped->name, $e->getMessage());
                $this->notify($onProgress, 'error', $errorInfo);
                continue;
            }

            $lat = $location->latitude ?? $event?->loc_lat;
            $lng = $location->longitude ?? $event?->loc_lng;

            if (null === $lat || null === $lng) {
                $skipInfo = $summary->recordSkipped(
                    $scraped->originalEventId,
                    $dateRange->startDate->toDateString(),
                    'Missing coordinates',
                    $scraped->name,
                );
                $this->notify($onProgress, 'skipped', $skipInfo);
                continue;
            }

            $data = [
                'name'              => $scraped->name,
                'type'              => $type,
                'days'              => $dateRange->days,
                'image_id'          => $image->id,
                'loc_name'          => $scraped->locationName,
                'loc_address'       => $location->address ?? $event?->loc_address ?? '',
                'loc_original_link' => $scraped->mapLink,
                'loc_lat'           => $lat,
                'loc_lng'           => $lng,
            ];

            if ($event) {
                $event->update($data);
                $updated = $summary->recordUpdated($event->refresh());
                $this->notify($onProgress, 'updated', $updated);
            } else {
                $created = Event::create($keyData + $data);
                $createdInfo = $summary->recordCreated($created);
                $this->notify($onProgress, 'created', $createdInfo);
            }
        }

        return $summary;
    }

    /**
     * @param array<int, string> $filters
     */
    private function matchesRequestedId(array $filters, ?Event $event): bool
    {
        if (!$event) {
            return false;
        }

        $candidates = array_filter([
            (string) $event->id,
            $event->hashId ?? null,
        ]);

        return (bool) array_intersect($filters, $candidates);
    }

    /**
     * @param array<int, string|int>|string|int|null $ids
     *
     * @return array<int, string>
     */
    private function normalizeIds(array|string|int|null $ids): array
    {
        if (null === $ids) {
            return [];
        }

        $ids = Arr::wrap($ids);

        return array_values(array_filter(array_map(static fn ($value): string => (string) $value, $ids), static fn ($value): bool => '' !== $value));
    }

    private function normalizeType(string $rawType): string
    {
        $value = Str::lower($rawType);

        return match (true) {
            Str::contains($value, 'silence')     => 'silent-retreat',
            Str::contains($value, 'résidentiel') => 'retreat',
            default                              => 'seminar',
        };
    }

    private function notify(?callable $callback, string $type, array $payload): void
    {
        if (null === $callback) {
            return;
        }

        $callback($type, $payload);
    }
}
