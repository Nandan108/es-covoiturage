<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Image;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;

/** @psalm-suppress UnusedClass */
final class MyEventController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View
    {
        /** @psalm-suppress UndefinedMagicMethod */
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

        $imgFile = $request->file('image');
        if ($imgFile instanceof UploadedFile && $imgFile->isValid()) {
            $imageFile = $data['image'];
            $b64Image = base64_encode($imageFile->get());
            // Check if the image already exists in the database
            /** @psalm-suppress UndefinedMagicMethod */
            $image = Image::whereRaw('crc32(file) = ?', crc32($b64Image))->first();
            if (!$image) {
                $image = new Image([
                    'name' => $imgFile->getClientOriginalName(),
                    'file' => $b64Image,
                ]);
                $image->save();
                $image->ensureStoredLocally();
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

    public function destroy(string $eventId): RedirectResponse
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
