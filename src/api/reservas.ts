import { api } from './client'
import type { Reserva } from '@/types/api'

export interface ReservasFiltros {
  socio_id?: number
  libro_id?: number
  sede_id?: number
  estado?: string
}

export interface ReservaPayload {
  socio_id: number
  libro_id: number
  sede_id: number
}

export async function crearReserva(payload: ReservaPayload): Promise<Reserva> {
  const { data } = await api.post<Reserva>('/reservas', payload)
  return data
}

export async function cancelarReserva(id: number): Promise<Reserva> {
  const { data } = await api.post<Reserva>(`/reservas/${id}/cancelar`)
  return data
}

export async function listarReservas(filtros: ReservasFiltros = {}): Promise<Reserva[]> {
  const { data } = await api.get<Reserva[]>('/reservas', { params: filtros })
  return data
}
