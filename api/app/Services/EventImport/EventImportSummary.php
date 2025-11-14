<?php

namespace App\Services\EventImport;

use App\Models\Event;

final class EventImportSummary
{
    /**
     * @var array<int, array<string, mixed>>
     */
    private array $created = [];

    /**
     * @var array<int, array<string, mixed>>
     */
    private array $updated = [];

    /**
     * @var array<int, array<string, mixed>>
     */
    private array $skipped = [];

    /**
     * @var array<int, array<string, mixed>>
     */
    private array $errors = [];

    public function recordCreated(Event $event): array
    {
        $info = $this->eventInfo($event);
        $this->created[] = $info;

        return $info;
    }

    public function recordUpdated(Event $event): array
    {
        $info = $this->eventInfo($event);
        $this->updated[] = $info;

        return $info;
    }

    public function recordSkipped(int $originalEventId, string $startDate, string $reason, ?string $name = null): array
    {
        $info = [
            'original_event_id' => $originalEventId,
            'start_date'        => $startDate,
            'reason'            => $reason,
            'name'              => $name,
        ];

        $this->skipped[] = $info;

        return $info;
    }

    public function recordError(int $originalEventId, string $name, string $reason): array
    {
        $info = [
            'original_event_id' => $originalEventId,
            'name'              => $name,
            'reason'            => $reason,
        ];

        $this->errors[] = $info;

        return $info;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function created(): array
    {
        return $this->created;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function updated(): array
    {
        return $this->updated;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function skipped(): array
    {
        return $this->skipped;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function errors(): array
    {
        return $this->errors;
    }

    public function hasErrors(): bool
    {
        return [] !== $this->errors;
    }

    /** @psalm-suppress PossiblyUnusedMethod */
    public function toArray(): array
    {
        return [
            'created' => $this->created,
            'updated' => $this->updated,
            'skipped' => $this->skipped,
            'errors'  => $this->errors,
        ];
    }

    /**
     * Summary of eventInfo.
     *
     * @return array{id: int, hash_id: string, name: string, original_event_id: int, start_date: string }
     */
    private function eventInfo(Event $event): array
    {
        return [
            'id'                => $event->id,
            'hash_id'           => $event->hashId ?? '',
            'original_event_id' => $event->original_event_id,
            'start_date'        => $event->start_date->toDateString(),
            'name'              => $event->name,
        ];
    }
}
