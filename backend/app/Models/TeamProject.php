<?php
// app/Models/TeamProject.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeamProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'leader_id',
        'max_members',
        'status',
        'skills_needed',
        'milestones'
    ];

    protected $casts = [
        'skills_needed' => 'array',
        'milestones' => 'array',
    ];

    public function leader()
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'team_project_members')
                    ->withPivot('role', 'joined_at')
                    ->withTimestamps();
    }
}