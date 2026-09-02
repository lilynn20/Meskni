import { createContext } from 'react'
import type { LoginPayload, RegisterPayload, User } from '../types/auth'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export type AuthContextValue = {
  user: User | null
  status: AuthStatus
  isAuthenticated: boolean
  register: (payload: RegisterPayload) => Promise<User>
  login: (payload: LoginPayload) => Promise<User>
  logout: () => Promise<void>
  refresh: () => Promise<User | null>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)