<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleDark } = useTheme()
</script>

<template>
  <main class="flex min-h-screen flex-col bg-surface-50 dark:bg-surface-950">
    <header class="px-6 py-2">
      <div class="flex justify-end gap-4">
        <Button
          :icon="isDark ? 'pi pi-sun' : 'pi pi-moon'"
          rounded
          text
          severity="secondary"
          :aria-label="isDark ? 'Ativar tema claro' : 'Ativar tema escuro'"
          v-tooltip.bottom="isDark ? 'Modo claro' : 'Modo escuro'"
          @click="toggleDark"
        />
      </div>
    </header>
    <section
      class="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8"
    >
      <RouterView />
    </section>
  </main>
</template>
