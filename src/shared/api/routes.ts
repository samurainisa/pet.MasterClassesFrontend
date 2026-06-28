export const API_ROUTES = {
  auth: {
    register: '/register/',
    login: '/login/',
    tokenRefresh: '/token/refresh/'
  },
  users: {
    detail: (id: number) => `/api/users/${id}/`,
    organizers: '/api/users/organizers/',
    speakers: '/api/users/speakers/'
  },
  masterClasses: {
    list: '/api/masterclasses/',
    detail: (id: number) => `/api/masterclasses/${id}/`,
    byCity: '/api/masterclasses/by_city/',
    categories: '/api/masterclasses/categories/',
    cities: '/api/masterclasses/cities/',
    register: (id: number) => `/api/masterclasses/${id}/register/`,
    registrations: (id: number) => `/api/masterclasses/${id}/registrations/`,
    favorites: {
      add: '/api/masterclasses/favorites/add/',
      remove: '/api/masterclasses/favorites/remove/',
      my: '/api/masterclasses/favorites/my/'
    }
  },
  gis: {
    geocode: '/api/gis/geocode/',
    reverseGeocode: '/api/gis/reverse-geocode/'
  },
  organizer: {
    masterClasses: (organizerId: number) => `/organizer/${organizerId}/masterclasses/`
  }
} as const
