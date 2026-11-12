import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import type { Rol } from '@/types/api'

export function RequireRole({ roles }: { roles: Rol[] }) {
  const { usuario } = useAuth()

  if (!usuario || !roles.includes(usuario.rol)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
