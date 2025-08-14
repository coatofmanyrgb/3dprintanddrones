<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    /**
     * Display a listing of the projects.
     */
    public function index(Request $request)
    {
        $query = Project::with('user');

        // Filter by user if provided
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by category
        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Sorting
        switch ($request->get('sort', 'recent')) {
            case 'popular':
                $query->orderBy('votes', 'desc');
                break;
            case 'name':
                $query->orderBy('title', 'asc');
                break;
            case 'recent':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Pagination
        $projects = $query->paginate($request->get('per_page', 12));

        return response()->json($projects);
    }

    /**
     * Store a newly created project.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:3d,flight,electronics,robotics,other',
            'model_file' => 'nullable|file|mimes:stl,obj,3mf,gcode|max:51200', // 50MB
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB
            'tags' => 'nullable|json',
            'materials' => 'nullable|json',
            'specifications' => 'nullable|json',
            'status' => 'nullable|in:draft,published',
        ]);

        $data = [
            'user_id' => Auth::id(),
            'title' => $request->title,
            'description' => $request->description,
            'category' => $request->category,
            'status' => $request->status ?? 'draft',
        ];

        // Handle file uploads
        if ($request->hasFile('model_file')) {
            $modelPath = $request->file('model_file')->store('models', 'public');
            $data['model_url'] = Storage::url($modelPath);
        }

        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('thumbnails', 'public');
            $data['thumbnail'] = Storage::url($thumbnailPath);
        }

        // Parse JSON strings
        if ($request->tags) {
            $data['tags'] = json_decode($request->tags, true);
        }
        if ($request->materials) {
            $data['materials'] = json_decode($request->materials, true);
        }
        if ($request->specifications) {
            $data['specifications'] = json_decode($request->specifications, true);
        }

        $project = Project::create($data);

        return response()->json($project, 201);
    }

    /**
     * Display the specified project.
     */
    public function show(Project $project)
    {
        // Increment views
        $project->incrementViews();
        
        // Load relationships
        $project->load(['user', 'flightVideos']);
        
        return response()->json($project);
    }

    /**
     * Update the specified project.
     */
    public function update(Request $request, Project $project)
    {
        // Check if user owns the project
        if ($project->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'category' => 'sometimes|required|in:3d,flight,electronics,robotics,other',
            'status' => 'sometimes|required|in:draft,published,archived',
            'model_url' => 'nullable|string',
            'model_data' => 'nullable|json',
            'tags' => 'nullable|array',
            'materials' => 'nullable|array',
            'specifications' => 'nullable|array',
        ]);

        $project->update($request->all());

        return response()->json($project);
    }

    /**
     * Remove the specified project.
     */
    public function destroy(Project $project)
    {
        // Check if user owns the project
        if ($project->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }

    /**
     * Vote for a project.
     */
    public function vote(Project $project)
    {
        $user = Auth::user();
        
        // Check if user already voted
        $existingVote = $project->votes()->where('user_id', $user->id)->first();
        
        if ($existingVote) {
            // Remove vote
            $existingVote->delete();
            $project->decrement('votes');
            $voted = false;
        } else {
            // Add vote
            $project->votes()->create(['user_id' => $user->id]);
            $project->increment('votes');
            $voted = true;
        }
        
        return response()->json([
            'voted' => $voted,
            'votes' => $project->votes
        ]);
    }

    /**
     * Add evolution timeline entry.
     */
    public function evolution(Request $request, Project $project)
    {
        // Check if user owns the project
        if ($project->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string',
            'description' => 'required|string',
            'image_url' => 'nullable|string',
        ]);

        $timeline = $project->evolution_timeline ?? [];
        $timeline[] = [
            'title' => $request->title,
            'description' => $request->description,
            'image_url' => $request->image_url,
            'created_at' => now(),
        ];

        $project->update(['evolution_timeline' => $timeline]);

        return response()->json($project);
    }
}