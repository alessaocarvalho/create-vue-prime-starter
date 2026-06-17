<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('demo@exemplo.com')

const entrar = async () => {
  await authStore.login(email.value)
  await router.push({ name: 'home' })
}
</script>

<template>
  <Card class="w-full max-w-sm">
    <template #title>
      <div class="text-center">
        <i class="pi pi-bolt text-3xl text-primary" />
        <h2 class="mt-2 text-xl font-semibold">{{ '{{PROJECT_NAME}}' }}</h2>
        <p class="text-sm font-normal text-surface-500">Acesse para continuar</p>
      </div>
    </template>
    <template #content>
      <form class="flex flex-col gap-4" @submit.prevent="entrar">
        <IconField>
          <InputIcon class="pi pi-user" />
          <InputText v-model="email" placeholder="E-mail" class="w-full" autocomplete="username" />
        </IconField>
        <Button
          type="submit"
          label="Entrar"
          icon="pi pi-sign-in"
          :loading="!!authStore.loadingState"
          class="w-full"
        />
        <p class="text-center text-xs text-surface-400">
          Login simulado — qualquer e-mail funciona neste template.
        </p>
      </form>
    </template>
  </Card>
</template>
