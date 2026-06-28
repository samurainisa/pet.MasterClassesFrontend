import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user/userStore'
import { routeNames } from '@/app/router/routes'

export function setupRouterGuards(router: Router): void {
  router.beforeEach(async (to, _from, next) => {
    const userStore = useUserStore()

    if (!userStore.user && userStore.accessToken) {
      try {
        await userStore.checkUser()
      } catch {
        userStore.logout()
      }
    }

    if (to.meta.guestOnly && userStore.isAuthenticated) {
      return next({ name: routeNames.home })
    }

    if (to.meta.requiresAuth && !userStore.isAuthenticated) {
      return next({
        name: routeNames.home,
        query: { redirect: to.fullPath }
      })
    }

    const allowedRoles = to.meta.roles
    if (allowedRoles?.length && userStore.user) {
      if (!allowedRoles.includes(userStore.user.role)) {
        return next({ name: routeNames.home })
      }
    }

    next()
  })
}
