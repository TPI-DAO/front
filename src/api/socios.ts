import { api } from './client'
import type { EstadoSocio, Socio } from '@/types/api'

export interface SociosFiltros {
  q?: string
  estado?: string
}

export interface SocioPayload {
  dni: string
  nombre: string
  apellido: string
  telefono?: string | null
}

export async function listarSocios(filtros: SociosFiltros = {}): Promise<Socio[]> {
  const { data } = await api.get<Socio[]>('/socios', { params: filtros })
  return data
}

export async function obtenerMiSocio(): Promise<Socio> {
  const { data } = await api.get<Socio>('/socios/me')
  return data
}

export async function crearSocio(payload: SocioPayload): Promise<Socio> {
  const { data } = await api.post<Socio>('/socios', payload)
  return data
}

export async function actualizarSocio(
  socioId: number,
  payload: Partial<SocioPayload>,
): Promise<Socio> {
  const { data } = await api.put<Socio>(`/socios/${socioId}`, payload)
  return data
}

export async function cambiarEstadoSocio(socioId: number, estado: EstadoSocio): Promise<Socio> {
  const { data } = await api.patch<Socio>(`/socios/${socioId}/estado`, { estado })
  return data
}
