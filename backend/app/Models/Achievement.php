<?php
// app/Models/Achievement.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Achievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'xp_reward',
        'category',
        'requirements',
        'tier'
    ];

    protected $casts = [
        'requirements' => 'array',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_achievements')
                    ->withPivot('unlocked_at', 'progress')
                    ->withTimestamps();
    }
}