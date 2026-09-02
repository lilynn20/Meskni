<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);
        $reports = Report::with(['listing:id,title,city,neighborhood', 'reporter:id,name'])->latest()->get();
        return response()->json(['data' => $reports]);
    }

    public function store(Request $request, Listing $listing): JsonResponse
    {
        abort_if($request->user()->id === $listing->owner_id, 403, 'Owners cannot report their own listing.');
        $validated = $request->validate([
            'reason' => ['required', 'in:scam,misleading,duplicate,inappropriate,other'],
            'details' => ['nullable', 'string', 'max:2000'],
        ]);
        $report = Report::create([
            'listing_id' => $listing->id,
            'reporter_id' => $request->user()->id,
            'reason' => $validated['reason'],
            'details' => $validated['details'] ?? null,
            'status' => 'pending',
        ]);
        return response()->json(['data' => $report, 'message' => 'Thank you. Your report was submitted.'], 201);
    }

    public function update(Request $request, Report $report): JsonResponse
    {
        $this->ensureAdmin($request);
        $validated = $request->validate([
            'status' => ['required', 'in:under_review,resolved,dismissed'],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
        ]);
        $report->update([...$validated, 'reviewed_by' => $request->user()->id, 'reviewed_at' => now()]);
        return response()->json(['data' => $report->fresh()->load(['listing:id,title,city,neighborhood', 'reporter:id,name'])]);
    }

    private function ensureAdmin(Request $request): void
    {
        abort_unless($request->user()?->role === 'admin', 403, 'Admin access required.');
    }
}