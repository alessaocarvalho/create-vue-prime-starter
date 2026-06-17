<script setup lang="ts">
import { ref, computed } from 'vue'
import { useErrorStore } from '@/stores/error.store'

const store = useErrorStore()

const error = computed(() => store.currentError)
const position = computed(() =>
  store.total > 0 ? `${store.currentIndex + 1} / ${store.total}` : '',
)

const originIcon = computed(() => {
  const map: Record<string, string> = {
    api: 'pi pi-server',
    network: 'pi pi-wifi',
    timeout: 'pi pi-clock',
    client: 'pi pi-desktop',
  }
  return map[error.value?.origem ?? ''] ?? 'pi pi-exclamation-triangle'
})

const originLabel = computed(() => {
  const map: Record<string, string> = {
    api: 'API',
    network: 'Rede',
    timeout: 'Timeout',
    client: 'Cliente',
  }
  return map[error.value?.origem ?? ''] ?? 'Desconhecido'
})

const originSeverity = computed(() => {
  const map: Record<string, string> = {
    api: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    network: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    timeout: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    client: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
  }
  return (
    map[error.value?.origem ?? ''] ??
    'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-300'
  )
})

type DetailItem = { key: string; value: string }
type DetailSection = { label: string; items: DetailItem[] }

const detailSections = computed<DetailSection[]>(() => {
  if (!error.value?.detalhes) return []
  const d = error.value.detalhes
  const sections: DetailSection[] = []

  const req: DetailItem[] = []
  if (d.method && d.url) req.push({ key: 'Endpoint', value: `${d.method} ${d.url}` })
  if (d.errorCode) req.push({ key: 'Código', value: d.errorCode })
  if (d.message) req.push({ key: 'Mensagem', value: d.message })
  if (req.length) sections.push({ label: 'Requisição', items: req })

  const res: DetailItem[] = []
  if (d.statusText) res.push({ key: 'Status', value: d.statusText })
  if (d.exception) res.push({ key: 'Exceção', value: d.exception })
  if (d.correlationId) res.push({ key: 'Correlation ID', value: d.correlationId })
  if (res.length) sections.push({ label: 'Resposta', items: res })

  const ctx: DetailItem[] = []
  if (d.timestamp) ctx.push({ key: 'Horário', value: d.timestamp })
  if (d.offline) ctx.push({ key: 'Offline', value: 'Sim' })
  if (ctx.length) sections.push({ label: 'Contexto', items: ctx })

  return sections
})

const detailsText = computed(() =>
  detailSections.value
    .map((s) => `${s.label}\n${s.items.map((i) => `${i.key}: ${i.value}`).join('\n')}`)
    .join('\n\n'),
)

const copied = ref(false)
const detailsOpen = ref(false)

async function copyDetails() {
  if (!detailsText.value) return
  await navigator.clipboard.writeText(detailsText.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <Dialog
    v-model:visible="store.visible"
    modal
    :closable="true"
    :draggable="false"
    class="error-dialog"
    :pt="{
      root: { style: 'max-width: 28rem; width: 95vw' },
      content: { style: 'padding: 0 1.25rem 1.25rem' },
      header: {
        style: 'padding: 1rem 1.25rem 0.75rem; border-bottom: 1px solid var(--surface-border)',
      },
    }"
    @hide="store.hide()"
  >
    <template #header>
      <div class="flex items-center gap-2 w-full min-w-0">
        <i :class="originIcon" class="text-red-500 text-lg shrink-0" />
        <span class="font-medium text-sm text-surface-800 dark:text-surface-100 truncate">
          {{ error?.titulo }}
        </span>
        <span
          v-if="store.total > 1"
          class="ml-auto text-xs text-surface-400 whitespace-nowrap font-mono shrink-0"
        >
          {{ position }}
        </span>
      </div>
    </template>

    <div v-if="error" class="flex flex-col gap-3.5 pt-3">
      <!-- Origem + status -->
      <div class="flex items-center gap-2">
        <span class="text-xs px-2.5 py-0.5 rounded-full font-medium" :class="originSeverity">
          {{ originLabel }}
        </span>
        <span v-if="error.status" class="text-xs text-surface-400 font-mono">
          HTTP {{ error.status }}
        </span>
      </div>

      <!-- Mensagem principal -->
      <p class="text-sm text-surface-600 dark:text-surface-300 leading-relaxed m-0">
        {{ error.mensagem }}
      </p>

      <!-- Detalhes tecnicos -->
      <div v-if="detailSections.length" class="flex flex-col gap-2">
        <button
          class="flex items-center gap-1.5 text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors cursor-pointer bg-transparent border-0 p-0 w-fit"
          @click="detailsOpen = !detailsOpen"
        >
          <i
            class="pi pi-chevron-right text-[10px] transition-transform duration-200"
            :class="{ 'rotate-90': detailsOpen }"
          />
          Detalhes técnicos
        </button>

        <Transition
          enter-active-class="transition-all duration-200 ease-out overflow-hidden"
          leave-active-class="transition-all duration-150 ease-in overflow-hidden"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-48"
          leave-from-class="opacity-100 max-h-48"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="detailsOpen" class="relative group">
            <div
              class="bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg p-3 flex flex-col gap-3 max-h-48 overflow-y-auto"
            >
              <div v-for="section in detailSections" :key="section.label">
                <span
                  class="text-[10px] font-semibold uppercase tracking-widest text-surface-400 dark:text-surface-500"
                >
                  {{ section.label }}
                </span>
                <dl class="mt-1.5 flex flex-col gap-1 m-0">
                  <div
                    v-for="item in section.items"
                    :key="item.key"
                    class="flex gap-3 text-xs leading-relaxed"
                  >
                    <dt class="text-surface-400 dark:text-surface-500 shrink-0 min-w-[4.5rem]">
                      {{ item.key }}
                    </dt>
                    <dd class="text-surface-600 dark:text-surface-300 m-0 break-all font-mono">
                      {{ item.value }}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <!-- Botao copiar -->
            <button
              class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded p-1 cursor-pointer border-0"
              :title="copied ? 'Copiado!' : 'Copiar detalhes'"
              @click="copyDetails"
            >
              <i
                :class="copied ? 'pi pi-check text-green-500' : 'pi pi-copy text-surface-500'"
                class="text-xs"
              />
            </button>
          </div>
        </Transition>
      </div>

      <!-- Acoes -->
      <div class="flex items-center gap-1.5 pt-2">
        <template v-if="store.total > 1">
          <Button
            text
            rounded
            size="small"
            icon="pi pi-chevron-left"
            :disabled="store.currentIndex === 0"
            aria-label="Erro anterior"
            @click="store.prev()"
          />
          <Button
            text
            rounded
            size="small"
            icon="pi pi-chevron-right"
            :disabled="store.currentIndex === store.total - 1"
            aria-label="Próximo erro"
            @click="store.next()"
          />
        </template>

        <div class="flex-1" />

        <Button
          v-if="store.total > 1"
          text
          size="small"
          severity="secondary"
          label="Limpar tudo"
          @click="store.dismissAll()"
        />
        <Button size="small" severity="danger" label="Dispensar" @click="store.dismiss()" />
      </div>
    </div>
  </Dialog>
</template>
