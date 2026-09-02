<?php

namespace App\Http\Controllers;

use App\Services\AffordabilityCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalculatorController extends Controller
{
    public function affordability(Request $request, AffordabilityCalculator $calculator): JsonResponse
    {
        $validated = $request->validate([
            'monthly_income' => ['required', 'numeric', 'gt:0'],
            'monthly_rent' => ['required', 'numeric', 'gte:0'],
            'utilities' => ['nullable', 'numeric', 'gte:0'],
            'transport' => ['nullable', 'numeric', 'gte:0'],
            'food' => ['nullable', 'numeric', 'gte:0'],
            'other_expenses' => ['nullable', 'numeric', 'gte:0'],
        ]);

        return response()->json(['data' => $calculator->calculate($validated)]);
    }
}