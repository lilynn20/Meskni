<?php

namespace Tests\Feature;

use Tests\TestCase;

class RoommateCostCalculatorTest extends TestCase
{
    public function test_public_roommate_calculation_returns_per_person_breakdown(): void
    {
        $this->postJson('/api/calculators/roommate', [
            'monthly_rent' => 4000,
            'occupants' => 3,
            'utilities' => 600,
            'additional_shared_costs' => 300,
        ])->assertOk()
            ->assertJsonPath('data.rent_per_person', 1333.33)
            ->assertJsonPath('data.utilities_per_person', 200)
            ->assertJsonPath('data.additional_costs_per_person', 100)
            ->assertJsonPath('data.total_monthly_cost_per_person', 1633.33);
    }

    public function test_zero_occupants_are_rejected(): void
    {
        $this->postJson('/api/calculators/roommate', ['monthly_rent' => 4000, 'occupants' => 0])
            ->assertUnprocessable();
    }
}