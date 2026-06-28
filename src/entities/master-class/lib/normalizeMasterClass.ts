import type { MasterClass, MasterClassDto } from '@/entities/master-class/model/types'

export function normalizeMasterClass(dto: MasterClassDto): MasterClass {
  const { latitude, longitude, ...rest } = dto
  return {
    ...rest,
    coordinates: {
      latitude: parseFloat(String(latitude)),
      longitude: parseFloat(String(longitude))
    }
  }
}
