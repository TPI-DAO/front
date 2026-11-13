import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardPage } from '@/pages/DashboardPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OperationsPage } from '@/pages/OperationsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="catalogo" element={<OperationsPage section="catalogo" />} />
        <Route path="disponibilidad" element={<OperationsPage section="disponibilidad" />} />
        <Route path="mis-prestamos" element={<Navigate to="/admin/prestamos" replace />} />
        <Route path="mis-reservas" element={<Navigate to="/admin/reservas" replace />} />
        <Route path="admin/sedes" element={<OperationsPage section="sedes" />} />
        <Route path="admin/socios" element={<OperationsPage section="socios" />} />
        <Route path="admin/libros" element={<OperationsPage section="libros" />} />
        <Route path="admin/ejemplares" element={<OperationsPage section="ejemplares" />} />
        <Route path="admin/prestamos" element={<OperationsPage section="prestamos" />} />
        <Route path="admin/reservas" element={<OperationsPage section="reservas" />} />
        <Route path="admin/remitos" element={<OperationsPage section="remitos" />} />
        <Route path="admin/devoluciones" element={<OperationsPage section="devoluciones" />} />
        <Route path="admin/reportes" element={<OperationsPage section="reportes" />} />
      </Route>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
