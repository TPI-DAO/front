export type Rol = 'ADMIN' | 'SOCIO'

export interface Usuario {
  id: number
  username: string
  email: string
  rol: Rol
  socio_id: number | null
  activo: boolean
  fecha_alta: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  username: string
  rol: Rol
  socio_id: number | null
  expira_en_minutos: number
}

export interface ApiError {
  detail: string
}
