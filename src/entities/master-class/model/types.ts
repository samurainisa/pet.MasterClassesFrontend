import type { UserBrief } from '@/entities/user/model/types'

export interface Category {
  id: number
  name: string
}

export interface City {
  id: number
  name: string
}

export interface Coordinates {
  latitude: number
  longitude: number
}

export interface AddressData {
  latitude: number
  longitude: number
  country: string
  province: string
  area: string
  locality: string
  street: string
  house: string
  postal_code: string
}

export interface MasterClassDto {
  id: number
  title: string
  description: string
  location_name: string
  categories: Category[]
  image_url: string | null
  speakers: UserBrief[]
  organizer: UserBrief
  registration_deadline: string
  start_date: string
  end_date: string
  duration: number
  latitude: string | number
  longitude: string | number
  country: string
  province: string
  area: string
  locality: string
  street: string
  house: string
  postal_code: string
  requires_approval: boolean
  price: string
}

export interface MasterClass extends Omit<MasterClassDto, 'latitude' | 'longitude'> {
  coordinates: Coordinates
}

export interface MasterClassFilters {
  categories?: number[]
  cities?: string[]
  startDate?: Date | null
  endDate?: Date | null
  fetchAll?: boolean
}

export interface CreateMasterClassPayload {
  title: string
  categories: number[]
  description: string
  location_name: string
  start_date: string
  end_date: string
  end_register_date: string
  image_url?: File | null
  organizer: number
  speaker: number
  longitude: string
  latitude: string
  country: string
  province: string
  area: string
  locality: string
  street: string
  house: string
  postal_code: string
  duration: number
  price: number | string
  requires_approval: boolean
}

export interface GeocodeResult extends AddressData {}
