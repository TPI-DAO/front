import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'
import { useAuth } from '@/features/auth/useAuth'

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <FullScreenLoader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
