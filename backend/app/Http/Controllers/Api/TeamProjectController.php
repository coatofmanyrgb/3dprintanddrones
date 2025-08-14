<?php
// app/Http/Controllers/Api/TeamProjectController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TeamProject;
use Illuminate\Http\Request;

class TeamProjectController extends Controller
{
    public function index(Request $request)
    {
        $query = TeamProject::with(['leader', 'members']);

        if ($request->has('recruiting')) {
            $query->where('status', 'recruiting');
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $projects = $query->paginate(12);

        return response()->json($projects);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'max_members' => 'integer|min:2|max:10',
            'skills_needed' => 'array',
        ]);

        $project = auth()->user()->ledTeamProjects()->create($validated);

        // Add leader as first member
        $project->members()->attach(auth()->id(), [
            'role' => 'leader',
            'joined_at' => now()
        ]);

        return response()->json($project, 201);
    }

    public function show(TeamProject $project)
    {
        $project->load(['leader', 'members']);
        
        $isMember = false;
        if (auth()->check()) {
            $isMember = $project->members()
                ->where('user_id', auth()->id())
                ->exists();
        }

        return response()->json([
            'project' => $project,
            'is_member' => $isMember,
            'members_count' => $project->members()->count()
        ]);
    }

    public function update(Request $request, TeamProject $project)
    {
        $this->authorize('update', $project);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'status' => 'sometimes|in:recruiting,active,completed,paused',
            'max_members' => 'sometimes|integer|min:2|max:10',
            'skills_needed' => 'sometimes|array',
            'milestones' => 'sometimes|array',
        ]);

        $project->update($validated);

        return response()->json($project);
    }

    public function join(TeamProject $project)
    {
        if ($project->status !== 'recruiting') {
            return response()->json([
                'message' => 'This team is not recruiting'
            ], 422);
        }

        if ($project->members()->count() >= $project->max_members) {
            return response()->json([
                'message' => 'Team is full'
            ], 422);
        }

        $project->members()->attach(auth()->id(), [
            'role' => 'member',
            'joined_at' => now()
        ]);

        // Award XP
        auth()->user()->addXP(25);

        return response()->json([
            'message' => 'Successfully joined team',
            'project' => $project->load('members')
        ]);
    }

    public function leave(TeamProject $project)
    {
        if ($project->leader_id === auth()->id()) {
            return response()->json([
                'message' => 'Team leader cannot leave the project'
            ], 422);
        }

        $project->members()->detach(auth()->id());

        return response()->json([
            'message' => 'Successfully left team'
        ]);
    }
}