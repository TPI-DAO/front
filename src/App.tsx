import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RequireRole } from '@/components/auth/RequireRole'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { ForbiddenPage } from '@/pages/ForbiddenPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PlaceholderPage } from '@/pages/PlaceholderPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />

          <Route
            path="catalogo"
            element={
              <PlaceholderPage
                title="Catálogo"
                description="Búsqueda de libros, detalle y disponibilidad por sede."
              />
            }
          />
          <Route
            path="disponibilidad"
            element={
              <PlaceholderPage
                title="Disponibilidad"
                description="Consulta de ejemplares disponibles por libro y sede."
              />
            }
          />
          <Route
            path="perfil"
            element={
              <PlaceholderPage
                title="Mi perfil"
                description="Datos de la cuenta y cambio de contraseña."
              />
            }
          />

          <Route element={<RequireRole roles={['SOCIO']} />}>
            <Route
              path="mis-prestamos"
              element={
                <PlaceholderPage
                  title="Mis préstamos"
                  description="Préstamos activos e históricos del socio."
                />
              }
            />
            <Route
              path="mis-reservas"
              element={
                <PlaceholderPage
                  title="Mis reservas"
                  description="Reservas activas e históricas del socio."
                />
              }
            />
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
                <PlaceholderPage title="Socios" description="Alta, edición y listado de socios." />
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
  )
}
