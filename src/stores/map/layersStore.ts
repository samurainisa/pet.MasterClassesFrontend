import { defineStore } from 'pinia'
import { ref } from 'vue'
import { SubData } from '@/assets/output.js'
import L, {
  type GeoJSONOptions,
  type LatLngExpression,
  type Layer,
  type GeoJSON,
  type Map
} from 'leaflet'
import type { MasterClass } from '@/entities/master-class/model/types'
import 'leaflet.heat'
import 'leaflet.markercluster'

import type { GeoJsonObject } from 'geojson'

export const useLayersStore = defineStore('layersStore', () => {
  const activeLayer = ref<number>(0)
  const activeLayerIndex = ref<number>(-1)
  const map = ref<L.Map | null>(null)
  const markers = ref(L.markerClusterGroup())
  const heatmapLayer = ref<Layer | null>(null)
  const geoJsonLayer = ref<L.GeoJSON | null>(null)
  const eventCountByRegion = ref<Record<string, number>>({})

  function initializeMap(mapInstance: L.Map) {
    map.value = mapInstance
  }

  function updateMarkers(displayedMasterClasses: MasterClass[], myIcon: L.Icon) {
    if (!map.value) return

    markers.value.clearLayers()

    displayedMasterClasses.forEach((item, index) => {
      const { latitude, longitude } = item.coordinates

      if (isNaN(latitude) || isNaN(longitude)) return

      const marker = L.marker([latitude, longitude] as LatLngExpression, { icon: myIcon })
        .on('mouseover', () => {
          if (!marker.getPopup()) {
            marker.bindPopup(`
            <div class="marker-popup">
              <div class="image-container">
                <img src="${item.image_url || '/default-image.jpg'}" class="card-image" id="popup-image-${index}">
              </div>
              <div class="card-content">
                <strong>${item.title}</strong><br>
                <div class="mc-footer">
                  <span>${item.location_name}</span>
                  <span>${new Date(item.start_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>`)
          }
          marker.openPopup()
        })
        .on('mouseout', () => {
          setTimeout(() => {
            if (!marker.isPopupOpen()) {
              marker.closePopup()
            }
          }, 300)
        })

      marker.on('popupopen', () => {
        const popup = document.getElementById(`popup-image-${index}`)
        if (popup) {
          popup.addEventListener('mouseover', () => {
            clearTimeout((marker as L.Marker & { _closeTimeout?: ReturnType<typeof setTimeout> })._closeTimeout)
          })
          popup.addEventListener('mouseout', () => {
            ;(marker as L.Marker & { _closeTimeout?: ReturnType<typeof setTimeout> })._closeTimeout =
              setTimeout(() => {
                marker.closePopup()
              }, 300)
          })
        }
      })

      markers.value.addLayer(marker)
    })

    if (map.value) {
      map.value.addLayer(markers.value as unknown as Layer)
    }
  }

  function updateHeatmap(displayedMasterClasses: MasterClass[]) {
    if (!map.value) return

    if (heatmapLayer.value) {
      map.value.removeLayer(heatmapLayer.value as Layer)
    }

    const heatData = displayedMasterClasses
      .map((item) => {
        const { latitude, longitude } = item.coordinates
        if (isNaN(latitude) || isNaN(longitude)) return null
        return [latitude, longitude, 300] as [number, number, number]
      })
      .filter((item): item is [number, number, number] => item !== null)

    heatmapLayer.value = (L as typeof L & { heatLayer: (...args: unknown[]) => Layer }).heatLayer(
      heatData,
      { radius: 25 }
    ) as Layer

    if (map.value && heatmapLayer.value) {
      heatmapLayer.value.addTo(map.value as L.Map)
    }
  }

  function aggregateEventCounts(displayedMasterClasses: MasterClass[]) {
    const counts: Record<string, number> = {}

    displayedMasterClasses.forEach((item) => {
      const { latitude, longitude } = item.coordinates
      if (isNaN(latitude) || isNaN(longitude)) return

      const point = L.latLng(latitude, longitude)
      SubData.features.forEach((feature: GeoJsonObject) => {
        const polygon = L.geoJSON(feature as GeoJSON.GeoJsonObject).getLayers()[0] as L.Polygon
        if (polygon.getBounds().contains(point)) {
          const region = (feature as GeoJsonObject & { properties: { name: string } }).properties.name
          counts[region] = (counts[region] ?? 0) + 1
        }
      })
    })

    eventCountByRegion.value = counts
  }

  function updateChoropleth() {
    if (!map.value) return

    if (geoJsonLayer.value) {
      map.value.removeLayer(geoJsonLayer.value as GeoJSON)
    }

    function getColor(eventCount: number) {
      if (eventCount > 100) return '#800026'
      if (eventCount > 50) return '#BD0026'
      if (eventCount > 20) return '#E31A1C'
      if (eventCount > 10) return '#FC4E2A'
      if (eventCount > 5) return '#FD8D3C'
      if (eventCount > 2) return '#FEB24C'
      if (eventCount > 1) return '#FED976'
      return '#81817f'
    }

    function style(feature: GeoJsonObject) {
      const name = (feature as GeoJsonObject & { properties: { name: string } }).properties.name
      const eventCount = eventCountByRegion.value[name] ?? 0
      return {
        fillColor: getColor(eventCount),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
      }
    }

    function onEachFeature(feature: GeoJsonObject, layer: L.Layer) {
      const name = (feature as GeoJsonObject & { properties: { name: string } }).properties.name
      const eventCount = eventCountByRegion.value[name] ?? 0
      layer.on({
        mouseover: (e: L.LeafletMouseEvent) => {
          const target = e.target as L.Path
          target.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
          })
          layer.bindPopup(`Количество мероприятий: ${eventCount}`).openPopup()
        },
        mouseout: (e: L.LeafletMouseEvent) => {
          geoJsonLayer.value?.resetStyle(e.target)
          layer.closePopup()
        }
      })
    }

    geoJsonLayer.value = L.geoJSON(SubData, {
      style,
      onEachFeature
    } as GeoJSONOptions)

    geoJsonLayer.value.addTo(map.value as Map)
  }

  function toggleLayer(index: number, displayedMasterClasses: MasterClass[], myIcon: L.Icon) {
    activeLayerIndex.value = index

    if (heatmapLayer.value && map.value) {
      map.value.removeLayer(heatmapLayer.value as Layer)
    }
    if (geoJsonLayer.value && map.value) {
      map.value.removeLayer(geoJsonLayer.value as GeoJSON)
    }
    if (map.value) {
      map.value.removeLayer(markers.value as unknown as Layer)
    }

    if (index === 1) {
      updateHeatmap(displayedMasterClasses)
    } else if (index === 2) {
      aggregateEventCounts(displayedMasterClasses)
      updateChoropleth()
    } else {
      updateMarkers(displayedMasterClasses, myIcon)
    }
  }

  return {
    activeLayer,
    activeLayerIndex,
    initializeMap,
    toggleLayer,
    updateMarkers,
    updateHeatmap,
    updateChoropleth
  }
})
