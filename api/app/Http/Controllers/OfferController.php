<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Offer;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class OfferController extends Controller
{
    private function validateForm(Request $request) {
        $data = $request->validate([
            'name' => 'string|min:3|max:50',
            'email' => 'required|email',
            'notes' => 'nullable|string|max:500',
            //'email_is_public' => 'required|boolean',
            'phone' => 'regex:/^\+?[()\d ]+$/',
            'driver_seats' => 'required|int|min:0',
            'pasngr_seats' => 'required|int|min:0|max:10',
            //'driver_seats|pasngr_seats' => 'required|gt:0:Please specify at least one seat',
            'address' => 'required|string|max:255',
            // latitude and longitude are valid from Canada to Italy
            'lat' => 'required|numeric|between:36,66',
            'lng' => 'required|numeric|between:-175,18',
        ]);

        // $data['role'] = implode(',', $data['role']);

        return $data;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param \App\Models\Event $event
     * @param \Illuminate\Http\Request $request
     */
    public function store(Event $event, Request $request): JsonResponse
    {
        $data = $this->validateForm($request);

        $offer = $event->offers()->create($data)->toArray();

        unset($offer['event_id']);
        $offer['eventHash'] = $event->hash_id;

        return response()->json([
            'message' => 'Offer created successfully',
            'offer' => $offer
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Offer $offer) {

    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Event $event, Offer $offer)
    {
        return view('offers.edit', [
            'event' => $event,
            'offer' => $offer,
            'possibleRoles' => Offer::$roles,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Event $event, Offer $offer, Request $request)
    {
        if ($event->id !== $offer->event_id) {
            return response()->json(['message' => 'Offer does not belong to the specified event'], 400);
        }

        $data = $this->validateForm($request);
        $offer->update($data);

        return response()->json(['message' => 'Offer updated successfully', 'offer' => $offer], 200);

        //return redirect()->route('events.show', $event)->withFragment($offer->id);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Event $event, Offer $offer)
    {
        if ($event->id !== $offer->event_id) {
            return response()->json(['message' => 'Offer does not belong to the specified event'], 400);
        }

        $result = $offer->delete() ? ['deleted successfully', 200] : ['not deleted', 500];

        return response()->json(['message' => 'Offer ' . $result[0]], $result[1]);
    }
}
