import { exampleService } from '@/api/services/example.service'
import { defineStore } from 'pinia'

/**
 * Store de autenticacao simplificada (exemplo).
 *
 * Em um projeto real, substitua `login` por uma chamada a um auth.service
 * que troca credenciais/codigo por um token e dados do usuario. O essencial
 * para a arquitetura e manter:
 *  - estado `user` + getter `isAuthenticated` (usados pelo route guard);
 *  - `expireSession()` (chamado pelo error.interceptor no status 401);
 *  - persistencia do usuario via pinia-plugin-persistedstate.
 */
export const useAuthStore = defineStore('auth', {
  state: () => ({
    loadingState: null as string | null,
    user: null as User | null,
    sessionExpired: false,
  }),

  persist: {
    key: 'auth',
    storage: localStorage,
    pick: ['user'],
  },

  getters: {
    isAuthenticated: (state) => !!state.user,
    hasRole: (state) => (role: string) => state.user?.permissoes.includes(role) ?? false,
  },

  actions: {
    async login(email: string) {
      this.loadingState = 'Entrando...'
      try {
        // Simula autenticacao. Substitua por chamada real ao backend.
        await new Promise((resolve) => setTimeout(resolve, 500))

        const token = import.meta.env.VITE_DEV_TOKEN || 'fake-token'
        sessionStorage.setItem('token', token)

        this.setUser({
          nome: email.split('@')[0] || 'Usuário',
          email,
          permissoes: ['USER'],
        })
      } finally {
        this.loadingState = null
      }
    },

    setUser(user: User) {
      this.user = user
    },

    clearUser() {
      sessionStorage.removeItem('token')
      exampleService.clearCache()
      this.user = null
      this.loadingState = null
    },

    expireSession() {
      this.clearUser()
      this.sessionExpired = true
    },
  },
})
