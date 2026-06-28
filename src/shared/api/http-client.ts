import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import Cookies from 'js-cookie'
import { API_BASE_URL } from '@/shared/config/env'
import { API_ROUTES } from '@/shared/api/routes'

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

class HttpClient {
  private static instance: HttpClient | null = null
  private readonly client: AxiosInstance

  private constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' }
    })
    this.setupInterceptors()
  }

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient()
    }
    return HttpClient.instance
  }

  get axios(): AxiosInstance {
    return this.client
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const accessToken = Cookies.get('access_token')
      const csrfToken = Cookies.get('csrftoken')

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken
      }
      return config
    })

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config as InternalAxiosRequestConfig | undefined

        if (
          !originalRequest ||
          error.response?.status !== 401 ||
          originalRequest._retry
        ) {
          return Promise.reject(error)
        }

        originalRequest._retry = true
        const refreshToken = Cookies.get('refresh_token')

        if (!refreshToken) {
          return Promise.reject(error)
        }

        try {
          const response = await this.client.post<{ access: string }>(
            API_ROUTES.auth.tokenRefresh,
            { refresh: refreshToken }
          )
          Cookies.set('access_token', response.data.access, { secure: true })
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`
          return this.client(originalRequest)
        } catch (refreshError) {
          console.error('Refresh token invalid:', refreshError)
          return Promise.reject(refreshError)
        }
      }
    )
  }

  setAuthHeaders(accessToken: string, csrfToken: string): void {
    this.client.defaults.headers.common.Authorization = `Bearer ${accessToken}`
    this.client.defaults.headers.common['X-CSRFToken'] = csrfToken
  }

  clearAuthHeaders(): void {
    delete this.client.defaults.headers.common.Authorization
    delete this.client.defaults.headers.common['X-CSRFToken']
  }
}

export const httpClient = HttpClient.getInstance()
export const api = httpClient.axios
