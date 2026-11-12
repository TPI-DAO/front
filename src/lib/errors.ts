import axios from 'axios'

export function mensajeDeError(error: unknown): string {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    return error.response?.data?.detail ?? 'No se pudo completar la operación.'
  }
  return 'Ocurrió un error inesperado.'
}
