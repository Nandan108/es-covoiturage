<?php

namespace App\Services\EventImport\Dto;

final class ScrapedEvent
{
    public function __construct(
        public readonly string $imagePath,
        public readonly string $date,
        public readonly string $name,
        public readonly int $originalEventId,
        public readonly string $type,
        public readonly string $mapLink,
        public readonly string $locationName,
    ) {
    }
}
