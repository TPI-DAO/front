import { api } from './client'
import type { Rol, Usuario } from '@/types/api'

export interface UsuarioPayload {
  username: string
  email: string
  password: string
  rol: Rol
  socio_id?: number | null
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>('/auth/usuarios')
  return data
}

export async function crearUsuario(payload: UsuarioPayload): Promise<Usuario> {
  const { data } = await api.post<Usuario>('/auth/usuarios', payload)
  return data
}

export async function cambiarEstadoUsuario(usuarioId: number, activo: boolean): Promise<Usuario> {
  const { data } = await api.patch<Usuario>(`/auth/usuarios/${usuarioId}/estado`, { activo })
  return data
}
