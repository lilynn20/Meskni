<?php

namespace App\Services;

class RoommateCostCalculator
{
    public function calculate(array $values): array
    {
        $occupants = (int) $values['occupants'];
        $rentPerPerson = (float) $values['monthly_rent'] / $occupants;
        $utilitiesPerPerson = (float) ($values['utilities'] ?? 0) / $occupants;
        $additionalCostsPerPerson = (float) ($values['additional_shared_costs'] ?? 0) / $occupants;

        return [
            'rent_per_person' => round($rentPerPerson, 2),
            'utilities_per_person' => round($utilitiesPerPerson, 2),
            'additional_costs_per_person' => round($additionalCostsPerPerson, 2),
            'total_monthly_cost_per_person' => round($rentPerPerson + $utilitiesPerPerson + $additionalCostsPerPerson, 2),
        ];
    }
}