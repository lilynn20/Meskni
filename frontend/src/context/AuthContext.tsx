import { useEffect, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import {
  clearStoredToken,
  getStoredToken,
  onUnauthorized,
  setStoredToken,
} from '../api/client'
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth'
import { AuthContext, type AuthContextValue, type AuthStatus } from './auth-context'

function applyAuthResponse(response: AuthResponse, setUser: (user: User) => void): User {
  setStoredToken(response.token)
  setUser(response.user)
  return response.user
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>(
    getStoredToken() ? 'loading' : 'unauthenticated',
  )

  useEffect(() => {
    const removeUnauthorizedHandler = onUnauthorized(() => {
      setUser(null)
      setStatus('unauthenticated')
    })

    if (!getStoredToken()) {
      return removeUnauthorizedHandler
    }

    void authApi.me()
      .then((currentUser) => {
        setUser(currentUser)
        setStatus('authenticated')
      })
      .catch(() => {
        clearStoredToken()
        setUser(null)
        setStatus('unauthenticated')
      })

    return removeUnauthorizedHandler
  }, [])

  async function register(payload: RegisterPayload): Promise<User> {
    const response = await authApi.register(payload)
    setStatus('authenticated')
    return applyAuthResponse(response, setUser)
  }

  async function login(payload: LoginPayload): Promise<User> {
    const response = await authApi.login(payload)
    setStatus('authenticated')
    return applyAuthResponse(response, setUser)
  }

  async function logout(): Promise<void> {
    try {
      if (getStoredToken()) {
        await authApi.logout()
      }
    } finally {
      clearStoredToken()
      setUser(null)
      setStatus('unauthenticated')
    }
  }

  async function refresh(): Promise<User | null> {
    if (!getStoredToken()) {
      setUser(null)
      setStatus('unauthenticated')
      return null
    }

    const currentUser = await authApi.me()
    setUser(currentUser)
    setStatus('authenticated')
    return currentUser
  }

  const value: AuthContextValue = {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    register,
    login,
    logout,
    refresh,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}