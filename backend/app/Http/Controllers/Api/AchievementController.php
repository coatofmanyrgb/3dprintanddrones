<?php
// app/Http/Controllers/Api/AchievementController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Achievement;
use App\Models\User;
use Illuminate\Http\Request;

class AchievementController extends Controller
{
    public function index()
    {
        $achievements = Achievement::all();
        $userAchievements = auth()->user()->achievements->pluck('id')->toArray();

        return response()->json([
            'achievements' => $achievements,
            'unlocked' => $userAchievements,
        ]);
    }

    public function userProgress()
    {
        $user = auth()->user();
        
        return response()->json([
            'xp' => $user->xp,
            'level' => $user->level,
            'next_level_xp' => ($user->level * 1000),
            'achievements_count' => $user->achievements()->count(),
            'recent_achievements' => $user->achievements()
                ->orderBy('user_achievements.unlocked_at', 'desc')
                ->take(5)
                ->get(),
            'stats' => [
                'projects' => $user->projects()->count(),
                'circuits' => $user->circuits()->count(),
                'flight_videos' => $user->flightVideos()->count(),
            ]
        ]);
    }

    public function leaderboard(Request $request)
    {
        $timeframe = $request->get('timeframe', 'all-time');
        $category = $request->get('category', 'xp');

        $query = User::query();

        // Filter by timeframe
        if ($timeframe === 'weekly') {
            $query->where('updated_at', '>=', now()->subWeek());
        } elseif ($timeframe === 'monthly') {
            $query->where('updated_at', '>=', now()->subMonth());
        }

        // Order by category
        switch ($category) {
            case 'projects':
                $query->withCount('projects')
                    ->orderBy('projects_count', 'desc');
                break;
            case 'achievements':
                $query->withCount('achievements')
                    ->orderBy('achievements_count', 'desc');
                break;
            default:
                $query->orderBy('xp', 'desc');
        }

        $leaderboard = $query->take(100)
            ->get(['id', 'username', 'avatar', 'xp', 'level']);

        return response()->json($leaderboard);
    }
}