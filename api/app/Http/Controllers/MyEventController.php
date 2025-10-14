<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Image;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/** @psalm-suppress UnusedClass */
final class MyEventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View
    {
        $events = Event::withCount(['offers'])
            ->orderBy('start_date', 'desc')
            ->get();

        return view('my-events.index', ['events' => $events]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Event $myEvent): View
    {
        return view('my-events.edit', ['event' => $myEvent]);
    }

    protected function validateData(Request $request, ?Event $myEvent = null): array
    {
        $imgRequired = $myEvent ? '' : '|required';

        $data = $request->validate([
            'image'       => 'image|mimes:png,jpg,jpeg,webp|max:512000'.$imgRequired,
            'name'        => 'required|min:3|max:255',
            'start_date'  => 'date|required',
            'days'        => 'integer|required',
            'private'     => 'boolean|required',
            'loc_name'    => 'string',
            'loc_address' => 'required|string|max:255',
            // latitude and longitude are valid from Canada to Italy
            'loc_lat' => 'required|numeric|between:36,66',
            'loc_lng' => 'required|numeric|between:-175,18',
        ]);

        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $imageFile = $data['image'];
            $b64Image = base64_encode($imageFile->get());
            if (!($image = Image::whereRaw('crc32(file) = ?', crc32($b64Image))->first())) {
                // $request->image->move(public_path('images'), $imageName);
                $image = new Image([
                    'name' => $request->file('image')->getClientOriginalName(),
                    'file' => $b64Image,
                ]);
                $image->save();
            }
            $data['image_id'] = $image->id;
        }

        return $data;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Event $myEvent, Request $request): RedirectResponse
    {
        $data = $this->validateData($request, $myEvent);

        $myEvent->update($data);

        return redirect()->route('my-events.index')
            ->with(['success' => __('event updated')])
            ->with('event_id', $myEvent->id);
    }

    public function create(): View
    {
        return view('my-events.create');
    }

    /**
     * Manage writing a new event do database.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['loc_original_link'] = '';

        $event = Event::create($data);

        return redirect()
            ->route('my-events.index')
            ->with('success', __('event created'))
            ->with('event_id', $event->id);
    }

    public function destroy($eventId): RedirectResponse
    {
        $event = Event::find(Event::keyFromHashId($eventId));

        try {
            $deleted = $event?->delete();
        } catch (\Throwable $t) {
            $deleted = false;
        }

        $message = $deleted
            ? ['success' => __('event deleted')]
            : ['error' => __('event not deleted')];

        return redirect()->route('my-events.index')->with($message);
    }
}
