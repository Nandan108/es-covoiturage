<?php

namespace App\Console\Commands;

use App\Models\Event;
use Illuminate\Console\Command;

class ImportEvents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:import-events {id? : The ID or hashId of the event to import (optional)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import Eveil Spirituel events from eveilspirituel.net';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Event::importEventsFromMainSite($this->argument('id'));
    }
}
