<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_report_and_admin_can_moderate(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $seeker = User::factory()->create(['role' => 'seeker']);
        $admin = User::factory()->create(['role' => 'admin']);
        $listing = $this->createListing($owner);
        $report = $this->actingAs($seeker, 'sanctum')->postJson("/api/listings/{$listing->id}/reports", ['reason' => 'scam', 'details' => 'The price and photos appear suspicious.']);
        $report->assertCreated()->assertJsonPath('data.status', 'pending');
        $reportId = $report->json('data.id');
        $this->actingAs($admin, 'sanctum')->getJson('/api/reports')->assertOk()->assertJsonPath('data.0.listing_id', $listing->id);
        $this->actingAs($admin, 'sanctum')->patchJson("/api/reports/{$reportId}", ['status' => 'resolved', 'admin_notes' => 'Reviewed.'])->assertOk()->assertJsonPath('data.status', 'resolved');
    }

    public function test_guests_non_admins_and_owners_cannot_use_report_boundaries(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $seeker = User::factory()->create(['role' => 'seeker']);
        $listing = $this->createListing($owner);
        $this->postJson("/api/listings/{$listing->id}/reports", ['reason' => 'scam'])->assertUnauthorized();
        $this->actingAs($owner, 'sanctum')->postJson("/api/listings/{$listing->id}/reports", ['reason' => 'scam'])->assertForbidden();
        $this->actingAs($seeker, 'sanctum')->getJson('/api/reports')->assertForbidden();
    }

    private function createListing(User $owner): Listing
    {
        return Listing::create(['owner_id' => $owner->id, 'title' => 'Bright room', 'description' => 'A comfortable room with natural light.', 'property_type' => 'room', 'listing_type' => 'private_room', 'city' => 'Casablanca', 'neighborhood' => 'Maarif', 'rent' => 3500]);
    }
}