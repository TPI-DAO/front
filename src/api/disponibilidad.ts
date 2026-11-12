import { api } from './client'
import type { DisponibilidadFila } from '@/types/api'

export interface DisponibilidadFiltros {
  libro_id?: number
  sede_id?: number
  titulo?: string
  solo_disponibles?: boolean
}

export async function consultarDisponibilidad(
  filtros: DisponibilidadFiltros = {},
): Promise<DisponibilidadFila[]> {
  const { data } = await api.get<DisponibilidadFila[]>('/disponibilidad', { params: filtros })
  return data
}
