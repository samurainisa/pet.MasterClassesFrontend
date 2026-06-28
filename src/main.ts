// src\main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@/shared/api/http-client'
import App from './App.vue'
import L from '@/shared/lib/leaflet'
import '@/assets/map-styles.scss'
import '@vueform/multiselect/themes/default.css'
import '@/assets/style.css'
import { useUserStore } from '@/stores/user/userStore'
import router from '@/app/router'
const app = createApp(App)
app.use(createPinia())
app.use(router)
const userStore = useUserStore()

userStore.checkUser().then(() => {
  app.mount('#app')
})
