import Cookies from 'js-cookie'
import { api, httpClient } from '@/shared/api/http-client'
import { API_ROUTES } from '@/shared/api/routes'
import type {
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  User
} from '@/entities/user/model/types'

class UserApi {
  async register(payload: RegisterPayload) {
    return api.post<User>(API_ROUTES.auth.register, payload)
  }

  async login(credentials: LoginPayload): Promise<AuthTokens> {
    const response = await api.post<AuthTokens>(API_ROUTES.auth.login, credentials)
    const { access, refresh, csrf_token } = response.data

    Cookies.set('access_token', access, { secure: true })
    Cookies.set('refresh_token', refresh, { secure: true })
    Cookies.set('csrftoken', csrf_token, { secure: true })
    httpClient.setAuthHeaders(access, csrf_token)

    return response.data
  }

  async getUserInfo(userId: number) {
    return api.get<User>(API_ROUTES.users.detail(userId))
  }

  async updateUser(userId: number, userData: FormData) {
    const csrfToken = Cookies.get('csrftoken')
    return api.put<User>(API_ROUTES.users.detail(userId), userData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-CSRFToken': csrfToken ?? ''
      }
    })
  }

  logout(): void {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    Cookies.remove('csrftoken')
    httpClient.clearAuthHeaders()
  }
}

export const userApi = new UserApi()
