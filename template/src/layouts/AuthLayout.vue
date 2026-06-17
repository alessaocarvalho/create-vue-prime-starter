<script setup lang="ts">
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import { useAuthStore } from '@/stores/auth.store'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const primeiroNome = computed(() => authStore.user?.nome?.trim().split(/\s+/)[0] ?? 'Usuário')

const logout = async () => {
  authStore.clearUser()
  await router.push({ name: 'login' })
}
</script>

<template>
  <main class="min-h-screen bg-surface-50 dark:bg-surface-950">
    <header class="px-6 py-3 border-b border-surface-200 dark:border-surface-800">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <div class="leading-tight">
          <h1 class="text-lg font-semibold text-surface-900 dark:text-surface-50">
            {{ '{{PROJECT_NAME}}' }}
          </h1>
          <p class="text-sm text-surface-500 dark:text-surface-400">Vue 3 + PrimeVue</p>
        </div>

        <div class="flex items-center gap-2">
          <ThemeSwitcher />
          <div class="flex items-center gap-2 pl-2">
            <Avatar :label="primeiroNome.charAt(0).toUpperCase()" shape="circle" />
            <span class="hidden text-sm font-semibold text-surface-900 dark:text-surface-50 sm:inline">
              {{ primeiroNome }}
            </span>
          </div>
          <Button
            icon="pi pi-sign-out"
            rounded
            text
            severity="secondary"
            aria-label="Sair"
            v-tooltip.bottom="'Sair'"
            @click="logout"
          />
        </div>
      </div>
    </header>

    <section class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <RouterView />
    </section>
  </main>
</template>
