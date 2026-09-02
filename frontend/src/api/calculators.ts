import { apiRequest } from './client'
import type { AffordabilityPayload, AffordabilityResult, RoommatePayload, RoommateResult } from '../types/calculator'

export async function calculateAffordability(payload: AffordabilityPayload): Promise<AffordabilityResult> {
  const response = await apiRequest<{ data: AffordabilityResult }>('/calculators/affordability', { method: 'POST', body: JSON.stringify(payload) })
  return response.data
}

export async function calculateRoommateCost(payload: RoommatePayload): Promise<RoommateResult> {
  const response = await apiRequest<{ data: RoommateResult }>('/calculators/roommate', { method: 'POST', body: JSON.stringify(payload) })
  return response.data
}