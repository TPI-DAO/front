import { api } from './client'
import type { Reserva } from '@/types/api'

export interface ReservasFiltros {
  estado?: string
}

export async function listarReservas(filtros: ReservasFiltros = {}): Promise<Reserva[]> {
  const { data } = await api.get<Reserva[]>('/reservas', { params: filtros })
  return data
}
