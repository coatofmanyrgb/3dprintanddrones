<?php

use Illuminate\Http\Request; // CORRECT - Use this one!
use Illuminate\Support\Facades\Route;
// use Illuminate\Support\Facades\Request; // WRONG - Don't use this!

use App\Http\Controllers\Api\{
    AuthController,
    ProjectController,
    FlightVideoController,
    CircuitController,
    AchievementController,
    WorkshopController,
    TeamProjectController
};

// Authentication routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public routes
Route::get('/projects', [ProjectController::class, 'index']);
Route::get('/projects/{project}', [ProjectController::class, 'show']);
Route::get('/workshops/live', [WorkshopController::class, 'live']);
Route::get('/leaderboard', [AchievementController::class, 'leaderboard']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // This is the route that's causing the error - make sure it uses the correct Request class
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Projects
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::put('/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/projects/{project}', [ProjectController::class, 'destroy']);
    Route::post('/projects/{project}/vote', [ProjectController::class, 'vote']);
    Route::post('/projects/{project}/evolution', [ProjectController::class, 'evolution']);
    
    // Flight Videos
    Route::get('/flight-videos', [FlightVideoController::class, 'index']);
    Route::post('/flight-videos', [FlightVideoController::class, 'store']);
    Route::get('/flight-videos/{flightVideo}', [FlightVideoController::class, 'show']);
    Route::put('/flight-videos/{flightVideo}', [FlightVideoController::class, 'update']);
    Route::delete('/flight-videos/{flightVideo}', [FlightVideoController::class, 'destroy']);
    Route::post('/flight-videos/{flightVideo}/annotate', [FlightVideoController::class, 'addAnnotation']);
    Route::post('/flight-videos/compare', [FlightVideoController::class, 'compare']);

    //Flight Analysis

    Route::get('/flight-videos/{video}/analysis', [FlightAnalysisController::class, 'show']);
    Route::post('/flight-videos/{video}/analyze', [FlightAnalysisController::class, 'analyzeVideo']);
    Route::post('/flight-videos/{video}/telemetry', [FlightAnalysisController::class, 'storeDataPoint']);
    Route::get('/flight-videos/{video}/path', [FlightAnalysisController::class, 'getFlightPath']);
    Route::post('/flight-videos/compare-analysis', [FlightAnalysisController::class, 'compare']);
    
    // Circuits
    Route::get('/circuits', [CircuitController::class, 'index']);
    Route::post('/circuits', [CircuitController::class, 'store']);
    Route::get('/circuits/{circuit}', [CircuitController::class, 'show']);
    Route::put('/circuits/{circuit}', [CircuitController::class, 'update']);
    Route::delete('/circuits/{circuit}', [CircuitController::class, 'destroy']);
    Route::get('/circuits/challenges', [CircuitController::class, 'challenges']);
    Route::post('/circuits/{challenge}/solve', [CircuitController::class, 'submitSolution']);
    
    // Achievements
    Route::get('/achievements', [AchievementController::class, 'index']);
    Route::get('/achievements/progress', [AchievementController::class, 'userProgress']);
    
    // Workshops
    Route::get('/workshops', [WorkshopController::class, 'index']);
    Route::get('/workshops/upcoming', [WorkshopController::class, 'upcoming']);
    Route::post('/workshops', [WorkshopController::class, 'store']);
    Route::get('/workshops/{workshop}', [WorkshopController::class, 'show']);
    Route::post('/workshops/{workshop}/register', [WorkshopController::class, 'register']);
    Route::delete('/workshops/{workshop}/register', [WorkshopController::class, 'unregister']);
    Route::post('/workshops/{workshop}/start', [WorkshopController::class, 'startStream']);
    Route::post('/workshops/{workshop}/end', [WorkshopController::class, 'endStream']);
    
    // Team Projects
    Route::get('/team-projects', [TeamProjectController::class, 'index']);
    Route::post('/team-projects', [TeamProjectController::class, 'store']);
    Route::get('/team-projects/{project}', [TeamProjectController::class, 'show']);
    Route::put('/team-projects/{project}', [TeamProjectController::class, 'update']);
    Route::post('/team-projects/{project}/join', [TeamProjectController::class, 'join']);
    Route::delete('/team-projects/{project}/leave', [TeamProjectController::class, 'leave']);
});