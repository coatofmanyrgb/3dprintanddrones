<?php
// app/Models/Circuit.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Circuit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'circuit_data',
        'components',
        'simulation_results',
        'is_public',
        'is_challenge',
        'difficulty_level'
    ];

    protected $casts = [
        'circuit_data' => 'array',
        'components' => 'array',
        'simulation_results' => 'array',
        'is_public' => 'boolean',
        'is_challenge' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}