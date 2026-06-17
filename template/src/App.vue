<script setup lang="ts">
import ErrorDialog from '@/components/ErrorDialog.vue'
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useToast } from 'primevue/usetoast'
import { useRoute, useRouter } from 'vue-router'

const authStore = useAuthStore()
const toast = useToast()
const router = useRouter()
const route = useRoute()

// Reage a expiracao de sessao disparada pelo error.interceptor (status 401).
watch(
  () => authStore.sessionExpired,
  (expired) => {
    if (!expired) return
    toast.add({
      severity: 'warn',
      summary: 'Sessão expirada',
      detail: 'Sua sessão expirou. Faça login novamente.',
      life: 5000,
    })

    if (route.name !== 'login') {
      router.replace({ name: 'login' })
    }

    authStore.sessionExpired = false
  },
)
</script>

<template>
  <router-view />
  <ErrorDialog />
  <Toast />
</template>
