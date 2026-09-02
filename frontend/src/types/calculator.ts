export type AffordabilityPayload = {
  monthly_income: number
  monthly_rent: number
  utilities: number
  transport: number
  food: number
  other_expenses: number
}

export type AffordabilityResult = {
  total_monthly_expenses: number
  remaining_income: number
  housing_percentage: number
  status: 'comfortable' | 'stretched' | 'high' | 'unaffordable'
}

export type RoommatePayload = {
  monthly_rent: number
  occupants: number
  utilities: number
  additional_shared_costs: number
}

export type RoommateResult = {
  rent_per_person: number
  utilities_per_person: number
  additional_costs_per_person: number
  total_monthly_cost_per_person: number
}