<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $events = Event::query()
            ->upcoming() // this scope filters out expired events
            ->orderBy('start_date')
            ->get()
            ->each->append('hashId')->makeHidden('id');

        return response()->json($events);
    }

    /**
     * Display the specified resource.
     */
    public function show(Event $event)
    {
        $event->load(['offers' => fn ($q) => $q->latest()]);

        //return view('events.show', ['event' => $event]);
        return response()->json($event);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }
}
