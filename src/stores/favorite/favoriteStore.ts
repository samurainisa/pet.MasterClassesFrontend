import { defineStore } from 'pinia'
import { ref } from 'vue'
import Cookies from 'js-cookie'
import { favoriteApi } from '@/entities/favorite/api/favoriteApi'

export const useFavoritesStore = defineStore('favorites', () => {
  const favorites = ref<number[]>([])

  async function addFavorite(masterClassId: number) {
    await favoriteApi.add(masterClassId)
    if (!favorites.value.includes(masterClassId)) {
      favorites.value.push(masterClassId)
    }
  }

  async function removeFavorite(masterClassId: number) {
    await favoriteApi.remove(masterClassId)
    favorites.value = favorites.value.filter((id) => id !== masterClassId)
  }

  async function fetchFavorites() {
    const accessToken = Cookies.get('access_token')
    if (!accessToken) return

    const data = await favoriteApi.getMyFavorites()
    favorites.value = data.map((favorite) => favorite.master_class.id)
  }

  function isFavorite(masterClassId: number): boolean {
    return favorites.value.includes(masterClassId)
  }

  return {
    favorites,
    addFavorite,
    removeFavorite,
    fetchFavorites,
    isFavorite
  }
})
