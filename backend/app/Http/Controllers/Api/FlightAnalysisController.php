<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FlightVideo;
use App\Models\FlightAnalysis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use FFMpeg\FFMpeg;
use FFMpeg\Coordinate\TimeCode;

class FlightAnalysisController extends Controller
{
    /**
     * Get flight analysis data for a video
     */
    public function show($videoId)
    {
        $video = FlightVideo::with(['analysis', 'user'])->findOrFail($videoId);
        
        return response()->json([
            'video' => $video,
            'analysis' => $video->analysis ?? $this->generateMockAnalysis($video)
        ]);
    }
    
    /**
     * Store real-time flight data point
     */
    public function storeDataPoint(Request $request, $videoId)
    {
        $request->validate([
            'timestamp' => 'required|numeric',
            'altitude' => 'required|numeric',
            'speed' => 'required|numeric',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'battery' => 'nullable|numeric',
            'signal_strength' => 'nullable|numeric',
            'pitch' => 'nullable|numeric',
            'roll' => 'nullable|numeric',
            'yaw' => 'nullable|numeric',
        ]);
        
        $video = FlightVideo::findOrFail($videoId);
        
        // Store data point
        $analysis = $video->analysis()->firstOrCreate([]);
        
        $flightData = $analysis->flight_data ?? [];
        $flightData[] = array_merge($request->all(), [
            'recorded_at' => now()
        ]);
        
        $analysis->update([
            'flight_data' => $flightData,
            'max_altitude' => max($analysis->max_altitude ?? 0, $request->altitude),
            'max_speed' => max($analysis->max_speed ?? 0, $request->speed),
            'avg_speed' => $this->calculateAverage($flightData, 'speed'),
            'total_distance' => $this->calculateTotalDistance($flightData),
        ]);
        
        return response()->json([
            'success' => true,
            'data_point' => end($flightData)
        ]);
    }
    
    /**
     * Analyze uploaded video
     */
    public function analyzeVideo(Request $request, $videoId)
    {
        $video = FlightVideo::findOrFail($videoId);
        
        // In production, this would extract telemetry from video metadata
        // For now, generate sample data
        $analysis = $this->generateFlightAnalysis($video);
        
        return response()->json([
            'success' => true,
            'analysis' => $analysis
        ]);
    }
    
    /**
     * Get comparison between multiple flights
     */
    public function compare(Request $request)
    {
        $request->validate([
            'video_ids' => 'required|array|min:2|max:4',
            'video_ids.*' => 'exists:flight_videos,id'
        ]);
        
        $videos = FlightVideo::with('analysis')
            ->whereIn('id', $request->video_ids)
            ->get();
        
        $comparison = [
            'videos' => $videos,
            'metrics' => $this->compareMetrics($videos),
            'performance' => $this->comparePerformance($videos)
        ];
        
        return response()->json($comparison);
    }
    
    /**
     * Generate flight path GeoJSON
     */
    public function getFlightPath($videoId)
    {
        $video = FlightVideo::with('analysis')->findOrFail($videoId);
        
        if (!$video->analysis || !$video->analysis->flight_data) {
            return response()->json([
                'type' => 'FeatureCollection',
                'features' => []
            ]);
        }
        
        $coordinates = collect($video->analysis->flight_data)
            ->filter(function ($point) {
                return isset($point['latitude']) && isset($point['longitude']);
            })
            ->map(function ($point) {
                return [$point['longitude'], $point['latitude'], $point['altitude'] ?? 0];
            })
            ->values()
            ->toArray();
        
        return response()->json([
            'type' => 'FeatureCollection',
            'features' => [
                [
                    'type' => 'Feature',
                    'geometry' => [
                        'type' => 'LineString',
                        'coordinates' => $coordinates
                    ],
                    'properties' => [
                        'video_id' => $video->id,
                        'title' => $video->title
                    ]
                ]
            ]
        ]);
    }
    
    private function generateMockAnalysis($video)
    {
        $duration = $video->duration_seconds ?? 180;
        $dataPoints = [];
        
        for ($i = 0; $i <= $duration; $i += 5) {
            $dataPoints[] = [
                'timestamp' => $i,
                'altitude' => 50 + sin($i / 30) * 30 + rand(-5, 5),
                'speed' => 25 + cos($i / 20) * 15 + rand(-3, 3),
                'battery' => 100 - ($i / $duration * 30),
                'signal_strength' => 90 + rand(-10, 10),
                'pitch' => sin($i / 15) * 10,
                'roll' => cos($i / 20) * 5,
                'yaw' => ($i / $duration) * 360,
                'latitude' => 40.7128 + sin($i / 100) * 0.01,
                'longitude' => -74.0060 + cos($i / 100) * 0.01,
            ];
        }
        
        return [
            'flight_data' => $dataPoints,
            'max_altitude' => 85,
            'max_speed' => 42,
            'avg_speed' => 25,
            'total_distance' => 3.2,
            'flight_time' => $duration,
            'battery_used' => 30,
            'analyzed_at' => now()
        ];
    }
    
    private function generateFlightAnalysis($video)
    {
        $analysis = FlightAnalysis::updateOrCreate(
            ['flight_video_id' => $video->id],
            $this->generateMockAnalysis($video)
        );
        
        return $analysis;
    }
    
    private function calculateAverage($data, $field)
    {
        $values = collect($data)->pluck($field)->filter();
        return $values->isEmpty() ? 0 : $values->avg();
    }
    
    private function calculateTotalDistance($data)
    {
        $distance = 0;
        $points = collect($data)->filter(function ($point) {
            return isset($point['latitude']) && isset($point['longitude']);
        })->values();
        
        for ($i = 1; $i < $points->count(); $i++) {
            $distance += $this->haversineDistance(
                $points[$i - 1]['latitude'],
                $points[$i - 1]['longitude'],
                $points[$i]['latitude'],
                $points[$i]['longitude']
            );
        }
        
        return round($distance, 2);
    }
    
    private function haversineDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // km
        
        $latDiff = deg2rad($lat2 - $lat1);
        $lonDiff = deg2rad($lon2 - $lon1);
        
        $a = sin($latDiff / 2) * sin($latDiff / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDiff / 2) * sin($lonDiff / 2);
        
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }
    
    private function compareMetrics($videos)
    {
        return [
            'altitude' => [
                'max' => $videos->max('analysis.max_altitude'),
                'avg' => $videos->avg('analysis.max_altitude'),
                'data' => $videos->map(function ($video) {
                    return [
                        'id' => $video->id,
                        'title' => $video->title,
                        'value' => $video->analysis->max_altitude ?? 0
                    ];
                })
            ],
            'speed' => [
                'max' => $videos->max('analysis.max_speed'),
                'avg' => $videos->avg('analysis.avg_speed'),
                'data' => $videos->map(function ($video) {
                    return [
                        'id' => $video->id,
                        'title' => $video->title,
                        'max' => $video->analysis->max_speed ?? 0,
                        'avg' => $video->analysis->avg_speed ?? 0
                    ];
                })
            ],
            'distance' => [
                'total' => $videos->sum('analysis.total_distance'),
                'data' => $videos->map(function ($video) {
                    return [
                        'id' => $video->id,
                        'title' => $video->title,
                        'value' => $video->analysis->total_distance ?? 0
                    ];
                })
            ]
        ];
    }
    
    private function comparePerformance($videos)
    {
        // Calculate performance scores
        return $videos->map(function ($video) {
            $analysis = $video->analysis;
            if (!$analysis) {
                return [
                    'id' => $video->id,
                    'title' => $video->title,
                    'score' => 0,
                    'metrics' => []
                ];
            }
            
            // Simple scoring algorithm
            $altitudeScore = min(($analysis->max_altitude ?? 0) / 100, 1) * 25;
            $speedScore = min(($analysis->avg_speed ?? 0) / 50, 1) * 25;
            $distanceScore = min(($analysis->total_distance ?? 0) / 5, 1) * 25;
            $efficiencyScore = $analysis->battery_used ? 
                min(($analysis->total_distance ?? 0) / ($analysis->battery_used ?? 1), 1) * 25 : 0;
            
            return [
                'id' => $video->id,
                'title' => $video->title,
                'score' => round($altitudeScore + $speedScore + $distanceScore + $efficiencyScore),
                'metrics' => [
                    'altitude' => round($altitudeScore),
                    'speed' => round($speedScore),
                    'distance' => round($distanceScore),
                    'efficiency' => round($efficiencyScore)
                ]
            ];
        });
    }
}