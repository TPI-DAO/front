import { api } from './client'
import type { TokenResponse, Usuario } from '@/types/api'

export async function loginRequest(username: string, password: string): Promise<TokenResponse> {
  const body = new URLSearchParams({ username, password })
  const { data } = await api.post<TokenResponse>('/auth/token', body, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return data
}

export async function obtenerUsuarioActual(): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/auth/me')
  return data
}
