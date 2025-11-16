<?php

namespace App\Services\EventImport;

use App\Models\Image;
use App\Services\Image\ImageStorageService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

final class EventImageResolver
{
    /** @psalm-suppress PossiblyUnusedMethod */
    public function __construct(
        private readonly ImageStorageService $imageStorage,
    ) {
    }

    public function resolve(string $imagePath): Image
    {
        $content = $this->downloadImage($imagePath);
        $originalName = basename($this->normalizeUrl($imagePath));
        if ('' === $originalName || false === strpos($originalName, '.')) {
            $originalName = 'imported.jpg';
        }

        return $this->imageStorage->storeFromBinary($content, $originalName);
    }

    /**
     * @return string binary contents
     */
    private function downloadImage(string $path): string
    {
        $url = $this->normalizeUrl($path);

        $response = Http::withOptions(['timeout' => 15])->get($url);

        if (!$response->successful()) {
            throw new \RuntimeException(sprintf('Failed to download image from %s (HTTP %d)', $url, $response->status()));
        }

        $body = $response->body();
        if ('' === $body) {
            throw new \RuntimeException(sprintf('Image %s returned an empty body', $url));
        }

        return $body;
    }

    private function normalizeUrl(string $path): string
    {
        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        $base = rtrim((string) config('app.main_site'), '/');

        if ('' === $base) {
            $base = 'https://eveilspirituel.net';
        }

        return $base.'/'.ltrim($path, '/');
    }
}
