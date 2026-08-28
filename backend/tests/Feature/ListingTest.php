<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_a_listing(): void
    {
        $owner = User::factory()->create([
            'role' => 'owner',
            'status' => 'active',
        ]);

        $response = $this->actingAs($owner, 'sanctum')->postJson('/api/listings', [
            'title' => 'Bright room near Agdal',
            'description' => 'Comfortable room in a central area.',
            'property_type' => 'room',
            'listing_type' => 'private_room',
            'city' => 'Rabat',
            'neighborhood' => 'Agdal',
            'address' => 'Rue Mohammed V',
            'rent' => 2000,
            'estimated_utilities' => 350,
            'deposit' => 500,
            'available_from' => '2026-10-01',
            'bedrooms' => 1,
            'bathrooms' => 1,
            'surface_area' => 32.5,
            'furnished' => true,
            'internet_included' => true,
            'parking' => false,
            'gender_preference' => 'female',
            'current_occupants' => 1,
            'available_spots' => 1,
            'max_occupants' => 2,
            'status' => 'active',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.owner_id', $owner->id)
            ->assertJsonPath('data.city', 'Rabat');
    }

    public function test_seeker_cannot_create_listing(): void
    {
        $seeker = User::factory()->create([
            'role' => 'seeker',
            'status' => 'active',
        ]);

        $response = $this->actingAs($seeker, 'sanctum')->postJson('/api/listings', [
            'title' => 'Hidden room',
            'description' => 'This should fail.',
            'property_type' => 'room',
            'listing_type' => 'private_room',
            'city' => 'Rabat',
            'neighborhood' => 'Agdal',
            'address' => 'Test address',
            'rent' => 1800,
            'estimated_utilities' => 200,
            'deposit' => 400,
            'available_from' => '2026-11-01',
            'bedrooms' => 1,
            'bathrooms' => 1,
            'surface_area' => 25,
            'furnished' => true,
            'internet_included' => false,
            'parking' => false,
            'gender_preference' => 'any',
            'current_occupants' => 0,
            'available_spots' => 1,
            'max_occupants' => 2,
            'status' => 'active',
        ]);

        $response->assertStatus(403);
    }

    public function test_listing_appears_in_public_search_and_detail(): void
    {
        $owner = User::factory()->create([
            'role' => 'owner',
            'status' => 'active',
        ]);

        $this->actingAs($owner, 'sanctum')->postJson('/api/listings', [
            'title' => 'Bright room near Agdal',
            'description' => 'Comfortable room in a central area.',
            'property_type' => 'room',
            'listing_type' => 'private_room',
            'city' => 'Rabat',
            'neighborhood' => 'Agdal',
            'address' => 'Rue Mohammed V',
            'rent' => 2000,
            'estimated_utilities' => 350,
            'deposit' => 500,
            'available_from' => '2026-10-01',
            'bedrooms' => 1,
            'bathrooms' => 1,
            'surface_area' => 32.5,
            'furnished' => true,
            'internet_included' => true,
            'parking' => false,
            'gender_preference' => 'female',
            'current_occupants' => 1,
            'available_spots' => 1,
            'max_occupants' => 2,
            'status' => 'active',
        ]);

        $search = $this->getJson('/api/listings?city=Rabat');
        $search->assertStatus(200)
            ->assertJsonPath('data.0.title', 'Bright room near Agdal');

        $detail = $this->getJson('/api/listings/1');
        $detail->assertStatus(200)
            ->assertJsonPath('data.title', 'Bright room near Agdal');
    }

    public function test_image_upload_and_validation_work_for_listings(): void
    {
        $owner = User::factory()->create(['role' => 'owner', 'status' => 'active']);

        $listingResponse = $this->actingAs($owner, 'sanctum')->postJson('/api/listings', [
            'title' => 'Room with image',
            'description' => 'Some description.',
            'property_type' => 'room',
            'listing_type' => 'private_room',
            'city' => 'Casablanca',
            'neighborhood' => 'Maarif',
            'address' => 'Street 12',
            'rent' => 2200,
            'estimated_utilities' => 300,
            'deposit' => 600,
            'available_from' => '2026-10-15',
            'bedrooms' => 1,
            'bathrooms' => 1,
            'surface_area' => 28,
            'furnished' => false,
            'internet_included' => true,
            'parking' => true,
            'gender_preference' => 'any',
            'current_occupants' => 0,
            'available_spots' => 1,
            'max_occupants' => 2,
            'status' => 'active',
        ]);

        $listingId = $listingResponse->json('data.id');

        $uploadResponse = $this->actingAs($owner, 'sanctum')->postJson('/api/listings/' . $listingId . '/images', [
            'images' => [UploadedFile::fake()->image('room.jpg', 640, 480)],
        ]);

        $uploadResponse->assertStatus(200)
            ->assertJsonPath('data.images.0.path', fn ($path) => is_string($path));

        $invalidResponse = $this->actingAs($owner, 'sanctum')->postJson('/api/listings/' . $listingId . '/images', [
            'images' => [UploadedFile::fake()->create('bad.txt', 100, 'text/plain')],
        ]);

        $invalidResponse->assertStatus(422);
    }
}
