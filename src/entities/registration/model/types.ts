export interface RegistrationResponse {
  status: string
  message?: string
}

export interface RegistrationRequest {
  id: number
  user: {
    id: number
    username: string
    first_name?: string
    last_name?: string
  }
  status: string
  created_at?: string
}
