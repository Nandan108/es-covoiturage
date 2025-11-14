<?php

namespace App\Services\EventImport;

use App\Services\EventImport\Dto\ScrapedEvent;
use Illuminate\Support\Collection;
use PHPHtmlParser\Dom;

final class DomEventParser
{
    public function parse(string $html): Collection
    {
        $dom = new Dom();
        $dom->loadStr($html);

        $events = [];

        foreach ($dom->find('div.element-item') ?? [] as $element) {
            $imageNodes = $element->find('img');
            $dateNodes = $element->find('span.date');
            $titleNodes = $element->find('h5 a');
            $typeNodes = $element->find('ul span');
            $mapLinkNodes = $element->find('ul a');

            if (!count($imageNodes) || !count($dateNodes) || !count($titleNodes) || !count($mapLinkNodes)) {
                continue;
            }

            $imagePath = trim($imageNodes[0]->getAttribute('src') ?? '');
            $rawDate = trim($dateNodes[0]->text ?? '');
            $name = trim($titleNodes[0]->text ?? '');
            $mapLink = trim($mapLinkNodes[0]->getAttribute('href') ?? '');
            $locationName = trim($mapLinkNodes[0]->text ?? '');

            if ('' === $imagePath || '' === $rawDate || '' === $name || '' === $mapLink) {
                continue;
            }

            $href = $titleNodes[0]->getAttribute('href') ?? '';
            $originalId = (int) (explode('=', $href)[1] ?? 0);

            if (0 === $originalId) {
                continue;
            }

            $typeText = count($typeNodes) > 1 ? trim($typeNodes[1]->text ?? '') : '';

            $events[] = new ScrapedEvent(
                imagePath: $imagePath,
                date: $rawDate,
                name: $name,
                originalEventId: $originalId,
                type: $typeText,
                mapLink: $mapLink,
                locationName: $locationName,
            );
        }

        return collect($events);
    }
}
