<?php
// app/Models/User.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'avatar',
        'xp',
        'level',
        'credits',
        'theme',
        'preferences',
        'role',
        'last_active'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_active' => 'datetime',
        'preferences' => 'array',
        'password' => 'hashed',
    ];

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function flightVideos()
    {
        return $this->hasMany(FlightVideo::class);
    }

    public function circuits()
    {
        return $this->hasMany(Circuit::class);
    }

    public function achievements()
    {
        return $this->belongsToMany(Achievement::class, 'user_achievements')
                    ->withPivot('unlocked_at', 'progress')
                    ->withTimestamps();
    }

    public function workshops()
    {
        return $this->hasMany(Workshop::class, 'instructor_id');
    }

    public function ledTeamProjects()
    {
        return $this->hasMany(TeamProject::class, 'leader_id');
    }

    public function teamProjects()
    {
        return $this->belongsToMany(TeamProject::class, 'team_project_members')
                    ->withPivot('role', 'joined_at')
                    ->withTimestamps();
    }

    public function addXP($amount)
    {
        $this->xp += $amount;
        $this->checkLevelUp();
        $this->save();
    }

    protected function checkLevelUp()
    {
        $newLevel = floor($this->xp / 1000) + 1;
        if ($newLevel > $this->level) {
            $this->level = $newLevel;
            // Dispatch level up event if needed
        }
    }
}