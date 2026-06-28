import type { RouteRecordRaw } from 'vue-router'
import HomePage from '@/pages/home/ui/HomePage.vue'
import MapPage from '@/pages/map/ui/MapPage.vue'
import AddMasterClassPage from '@/pages/add-masterclass/ui/AddMasterClassPage.vue'
import RegisterPage from '@/pages/register/ui/RegisterPage.vue'
import MasterClassDetailPage from '@/pages/masterclass-detail/ui/MasterClassDetailPage.vue'
import ProfilePage from '@/pages/profile/ui/ProfilePage.vue'
import LogoutPage from '@/pages/logout/ui/LogoutPage.vue'
import OrganizerMasterClassesPage from '@/pages/organizer-masterclasses/ui/OrganizerMasterClassesPage.vue'
import RequestsPage from '@/pages/masterclass-requests/ui/RequestsPage.vue'

export const routeNames = {
  home: 'Home',
  map: 'Map',
  addMasterClass: 'AddMasterClass',
  register: 'Register',
  masterClassDetail: 'MasterClassDetail',
  profile: 'Profile',
  logout: 'Logout',
  organizerMasterClasses: 'OrganizerMasterClasses',
  masterClassRequests: 'MasterClassRequests'
} as const

export type RouteName = (typeof routeNames)[keyof typeof routeNames]

const organizerRoles = ['Organizer', 'Admin'] as const

export const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    component: HomePage,
    name: routeNames.home,
    meta: { layout: 'default' }
  },
  {
    path: '/map',
    component: MapPage,
    name: routeNames.map,
    meta: { layout: 'map', requiresAuth: true, roles: [...organizerRoles] }
  },
  {
    path: '/add-masterclass',
    component: AddMasterClassPage,
    name: routeNames.addMasterClass,
    meta: { requiresAuth: true, roles: [...organizerRoles] }
  },
  {
    path: '/register',
    component: RegisterPage,
    name: routeNames.register,
    meta: { guestOnly: true }
  },
  {
    path: '/masterclass/:id',
    component: MasterClassDetailPage,
    name: routeNames.masterClassDetail
  },
  {
    path: '/masterclass/:id/requests',
    component: RequestsPage,
    name: routeNames.masterClassRequests,
    meta: { requiresAuth: true, roles: [...organizerRoles] }
  },
  {
    path: '/profile',
    component: ProfilePage,
    name: routeNames.profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/logout',
    component: LogoutPage,
    name: routeNames.logout,
    meta: { requiresAuth: true }
  },
  {
    path: '/my-masterclasses',
    component: OrganizerMasterClassesPage,
    name: routeNames.organizerMasterClasses,
    meta: { requiresAuth: true, roles: [...organizerRoles] }
  }
]
