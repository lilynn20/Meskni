import { apiRequest } from './client'
import type { AffordabilityPayload, AffordabilityResult } from '../types/calculator'

export async function calculateAffordability(payload: AffordabilityPayload): Promise<AffordabilityResult> {
  const response = await apiRequest<{ data: AffordabilityResult }>('/calculators/affordability', { method: 'POST', body: JSON.stringify(payload) })
  return response.data
}