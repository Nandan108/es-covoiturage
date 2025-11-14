<?php

namespace App\Services\EventImport;

use App\Models\Image;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

final class EventImageResolver
{
    public function resolve(string $imagePath): Image
    {
        $filename = basename($imagePath);

        $existing = Image::where('name', '=', $filename)->first();
        if ($existing) {
            $existing->ensureStoredLocally();

            return $existing;
        }

        $content = $this->downloadImage($imagePath);

        $image = Image::create([
            'name' => $filename,
            'file' => base64_encode($content),
        ]);

        $image->ensureStoredLocally();

        return $image;
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
