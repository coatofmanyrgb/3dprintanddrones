<?php
// app/Models/Project.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'model_url',
        'model_data',
        'evolution_timeline',
        'votes',
        'views',
        'featured',
        'thumbnail',
        'status',
        'tags',
        'materials',
        'specifications'
    ];

    protected $casts = [
        'model_data' => 'array',
        'evolution_timeline' => 'array',
        'tags' => 'array',
        'materials' => 'array',
        'specifications' => 'array',
        'featured' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function votes()
    {
        return $this->hasMany(ProjectVote::class);
    }

    public function flightVideos()
    {
        return $this->hasMany(FlightVideo::class);
    }

    public function incrementViews()
    {
        $this->increment('views');
    }
}