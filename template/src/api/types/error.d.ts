type ApiError = {
  erro?: string
  mensagem?: string
  message?: string
  exception?: string
}

type ErrorDetails = {
  method?: string
  url?: string
  errorCode?: string
  message?: string
  statusText?: string
  exception?: string
  correlationId?: string
  timestamp: string
  offline?: boolean
}

type ErrorDisplay = {
  titulo: string
  mensagem: string
  status?: number
  detalhes?: ErrorDetails
  origem: 'api' | 'network' | 'timeout' | 'client'
}
