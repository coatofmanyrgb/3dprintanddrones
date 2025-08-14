<?php
// app/Http/Controllers/Api/FlightVideoController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FlightVideo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FlightVideoController extends Controller
{
    public function index(Request $request)
    {
        $query = FlightVideo::with(['user', 'project']);

        if ($request->has('aircraft_type')) {
            $query->where('aircraft_type', $request->aircraft_type);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        $videos = $query->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json($videos);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'video_file' => 'required|file|mimetypes:video/*|max:500000',
            'project_id' => 'nullable|exists:projects,id',
            'aircraft_type' => 'required|in:drone,kite,plane,rocket,other',
        ]);

        // Upload video to S3
        $videoPath = $request->file('video_file')->store('flight-videos', 's3');
        
        // Create thumbnail (you'd implement this)
        $thumbnailUrl = $this->generateThumbnail($videoPath);
        
        // Extract video duration (simplified)
        $duration = 300; // You'd extract this from the video
        
        $flightVideo = auth()->user()->flightVideos()->create([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'video_url' => Storage::disk('s3')->url($videoPath),
            'thumbnail_url' => $thumbnailUrl,
            'project_id' => $validated['project_id'],
            'aircraft_type' => $validated['aircraft_type'],
            'duration_seconds' => $duration,
            'flight_data' => [],
            'max_altitude' => 0,
            'max_speed' => 0,
        ]);

        // Award XP
        auth()->user()->addXP(150);

        // Queue video analysis job
        // ProcessFlightVideo::dispatch($flightVideo);

        return response()->json($flightVideo, 201);
    }

    public function show(FlightVideo $flightVideo)
    {
        $flightVideo->load(['user', 'project']);
        
        return response()->json($flightVideo);
    }

    public function update(Request $request, FlightVideo $flightVideo)
    {
        $this->authorize('update', $flightVideo);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'flight_data' => 'sometimes|array',
        ]);

        $flightVideo->update($validated);

        return response()->json($flightVideo);
    }

    public function destroy(FlightVideo $flightVideo)
    {
        $this->authorize('delete', $flightVideo);

        $flightVideo->delete();

        return response()->json([
            'message' => 'Flight video deleted successfully'
        ]);
    }

    public function addAnnotation(FlightVideo $flightVideo, Request $request)
    {
        $validated = $request->validate([
            'timestamp' => 'required|numeric',
            'type' => 'required|in:physics,technique,observation',
            'text' => 'required|string',
            'position' => 'nullable|array',
        ]);

        $annotations = $flightVideo->annotations ?? [];
        $annotations[] = array_merge($validated, [
            'user_id' => auth()->id(),
            'created_at' => now()
        ]);
        
        $flightVideo->annotations = $annotations;
        $flightVideo->save();

        return response()->json($flightVideo->annotations);
    }

    public function compare(Request $request)
    {
        $validated = $request->validate([
            'video_ids' => 'required|array|min:2|max:4',
            'video_ids.*' => 'exists:flight_videos,id',
        ]);

        $videos = FlightVideo::whereIn('id', $validated['video_ids'])
            ->with('user', 'project')
            ->get();

        $comparison = [
            'videos' => $videos,
            'max_altitude' => $videos->max('max_altitude'),
            'max_speed' => $videos->max('max_speed'),
            'longest_flight' => $videos->max('duration_seconds'),
            'efficiency_rankings' => $videos->map(function($video) {
                return [
                    'id' => $video->id,
                    'title' => $video->title,
                    'efficiency' => $video->flight_distance > 0 
                        ? $video->flight_distance / $video->duration_seconds 
                        : 0
                ];
            })->sortByDesc('efficiency')->values()
        ];

        return response()->json($comparison);
    }

    protected function generateThumbnail($videoPath)
    {
        // Implement thumbnail generation
        // For now, return a placeholder
        return 'https://via.placeholder.com/640x360';
    }
}