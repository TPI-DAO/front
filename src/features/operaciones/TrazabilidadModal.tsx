import { useQuery } from '@tanstack/react-query'
import { obtenerTrazabilidad } from '@/api/remitos'
import { Badge, EstadoBadge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { mensajeDeError } from '@/lib/errors'
import { etiquetaEstado } from '@/lib/estados'
import { formatearFechaHora } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import { useDatosOperaciones } from './useDatosOperaciones'

export function TrazabilidadModal({
  busqueda,
  onCerrar,
}: {
  busqueda: number | string
  onCerrar: () => void
}) {
  const query = useQuery({
    queryKey: queryKeys.trazabilidad(busqueda),
    queryFn: () => obtenerTrazabilidad(busqueda),
  })
  const { sedesPorId } = useDatosOperaciones()
  const remito = query.data?.remito
  const historial = [...(query.data?.historial ?? [])].sort(
    (a, b) => Date.parse(a.fecha) - Date.parse(b.fecha) || a.id - b.id,
  )
  return (
    <Modal
      abierto
      titulo={remito ? `Trazabilidad · ${remito.numero}` : 'Trazabilidad del remito'}
      onCerrar={onCerrar}
      tamano="lg"
    >
      {query.isLoading && <LoadingState mensaje="Cargando trazabilidad…" />}
      {query.isError && <ErrorState mensaje={mensajeDeError(query.error)} />}
      {remito && (
        <div className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            <div className="mb-2 flex gap-2">
              <Badge tone="info">{etiquetaEstado(remito.tipo)}</Badge>
              <EstadoBadge estado={remito.estado} />
            </div>
            <p>
              Préstamo #{remito.prestamo_id} · Ejemplar #{remito.ejemplar_id}
            </p>
            <p>
              {sedesPorId.get(remito.sede_origen_id) ?? `Sede #${remito.sede_origen_id}`} →{' '}
              {sedesPorId.get(remito.sede_destino_id) ?? `Sede #${remito.sede_destino_id}`}
            </p>
            {remito.estado_fisico_recepcion && (
              <p>Estado físico: {etiquetaEstado(remito.estado_fisico_recepcion)}</p>
            )}
          </div>
          {historial.length === 0 ? (
            <EmptyState titulo="Sin eventos registrados" />
          ) : (
            <ol
              className="space-y-4 border-l-2 border-indigo-100 pl-4"
              aria-label="Historial del remito"
            >
              {historial.map((evento) => (
                <li key={evento.id} className="text-sm">
                  <p className="text-xs text-slate-500">{formatearFechaHora(evento.fecha)}</p>
                  <p className="mt-1 font-medium text-slate-800">
                    {evento.estado_anterior ? `${etiquetaEstado(evento.estado_anterior)} → ` : ''}
                    {etiquetaEstado(evento.estado_nuevo)}
                  </p>
                  {evento.observacion && (
                    <p className="mt-1 whitespace-pre-wrap text-slate-600">{evento.observacion}</p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </Modal>
  )
}
