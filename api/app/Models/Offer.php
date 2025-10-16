<?php

namespace App\Models;

use Database\Factories\OfferFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int    $id
 * @property int    $event_id
 * @property string $name
 * @property string $email
 * @property string $email_is_public
 * @property string $phone
 * @property string $notes
 * @property int    $pasngr_seats
 * @property int    $driver_seats
 * @property string $address
 * @property float  $lat
 * @property float  $lng
 */
final class Offer extends Model
{
    /** @use HasFactory<OfferFactory> */
    use HasFactory;

    protected $fillable = [
        'name', 'email', 'email_is_public', 'phone', 'notes',
        'pasngr_seats', 'driver_seats', 'address', 'lat', 'lng',
    ];

    #[\Override]
    public function getCasts(): array
    {
        return [
            'email_is_public' => 'boolean',
            'pasngr_seats'    => 'integer',
            'driver_seats'    => 'integer',
            'lat'             => 'float',
            'lng'             => 'float',
        ];
    }

    /** @psalm-suppress PossiblyUnusedMethod */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
