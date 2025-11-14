<?php

namespace App\Services\EventImport;

use App\Services\EventImport\Dto\GoogleMapsLocation;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

final class GoogleMapsLinkParser
{
    public function parse(string $url): GoogleMapsLocation
    {
        $resolved = $this->resolveRedirect($url);

        $address = $this->parseAddress($resolved);
        [$lat, $lng] = $this->parseCoordinates($resolved);

        return new GoogleMapsLocation(
            originalUrl: $url,
            resolvedUrl: $resolved,
            address: $address,
            latitude: $lat,
            longitude: $lng,
        );
    }

    private function resolveRedirect(string $url): string
    {
        if (!Str::contains($url, 'goo.gl')) {
            return $url;
        }

        $response = Http::withOptions([
            'allow_redirects' => false,
            'http_errors'     => false,
            'timeout'         => 10,
        ])->get($url);

        /** @var array<int, string>|string|null $location */
        $location = $response->header('Location');
        if (is_array($location)) {
            $location = $location[0] ?? null;
        }
        if (is_string($location) && '' !== $location) {
            return trim($location);
        }

        return $url;
    }

    private function parseAddress(string $url): ?string
    {
        if (!preg_match('/maps\/place\/(?P<address>[^\/]+)/', $url, $matches)) {
            return null;
        }

        return urldecode($matches['address']);
    }

    /**
     * @return array{0: float|null, 1: float|null}
     */
    private function parseCoordinates(string $url): array
    {
        if (preg_match('/3d(?P<lat>-?\d+\.\d+)!4d(?P<lng>-?\d+\.\d+)/', $url, $matches)) {
            return [isset($matches['lat']) ? (float) $matches['lat'] : null, isset($matches['lng']) ? (float) $matches['lng'] : null];
        }

        if (preg_match('/@(?P<lat>-?\d+\.\d+),(?P<lng>-?\d+\.\d+)/', $url, $matches)) {
            return [isset($matches['lat']) ? (float) $matches['lat'] : null, isset($matches['lng']) ? (float) $matches['lng'] : null];
        }

        return [null, null];
    }
}
