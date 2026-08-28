<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && ($this->user()->role === 'admin' || $this->user()->id === $this->route('listing')->owner_id);
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'property_type' => ['sometimes', 'in:apartment,room,studio,house'],
            'listing_type' => ['sometimes', 'in:entire_place,private_room,shared_room'],
            'city' => ['sometimes', 'string', 'max:150'],
            'neighborhood' => ['sometimes', 'string', 'max:150'],
            'address' => ['nullable', 'string'],
            'rent' => ['sometimes', 'numeric', 'gt:0'],
            'estimated_utilities' => ['sometimes', 'numeric', 'gte:0'],
            'deposit' => ['sometimes', 'numeric', 'gte:0'],
            'available_from' => ['sometimes', 'date'],
            'bedrooms' => ['sometimes', 'integer', 'gte:0'],
            'bathrooms' => ['sometimes', 'integer', 'gte:0'],
            'surface_area' => ['sometimes', 'numeric', 'gte:0'],
            'furnished' => ['sometimes', 'boolean'],
            'internet_included' => ['sometimes', 'boolean'],
            'parking' => ['sometimes', 'boolean'],
            'gender_preference' => ['sometimes', 'in:any,female,male'],
            'current_occupants' => ['sometimes', 'integer', 'gte:0'],
            'available_spots' => ['sometimes', 'integer', 'gte:0'],
            'max_occupants' => ['sometimes', 'integer', 'gt:0'],
            'status' => ['sometimes', 'in:active,rented,archived,draft'],
        ];
    }

    protected function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $current = (int) ($this->input('current_occupants', $this->route('listing')->current_occupants ?? 0));
            $available = (int) ($this->input('available_spots', $this->route('listing')->available_spots ?? 0));
            $max = (int) ($this->input('max_occupants', $this->route('listing')->max_occupants ?? 1));

            if ($current + $available > $max) {
                $validator->errors()->add('current_occupants', 'The total of current_occupants and available_spots cannot exceed max_occupants.');
            }
        });
    }
}
