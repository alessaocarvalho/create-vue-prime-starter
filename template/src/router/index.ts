import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { routes } from '@/router/routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/**
 * Route guard global.
 * Rotas marcadas com meta.public sao liberadas; as demais exigem usuario
 * autenticado, redirecionando para o login caso contrario.
 */
router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.public) return true

  if (!authStore.isAuthenticated) {
    authStore.clearUser()
    return { name: 'login' }
  }
})

export default router
