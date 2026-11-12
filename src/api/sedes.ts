import { api } from './client'
import type { Sede } from '@/types/api'

export async function listarSedes(): Promise<Sede[]> {
  const { data } = await api.get<Sede[]>('/sedes')
  return data
}
