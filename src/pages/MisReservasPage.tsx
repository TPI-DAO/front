import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { listarReservas } from '@/api/reservas'
import { EstadoBadge } from '@/components/ui/Badge'
import { EstadoFiltroSelect } from '@/components/ui/EstadoFiltroSelect'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { useLibrosSedes } from '@/features/catalogo/useLibrosSedes'
import { mensajeDeError } from '@/lib/errors'
import { ESTADOS_RESERVA } from '@/lib/estados'
import { formatearFechaHora } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'

export function MisReservasPage() {
  const [estado, setEstado] = useState('')

  const reservasQuery = useQuery({
    queryKey: queryKeys.reservasLista({ estado: estado || undefined }),
    queryFn: () => listarReservas({ estado: estado || undefined }),
  })
  const { titulos, sedes, isLoading: catalogosLoading, error: catalogosError } = useLibrosSedes()

  const reservas = reservasQuery.data ?? []
  const cargando = reservasQuery.isLoading || catalogosLoading
  const error = reservasQuery.error ?? catalogosError

  return (
    <div>
      <PageHeader
        title="Mis reservas"
        description="Estado de las reservas de ejemplares que realizaste."
        actions={
          <div className="w-56">
            <EstadoFiltroSelect valor={estado} onChange={setEstado} estados={ESTADOS_RESERVA} />
          </div>
        }
      />

      {cargando && <LoadingState mensaje="Cargando reservas…" />}
      {!cargando && error && <ErrorState mensaje={mensajeDeError(error)} />}
      {!cargando && !error && reservas.length === 0 && (
        <EmptyState
          titulo="No tenés reservas registradas"
          descripcion="Cuando reserves un ejemplar, va a aparecer en esta sección."
        />
      )}

      {!cargando && !error && reservas.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  Libro
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Sede
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Fecha
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservas.map((reserva) => (
                <tr key={reserva.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">
                      {titulos.get(reserva.libro_id) ?? `Libro #${reserva.libro_id}`}
                    </p>
                    <p className="text-xs text-slate-400">Reserva #{reserva.id}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {sedes.get(reserva.sede_id) ?? `Sede ${reserva.sede_id}`}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatearFechaHora(reserva.fecha)}</td>
                  <td className="px-4 py-3">
                    <EstadoBadge estado={reserva.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
