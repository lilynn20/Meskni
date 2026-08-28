<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'owner_id' => $this->owner_id,
            'title' => $this->title,
            'description' => $this->description,
            'property_type' => $this->property_type,
            'listing_type' => $this->listing_type,
            'city' => $this->city,
            'neighborhood' => $this->neighborhood,
            'address' => $this->address,
            'rent' => (float) $this->rent,
            'estimated_utilities' => (float) $this->estimated_utilities,
            'deposit' => (float) $this->deposit,
            'available_from' => $this->available_from?->format('Y-m-d'),
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'surface_area' => $this->surface_area,
            'furnished' => (bool) $this->furnished,
            'internet_included' => (bool) $this->internet_included,
            'parking' => (bool) $this->parking,
            'gender_preference' => $this->gender_preference,
            'current_occupants' => $this->current_occupants,
            'available_spots' => $this->available_spots,
            'max_occupants' => $this->max_occupants,
            'status' => $this->status,
            'owner' => $this->whenLoaded('owner', fn () => [
                'id' => $this->owner->id,
                'name' => $this->owner->name,
            ]),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'path' => $image->path,
                    'original_name' => $image->original_name,
                    'mime_type' => $image->mime_type,
                    'size' => $image->size,
                ];
            })->values()->all()),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
