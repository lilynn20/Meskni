<?php

namespace App\Services;

class AffordabilityCalculator
{
    public function calculate(array $values): array
    {
        $income = (float) $values['monthly_income'];
        $rent = (float) $values['monthly_rent'];
        $utilities = (float) ($values['utilities'] ?? 0);
        $transport = (float) ($values['transport'] ?? 0);
        $food = (float) ($values['food'] ?? 0);
        $otherExpenses = (float) ($values['other_expenses'] ?? 0);
        $totalExpenses = $rent + $utilities + $transport + $food + $otherExpenses;
        $remainingIncome = $income - $totalExpenses;
        $housingPercentage = ($rent / $income) * 100;

        return [
            'total_monthly_expenses' => round($totalExpenses, 2),
            'remaining_income' => round($remainingIncome, 2),
            'housing_percentage' => round($housingPercentage, 1),
            'status' => $remainingIncome < 0 ? 'unaffordable' : ($housingPercentage <= 30 ? 'comfortable' : ($housingPercentage <= 40 ? 'stretched' : 'high')),
        ];
    }
}