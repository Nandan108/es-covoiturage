<?php

namespace App\Services\EventImport;

use App\Services\EventImport\Dto\DateRange;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

final class EventDateRangeParser
{
    /**
     * Maps French month names to their numeric representation.
     *
     * @var array<string, int>
     */
    private const MONTHS = [
        'janvier'   => 1,
        'fevrier'   => 2,
        'mars'      => 3,
        'avril'     => 4,
        'mai'       => 5,
        'juin'      => 6,
        'juillet'   => 7,
        'aout'      => 8,
        'septembre' => 9,
        'octobre'   => 10,
        'novembre'  => 11,
        'decembre'  => 12,
    ];

    public function parse(string $rawDate): DateRange
    {
        $normalized = Str::ascii(mb_strtolower(trim($rawDate)));
        $pattern = '/(?P<fromDay>\d+)[a-z]*\s*(?P<fromMonth>[a-z]+)?\s*au\s*(?P<toDay>\d+)[a-z]*\s*(?P<toMonth>[a-z]+)(?:\s*(?P<year>\d{4}))?/';

        if (!preg_match($pattern, $normalized, $matches)) {
            throw new \RuntimeException(sprintf('Unable to parse date range "%s"', $rawDate));
        }

        $year = isset($matches['year']) && '' !== $matches['year'] ? (int) $matches['year'] : (int) date('Y');

        $fromMonthKey = $matches['fromMonth'] ?: $matches['toMonth'];
        $toMonthKey = $matches['toMonth'];

        $fromMonth = self::MONTHS[$fromMonthKey] ?? null;
        $toMonth = self::MONTHS[$toMonthKey] ?? null;

        if (null === $fromMonth || null === $toMonth) {
            throw new \RuntimeException(sprintf('Unsupported month in date range "%s"', $rawDate));
        }

        /** @var Carbon $from */
        $from = Carbon::create($year, $fromMonth, (int) $matches['fromDay'])?->startOfDay();
        /** @var Carbon $to */
        $to = Carbon::create($year, $toMonth, (int) $matches['toDay'])?->startOfDay();

        if ($to->lessThan($from)) {
            $to->addYear();
        }

        $days = (int) $from->diffInDays($to) + 1;

        return new DateRange($from, max(1, $days));
    }
}
