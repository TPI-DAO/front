import { createContext } from 'react'
import type { Usuario } from '@/types/api'

export interface AuthContextValue {
  usuario: Usuario | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
