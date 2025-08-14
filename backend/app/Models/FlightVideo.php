<?php
// app/Models/FlightVideo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FlightVideo extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'project_id',
        'title',
        'description',
        'video_url',
        'thumbnail_url',
        'flight_data',
        'annotations',
        'duration_seconds',
        'max_altitude',
        'max_speed',
        'flight_distance',
        'aircraft_type'
    ];

    protected $casts = [
        'flight_data' => 'array',
        'annotations' => 'array',
        'max_altitude' => 'decimal:2',
        'max_speed' => 'decimal:2',
        'flight_distance' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}