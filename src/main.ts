import './assets/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { initTelemetry } from './service/telemetry/sentry'

const app = createApp(App)

app.use(createPinia())
app.use(router)

initTelemetry(app, router)

app.mount('#app')
