import type { AxiosInstance } from 'axios'

/**
 * Interceptor de requisicao responsavel por injetar credenciais.
 *
 * - Modo development: usa um token fixo (VITE_DEV_TOKEN) via header x-dev-token,
 *   permitindo bypass de autenticacao em ambiente local.
 * - Producao: injeta o JWT Bearer armazenado no sessionStorage.
 */
export function setupAuthInterceptor(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const APP_MODE = import.meta.env.VITE_APP_MODE
    const DEV_TOKEN = import.meta.env.VITE_DEV_TOKEN
    const token = sessionStorage.getItem('token')

    if (APP_MODE === 'development' && DEV_TOKEN) {
      config.headers['x-dev-token'] = DEV_TOKEN
    } else if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })
}
