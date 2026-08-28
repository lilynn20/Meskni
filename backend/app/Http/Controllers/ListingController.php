<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreListingRequest;
use App\Http\Requests\UpdateListingRequest;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use App\Services\ListingSearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ListingController extends Controller
{
    public function index(Request $request, ListingSearchService $searchService): JsonResponse
    {
        $query = $searchService->buildQuery($request->all());

        $listings = $query->orderByDesc('created_at')->paginate($request->input('per_page', 12));

        return response()->json([
            'data' => ListingResource::collection($listings),
            'meta' => [
                'current_page' => $listings->currentPage(),
                'per_page' => $listings->perPage(),
                'total' => $listings->total(),
                'last_page' => $listings->lastPage(),
            ],
        ]);
    }

    public function show(Listing $listing): JsonResponse
    {
        return response()->json([
            'data' => new ListingResource($listing->load(['owner:id,name', 'images'])),
        ]);
    }

    public function store(StoreListingRequest $request): JsonResponse
    {
        $listing = Listing::create([
            'owner_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'property_type' => $request->property_type,
            'listing_type' => $request->listing_type,
            'city' => $request->city,
            'neighborhood' => $request->neighborhood,
            'address' => $request->address,
            'rent' => $request->rent,
            'estimated_utilities' => $request->estimated_utilities,
            'deposit' => $request->deposit,
            'available_from' => $request->available_from,
            'bedrooms' => $request->bedrooms,
            'bathrooms' => $request->bathrooms,
            'surface_area' => $request->surface_area,
            'furnished' => $request->boolean('furnished'),
            'internet_included' => $request->boolean('internet_included'),
            'parking' => $request->boolean('parking'),
            'gender_preference' => $request->gender_preference,
            'current_occupants' => $request->current_occupants,
            'available_spots' => $request->available_spots,
            'max_occupants' => $request->max_occupants,
            'status' => $request->status ?? 'active',
        ]);

        return response()->json([
            'data' => new ListingResource($listing),
            'message' => 'Listing created successfully.',
        ], 201);
    }

    public function update(UpdateListingRequest $request, Listing $listing): JsonResponse
    {
        $request->user()->can('update', $listing);

        $listing->update($request->validated());

        return response()->json([
            'data' => new ListingResource($listing->fresh()),
            'message' => 'Listing updated successfully.',
        ]);
    }

    public function archive(Listing $listing): JsonResponse
    {
        auth()->user()->can('update', $listing);

        $listing->update(['status' => 'archived']);

        return response()->json([
            'data' => new ListingResource($listing->fresh()),
            'message' => 'Listing archived successfully.',
        ]);
    }

    public function uploadImages(Request $request, Listing $listing): JsonResponse
    {
        $request->user()->can('update', $listing);

        $validated = $request->validate([
            'images' => ['required', 'array'],
            'images.*' => ['file', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ]);

        $stored = [];

        foreach ($validated['images'] as $image) {
            $filename = uniqid('listing_', true) . '.' . $image->getClientOriginalExtension();
            $path = $image->storeAs('listings/' . $listing->id, $filename, 'public');

            $stored[] = $listing->images()->create([
                'path' => $path,
                'original_name' => $image->getClientOriginalName(),
                'mime_type' => $image->getMimeType(),
                'size' => $image->getSize(),
            ]);
        }

        return response()->json([
            'data' => [
                'listing_id' => $listing->id,
                'images' => $stored,
            ],
        ]);
    }

    public function deleteImage(Listing $listing, $imageId): JsonResponse
    {
        auth()->user()->can('update', $listing);

        $image = $listing->images()->findOrFail($imageId);

        if (Storage::disk('public')->exists($image->path)) {
            Storage::disk('public')->delete($image->path);
        }

        $image->delete();

        return response()->json([
            'message' => 'Image deleted successfully.',
        ]);
    }
}
