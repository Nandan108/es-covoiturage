<?php

namespace App\Console\Commands;

use App\Services\EventImport\EventImporter;
use App\Services\EventImport\EventImportSummary;
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

    public function __construct(
        private readonly EventImporter $importer,
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $ids = $this->argument('ids');
        if (is_array($ids)) {
            $ids = array_values(array_filter($ids, static fn ($value): bool => !is_bool($value)));
        }
        /** @psalm-suppress RiskyTruthyFalsyComparison */
        $summary = $this->importer->import(
            empty($ids) ? null : $ids,
            function (string $type, array $payload): void {
                $identifier = $this->formatIdentifier($payload);
                $originalId = $payload['original_event_id'] ?? 'n/a';
                $startDate = $payload['start_date'] ?? 'n/a';
                $name = $payload['name'] ?? '';

                switch ($type) {
                    case 'created':
                        $this->line(sprintf('<info>+ %s</info> %s (original %s, start %s)', $identifier, $name, $originalId, $startDate));
                        break;
                    case 'updated':
                        $this->line(sprintf('<comment>~ %s</comment> %s (original %s, start %s)', $identifier, $name, $originalId, $startDate));
                        break;
                    case 'skipped':
                        $this->warn(sprintf('! Skipped original %s (%s): %s', $originalId, $startDate, $payload['reason'] ?? ''));
                        break;
                    case 'error':
                        $this->error(sprintf('× Error on original %s (%s): %s', $originalId, $name, $payload['reason'] ?? ''));
                        break;
                }
            }
        );

        $this->renderSummary($summary);

        return $summary->hasErrors() ? self::FAILURE : self::SUCCESS;
    }

    private function renderSummary(EventImportSummary $summary): void
    {
        $this->info(sprintf(
            'Created: %d | Updated: %d | Skipped: %d | Errors: %d',
            count($summary->created()),
            count($summary->updated()),
            count($summary->skipped()),
            count($summary->errors()),
        ));

        foreach ($summary->created() as $created) {
            $this->line(sprintf(
                '<info>+ %s</info> (original %s, start %s)',
                $created['hash_id'] ?? $created['id'],
                $created['original_event_id'],
                $created['start_date'],
            ));
        }

        foreach ($summary->updated() as $updated) {
            $this->line(sprintf(
                '<comment>~ %s</comment> (original %s, start %s)',
                $updated['hash_id'] ?? $updated['id'],
                $updated['original_event_id'],
                $updated['start_date'],
            ));
        }

        foreach ($summary->skipped() as $skipped) {
            $this->warn(sprintf(
                '! Skipped original %s (%s): %s',
                $skipped['original_event_id'],
                $skipped['start_date'],
                $skipped['reason'],
            ));
        }

        foreach ($summary->errors() as $error) {
            $this->error(sprintf(
                '× Error on original %s (%s): %s',
                $error['original_event_id'],
                $error['name'],
                $error['reason'],
            ));
        }
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function formatIdentifier(array $payload): string
    {
        return (string) ($payload['hash_id'] ?? $payload['id'] ?? 'n/a');
    }
}
