<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeker_can_start_an_inquiry_and_owner_can_reply(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $seeker = User::factory()->create(['role' => 'seeker']);
        $listing = $this->createListing($owner);

        $inquiry = $this->actingAs($seeker, 'sanctum')->postJson("/api/listings/{$listing->id}/messages", ['body' => 'Is this room still available?']);
        $inquiry->assertCreated()->assertJsonPath('data.receiver_id', $owner->id);
        $messageId = $inquiry->json('data.id');

        $this->actingAs($owner, 'sanctum')->postJson("/api/messages/{$messageId}/reply", ['body' => 'Yes, it is available.'])
            ->assertCreated()
            ->assertJsonPath('data.sender_id', $owner->id);

        $this->actingAs($seeker, 'sanctum')->getJson('/api/messages')
            ->assertOk()
            ->assertJsonPath('data.0.listing.id', $listing->id)
            ->assertJsonCount(2, 'data.0.messages');
    }

    public function test_guests_and_owners_cannot_start_inquiries_or_users_message_themselves(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $listing = $this->createListing($owner);

        $this->postJson("/api/listings/{$listing->id}/messages", ['body' => 'Hello'])->assertUnauthorized();
        $this->actingAs($owner, 'sanctum')->postJson("/api/listings/{$listing->id}/messages", ['body' => 'Hello'])->assertForbidden();
    }

    public function test_legitimate_conversation_participant_can_reply(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $seeker = User::factory()->create(['role' => 'seeker']);
        $listing = $this->createListing($owner);

        $inquiry = $this->actingAs($seeker, 'sanctum')->postJson("/api/listings/{$listing->id}/messages", ['body' => 'Is this room still available?']);
        $messageId = $inquiry->json('data.id');

        $this->actingAs($owner, 'sanctum')->postJson("/api/messages/{$messageId}/reply", ['body' => 'Yes, it is available.'])
            ->assertCreated()
            ->assertJsonPath('data.receiver_id', $seeker->id);
    }

    public function test_unrelated_authenticated_user_cannot_reply_to_a_thread(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $seeker = User::factory()->create(['role' => 'seeker']);
        $other = User::factory()->create(['role' => 'seeker']);
        $listing = $this->createListing($owner);

        $inquiry = $this->actingAs($seeker, 'sanctum')->postJson("/api/listings/{$listing->id}/messages", ['body' => 'Is this room still available?']);
        $messageId = $inquiry->json('data.id');

        $this->actingAs($other, 'sanctum')->postJson("/api/messages/{$messageId}/reply", ['body' => 'I should not be allowed to reply.'])
            ->assertForbidden();
    }

    public function test_whitespace_only_message_body_is_rejected(): void
    {
        $owner = User::factory()->create(['role' => 'owner']);
        $seeker = User::factory()->create(['role' => 'seeker']);
        $listing = $this->createListing($owner);

        $this->actingAs($seeker, 'sanctum')->postJson("/api/listings/{$listing->id}/messages", ['body' => '   '])
            ->assertUnprocessable();
    }

    private function createListing(User $owner): Listing
    {
        return Listing::create([
            'owner_id' => $owner->id,
            'title' => 'Bright room in Maarif',
            'description' => 'A comfortable room with plenty of natural light.',
            'property_type' => 'room',
            'listing_type' => 'private_room',
            'city' => 'Casablanca',
            'neighborhood' => 'Maarif',
            'rent' => 3500,
        ]);
    }
}