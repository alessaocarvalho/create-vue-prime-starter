/**
 * API Entry Point
 * Exporta instancias e services para toda a aplicacao.
 */
import { HttpClient } from '@/api/HttpClient'

// Instancia singleton do HttpClient (uso direto para chamadas simples).
export const httpClient = new HttpClient(import.meta.env.VITE_API_BASE_URL || '')

// Re-export dos services de dominio.
export * from '@/api/services/example.service'
