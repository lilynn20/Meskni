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