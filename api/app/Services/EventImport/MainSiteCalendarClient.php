<?php

namespace App\Services\EventImport;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

final class MainSiteCalendarClient
{
    private const CACHE_KEY = 'es-calendar-source';
    private const CACHE_TTL = 86400;
    private const CALENDAR_URL = 'https://eveilspirituel.net/calendrier-activites.asp';
    private const REQUEST_BODY = 'etypes=15&etypes=8&etypes=17';

    public function fetchCalendar(): string
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function (): string {
            $response = Http::withBody(self::REQUEST_BODY, 'application/x-www-form-urlencoded')
                ->send('POST', self::CALENDAR_URL);

            if (!$response->successful()) {
                throw new \RuntimeException(sprintf('Failed to fetch calendar from main site. HTTP %d', $response->status()));
            }

            return $response->body();
        });
    }
}
