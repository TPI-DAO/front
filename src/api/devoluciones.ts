import { api } from './client'
import type { EstadoFisicoPayload } from './remitos'
import type { Devolucion } from '@/types/api'

export async function listarDevoluciones(
  filtros: { prestamo_id?: number } = {},
): Promise<Devolucion[]> {
  const { data } = await api.get<Devolucion[]>('/devoluciones', { params: filtros })
  return data
}

export async function registrarDevolucion(
  prestamo_id: number,
  payload: EstadoFisicoPayload,
): Promise<Devolucion> {
  const { data } = await api.post<Devolucion>('/devoluciones', { prestamo_id, ...payload })
  return data
}
