<?php

namespace App\Models;

use Carbon\Carbon;
use Database\Factories\OfferFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

/**
 * @property int         $id
 * @property int         $event_id
 * @property string      $name
 * @property string      $email
 * @property string      $email_is_public
 * @property string      $phone
 * @property string      $notes
 * @property int         $pasngr_seats
 * @property int         $driver_seats
 * @property string      $address
 * @property float       $lat
 * @property float       $lng
 * @property string|null $token_hash
 * @property Carbon|null $token_expires_at
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
            'token_expires_at'=> 'datetime',
        ];
    }

    public function rememberOwnerToken(string $token, Carbon $expiresAt): void
    {
        $this->token_hash = self::hashToken($token);
        $this->token_expires_at = $expiresAt;
    }

    public function issueOwnerToken(Carbon $expiresAt): string
    {
        $token = bin2hex(random_bytes(32));
        $this->rememberOwnerToken($token, $expiresAt);
        $this->save();

        return $token;
    }

    public function tokenIsValid(?string $token): bool
    {
        if (Auth::guard('admin')->check()) {
            return true;
        }

        if (null === $this->token_hash) {
            return true; // legacy offers: no token required
        }

        if (null === $token) {
            return false;
        }

        if (null !== $this->token_expires_at && $this->token_expires_at->isPast()) {
            return false;
        }

        return hash_equals($this->token_hash, self::hashToken($token));
    }

    public static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    /** @psalm-suppress PossiblyUnusedMethod */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
