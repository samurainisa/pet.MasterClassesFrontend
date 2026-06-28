import { api } from '@/shared/api/http-client'
import { API_ROUTES } from '@/shared/api/routes'
import type { FavoriteItem, FavoritePayload } from '@/entities/favorite/model/types'

class FavoriteApi {
  async add(masterClassId: number) {
    const payload: FavoritePayload = { master_class_id: masterClassId }
    return api.post(API_ROUTES.masterClasses.favorites.add, payload)
  }

  async remove(masterClassId: number) {
    const payload: FavoritePayload = { master_class_id: masterClassId }
    return api.delete(API_ROUTES.masterClasses.favorites.remove, { data: payload })
  }

  async getMyFavorites(): Promise<FavoriteItem[]> {
    const response = await api.get<FavoriteItem[]>(API_ROUTES.masterClasses.favorites.my)
    return response.data
  }
}

export const favoriteApi = new FavoriteApi()
