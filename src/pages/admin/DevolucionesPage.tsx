import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listarDevoluciones } from '@/api/devoluciones'
import { listarPrestamos } from '@/api/prestamos'
import { Alert } from '@/components/ui/Alert'
import { EstadoBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, type ColumnaTabla } from '@/components/ui/DataTable'
import { FormField } from '@/components/ui/FormField'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { AccionMaterialModal } from '@/features/operaciones/AccionMaterialModal'
import { formatearMulta, idPositivo, puedeDevolver } from '@/features/operaciones/reglas'
import { TrazabilidadModal } from '@/features/operaciones/TrazabilidadModal'
import { useDatosOperaciones } from '@/features/operaciones/useDatosOperaciones'
import { mensajeDeError } from '@/lib/errors'
import { fieldClass } from '@/lib/formStyles'
import { formatearFechaHora } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import { useFeedback } from '@/lib/useFeedback'
import type { Devolucion } from '@/types/api'

export function DevolucionesPage() {
  const datos = useDatosOperaciones()
  const { feedback, mostrarExito, cerrarFeedback } = useFeedback()
  const [params, setParams] = useSearchParams()
  const [nuevo, setNuevo] = useState(false)
  const [traza, setTraza] = useState<number | null>(null)
  const [retorno, setRetorno] = useState<number | null>(null)
  const prestamoId = idPositivo(params.get('prestamo_id'))
  const filtros = { prestamo_id: prestamoId }
  const query = useQuery({
    queryKey: queryKeys.devolucionesLista(filtros),
    queryFn: () => listarDevoluciones(filtros),
  })
  const prestamos = useQuery({
    queryKey: queryKeys.prestamosLista(),
    queryFn: () => listarPrestamos(),
  })
  const porId = new Map(prestamos.data?.map((p) => [p.id, p]))
  const pendientes =
    prestamos.data?.filter((p) => puedeDevolver(p) && (!prestamoId || p.id === prestamoId)) ?? []
  const columnas: ColumnaTabla<Devolucion>[] = [
    {
      encabezado: 'Devolución',
      render: (d) => (
        <>
          <p className="font-medium text-slate-800">
            #{d.id} · Préstamo #{d.prestamo_id}
          </p>
          <p className="text-xs text-slate-500">{formatearFechaHora(d.fecha)}</p>
        </>
      ),
    },
    {
      encabezado: 'Libro y socio',
      render: (d) => {
        const p = porId.get(d.prestamo_id)
        return p ? (
          <>
            <p>{datos.titulos.get(p.libro_id) ?? `Libro #${p.libro_id}`}</p>
            <p className="text-xs text-slate-500">
              {datos.sociosPorId.get(p.socio_id) ?? `Socio #${p.socio_id}`}
            </p>
          </>
        ) : (
          `Préstamo #${d.prestamo_id}`
        )
      },
    },
    { encabezado: 'Sede', render: (d) => datos.sedesPorId.get(d.sede_id) ?? `Sede #${d.sede_id}` },
    { encabezado: 'Estado físico', render: (d) => <EstadoBadge estado={d.estado_fisico} /> },
    {
      encabezado: 'Atraso y multa',
      render: (d) => (
        <>
          <p>{d.dias_atraso} días</p>
          <p className="font-medium text-slate-800">{formatearMulta(d.multa)}</p>
        </>
      ),
    },
    {
      encabezado: 'Observación',
      render: (d) => <span className="whitespace-pre-wrap">{d.observacion || '—'}</span>,
    },
    {
      encabezado: 'Retorno',
      render: (d) =>
        d.remito_retorno_id !== null ? (
          <Button variant="secondary" onClick={() => setTraza(d.remito_retorno_id)}>
            Remito #{d.remito_retorno_id}
          </Button>
        ) : (
          <span className="text-xs text-slate-400">No corresponde</span>
        ),
    },
  ]
  return (
    <div>
      <PageHeader
        title="Devoluciones"
        description="Estado físico del material, días de atraso y multas calculadas por el servidor."
        actions={
          <Button
            disabled={!prestamos.isSuccess || pendientes.length === 0}
            onClick={() => setNuevo(true)}
          >
            Registrar devolución
          </Button>
        }
      />
      {feedback && (
        <Alert tone={feedback.tone} onClose={cerrarFeedback}>
          {feedback.mensaje}
        </Alert>
      )}
      {retorno !== null && (
        <Alert>
          Se generó el remito de retorno #{retorno}.{' '}
          <Button variant="ghost" onClick={() => setTraza(retorno)}>
            Ver trazabilidad
          </Button>
        </Alert>
      )}
      {prestamos.error && <Alert tone="error">{mensajeDeError(prestamos.error)}</Alert>}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <FormField label="Préstamo" htmlFor="devolucion-prestamo">
          <select
            id="devolucion-prestamo"
            className={fieldClass}
            value={prestamoId ?? ''}
            onChange={(e) => setParams(e.target.value ? { prestamo_id: e.target.value } : {})}
          >
            <option value="">Todos los préstamos</option>
            {prestamos.data?.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.id} · {datos.titulos.get(p.libro_id) ?? `Libro #${p.libro_id}`}
              </option>
            ))}
          </select>
        </FormField>
        {prestamoId && (
          <Button variant="ghost" onClick={() => setParams({})}>
            Limpiar filtro
          </Button>
        )}
      </div>
      {(query.isLoading || datos.isLoading) && <LoadingState mensaje="Cargando devoluciones…" />}
      {(query.error || datos.error) && (
        <ErrorState mensaje={mensajeDeError(query.error ?? datos.error)} />
      )}
      {query.isSuccess && !datos.isLoading && !datos.error && (
        <DataTable
          columnas={columnas}
          filas={query.data}
          clave={(d) => d.id}
          minWidth="min-w-[1000px]"
          ariaLabel="Devoluciones"
          vacio={
            <EmptyState
              titulo="No hay devoluciones para estos filtros"
              descripcion="Solo se pueden devolver préstamos activos o vencidos."
            />
          }
        />
      )}
      {nuevo && (
        <AccionMaterialModal
          accion="devolver"
          prestamos={pendientes}
          titulosLibros={datos.titulos}
          onCerrar={() => setNuevo(false)}
          onSaved={(mensaje, retornoId) => {
            setNuevo(false)
            setRetorno(retornoId ?? null)
            mostrarExito(mensaje)
          }}
        />
      )}
      {traza !== null && <TrazabilidadModal busqueda={traza} onCerrar={() => setTraza(null)} />}
    </div>
  )
}
