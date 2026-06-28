export interface FavoriteItem {
  id: number
  master_class: {
    id: number
    title?: string
  }
}

export interface FavoritePayload {
  master_class_id: number
}
