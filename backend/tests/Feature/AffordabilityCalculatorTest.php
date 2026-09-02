<?php

namespace Tests\Feature;

use Tests\TestCase;

class AffordabilityCalculatorTest extends TestCase
{
    public function test_public_affordability_calculation_returns_interpretable_results(): void
    {
        $response = $this->postJson('/api/calculators/affordability', [
            'monthly_income' => 7000,
            'monthly_rent' => 2500,
            'utilities' => 400,
            'transport' => 500,
            'food' => 1200,
            'other_expenses' => 300,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.total_monthly_expenses', 4900)
            ->assertJsonPath('data.remaining_income', 2100)
            ->assertJsonPath('data.housing_percentage', 35.7)
            ->assertJsonPath('data.status', 'stretched');
    }

    public function test_invalid_income_is_rejected_and_negative_balance_is_unaffordable(): void
    {
        $this->postJson('/api/calculators/affordability', ['monthly_income' => 0, 'monthly_rent' => 1000])
            ->assertUnprocessable();

        $this->postJson('/api/calculators/affordability', ['monthly_income' => 2000, 'monthly_rent' => 2500])
            ->assertOk()
            ->assertJsonPath('data.remaining_income', -500)
            ->assertJsonPath('data.status', 'unaffordable');
    }
}