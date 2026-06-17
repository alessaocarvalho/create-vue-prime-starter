<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useExampleStore } from '@/stores/example.store'
import { useErrorStore } from '@/stores/error.store'

const exampleStore = useExampleStore()
const errorStore = useErrorStore()
const { produtos, loadingState, total, ativos } = storeToRefs(exampleStore)

onMounted(() => {
  if (!produtos.value.length) exampleStore.carregarProdutos()
})

const formatarPreco = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)

// Demonstra o pipeline de tratamento de erros (error.store -> ErrorDialog)
// sem precisar de um backend.
const simularErro = () => {
  errorStore.addError({
    titulo: 'Falha ao sincronizar',
    mensagem: 'Nao foi possivel concluir a operacao. Este e um erro de demonstracao.',
    status: 503,
    origem: 'api',
    detalhes: {
      method: 'POST',
      url: 'api/produtos/sync',
      statusText: 'Service Unavailable',
      correlationId: crypto.randomUUID(),
      timestamp: new Date().toLocaleString(),
    },
  })
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Cabecalho -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-50">Olá, mundo 👋</h2>
        <p class="text-surface-500 dark:text-surface-400">
          Template Vue 3 + PrimeVue com temas, layouts, stores e tratamento de erros.
        </p>
      </div>
      <div class="flex gap-2">
        <Button
          label="Recarregar"
          icon="pi pi-refresh"
          severity="secondary"
          outlined
          :loading="!!loadingState"
          @click="exampleStore.carregarProdutos()"
        />
        <Button label="Simular erro" icon="pi pi-exclamation-triangle" severity="danger" outlined @click="simularErro" />
      </div>
    </div>

    <!-- Indicadores -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <template #content>
          <span class="text-sm text-surface-500">Total de produtos</span>
          <p class="text-3xl font-bold text-primary">{{ total }}</p>
        </template>
      </Card>
      <Card>
        <template #content>
          <span class="text-sm text-surface-500">Ativos</span>
          <p class="text-3xl font-bold text-emerald-500">{{ ativos }}</p>
        </template>
      </Card>
      <Card>
        <template #content>
          <span class="text-sm text-surface-500">Inativos</span>
          <p class="text-3xl font-bold text-surface-400">{{ total - ativos }}</p>
        </template>
      </Card>
    </div>

    <!-- Tabela -->
    <Card>
      <template #title>Produtos</template>
      <template #content>
        <DataTable
          :value="produtos"
          :loading="!!loadingState"
          paginator
          :rows="5"
          dataKey="id"
          stripedRows
        >
          <template #empty>Nenhum produto encontrado.</template>
          <template #loading>{{ loadingState }}</template>
          <Column field="nome" header="Nome" sortable />
          <Column field="categoria" header="Categoria" sortable />
          <Column field="preco" header="Preço" sortable>
            <template #body="{ data }">{{ formatarPreco(data.preco) }}</template>
          </Column>
          <Column field="ativo" header="Status">
            <template #body="{ data }">
              <Tag
                :value="data.ativo ? 'Ativo' : 'Inativo'"
                :severity="data.ativo ? 'success' : 'secondary'"
              />
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
