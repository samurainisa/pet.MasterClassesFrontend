import { defineStore } from 'pinia'
import { ref } from 'vue'
import Cookies from 'js-cookie'
import { userApi } from '@/entities/user/api/userApi'
import { parseJwt } from '@/shared/lib/jwt'
import type { LoginPayload, RegisterPayload, User } from '@/entities/user/model/types'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(Cookies.get('access_token') ?? null)
  const isAuthenticated = ref<boolean>(Boolean(accessToken.value))

  async function register(userData: RegisterPayload) {
    const response = await userApi.register(userData)
    return response.data
  }

  async function login(credentials: LoginPayload) {
    const tokens = await userApi.login(credentials)

    if (!tokens.access || !tokens.refresh) {
      throw new Error('Ошибка авторизации: токены не получены')
    }

    Cookies.set('access_token', tokens.access, { secure: true })
    Cookies.set('refresh_token', tokens.refresh, { secure: true })
    accessToken.value = tokens.access
    isAuthenticated.value = true

    const decodedToken = parseJwt(tokens.access)
    await fetchUser(decodedToken.user_id)
  }

  async function fetchUser(userId: number) {
    const response = await userApi.getUserInfo(userId)
    user.value = response.data
  }

  async function checkUser() {
    if (!user.value && accessToken.value) {
      const decodedToken = parseJwt(accessToken.value)
      await fetchUser(decodedToken.user_id)
    }
  }

  function logout() {
    userApi.logout()
    user.value = null
    accessToken.value = null
    isAuthenticated.value = false
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
  }

  return {
    user,
    accessToken,
    isAuthenticated,
    register,
    login,
    fetchUser,
    checkUser,
    logout
  }
})
