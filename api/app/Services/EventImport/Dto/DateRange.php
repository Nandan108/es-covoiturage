<?php

namespace App\Services\EventImport\Dto;

use Illuminate\Support\Carbon;

final class DateRange
{
    public function __construct(
        public readonly Carbon $startDate,
        public readonly int $days,
    ) {
    }
}
