<?php

namespace Tests\Feature;

use App\Models\Event;
use Illuminate\Database\Eloquent\Collection;

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
        echo "Event count: $eventCount\n";
        $response->assertOk();
        $response->assertJsonCount($eventCount, 'data');
    }

    public function testCanFetchEvent(): void
    {
        // take one Event randomly
        $event = $this->randomEvent();

        // use it's ID to fetch it at /api/events/{id} and verify the data
        $uri = route('events.show', ['event' => $event->hashId]);
        $this->getJson($uri)
            ->assertOk()
            ->assertJsonPath('data.id', $event->id);
    }
}
