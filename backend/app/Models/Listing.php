<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Listing extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'owner_id',
        'title',
        'description',
        'property_type',
        'listing_type',
        'city',
        'neighborhood',
        'address',
        'rent',
        'estimated_utilities',
        'deposit',
        'available_from',
        'bedrooms',
        'bathrooms',
        'surface_area',
        'furnished',
        'internet_included',
        'parking',
        'gender_preference',
        'current_occupants',
        'available_spots',
        'max_occupants',
        'status',
    ];

    protected $casts = [
        'furnished' => 'boolean',
        'internet_included' => 'boolean',
        'parking' => 'boolean',
        'available_from' => 'date',
        'rent' => 'decimal:2',
        'estimated_utilities' => 'decimal:2',
        'deposit' => 'decimal:2',
        'surface_area' => 'decimal:2',
        'deleted_at' => 'datetime',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ListingImage::class);
    }

    public function savedByUsers(): HasMany
    {
        return $this->hasMany(SavedListing::class);
    }
}
