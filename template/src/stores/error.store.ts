import { defineStore } from 'pinia'

type ErrorItem = ErrorDisplay & { id: string; createdAt: number }

/**
 * Fila global de erros. Alimentada pelo error.interceptor (e diretamente pela
 * UI quando necessario) e consumida pelo ErrorDialog. Mantem no maximo 50
 * itens para evitar crescimento ilimitado.
 */
export const useErrorStore = defineStore('error', {
  state: () => ({
    errorQueue: [] as ErrorItem[],
    currentIndex: 0,
    visible: false,
  }),
  getters: {
    total: (s) => s.errorQueue.length,
    currentError: (s): ErrorItem | null => s.errorQueue[s.currentIndex] ?? null,
    hasErrors: (s) => s.errorQueue.length > 0,
  },
  actions: {
    addError(error: ErrorDisplay) {
      const id = crypto.randomUUID()
      const createdAt = Date.now()
      this.errorQueue.push({ ...error, id, createdAt })

      if (this.errorQueue.length > 50) {
        this.errorQueue.shift()
        if (this.currentIndex > 0) this.currentIndex--
      }

      this.currentIndex = this.errorQueue.length - 1
      this.visible = true
    },
    dismiss() {
      if (!this.errorQueue.length) return
      this.errorQueue.splice(this.currentIndex, 1)

      if (!this.errorQueue.length) {
        this.currentIndex = 0
        this.visible = false
        return
      }

      if (this.currentIndex >= this.errorQueue.length) {
        this.currentIndex = this.errorQueue.length - 1
      }
    },
    dismissAll() {
      this.errorQueue = []
      this.currentIndex = 0
      this.visible = false
    },
    prev() {
      if (this.currentIndex > 0) this.currentIndex--
    },
    next() {
      if (this.currentIndex < this.errorQueue.length - 1) this.currentIndex++
    },
    hide() {
      this.visible = false
    },
  },
})
