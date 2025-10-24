<?php

namespace App\Console\Commands;

use App\Models\Event;
use Illuminate\Console\Command;

/** @psalm-suppress UnusedClass */
final class ImportEvents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:import-events {ids?* : The IDs or hashIds of the event(s) to import (optional)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import Eveil Spirituel events from eveilspirituel.net';

    /**
     * Execute the console command.
     *
     * @return void
     */
    public function handle()
    {
        $ids = $this->argument('ids');
        /** @psalm-suppress RiskyTruthyFalsyComparison */
        if (!$ids) {
            Event::importEventsFromMainSite();

            return;
        }
        if (!is_array($ids)) {
            $ids = [$ids];
        }
        foreach ($ids as $id) {
            if (is_bool($id)) {
                continue;
            }
            Event::importEventsFromMainSite($id);
        }
    }
}
