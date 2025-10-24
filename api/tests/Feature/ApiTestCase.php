<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Image;
use App\Models\Offer;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

abstract class ApiTestCase extends TestCase
{
    use RefreshDatabase {
        refreshDatabase as baseRefreshDatabase;
    }

    /** @var Collection<int, Event> */
    protected Collection $events;

    /** @psalm-suppress PossiblyUnusedMethod */
    protected function refreshDatabase(): void
    {
        // Run migrations manually without unsupported options
        Artisan::call('migrate:fresh', [
            '--drop-views' => false,
            '--drop-types' => false,
        ]);

        $this->afterRefreshingDatabase();
    }

    #[\Override]
    protected function setUp(): void
    {
        parent::setUp();
    }

    #[\Override]
    protected function tearDown(): void
    {
        $this->cleanupTestImages();

        parent::tearDown();
    }

    protected function setUpFakeEvents(int $count = 10): void
    {
        /** @var Collection<int, Event> */
        $events = Event::factory()->count($count)->create();
        $this->events = $events;

        $offerCount = 0;
        foreach ($this->events as $event) {
            $eventOfferCount = fake()->numberBetween(5, 15);
            $offerCount += $eventOfferCount;
            Offer::factory()->forEvent($event)->count($eventOfferCount)->create();
        }

        $this->assertDatabaseCount('offers', $offerCount);
    }

    public function randomEvent(): Event
    {
        $event = fake()->randomElement($this->events->values()->all());

        return $event;
    }

    private function cleanupTestImages(): void
    {
        $dir = storage_path(Image::STORAGE_DIR);
        if (!File::isDirectory($dir)) {
            return;
        }

        foreach (File::files($dir) as $file) {
            $basename = $file->getFilename();
            if (str_starts_with($basename, 'test-image-')) {
                File::delete($file->getRealPath());
            }
        }
    }
}
