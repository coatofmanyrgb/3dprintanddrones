<?php
// app/Models/Workshop.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workshop extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id',
        'title',
        'description',
        'start_time',
        'duration_minutes',
        'stream_url',
        'max_participants',
        'status',
        'topics',
        'materials'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'topics' => 'array',
        'materials' => 'array',
    ];

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function participants()
    {
        return $this->belongsToMany(User::class, 'workshop_participants')
                    ->withTimestamps();
    }
}