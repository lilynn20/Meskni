export type UserRole = 'seeker' | 'owner' | 'admin'
export type UserStatus = 'active' | 'suspended' | 'inactive'

export type User = {
  id: number
  name: string
  email: string
  phone: string
  city: string
  role: UserRole
  status: UserStatus
  avatar_url: string | null
  created_at: string | null
  updated_at: string | null
}

export type AuthResponse = {
  user: User
  token: string
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  name: string
  email: string
  phone: string
  password: string
  city: string
  role: Exclude<UserRole, 'admin'>
}