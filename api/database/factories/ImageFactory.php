<?php

namespace Database\Factories;

use App\Models\Image;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\File;

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
            'name'  => $this->faker->unique()->lexify('test-image-??????').'.jpg',
            'crc32' => 0,
        ];
    }

    /**
     * Ensure the generated image is also written to storage for consumers that
     * expect the file to exist on disk.
     */
    public function configure(): static
    {
        return $this->afterCreating(static function (Image $image): void {
            $binary = random_bytes(128);
            $path = $image->storagePath();
            File::ensureDirectoryExists(dirname($path));
            File::put($path, $binary);
            $image->crc32 = (int) sprintf('%u', crc32($binary));
            $image->save();
        });
    }
}
