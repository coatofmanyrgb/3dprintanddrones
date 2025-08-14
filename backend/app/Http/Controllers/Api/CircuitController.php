<?php
// app/Http/Controllers/Api/CircuitController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Circuit;
use Illuminate\Http\Request;

class CircuitController extends Controller
{
    public function index(Request $request)
    {
        $query = Circuit::with('user');

        if ($request->has('is_challenge')) {
            $query->where('is_challenge', true);
        }

        if ($request->has('is_public')) {
            $query->where('is_public', true);
        }

        $circuits = $query->orderBy('created_at', 'desc')
            ->paginate(12);

        return response()->json($circuits);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'circuit_data' => 'required|array',
            'is_public' => 'boolean',
        ]);

        // Extract components from circuit data
        $components = $this->extractComponents($validated['circuit_data']);
        
        // Simulate circuit
        $simulationResults = $this->simulateCircuit($validated['circuit_data']);
        
        $circuit = auth()->user()->circuits()->create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'circuit_data' => $validated['circuit_data'],
            'components' => $components,
            'simulation_results' => $simulationResults,
            'is_public' => $validated['is_public'] ?? true,
        ]);

        // Award XP
        auth()->user()->addXP(50);

        // Check for achievements
        $this->checkCircuitAchievements();

        return response()->json($circuit, 201);
    }

    public function show(Circuit $circuit)
    {
        $circuit->load('user');
        
        return response()->json($circuit);
    }

    public function update(Request $request, Circuit $circuit)
    {
        $this->authorize('update', $circuit);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'circuit_data' => 'sometimes|array',
            'is_public' => 'sometimes|boolean',
        ]);

        if (isset($validated['circuit_data'])) {
            $validated['components'] = $this->extractComponents($validated['circuit_data']);
            $validated['simulation_results'] = $this->simulateCircuit($validated['circuit_data']);
        }

        $circuit->update($validated);

        return response()->json($circuit);
    }

    public function destroy(Circuit $circuit)
    {
        $this->authorize('delete', $circuit);

        $circuit->delete();

        return response()->json([
            'message' => 'Circuit deleted successfully'
        ]);
    }

    public function challenges()
    {
        $challenges = Circuit::where('is_challenge', true)
            ->orderBy('difficulty_level')
            ->get();

        return response()->json($challenges);
    }

    public function submitSolution(Circuit $challenge, Request $request)
    {
        if (!$challenge->is_challenge) {
            return response()->json([
                'message' => 'This is not a challenge circuit'
            ], 422);
        }

        $validated = $request->validate([
            'circuit_data' => 'required|array',
        ]);

        // Verify solution
        $isCorrect = $this->verifySolution(
            $challenge->circuit_data,
            $validated['circuit_data']
        );

        if ($isCorrect) {
            // Award XP based on difficulty
            $xpReward = $challenge->difficulty_level * 100;
            auth()->user()->addXP($xpReward);

            return response()->json([
                'success' => true,
                'xp_earned' => $xpReward,
                'message' => 'Challenge completed successfully!'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Solution incorrect. Try again!'
        ], 422);
    }

    protected function extractComponents($circuitData)
    {
        $components = [];
        foreach ($circuitData['components'] ?? [] as $component) {
            $type = $component['type'];
            $components[$type] = ($components[$type] ?? 0) + 1;
        }
        return $components;
    }

    protected function simulateCircuit($circuitData)
    {
        // Simplified simulation
        $voltage = $circuitData['voltage'] ?? 5;
        $totalResistance = 100; // Simplified calculation
        $current = $voltage / $totalResistance;
        
        return [
            'voltage' => $voltage,
            'current' => round($current * 1000, 2), // in mA
            'resistance' => $totalResistance,
            'power' => round($voltage * $current * 1000, 2), // in mW
        ];
    }

    protected function verifySolution($challengeData, $solutionData)
    {
        // Simplified verification
        $challengeResults = $this->simulateCircuit($challengeData);
        $solutionResults = $this->simulateCircuit($solutionData);
        
        $tolerance = 0.1; // 10% tolerance
        
        return abs($challengeResults['current'] - $solutionResults['current']) 
            <= $challengeResults['current'] * $tolerance;
    }

    protected function checkCircuitAchievements()
    {
        $user = auth()->user();
        $circuitCount = $user->circuits()->count();
        
        // Check for "First Circuit" achievement
        if ($circuitCount === 1) {
            // Award achievement
        }
        
        // Check for "Circuit Master" achievement
        if ($circuitCount >= 10) {
            // Award achievement
        }
    }
}