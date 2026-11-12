import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RequireRole } from '@/components/auth/RequireRole'
import { AppShell } from '@/components/layout/AppShell'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'
import { DashboardPage } from '@/pages/DashboardPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

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
              <Route
                path="admin/sedes"
                element={
                  <PlaceholderPage
                    title="Sedes"
                    description="Alta, edición y listado de sedes de la biblioteca."
                  />
                }
              />
              <Route
                path="admin/socios"
                element={
                  <PlaceholderPage
                    title="Socios"
                    description="Alta, edición y listado de socios."
                  />
                }
              />
              <Route
                path="admin/libros"
                element={
                  <PlaceholderPage
                    title="Libros"
                    description="Alta, edición y listado del catálogo de libros."
                  />
                }
              />
              <Route
                path="admin/ejemplares"
                element={
                  <PlaceholderPage
                    title="Ejemplares"
                    description="Alta, edición y estado de los ejemplares."
                  />
                }
              />
              <Route
                path="admin/prestamos"
                element={
                  <PlaceholderPage
                    title="Préstamos"
                    description="Registro y seguimiento de préstamos interbibliotecarios."
                  />
                }
              />
              <Route
                path="admin/remitos"
                element={
                  <PlaceholderPage
                    title="Remitos"
                    description="Emisión y seguimiento de remitos de traslado."
                  />
                }
              />
              <Route
                path="admin/devoluciones"
                element={
                  <PlaceholderPage
                    title="Devoluciones"
                    description="Registro de devoluciones y cálculo de multas."
                  />
                }
              />
              <Route
                path="admin/reportes"
                element={
                  <PlaceholderPage
                    title="Reportes"
                    description="Reportes operativos y estadísticos del sistema."
                  />
                }
              />
              <Route
                path="admin/usuarios"
                element={
                  <PlaceholderPage
                    title="Usuarios"
                    description="Alta de usuarios, asignación de roles y estado de cuentas."
                  />
                }
              />
            </Route>
          </Route>
        </Route>

        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
