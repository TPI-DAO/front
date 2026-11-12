import { api } from './client'
import type { Prestamo } from '@/types/api'

export interface PrestamosFiltros {
  socio_id?: number
  sede_id?: number
  estado?: string
  interbibliotecario?: boolean
}

export interface PrestamoPayload {
  socio_id: number
  libro_id: number
  sede_origen_id: number
  sede_destino_id: number
}

export async function solicitarPrestamo(payload: PrestamoPayload): Promise<Prestamo> {
  const { data } = await api.post<Prestamo>('/prestamos', payload)
  return data
}

export async function cancelarPrestamo(id: number): Promise<Prestamo> {
  const { data } = await api.post<Prestamo>(`/prestamos/${id}/cancelar`)
  return data
}

export async function controlarVencimientos(): Promise<{ prestamos_marcados_vencidos: number }> {
  const { data } = await api.post<{ prestamos_marcados_vencidos: number }>(
    '/prestamos/controlar-vencimientos',
  )
  return data
}

export async function listarPrestamos(filtros: PrestamosFiltros = {}): Promise<Prestamo[]> {
  const { data } = await api.get<Prestamo[]>('/prestamos', { params: filtros })
  return data
}
