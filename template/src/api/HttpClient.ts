import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { setupAuthInterceptor } from '@/api/interceptors/auth.interceptor'
import { setupErrorInterceptor } from '@/api/interceptors/error.interceptor'

/**
 * Cliente HTTP base da aplicacao.
 *
 * Centraliza a criacao da instancia Axios, registra os interceptors de
 * autenticacao e de erro e expoe metodos tipados (get/post/put/patch/delete)
 * que ja retornam o "data" da resposta.
 *
 * Services de dominio devem estender esta classe (ver example.service.ts).
 */
export class HttpClient {
  protected client: AxiosInstance

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      withCredentials: true,
    })

    setupAuthInterceptor(this.client)
    setupErrorInterceptor(this.client)
  }

  get instance() {
    return this.client
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.client.get<T>(url, config)
    return data
  }

  async post<T, P = unknown>(url: string, payload?: P, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.client.post<T>(url, payload, config)
    return data
  }

  async put<T, P = unknown>(url: string, payload?: P, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.client.put<T>(url, payload, config)
    return data
  }

  async patch<T, P = unknown>(url: string, payload?: P, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.client.patch<T>(url, payload, config)
    return data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const { data } = await this.client.delete<T>(url, config)
    return data
  }
}
