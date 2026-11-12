import { api } from './client'
import type { EstadoSede, Sede } from '@/types/api'

export interface SedesFiltros {
  estado?: string
}

export interface SedePayload {
  nombre: string
  direccion: string
  correo?: string | null
  telefono?: string | null
  horarios?: string | null
}

export async function listarSedes(filtros: SedesFiltros = {}): Promise<Sede[]> {
  const { data } = await api.get<Sede[]>('/sedes', { params: filtros })
  return data
}

export async function crearSede(payload: SedePayload): Promise<Sede> {
  const { data } = await api.post<Sede>('/sedes', payload)
  return data
}

export async function actualizarSede(sedeId: number, payload: Partial<SedePayload>): Promise<Sede> {
  const { data } = await api.put<Sede>(`/sedes/${sedeId}`, payload)
  return data
}

export async function cambiarEstadoSede(sedeId: number, estado: EstadoSede): Promise<Sede> {
  const { data } = await api.patch<Sede>(`/sedes/${sedeId}/estado`, { estado })
  return data
}
