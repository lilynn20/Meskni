<?php

namespace App\Services;

use App\Models\Listing;
use Illuminate\Database\Eloquent\Builder;

class ListingSearchService
{
    public function buildQuery(array $filters): Builder
    {
        $query = Listing::query()
            ->where('status', 'active')
            ->whereNull('deleted_at');

        if (! empty($filters['city'])) {
            $query->where('city', 'like', '%' . trim($filters['city']) . '%');
        }

        if (! empty($filters['neighborhood'])) {
            $query->where('neighborhood', 'like', '%' . trim($filters['neighborhood']) . '%');
        }

        if (! empty($filters['min_price'])) {
            $query->where('rent', '>=', (float) $filters['min_price']);
        }

        if (! empty($filters['max_price'])) {
            $query->where('rent', '<=', (float) $filters['max_price']);
        }

        if (! empty($filters['property_type'])) {
            $query->where('property_type', $filters['property_type']);
        }

        if (! empty($filters['listing_type'])) {
            $query->where('listing_type', $filters['listing_type']);
        }

        if (isset($filters['furnished'])) {
            $query->where('furnished', filter_var($filters['furnished'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filters['internet_included'])) {
            $query->where('internet_included', filter_var($filters['internet_included'], FILTER_VALIDATE_BOOLEAN));
        }

        if (isset($filters['parking'])) {
            $query->where('parking', filter_var($filters['parking'], FILTER_VALIDATE_BOOLEAN));
        }

        if (! empty($filters['available_from'])) {
            $query->whereDate('available_from', '>=', $filters['available_from']);
        }

        if (! empty($filters['gender_preference'])) {
            $query->where('gender_preference', $filters['gender_preference']);
        }

        return $query;
    }
}
