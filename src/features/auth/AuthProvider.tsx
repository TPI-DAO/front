import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { obtenerUsuarioActual, loginRequest } from '@/api/auth'
import { AUTH_LOGOUT_EVENT } from '@/api/client'
import { tokenStorage } from '@/lib/storage'
import { AuthContext, type AuthContextValue } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [token, setToken] = useState<string | null>(() => tokenStorage.get())

  const { data: usuario, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        return await obtenerUsuarioActual()
      } catch (error) {
        tokenStorage.clear()
        throw error
      }
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const logout = useCallback(() => {
    tokenStorage.clear()
    setToken(null)
    queryClient.clear()
  }, [queryClient])

  useEffect(() => {
    window.addEventListener(AUTH_LOGOUT_EVENT, logout)
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, logout)
  }, [logout])

  const login = useCallback(
    async (username: string, password: string) => {
      const response = await loginRequest(username, password)
      tokenStorage.set(response.access_token)
      queryClient.clear()
      setToken(response.access_token)
    },
    [queryClient],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario: usuario ?? null,
      isLoading: Boolean(token) && isLoading,
      isAuthenticated: Boolean(token) && Boolean(usuario),
      login,
      logout,
    }),
    [usuario, token, isLoading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
