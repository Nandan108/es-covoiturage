<?php

namespace Tests\Feature;

use App\Models\Event;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

final class EventTest extends ApiTestCase
{
    /** @var Collection<int, Event> */
    protected Collection $events;

    #[\Override]
    public function setUp(): void
    {
        parent::setUp();
        $this->setUpFakeEvents(rand(5, 10));
    }

    public function testCanListEvents(): void
    {
        $response = $this->getJson(route('events.index'));

        $eventCount = Event::count();
        $response->assertOk();
        $response->assertJsonCount($eventCount, 'data');

        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'hashId',
                    'image_url',
                    'name',
                    'start_date',
                ],
            ],
        ]);
        $response->assertJsonMissingPath('data.0.id');

        $firstEvent = $this->events->first();
        $this->assertNotNull($firstEvent);
        $payloadEvent = collect($response->json('data'))
            ->firstWhere('hashId', $firstEvent->hashId);
        $this->assertNotNull($payloadEvent, 'Expected event hashId not found in payload');
        $this->assertSame($firstEvent->picture->publicPath(), $payloadEvent['image_url']);
    }

    public function testCanFetchEvent(): void
    {
        // take one Event randomly
        $event = $this->randomEvent();

        // use it's ID to fetch it at /api/events/{id} and verify the data
        $uri = route('events.show', ['event' => $event->hashId]);
        $response = $this->getJson($uri);

        $response->assertOk();
        $response->assertJsonPath('data.hashId', $event->hashId);
        $response->assertJsonPath('data.image_url', $event->picture->publicPath());
        $response->assertJsonPath('data.name', $event->name);
        $response->assertJsonStructure([
            'data' => [
                'id',
                'hashId',
                'image_url',
                'offers' => [
                    '*' => [
                        'id',
                        'event_id',
                        'name',
                        'email',
                    ],
                ],
            ],
        ]);

        $this->assertSame(
            $event->offers()->count(),
            count($response->json('data.offers'))
        );
    }

    public function testPastEventsAreExcludedFromIndex(): void
    {
        $pastEvent = Event::factory()->create([
            'start_date' => Carbon::now()->subDays(10),
        ]);

        $response = $this->getJson(route('events.index'));
        $response->assertOk();

        $hashIds = collect($response->json('data'))->pluck('hashId')->all();
        $this->assertNotContains($pastEvent->hashId, $hashIds);
    }

    public function testValidationErrorsReturnProblemDetails(): void
    {
        $event = $this->randomEvent();

        $response = $this->postJson(
            route('events.offers.store', ['event' => $event->hashId]),
            [] // Missing required fields
        );

        $response->assertStatus(422);
        $contentType = $response->headers->get('Content-Type');
        $this->assertNotNull($contentType);
        $this->assertStringContainsString('application/problem+json', $contentType);

        $json = $response->json();
        $this->assertSame('about:blank', $json['type']);
        $this->assertSame('Unprocessable Entity', $json['title']);
        $this->assertSame(422, $json['status']);
        $this->assertArrayHasKey('errors', $json);
        $this->assertArrayHasKey('email', $json['errors']);
    }
}
