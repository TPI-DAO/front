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

export async function cambiarPassword(
  passwordActual: string,
  passwordNueva: string,
): Promise<void> {
  await api.post('/auth/me/password', {
    password_actual: passwordActual,
    password_nueva: passwordNueva,
  })
}
