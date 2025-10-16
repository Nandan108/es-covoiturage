<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;

/** @psalm-suppress UnusedClass */
final class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @psalm-suppress PossiblyUnusedMethod
     */
    public function index(): JsonResponse
    {
        $events = Event::query()
            ->upcoming() // this scope filters out expired events
            ->orderBy('start_date')
            ->get()
            ->each->append('hashId')->makeHidden('id');

        return response()->json(['data' => $events]);
    }

    /**
     * Display the specified resource.
     *
     * @psalm-suppress PossiblyUnusedMethod
     */
    public function show(Event $event): JsonResponse
    {
        $event->load(['offers' => fn (Builder $q): mixed => $q->latest()]);

        // return view('events.show', ['event' => $event]);
        return response()->json(['data' => $event]);
    }
}
