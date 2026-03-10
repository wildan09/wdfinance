import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import VueApexCharts from 'vue3-apexcharts'

import './assets/css/main.css'
import { registerSW } from 'virtual:pwa-register'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueApexCharts)

// Daftarkan service worker untuk PWA (auto update)
registerSW({ immediate: true })

app.mount('#app')
