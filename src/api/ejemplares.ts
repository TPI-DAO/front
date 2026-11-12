import { api } from './client'
import type { Ejemplar } from '@/types/api'

export interface EjemplaresFiltros {
  libro_id?: number
  sede_id?: number
  estado?: string
}

export interface EjemplarPayload {
  libro_id: number
  sede_id: number
  codigo_inventario?: string | null
}

export interface EjemplarUpdatePayload {
  sede_id?: number
  codigo_inventario?: string | null
  estado?: 'DISPONIBLE' | 'DANADO'
}

export async function listarEjemplares(filtros: EjemplaresFiltros = {}): Promise<Ejemplar[]> {
  const { data } = await api.get<Ejemplar[]>('/ejemplares', { params: filtros })
  return data
}

export async function crearEjemplar(payload: EjemplarPayload): Promise<Ejemplar> {
  const { data } = await api.post<Ejemplar>('/ejemplares', payload)
  return data
}

export async function actualizarEjemplar(
  ejemplarId: number,
  payload: EjemplarUpdatePayload,
): Promise<Ejemplar> {
  const { data } = await api.put<Ejemplar>(`/ejemplares/${ejemplarId}`, payload)
  return data
}

export async function darBajaEjemplar(ejemplarId: number): Promise<Ejemplar> {
  const { data } = await api.post<Ejemplar>(`/ejemplares/${ejemplarId}/baja`)
  return data
}
