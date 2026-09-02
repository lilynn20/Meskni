const apiUrl = import.meta.env.VITE_API_URL ?? '/api'
const tokenStorageKey = 'meskni.auth.token'

type ApiErrorPayload = {
  message?: string
  errors?: Record<string, string[]>
}

type UnauthorizedHandler = () => void

let unauthorizedHandler: UnauthorizedHandler | undefined

export class ApiError extends Error {
  status: number
  errors?: Record<string, string[]>

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(tokenStorageKey)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(tokenStorageKey, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(tokenStorageKey)
}

export function onUnauthorized(handler: UnauthorizedHandler): () => void {
  unauthorizedHandler = handler

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = undefined
    }
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getStoredToken()
  const headers = new Headers(options.headers)

  headers.set('Accept', 'application/json')

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let payload: ApiErrorPayload = {}

    try {
      payload = (await response.json()) as ApiErrorPayload
    } catch {
      payload = {}
    }

    if (response.status === 401) {
      clearStoredToken()
      unauthorizedHandler?.()
    }

    throw new ApiError(
      response.status,
      payload.message ?? 'The request could not be completed.',
      payload.errors,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}