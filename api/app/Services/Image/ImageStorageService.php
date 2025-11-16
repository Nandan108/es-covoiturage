<?php

namespace App\Services\Image;

use App\Models\Image;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

final class ImageStorageService
{
    public function storeFromUpload(UploadedFile $file): Image
    {
        /** @psalm-suppress RiskyTruthyFalsyComparison */
        $binary = file_get_contents($file->getRealPath()) ?: '';

        return $this->storeFromBinary($binary, $file->getClientOriginalName() ?: 'upload');
    }

    public function storeFromBinary(string $binary, string $originalName): Image
    {
        $crc = '' === $binary ? 0 : (int) sprintf('%u', crc32($binary));
        if (0 !== $crc) {
            $existing = Image::where('crc32', $crc)->first();
            if ($existing) {
                $this->ensureFileExists($existing, $binary);

                return $existing;
            }
        }

        $storageDir = storage_path(Image::STORAGE_DIR);
        File::ensureDirectoryExists($storageDir);

        $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION) ?: 'jpg');
        $base = pathinfo($originalName, PATHINFO_FILENAME);
        $sanitized = $this->sanitizeFilename($base);
        $finalName = $this->determineUniqueFilename($sanitized, $extension, $crc);

        File::put($storageDir.DIRECTORY_SEPARATOR.$finalName, $binary);

        return Image::create([
            'name'  => $finalName,
            'crc32' => $crc,
        ]);
    }

    private function ensureFileExists(Image $image, string $binary): void
    {
        $path = $image->storagePath();
        if (File::exists($path)) {
            return;
        }

        if ('' === $binary) {
            return;
        }

        File::ensureDirectoryExists(dirname($path));
        File::put($path, $binary);
    }

    private function sanitizeFilename(string $name): string
    {
        $slug = Str::slug($name, '-');

        return '' !== $slug ? $slug : 'image';
    }

    private function determineUniqueFilename(string $base, string $extension, int $crc): string
    {
        $candidate = "{$base}.{$extension}";
        if (Image::where('name', $candidate)->exists()) {
            $candidate = "{$base}-{$crc}.{$extension}";
        }

        return $candidate;
    }
}
