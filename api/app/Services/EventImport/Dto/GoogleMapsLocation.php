<?php

namespace App\Services\EventImport\Dto;

final class GoogleMapsLocation
{
    /** @psalm-suppress PossiblyUnusedProperty */
    public readonly string $originalUrl;
    /** @psalm-suppress PossiblyUnusedProperty */
    public readonly string $resolvedUrl;

    public function __construct(
        string $originalUrl,
        string $resolvedUrl,
        public readonly ?string $address,
        public readonly ?float $latitude,
        public readonly ?float $longitude,
    ) {
        $this->originalUrl = $originalUrl;
        $this->resolvedUrl = $resolvedUrl;
    }
}
