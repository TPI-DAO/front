import { api } from './client'
import type { Socio } from '@/types/api'

export async function obtenerMiSocio(): Promise<Socio> {
  const { data } = await api.get<Socio>('/socios/me')
  return data
}
