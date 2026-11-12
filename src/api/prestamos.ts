import { api } from './client'
import type { Prestamo } from '@/types/api'

export interface PrestamosFiltros {
  estado?: string
  interbibliotecario?: boolean
}

export async function listarPrestamos(filtros: PrestamosFiltros = {}): Promise<Prestamo[]> {
  const { data } = await api.get<Prestamo[]>('/prestamos', { params: filtros })
  return data
}
