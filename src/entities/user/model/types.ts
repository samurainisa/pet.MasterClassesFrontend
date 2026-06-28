export type UserRole = 'Organizer' | 'Participant' | 'Admin' | 'Speaker' | string

export interface User {
  id: number
  username: string
  role: UserRole
  first_name?: string
  last_name?: string
  email?: string
  date_joined?: string
  bio?: string | null
  age?: number | null
  gender?: string
  image?: string | null
}

export interface RegisterPayload {
  username: string
  email: string
  password: string
  password2?: string
  first_name?: string
  last_name?: string
  role?: UserRole
}

export interface LoginPayload {
  username: string
  password: string
}

export interface AuthTokens {
  access: string
  refresh: string
  csrf_token: string
}

export interface UserBrief {
  id: number
  username: string
  first_name?: string
  last_name?: string
  email?: string
  bio?: string | null
  image?: string | null
}
