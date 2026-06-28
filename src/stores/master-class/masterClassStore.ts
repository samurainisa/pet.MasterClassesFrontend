import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { masterClassApi } from '@/entities/master-class/api/masterClassApi'
import type {
  AddressData,
  Category,
  CreateMasterClassPayload,
  MasterClass
} from '@/entities/master-class/model/types'
import type { UserBrief } from '@/entities/user/model/types'

const emptyAddressData = (): AddressData => ({
  latitude: 0,
  longitude: 0,
  country: '',
  province: '',
  area: '',
  locality: '',
  street: '',
  house: '',
  postal_code: ''
})

export const useMasterClassesStore = defineStore('masterClasses', () => {
  const masterClasses = ref<MasterClass[]>([])
  const organizers = ref<UserBrief[]>([])
  const speakers = ref<UserBrief[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedCategories = ref<number[]>([])
  const selectedCities = ref<string[]>([])
  const startDate = ref<Date | null>(null)
  const endDate = ref<Date | null>(null)
  const addressData = ref<AddressData>(emptyAddressData())
  const selectedMasterClass = ref<MasterClass | null>(null)

  const getMasterClasses = computed(() => masterClasses.value)
  const getOrganizers = computed(() => organizers.value)
  const getSpeakers = computed(() => speakers.value)
  const getSelectedMasterClass = computed(() => selectedMasterClass.value)

  function currentFilters(fetchAll = false) {
    return {
      categories: selectedCategories.value,
      cities: selectedCities.value,
      startDate: startDate.value,
      endDate: endDate.value,
      fetchAll
    }
  }

  async function fetchMasterClassesList() {
    loading.value = true
    error.value = null
    try {
      masterClasses.value = await masterClassApi.fetchList(currentFilters())
    } catch {
      error.value = 'Failed to load master classes'
    } finally {
      loading.value = false
    }
  }

  async function fetchMasterClassById(id: number) {
    loading.value = true
    error.value = null
    try {
      selectedMasterClass.value = await masterClassApi.fetchById(id)
    } catch {
      error.value = 'Failed to load master class'
    } finally {
      loading.value = false
    }
  }

  async function fetchAllMasterClasses() {
    loading.value = true
    error.value = null
    try {
      masterClasses.value = await masterClassApi.fetchList(currentFilters(true))
    } catch {
      error.value = 'Failed to load all master classes'
    } finally {
      loading.value = false
    }
  }

  async function fetchOrganizersList() {
    try {
      organizers.value = await masterClassApi.fetchOrganizers()
    } catch {
      error.value = 'Failed to fetch organizers'
    }
  }

  async function fetchSpeakersList() {
    try {
      speakers.value = await masterClassApi.fetchSpeakers()
    } catch {
      error.value = 'Failed to fetch speakers'
    }
  }

  async function createMasterClass(payload: CreateMasterClassPayload) {
    loading.value = true
    error.value = null
    try {
      await masterClassApi.create(payload)
      await fetchMasterClassesList()
    } catch {
      error.value = 'Failed to create master class'
    } finally {
      loading.value = false
    }
  }

  async function searchMasterClassesByTitle(title: string) {
    loading.value = true
    error.value = null
    try {
      masterClasses.value = await masterClassApi.searchByTitle(title)
    } catch {
      error.value = 'Failed to search master classes'
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories(): Promise<Category[] | undefined> {
    try {
      return await masterClassApi.fetchCategories()
    } catch {
      error.value = 'Failed to fetch categories'
      return undefined
    }
  }

  async function fetchCitiesList() {
    try {
      return await masterClassApi.fetchCities()
    } catch {
      error.value = 'Failed to fetch cities'
      return undefined
    }
  }

  async function geocodeAddress(locationName: string) {
    try {
      addressData.value = await masterClassApi.geocodeAddress(locationName)
    } catch {
      error.value = 'Failed to geocode address'
    }
  }

  async function reverseGeocodeCoordinates(longitude: number, latitude: number) {
    try {
      addressData.value = await masterClassApi.reverseGeocode(longitude, latitude)
    } catch {
      error.value = 'Failed to reverse geocode coordinates'
    }
  }

  function setSelectedCategories(categories: number[]) {
    selectedCategories.value = categories
  }

  function setSelectedCities(cities: string[]) {
    selectedCities.value = cities
  }

  function setStartDate(date: Date | null) {
    startDate.value = date
  }

  function setEndDate(date: Date | null) {
    endDate.value = date
  }

  return {
    masterClasses,
    organizers,
    speakers,
    loading,
    error,
    selectedCategories,
    selectedCities,
    startDate,
    endDate,
    addressData,
    selectedMasterClass,
    getMasterClasses,
    getOrganizers,
    getSpeakers,
    getSelectedMasterClass,
    fetchMasterClasses: fetchMasterClassesList,
    fetchMasterClassById,
    fetchAllMasterClasses,
    fetchOrganizers: fetchOrganizersList,
    fetchSpeakers: fetchSpeakersList,
    createMasterClass,
    searchMasterClassesByTitle,
    fetchCategories,
    fetchCities: fetchCitiesList,
    geocodeAddress,
    reverseGeocodeCoordinates,
    setSelectedCategories,
    setSelectedCities,
    setStartDate,
    setEndDate
  }
})

export type { Category } from '@/entities/master-class/model/types'
