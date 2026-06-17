import { exampleService } from '@/api/services/example.service'
import { defineStore } from 'pinia'

/**
 * Store de dominio de exemplo. Demonstra o padrao:
 *  - `loadingState` como string descritiva (null = ocioso);
 *  - actions assincronas que delegam ao service e tratam erro de forma
 *    amigavel (o erro tecnico ja foi capturado pelo interceptor global).
 */
export const useExampleStore = defineStore('example', {
  state: () => ({
    loadingState: null as string | null,
    produtos: [] as Produto[],
  }),

  getters: {
    total: (s) => s.produtos.length,
    ativos: (s) => s.produtos.filter((p) => p.ativo).length,
  },

  actions: {
    async carregarProdutos() {
      this.loadingState = 'Carregando produtos...'
      try {
        this.produtos = await exampleService.getProdutos()
      } catch {
        throw new Error('Falha ao carregar os produtos. Por favor, tente novamente.')
      } finally {
        this.loadingState = null
      }
    },

    limpar() {
      this.produtos = []
      this.loadingState = null
    },
  },
})
