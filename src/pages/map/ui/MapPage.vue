<template>
  <div class="main-container">
    <div id="map" class="maps-container"></div>
    <LayerToggleButton :displayedMasterClasses="displayedMasterClasses" :myIcon="myIcon" />
    <div class="controls-container">
      <Timeline
        :start-date="earliestDate"
        :end-date="latestDate"
        @changeData="handleDataChange"
        class="timeline"
      />
      <button class="button button--small show-all-btn" @click="showAll">показать всё</button>
    </div>
    <div class="zoom-controls">
      <button class="zoom-in" @click="zoomIn">
        <img src="/src/assets/imgs/map-controls/tabler_search_plus.svg" alt="" />
      </button>
      <button class="zoom-out" @click="zoomOut">
        <img src="/src/assets/imgs/map-controls/tabler_search_minus.svg" alt="" />
      </button>
      <button class="to-home" @click="zoomToHome">
        <img src="/src/assets/imgs/map-controls/to_home.svg" alt="" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import icon from '@/assets/imgs/map-marker-svgrepo-com.svg'
import { useMasterClassesStore } from '@/stores/master-class/masterClassStore'
import { computed, onMounted, ref, watch, toRaw } from 'vue'
import { useLayersStore } from '@/stores/map/layersStore'
import Timeline from '@/components/map/Timeline.vue'
import LayerToggleButton from '@/components/map/LayerToggleButton.vue'
import type { MasterClass } from '@/entities/master-class/model/types'
import L from 'leaflet'

const store = useMasterClassesStore()
const layersStore = useLayersStore()
const displayedMasterClasses = ref<MasterClass[]>([])
let userMarker: L.Marker | null = null

const myIcon = L.icon({
  iconUrl: icon,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
  shadowSize: [60, 30],
  shadowAnchor: [15, 30]
})

const earliestDate = computed(() => {
  return store.masterClasses.reduce(
    (min, mc) => (new Date(mc.start_date) < min ? new Date(mc.start_date) : min),
    new Date()
  )
})

const latestDate = computed(() => {
  return store.masterClasses.reduce(
    (max, mc) => (new Date(mc.start_date) > max ? new Date(mc.start_date) : max),
    new Date()
  )
})

let mapInstance: L.Map | undefined
let lastZoomTime = 0
const zoomCooldown = 500

function handleDataChange({
  startDate,
  interval,
  mode
}: {
  startDate: Date
  interval: string
  mode: string
}) {
  const intervalMilliseconds =
    interval === 'день' ? 86400000 : interval === 'неделя' ? 604800000 : 2592000000
  const endDate = new Date(startDate.getTime() + intervalMilliseconds)

  displayedMasterClasses.value = store.masterClasses.filter((mc) => {
    const mcDate = new Date(mc.start_date)
    return mode === 'накопительно' ? mcDate <= endDate : mcDate >= startDate && mcDate <= endDate
  })
  layersStore.toggleLayer(layersStore.activeLayerIndex, displayedMasterClasses.value, myIcon)
}

function showAll() {
  displayedMasterClasses.value = store.masterClasses
  layersStore.toggleLayer(layersStore.activeLayerIndex, displayedMasterClasses.value, myIcon)
}

function initializeMap(center: [number, number]) {
  const rawMapInstance = L.map('map', { zoomControl: false, zoom: 13, center })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '...',
    maxZoom: 20,
    minZoom: 3
  }).addTo(rawMapInstance)

  mapInstance = toRaw(rawMapInstance)

  layersStore.initializeMap(mapInstance)
  layersStore.updateMarkers(displayedMasterClasses.value, myIcon)
  showAll()
  layersStore.toggleLayer(0, displayedMasterClasses.value, myIcon)
}

onMounted(async () => {
  await store.fetchAllMasterClasses()
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        initializeMap([latitude, longitude])
      },
      () => {
        alert('Не удалось получить ваше местоположение.')
        initializeMap([55.755819, 37.617644])
      }
    )
  } else {
    alert('Ваш браузер не поддерживает геолокацию.')
    initializeMap([55.755819, 37.617644])
  }
})

watch(
  () => store.masterClasses,
  (newData) => {
    if (mapInstance) {
      layersStore.updateMarkers(newData, myIcon)
    }
  }
)

function zoomIn() {
  const now = Date.now()
  if (mapInstance && now - lastZoomTime > zoomCooldown) {
    mapInstance.zoomIn()
    lastZoomTime = now
  }
}

function zoomOut() {
  const now = Date.now()
  if (mapInstance && now - lastZoomTime > zoomCooldown) {
    mapInstance.zoomOut()
    lastZoomTime = now
  }
}

function zoomToHome() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        if (mapInstance) {
          if (userMarker) {
            mapInstance.removeLayer(userMarker)
          }
          userMarker = L.marker([latitude, longitude])
            .addTo(mapInstance)
            .bindPopup('Вы здесь')
            .openPopup()
          mapInstance.setView([latitude, longitude], 13)
        }
      },
      () => {
        alert('Не удалось получить ваше местоположение.')
      }
    )
  } else {
    alert('Ваш браузер не поддерживает геолокацию.')
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/variables';
@import '@/assets/button-styles';
@import '@/assets/map-styles';

.show-all-btn {
  background-color: $green;
  color: $white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: darken($green, 10%);
  }
}

.zoom-controls {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 10px;

  button {
    width: 48px;
    height: 48px;
    background-color: $green;
    color: $white;
    border: none;
    border-radius: 50%;
    padding: 10px;
    cursor: pointer;
    font-size: 18px;
    line-height: 18px;
    transition: background-color 0.3s;

    &:hover {
      background-color: darken($green, 10%);
    }
  }
}
</style>
