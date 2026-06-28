import { api } from '@/shared/api/http-client'
import { API_ROUTES } from '@/shared/api/routes'
import type {
  RegistrationRequest,
  RegistrationResponse
} from '@/entities/registration/model/types'

class RegistrationApi {
  async registerForMasterClass(masterClassId: number): Promise<RegistrationResponse> {
    const response = await api.post<RegistrationResponse>(
      API_ROUTES.masterClasses.register(masterClassId)
    )
    return response.data
  }

  async fetchRegistrations(masterClassId: number): Promise<RegistrationRequest[]> {
    const response = await api.get<RegistrationRequest[]>(
      API_ROUTES.masterClasses.registrations(masterClassId)
    )
    return response.data
  }
}

export const registrationApi = new RegistrationApi()
