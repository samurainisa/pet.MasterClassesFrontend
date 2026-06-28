import type { AxiosResponse } from 'axios'
import type {
  MasterClassDto,
  MasterClass,
  MasterClassFilters,
  CreateMasterClassPayload,
  GeocodeResult,
  Category,
  City
} from '@/entities/master-class/model/types'
import type { UserBrief } from '@/entities/user/model/types'
import type { PaginatedResponse } from '@/shared/api/types'
import { api } from '@/shared/api/http-client'
import { API_ROUTES } from '@/shared/api/routes'
import { normalizeMasterClass } from '@/entities/master-class/lib/normalizeMasterClass'

class MasterClassApi {
  private buildFilterParams(filters: MasterClassFilters): URLSearchParams {
    const params = new URLSearchParams()
    filters.categories?.forEach((category) => params.append('categories', String(category)))
    filters.cities?.forEach((city) => params.append('locality', city))
    if (filters.startDate) {
      params.append('start_date', filters.startDate.toISOString())
    }
    if (filters.endDate) {
      params.append('end_date', filters.endDate.toISOString())
    }
    return params
  }

  async fetchList(filters: MasterClassFilters = {}): Promise<MasterClass[]> {
    const params = this.buildFilterParams(filters)
    const response = await api.get<PaginatedResponse<MasterClassDto>>(
      API_ROUTES.masterClasses.list,
      { params }
    )

    let data = response.data.results

    if (filters.fetchAll && response.data.next) {
      let nextUrl: string | null | undefined = response.data.next

      while (nextUrl) {
        const nextResponse: AxiosResponse<PaginatedResponse<MasterClassDto>> =
          await api.get(nextUrl)
        data = data.concat(nextResponse.data.results)
        nextUrl = nextResponse.data.next
      }
    }

    return data.map(normalizeMasterClass)
  }

  async fetchByCity(city: string): Promise<MasterClass[]> {
    const response = await api.get<MasterClassDto[]>(API_ROUTES.masterClasses.byCity, {
      params: { locality: city }
    })
    return response.data.map(normalizeMasterClass)
  }

  async fetchById(id: number): Promise<MasterClass> {
    const response = await api.get<MasterClassDto>(API_ROUTES.masterClasses.detail(id))
    return normalizeMasterClass(response.data)
  }

  async fetchOrganizers(): Promise<UserBrief[]> {
    const response = await api.get<UserBrief[]>(API_ROUTES.users.organizers)
    return response.data
  }

  async fetchSpeakers(): Promise<UserBrief[]> {
    const response = await api.get<UserBrief[]>(API_ROUTES.users.speakers)
    return response.data
  }

  async fetchCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>(API_ROUTES.masterClasses.categories)
    return response.data
  }

  async fetchCities(): Promise<City[]> {
    const response = await api.get<City[]>(API_ROUTES.masterClasses.cities)
    return response.data
  }

  async searchByTitle(title: string): Promise<MasterClass[]> {
    const response = await api.get<PaginatedResponse<MasterClassDto>>(
      API_ROUTES.masterClasses.list,
      { params: { search: title } }
    )
    return response.data.results.map(normalizeMasterClass)
  }

  async create(payload: CreateMasterClassPayload): Promise<MasterClass> {
    const formData = new FormData()

    Object.entries(payload).forEach(([key, value]) => {
      if (value === null || value === undefined) return

      if (key === 'categories') {
        ;(value as number[]).forEach((categoryId) => formData.append(key, String(categoryId)))
      } else if (key === 'image_url' && value instanceof File) {
        formData.append('image_url', value, value.name)
      } else {
        formData.append(key, String(value))
      }
    })

    const response = await api.post<MasterClassDto>(API_ROUTES.masterClasses.list, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return normalizeMasterClass(response.data)
  }

  async geocodeAddress(locationName: string): Promise<GeocodeResult> {
    const response = await api.get<GeocodeResult>(API_ROUTES.gis.geocode, {
      params: { location_name: locationName }
    })
    return response.data
  }

  async reverseGeocode(longitude: number, latitude: number): Promise<GeocodeResult> {
    const response = await api.get<GeocodeResult>(API_ROUTES.gis.reverseGeocode, {
      params: { longitude, latitude }
    })
    return response.data
  }
}

export const masterClassApi = new MasterClassApi()
