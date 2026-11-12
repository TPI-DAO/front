import axios from 'axios'

interface ValidationError {
  msg?: string
}

interface ErrorBody {
  detail?: string | ValidationError[]
}

export function mensajeDeError(error: unknown): string {
  if (axios.isAxiosError<ErrorBody>(error)) {
    const detail = error.response?.data?.detail

    if (typeof detail === 'string') {
      return detail
    }

    if (Array.isArray(detail) && detail.length > 0) {
      return detail.map((item) => item.msg ?? 'Dato inválido').join(' · ')
    }

    return error.response
      ? 'No se pudo completar la operación.'
      : 'No se pudo conectar con el servidor.'
  }

  return 'Ocurrió un error inesperado.'
}
