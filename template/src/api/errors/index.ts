import type { AxiosError } from 'axios'

/**
 * Converte um erro do Axios em um objeto padronizado (ErrorDisplay) usado
 * pela camada de UI (error.store + ErrorDialog).
 *
 * Distingue timeout, falha de rede e erros de API, preservando detalhes
 * tecnicos uteis para diagnostico (endpoint, status, correlationId, etc.).
 */
export function normalizeAxiosError(error: AxiosError): ErrorDisplay {
  const status = error.response?.status
  const data = (error.response?.data ?? {}) as ApiError

  const detalhes: ErrorDetails = {
    method: error.config?.method?.toUpperCase(),
    url: error.config?.url,
    errorCode: error.code,
    message: error.message,
    statusText: error.response?.statusText,
    exception: data?.exception,
    correlationId:
      (error.response?.headers['x-request-id'] as string | undefined) ||
      (error.response?.headers['x-correlation-id'] as string | undefined),
    timestamp: new Date().toLocaleString(),
    offline: typeof navigator != 'undefined' ? !navigator.onLine : undefined,
  }

  if (error.code === 'ECONNABORTED') {
    return {
      titulo: 'Tempo de resposta esgotado',
      mensagem: 'A requisicao demorou mais do que o esperado e foi cancelada.',
      detalhes,
      origem: 'timeout',
    }
  }

  if (!error.response) {
    return {
      titulo: 'Erro de rede',
      mensagem: 'Nao foi possivel conectar ao servidor. Verifique sua conexao com a internet.',
      detalhes,
      origem: 'network',
    }
  }

  const titulo = data.erro || `Erro ${status}`
  const mensagem =
    data.mensagem ||
    data.message ||
    (status && status >= 500
      ? 'Ocorreu um erro no servidor. Tente novamente mais tarde.'
      : 'Ocorreu um erro ao processar a requisicao. Tente novamente.')

  return {
    titulo,
    mensagem,
    status,
    detalhes,
    origem: 'api',
  }
}
