<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Offer extends Model
{
    use HasFactory;
    public static $roles = [
        ['roleLabel' => 'Passenger', 'seatLabel' => 'places souhaitées',  'role' => 'pasngr'],
        ['roleLabel' => 'Driver',    'seatLabel' => 'places disponibles', 'role' => 'driver'],
    ];
    protected $fillable = [
        'name','email','email_is_public','phone','notes',
        'pasngr_seats','driver_seats','address','lat','lng'
    ];

    public function getCasts(): array {
        return [
            'email_is_public' => 'boolean',
            'pasngr_seats' => 'integer',
            'driver_seats' => 'integer',
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function getRoles(): array {
        $roles = array_filter([
            $this->pasngr_seats ? (object)['label' => 'Passenger', 'seatsLabel' => 'seat required|seats required', 'seats' => $this->pasngr_seats] : null,
            $this->driver_seats ? (object)['label' => 'Driver',    'seatsLabel' => 'seat available|seats available', 'seats' => $this->driver_seats] : null,
        ]);
        return $roles;
    }
}
