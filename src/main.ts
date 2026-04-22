import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ru as ruLocale } from 'primelocale/js/ru.js'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'

const app = createApp(App)

app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
  locale: ruLocale,
})

app.use(createPinia())
app.use(router)

app.mount('#app')
