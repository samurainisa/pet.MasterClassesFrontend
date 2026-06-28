export interface PaginatedResponse<T> {
  results: T[]
  next?: string | null
  count?: number
}

export interface ApiErrorResponse {
  detail?: string
  message?: string
  [key: string]: unknown
}
