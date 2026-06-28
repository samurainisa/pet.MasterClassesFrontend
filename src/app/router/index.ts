import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '@/app/router/routes'
import { setupRouterGuards } from '@/app/router/guards'
import '@/app/router/types'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition ?? { top: 0 }
  }
})

setupRouterGuards(router)

export default router
