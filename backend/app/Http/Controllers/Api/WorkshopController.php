<?php
// app/Http/Controllers/Api/WorkshopController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workshop;
use Illuminate\Http\Request;

class WorkshopController extends Controller
{
    public function index()
    {
        $workshops = Workshop::with('instructor')
            ->orderBy('start_time')
            ->paginate(12);

        return response()->json($workshops);
    }

    public function upcoming()
    {
        $workshops = Workshop::where('status', 'scheduled')
            ->where('start_time', '>', now())
            ->orderBy('start_time')
            ->with('instructor')
            ->get();

        return response()->json($workshops);
    }

    public function live()
    {
        $workshop = Workshop::where('status', 'live')
            ->with(['instructor', 'participants'])
            ->first();

        return response()->json($workshop);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Workshop::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'start_time' => 'required|date|after:now',
            'duration_minutes' => 'required|integer|min:15|max:480',
            'max_participants' => 'nullable|integer|min:1',
            'topics' => 'nullable|array',
            'materials' => 'nullable|array',
        ]);

        $workshop = auth()->user()->workshops()->create($validated);

        return response()->json($workshop, 201);
    }

    public function show(Workshop $workshop)
    {
        $workshop->load(['instructor', 'participants']);
        
        $isRegistered = false;
        if (auth()->check()) {
            $isRegistered = $workshop->participants()
                ->where('user_id', auth()->id())
                ->exists();
        }

        return response()->json([
            'workshop' => $workshop,
            'is_registered' => $isRegistered,
            'participants_count' => $workshop->participants()->count()
        ]);
    }

    public function register(Workshop $workshop)
    {
        if ($workshop->status !== 'scheduled') {
            return response()->json([
                'message' => 'Cannot register for this workshop'
            ], 422);
        }

        if ($workshop->max_participants && 
            $workshop->participants()->count() >= $workshop->max_participants) {
            return response()->json([
                'message' => 'Workshop is full'
            ], 422);
        }

        $workshop->participants()->attach(auth()->id());
        
        return response()->json([
            'message' => 'Successfully registered',
            'workshop' => $workshop
        ]);
    }

    public function unregister(Workshop $workshop)
    {
        $workshop->participants()->detach(auth()->id());
        
        return response()->json([
            'message' => 'Successfully unregistered'
        ]);
    }

    public function startStream(Workshop $workshop)
    {
        $this->authorize('start', $workshop);

        $workshop->update([
            'status' => 'live',
            'stream_url' => $this->generateStreamUrl($workshop)
        ]);

        // Broadcast event to participants
        // broadcast(new WorkshopStarted($workshop));

        return response()->json($workshop);
    }

    public function endStream(Workshop $workshop)
    {
        $this->authorize('end', $workshop);

        $workshop->update([
            'status' => 'completed'
        ]);

        // Award XP to participants
        foreach ($workshop->participants as $participant) {
            $participant->addXP(50);
        }

        return response()->json($workshop);
    }

    protected function generateStreamUrl($workshop)
    {
        // Integration with streaming service
        return "https://stream.stemlab.io/workshop/{$workshop->id}";
    }
}