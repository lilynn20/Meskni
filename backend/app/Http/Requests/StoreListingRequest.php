<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && in_array($this->user()->role, ['owner', 'admin'], true);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'property_type' => ['required', 'in:apartment,room,studio,house'],
            'listing_type' => ['required', 'in:entire_place,private_room,shared_room'],
            'city' => ['required', 'string', 'max:150'],
            'neighborhood' => ['required', 'string', 'max:150'],
            'address' => ['nullable', 'string'],
            'rent' => ['required', 'numeric', 'gt:0'],
            'estimated_utilities' => ['nullable', 'numeric', 'gte:0'],
            'deposit' => ['nullable', 'numeric', 'gte:0'],
            'available_from' => ['nullable', 'date'],
            'bedrooms' => ['nullable', 'integer', 'gte:0'],
            'bathrooms' => ['nullable', 'integer', 'gte:0'],
            'surface_area' => ['nullable', 'numeric', 'gte:0'],
            'furnished' => ['nullable', 'boolean'],
            'internet_included' => ['nullable', 'boolean'],
            'parking' => ['nullable', 'boolean'],
            'gender_preference' => ['nullable', 'in:any,female,male'],
            'current_occupants' => ['nullable', 'integer', 'gte:0'],
            'available_spots' => ['nullable', 'integer', 'gte:0'],
            'max_occupants' => ['nullable', 'integer', 'gt:0'],
            'status' => ['nullable', 'in:active,rented,archived,draft'],
        ];
    }

    protected function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $current = (int) ($this->input('current_occupants', 0));
            $available = (int) ($this->input('available_spots', 0));
            $max = (int) ($this->input('max_occupants', 1));

            if ($current + $available > $max) {
                $validator->errors()->add('current_occupants', 'The total of current_occupants and available_spots cannot exceed max_occupants.');
            }
        });
    }
}
