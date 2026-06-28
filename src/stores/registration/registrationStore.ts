import { defineStore } from 'pinia'
import { ref } from 'vue'
import { registrationApi } from '@/entities/registration/api/registrationApi'
import type { RegistrationResponse } from '@/entities/registration/model/types'

export const useRegistrationStore = defineStore('registration', () => {
  const registrationStatus = ref<string | null>(null)

  async function registerForMasterClass(
    masterClassId: number
  ): Promise<RegistrationResponse> {
    try {
      const response = await registrationApi.registerForMasterClass(masterClassId)
      registrationStatus.value = response.status
      return response
    } catch (error) {
      registrationStatus.value = 'registration failed'
      throw error
    }
  }

  return {
    registrationStatus,
    registerForMasterClass
  }
})
