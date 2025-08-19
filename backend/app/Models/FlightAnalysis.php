<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlightAnalysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'flight_video_id',
        'flight_data',
        'max_altitude',
        'max_speed',
        'avg_speed',
        'total_distance',
        'flight_time',
        'battery_used',
        'takeoff_location',
        'landing_location',
        'weather_conditions',
        'wind_speed',
        'temperature',
        'analyzed_at',
        'telemetry_data',
        'waypoints',
        'warnings',
        'performance_score'
    ];

    protected $casts = [
        'flight_data' => 'array',
        'takeoff_location' => 'array',
        'landing_location' => 'array',
        'weather_conditions' => 'array',
        'telemetry_data' => 'array',
        'waypoints' => 'array',
        'warnings' => 'array',
        'analyzed_at' => 'datetime',
        'max_altitude' => 'decimal:2',
        'max_speed' => 'decimal:2',
        'avg_speed' => 'decimal:2',
        'total_distance' => 'decimal:2',
        'wind_speed' => 'decimal:2',
        'temperature' => 'decimal:2',
        'performance_score' => 'integer'
    ];

    public function flightVideo()
    {
        return $this->belongsTo(FlightVideo::class);
    }

    /**
     * Get formatted flight duration
     */
    public function getFormattedDurationAttribute()
    {
        $minutes = floor($this->flight_time / 60);
        $seconds = $this->flight_time % 60;
        return sprintf('%d:%02d', $minutes, $seconds);
    }

    /**
     * Get altitude data for charts
     */
    public function getAltitudeChartDataAttribute()
    {
        if (!$this->flight_data) return [];
        
        return collect($this->flight_data)->map(function ($point) {
            return [
                'time' => $point['timestamp'] ?? 0,
                'value' => $point['altitude'] ?? 0
            ];
        })->toArray();
    }

    /**
     * Get speed data for charts
     */
    public function getSpeedChartDataAttribute()
    {
        if (!$this->flight_data) return [];
        
        return collect($this->flight_data)->map(function ($point) {
            return [
                'time' => $point['timestamp'] ?? 0,
                'value' => $point['speed'] ?? 0
            ];
        })->toArray();
    }

    /**
     * Calculate efficiency score
     */
    public function calculateEfficiency()
    {
        if (!$this->battery_used || !$this->total_distance) {
            return 0;
        }
        
        return round(($this->total_distance / $this->battery_used) * 100, 2);
    }
}