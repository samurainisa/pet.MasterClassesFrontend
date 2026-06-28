import { api } from '@/shared/api/http-client'
import { API_ROUTES } from '@/shared/api/routes'
import type { MasterClassDto } from '@/entities/master-class/model/types'
import { normalizeMasterClass } from '@/entities/master-class/lib/normalizeMasterClass'
import type { MasterClass } from '@/entities/master-class/model/types'

class OrganizerApi {
  async fetchMasterClasses(organizerId: number): Promise<MasterClass[]> {
    const response = await api.get<MasterClassDto[]>(
      API_ROUTES.organizer.masterClasses(organizerId)
    )
    return response.data.map(normalizeMasterClass)
  }
}

export const organizerApi = new OrganizerApi()
