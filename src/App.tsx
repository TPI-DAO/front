import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RequireRole } from '@/components/auth/RequireRole'
import { AppShell } from '@/components/layout/AppShell'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'
import { DashboardPage } from '@/pages/DashboardPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OperationsPage } from '@/pages/OperationsPage'

const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((modulo) => ({ default: modulo.LoginPage })),
)
const CatalogoPage = lazy(() =>
  import('@/pages/CatalogoPage').then((modulo) => ({ default: modulo.CatalogoPage })),
)
const LibroDetallePage = lazy(() =>
  import('@/pages/LibroDetallePage').then((modulo) => ({ default: modulo.LibroDetallePage })),
)
const DisponibilidadPage = lazy(() =>
  import('@/pages/DisponibilidadPage').then((modulo) => ({ default: modulo.DisponibilidadPage })),
)
const MisPrestamosPage = lazy(() =>
  import('@/pages/MisPrestamosPage').then((modulo) => ({ default: modulo.MisPrestamosPage })),
)
const MisReservasPage = lazy(() =>
  import('@/pages/MisReservasPage').then((modulo) => ({ default: modulo.MisReservasPage })),
)
const PerfilPage = lazy(() =>
  import('@/pages/PerfilPage').then((modulo) => ({ default: modulo.PerfilPage })),
)
const SedesPage = lazy(() =>
  import('@/pages/admin/SedesPage').then((modulo) => ({ default: modulo.SedesPage })),
)
const SociosPage = lazy(() =>
  import('@/pages/admin/SociosPage').then((modulo) => ({ default: modulo.SociosPage })),
)
const LibrosPage = lazy(() =>
  import('@/pages/admin/LibrosPage').then((modulo) => ({ default: modulo.LibrosPage })),
)
const EjemplaresPage = lazy(() =>
  import('@/pages/admin/EjemplaresPage').then((modulo) => ({ default: modulo.EjemplaresPage })),
)
const UsuariosPage = lazy(() =>
  import('@/pages/admin/UsuariosPage').then((modulo) => ({ default: modulo.UsuariosPage })),
)
const PrestamosPage = lazy(() =>
  import('@/pages/admin/PrestamosPage').then((m) => ({ default: m.PrestamosPage })),
)
const ReservasPage = lazy(() =>
  import('@/pages/admin/ReservasPage').then((m) => ({ default: m.ReservasPage })),
)
const RemitosPage = lazy(() =>
  import('@/pages/admin/RemitosPage').then((m) => ({ default: m.RemitosPage })),
)
const DevolucionesPage = lazy(() =>
  import('@/pages/admin/DevolucionesPage').then((m) => ({ default: m.DevolucionesPage })),
)

export default function App() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />

            <Route path="catalogo" element={<CatalogoPage />} />
            <Route path="catalogo/:libroId" element={<LibroDetallePage />} />
            <Route path="disponibilidad" element={<DisponibilidadPage />} />
            <Route path="perfil" element={<PerfilPage />} />

            <Route element={<RequireRole roles={['SOCIO']} />}>
              <Route path="mis-prestamos" element={<MisPrestamosPage />} />
              <Route path="mis-reservas" element={<MisReservasPage />} />
            </Route>

            <Route element={<RequireRole roles={['ADMIN']} />}>
              <Route path="admin/sedes" element={<SedesPage />} />
              <Route path="admin/socios" element={<SociosPage />} />
              <Route path="admin/libros" element={<LibrosPage />} />
              <Route path="admin/ejemplares" element={<EjemplaresPage />} />
              <Route path="admin/prestamos" element={<PrestamosPage />} />
              <Route path="admin/reservas" element={<ReservasPage />} />
              <Route path="admin/remitos" element={<RemitosPage />} />
              <Route path="admin/devoluciones" element={<DevolucionesPage />} />
              <Route path="admin/reportes" element={<OperationsPage section="reportes" />} />
              <Route path="admin/usuarios" element={<UsuariosPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
