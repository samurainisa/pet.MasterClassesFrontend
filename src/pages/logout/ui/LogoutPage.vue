<template>
  <div>Выход...</div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user/userStore'
import { routeNames } from '@/app/router/routes'

const userStore = useUserStore()
const router = useRouter()

onMounted(() => {
  userStore.logout()
  router.push({ name: routeNames.home })
})
</script>
