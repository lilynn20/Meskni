<?php

namespace App\Http\Controllers;

use App\Http\Resources\ListingResource;
use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedListingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->ensureSeeker($request);

        $listings = $request->user()->savedListings()
            ->with(['listing.owner:id,name', 'listing.images'])
            ->latest()
            ->get()
            ->pluck('listing');

        return response()->json(['data' => ListingResource::collection($listings)]);
    }

    public function store(Request $request, Listing $listing): JsonResponse
    {
        $this->ensureSeeker($request);

        $request->user()->savedListings()->firstOrCreate(['listing_id' => $listing->id]);

        return response()->json(['message' => 'Listing saved successfully.']);
    }

    public function destroy(Request $request, Listing $listing): JsonResponse
    {
        $this->ensureSeeker($request);

        $request->user()->savedListings()->where('listing_id', $listing->id)->delete();

        return response()->json(['message' => 'Listing removed from saved listings.']);
    }

    private function ensureSeeker(Request $request): void
    {
        abort_unless($request->user()?->role === 'seeker', 403, 'Only seekers can save listings.');
    }
}