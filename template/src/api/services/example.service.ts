import { HttpClient } from '@/api/HttpClient'

/**
 * Service de exemplo demonstrando o padrao de camada de dados:
 *
 * - Estende HttpClient (herda interceptors e metodos tipados).
 * - Implementa cache simples em memoria.
 * - Faz fallback para dados mock quando VITE_API_BASE_URL nao esta configurada,
 *   permitindo rodar o "hello world" sem backend.
 *
 * Em um projeto real, remova o mock e aponte para o endpoint correspondente.
 */
const MOCK_PRODUTOS: Produto[] = [
  { id: 1, nome: 'Notebook Pro 14', categoria: 'Eletronicos', preco: 8499.9, ativo: true },
  { id: 2, nome: 'Cadeira Ergonomica', categoria: 'Mobiliario', preco: 1299.0, ativo: true },
  { id: 3, nome: 'Monitor UltraWide', categoria: 'Eletronicos', preco: 2899.5, ativo: false },
  { id: 4, nome: 'Teclado Mecanico', categoria: 'Perifericos', preco: 549.9, ativo: true },
  { id: 5, nome: 'Mesa Regulavel', categoria: 'Mobiliario', preco: 2199.0, ativo: true },
]

export class ExampleService extends HttpClient {
  private cache?: Produto[]

  constructor() {
    super(import.meta.env.VITE_API_BASE_URL || '')
  }

  async getProdutos(): Promise<Produto[]> {
    if (this.cache) return this.cache

    // Sem backend configurado: usa mock local (simula latencia).
    if (!import.meta.env.VITE_API_BASE_URL) {
      await new Promise((resolve) => setTimeout(resolve, 600))
      this.cache = MOCK_PRODUTOS
      return this.cache
    }

    const data = await this.get<Produto[]>('api/produtos')
    this.cache = data
    return data
  }

  clearCache() {
    this.cache = undefined
  }
}

export const exampleService = new ExampleService()
