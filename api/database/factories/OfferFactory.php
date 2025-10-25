<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Offer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Offer>
 */
class OfferFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        /**
         * Offer properties:
         *
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
        $seats = [
            'pasngr_seats' => 1 + (int) $this->faker->boolean(20),
            'driver_seats' => $this->faker->numberBetween(1, 4),
        ];
        $role = $this->faker->randomElement(['passenger', 'passenger', 'passenger', 'passenger', 'driver', 'driver', 'both']);
        $seats += match ($role) {
            'driver'    => ['pasngr_seats' => 0],
            'passenger' => ['driver_seats' => 0],
            'both'      => [],
        };

        return [
            'event_id'        => null, // Should be set explicitly
            'name'            => $this->faker->name(),
            'email'           => $this->faker->unique()->safeEmail(),
            'email_is_public' => $this->faker->boolean(),
            'phone'           => $this->faker->phoneNumber(),
            'notes'           => $this->faker->optional()->sentence(),
            ...$seats,
            'address'         => $this->faker->address(),
            'lat'             => $this->faker->latitude(49.1545224, 43.860136),
            'lng'             => $this->faker->longitude(-1.5425988, 4.943467),
            'token_hash'      => Offer::hashToken(bin2hex(random_bytes(16))),
            'token_expires_at'=> now()->addWeeks(2),
        ];
    }

    /**
     * Set the event_id attribute.
     */
    public function forEvent(Event $event): Factory
    {
        return $this->state(function (array $attributes) use ($event) {
            return [
                'event_id' => $event->id,
            ];
        });
    }
}
