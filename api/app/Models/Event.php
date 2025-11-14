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
use Illuminate\Support\Carbon;

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
 * @property Carbon $start_date
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

    public function endDate(): Carbon
    {
        $days = max(1, $this->days);

        return $this->start_date->copy()->addDays($days - 1)->endOfDay();
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
}
