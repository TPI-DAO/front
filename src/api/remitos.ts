import { api } from './client'
import type { EstadoFisico, Remito, Trazabilidad } from '@/types/api'

export interface RemitosFiltros {
  estado?: string
  tipo?: string
  sede_id?: number
  prestamo_id?: number
}

export interface EstadoFisicoPayload {
  estado_fisico: EstadoFisico
  observacion?: string | null
}

export async function listarRemitos(filtros: RemitosFiltros = {}): Promise<Remito[]> {
  const { data } = await api.get<Remito[]>('/remitos', { params: filtros })
  return data
}

export async function generarRemito(prestamo_id: number, observacion?: string): Promise<Remito> {
  const { data } = await api.post<Remito>('/remitos', { prestamo_id, observacion })
  return data
}

export async function despacharRemito(id: number, observacion?: string): Promise<Remito> {
  const { data } = await api.post<Remito>(`/remitos/${id}/despachar`, { observacion })
  return data
}

export async function recibirRemito(id: number, payload: EstadoFisicoPayload): Promise<Remito> {
  const { data } = await api.post<Remito>(`/remitos/${id}/recibir`, payload)
  return data
}

export async function obtenerTrazabilidad(busqueda: number | string): Promise<Trazabilidad> {
  const ruta =
    typeof busqueda === 'number'
      ? `/remitos/${busqueda}/trazabilidad`
      : `/remitos/numero/${encodeURIComponent(busqueda.trim().toUpperCase())}/trazabilidad`
  const { data } = await api.get<Trazabilidad>(ruta)
  return data
}
