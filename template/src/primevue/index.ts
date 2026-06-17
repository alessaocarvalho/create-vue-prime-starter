import PrimeVue from 'primevue/config'
import { primeVueConfig } from '@/primevue/config'
import type { App } from 'vue'
import { setupComponents } from '@/primevue/components'
import { setupDirectives } from '@/primevue/directives'
import { ConfirmationService, ToastService } from 'primevue'

/**
 * Ponto unico de configuracao do PrimeVue.
 * Registra o plugin, os servicos (Toast/Confirmation), componentes e diretivas
 * de forma centralizada e tipada.
 */
export const setupPrimeVue = (app: App) => {
  app.use(PrimeVue, primeVueConfig)
  app.use(ToastService)
  app.use(ConfirmationService)

  setupComponents(app)
  setupDirectives(app)
}
