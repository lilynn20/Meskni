<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeker_can_register_and_login(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Sara Benali',
            'email' => 'sara@example.com',
            'phone' => '+212600000001',
            'password' => 'StrongPass123!',
            'city' => 'Rabat',
            'role' => 'seeker',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.role', 'seeker');

        $login = $this->postJson('/api/login', [
            'email' => 'sara@example.com',
            'password' => 'StrongPass123!',
        ]);

        $login->assertStatus(200)
            ->assertJsonPath('data.user.role', 'seeker');
    }

    public function test_admin_cannot_register_via_public_registration(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'phone' => '+212600000002',
            'password' => 'StrongPass123!',
            'city' => 'Casablanca',
            'role' => 'admin',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }
}
