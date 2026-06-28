<template>
  <div id="app" :class="{ 'has-map': isMapLayout }">
    <div class="wrapper">
      <main class="main-content">
        <AppNav />
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNav from '@/widgets/layout/ui/AppNav.vue'

const route = useRoute()

const isMapLayout = computed(() => route.meta.layout === 'map')
</script>

<style>
.wrapper {
  margin: 0 auto;
  max-width: 1280px;
  padding: 0 20px;
}

.wrapper:has(.main-container):has(.maps-container) {
  max-width: none !important;
  padding: 0 !important;
  margin: 0 !important;
}

.main-content {
  margin-top: 60px;
}

.has-map .main-content {
  margin-top: 0 !important;
}
</style>
