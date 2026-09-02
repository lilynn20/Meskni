import { apiRequest } from './client'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth'

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await apiRequest<{ data: User; token: string }>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return { user: response.data, token: response.token }
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiRequest<{ data: AuthResponse }>('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function me(): Promise<User> {
  const response = await apiRequest<{ data: User }>('/me')
  return response.data
}

export async function logout(): Promise<void> {
  await apiRequest<{ message: string }>('/logout', { method: 'POST' })
}