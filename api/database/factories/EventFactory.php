<?php

namespace Database\Factories;

use App\Models\Image;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name'              => $this->faker->sentence(),
            'type'              => $this->faker->randomElement(['retreat', 'silent-retreat', 'seminar']),
            'days'              => $this->faker->numberBetween(2, 3),
            'image_id'          => Image::factory(),
            'loc_name'          => $this->faker->word(),
            'loc_address'       => $this->faker->address(),
            'loc_lat'           => $this->faker->latitude(49.1545224, 43.860136),
            'loc_lng'           => $this->faker->longitude(-1.5425988, 4.943467),
            'original_event_id' => $this->faker->randomNumber(),
            'start_date'        => $this->faker->dateTimeBetween('+3 day', '+1 year'),
            'loc_original_link' => $this->faker->url(),
            'private'           => false,
        ];
    }
}
