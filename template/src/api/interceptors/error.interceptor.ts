import { useAuthStore } from '@/stores/auth.store'
import { useErrorStore } from '@/stores/error.store'
import type { AxiosInstance } from 'axios'
import { normalizeAxiosError } from '@/api/errors'

/**
 * Interceptor de resposta para tratamento centralizado de erros.
 *
 * - 401: expira a sessao do usuario (logout + flag de sessao expirada).
 * - Demais erros: normaliza e empilha no error.store, que alimenta o
 *   ErrorDialog global.
 *
 * O erro continua sendo rejeitado para que a camada chamadora possa
 * reagir (ex.: parar loading) se necessario.
 */
export function setupErrorInterceptor(client: AxiosInstance) {
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const authStore = useAuthStore()
      const errorStore = useErrorStore()
      const normalizedError = normalizeAxiosError(error)

      if (normalizedError.status === 401) {
        authStore.expireSession()
      } else {
        errorStore.addError(normalizedError)
      }

      return Promise.reject(error)
    },
  )
}
