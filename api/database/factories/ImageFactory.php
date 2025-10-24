<?php

namespace Database\Factories;

use App\Models\Image;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Image>
 */
class ImageFactory extends Factory
{
    protected $model = Image::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->lexify('test-image-??????').'.jpg',
            'file' => base64_encode($this->faker->randomHtml(1, 1)),
        ];
    }

    /**
     * Ensure the generated image is also written to storage for consumers that
     * expect the file to exist on disk.
     */
    public function configure(): static
    {
        return $this->afterCreating(static function (Image $image): void {
            $image->ensureStoredLocally();
        });
    }
}
