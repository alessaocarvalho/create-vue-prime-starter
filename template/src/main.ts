import '@/assets/main.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { useThemeStore } from '@/stores/theme.store'
import App from './App.vue'
import router from './router'
import { setupPrimeVue } from './primevue'
import {
  applyDarkModeClass,
  applyFontSizeClass,
  getStoredDarkMode,
  getStoredFontSize,
} from '@/primevue/utils/themeUtils'

// Aplica preferencias visuais antes do mount para evitar "flash" de tema.
applyDarkModeClass(getStoredDarkMode())
applyFontSizeClass(getStoredFontSize())

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
setupPrimeVue(app)

useThemeStore().initializeTheme()

app.mount('#app')
