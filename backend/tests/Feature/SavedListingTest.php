<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SavedListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeker_can_save_listings_and_view_saved_listings(): void
    {
        $seeker = User::factory()->create(['role' => 'seeker']);
        $listing = $this->createListing();

        $this->actingAs($seeker, 'sanctum')->postJson("/api/listings/{$listing->id}/save")
            ->assertOk();

        $this->actingAs($seeker, 'sanctum')->getJson('/api/saved-listings')
            ->assertOk()
            ->assertJsonPath('data.0.id', $listing->id);
    }

    public function test_seeker_can_unsave_a_listing(): void
    {
        $seeker = User::factory()->create(['role' => 'seeker']);
        $listing = $this->createListing();

        $seeker->savedListings()->create(['listing_id' => $listing->id]);

        $this->actingAs($seeker, 'sanctum')->deleteJson("/api/listings/{$listing->id}/save")
            ->assertOk();

        $this->assertDatabaseMissing('saved_listings', [
            'user_id' => $seeker->id,
            'listing_id' => $listing->id,
        ]);
    }

    public function test_only_seekers_can_use_saved_listings(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $listing = $this->createListing();

        $this->actingAs($owner, 'sanctum')->postJson("/api/listings/{$listing->id}/save")
            ->assertForbidden();

        $this->actingAs($owner, 'sanctum')->getJson('/api/saved-listings')
            ->assertForbidden();
    }

    private function createListing(): Listing
    {
        return Listing::create([
            'owner_id' => User::factory()->create(['role' => 'owner'])->id,
            'title' => 'Bright room in the city centre',
            'description' => 'A comfortable room with plenty of natural light.',
            'property_type' => 'room',
            'listing_type' => 'private_room',
            'city' => 'Casablanca',
            'neighborhood' => 'Maarif',
            'rent' => 3500,
        ]);
    }
}