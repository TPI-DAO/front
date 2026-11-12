import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { listarPrestamos } from '@/api/prestamos'
import { Badge, EstadoBadge } from '@/components/ui/Badge'
import { EstadoFiltroSelect } from '@/components/ui/EstadoFiltroSelect'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { useLibrosSedes } from '@/features/catalogo/useLibrosSedes'
import { mensajeDeError } from '@/lib/errors'
import { ESTADOS_PRESTAMO } from '@/lib/estados'
import { formatearFecha, formatearFechaHora } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'

export function MisPrestamosPage() {
  const [estado, setEstado] = useState('')

  const prestamosQuery = useQuery({
    queryKey: queryKeys.prestamosLista({ estado: estado || undefined }),
    queryFn: () => listarPrestamos({ estado: estado || undefined }),
  })
  const { titulos, sedes, isLoading: catalogosLoading, error: catalogosError } = useLibrosSedes()

  const prestamos = prestamosQuery.data ?? []
  const cargando = prestamosQuery.isLoading || catalogosLoading
  const error = prestamosQuery.error ?? catalogosError

  return (
    <div>
      <PageHeader
        title="Mis préstamos"
        description="Seguimiento de tus préstamos locales e interbibliotecarios."
        actions={
          <div className="w-56">
            <EstadoFiltroSelect valor={estado} onChange={setEstado} estados={ESTADOS_PRESTAMO} />
          </div>
        }
      />

      {cargando && <LoadingState mensaje="Cargando préstamos…" />}
      {!cargando && error && <ErrorState mensaje={mensajeDeError(error)} />}
      {!cargando && !error && prestamos.length === 0 && (
        <EmptyState
          titulo="No tenés préstamos registrados"
          descripcion="Cuando solicites un préstamo, va a aparecer en esta sección."
        />
      )}

      {!cargando && !error && prestamos.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Libro
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Recorrido
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Estado
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Solicitado
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Vencimiento
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Devolución
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prestamos.map((prestamo) => {
                const origen =
                  sedes.get(prestamo.sede_origen_id) ?? `Sede ${prestamo.sede_origen_id}`
                const destino =
                  sedes.get(prestamo.sede_destino_id) ?? `Sede ${prestamo.sede_destino_id}`
                return (
                  <tr key={prestamo.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">
                        {titulos.get(prestamo.libro_id) ?? `Libro #${prestamo.libro_id}`}
                      </p>
                      <p className="text-xs text-slate-400">Préstamo #{prestamo.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-600">
                        {prestamo.interbibliotecario
                          ? `${origen} → ${destino}`
                          : `Local · ${origen}`}
                      </p>
                      <div className="mt-1">
                        <Badge tone={prestamo.interbibliotecario ? 'info' : 'neutral'}>
                          {prestamo.interbibliotecario ? 'Interbibliotecario' : 'Local'}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge estado={prestamo.estado} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatearFechaHora(prestamo.fecha_solicitud)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatearFecha(prestamo.fecha_vencimiento)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatearFechaHora(prestamo.fecha_devolucion)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
