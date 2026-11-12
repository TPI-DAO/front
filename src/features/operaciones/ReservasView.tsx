import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { listarReservas, type ReservasFiltros } from '@/api/reservas'
import { Alert } from '@/components/ui/Alert'
import { EstadoBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, type ColumnaTabla } from '@/components/ui/DataTable'
import { EstadoFiltroSelect } from '@/components/ui/EstadoFiltroSelect'
import { FormField } from '@/components/ui/FormField'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { mensajeDeError } from '@/lib/errors'
import { ESTADOS_RESERVA } from '@/lib/estados'
import { fieldClass } from '@/lib/formStyles'
import { formatearFechaHora } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import { useFeedback } from '@/lib/useFeedback'
import type { Reserva } from '@/types/api'
import { CancelarOperacionModal } from './CancelarOperacionModal'
import { SolicitudModal } from './SolicitudModal'
import { useDatosOperaciones } from './useDatosOperaciones'

export function ReservasView() {
  const datos = useDatosOperaciones()
  const { feedback, mostrarExito, cerrarFeedback } = useFeedback()
  const [filtros, setFiltros] = useState<ReservasFiltros>({})
  const [nuevo, setNuevo] = useState(false)
  const [cancelar, setCancelar] = useState<number | null>(null)
  const [solicitar, setSolicitar] = useState<Reserva | null>(null)
  const query = useQuery({
    queryKey: queryKeys.reservasLista(filtros),
    queryFn: () => listarReservas(filtros),
  })
  const columnas: ColumnaTabla<Reserva>[] = [
    {
      encabezado: 'Libro',
      render: (r) => (
        <>
          <p className="font-medium text-slate-800">
            {datos.titulos.get(r.libro_id) ?? `Libro #${r.libro_id}`}
          </p>
          <p className="text-xs text-slate-400">Reserva #{r.id}</p>
        </>
      ),
    },
    ...(datos.admin
      ? [
          {
            encabezado: 'Socio',
            render: (r: Reserva) => datos.sociosPorId.get(r.socio_id) ?? `Socio #${r.socio_id}`,
          },
        ]
      : []),
    { encabezado: 'Sede', render: (r) => datos.sedesPorId.get(r.sede_id) ?? `Sede #${r.sede_id}` },
    { encabezado: 'Fecha', render: (r) => formatearFechaHora(r.fecha) },
    { encabezado: 'Estado', render: (r) => <EstadoBadge estado={r.estado} /> },
    {
      encabezado: 'Acciones',
      render: (r) =>
        r.estado === 'ACTIVA' ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="dangerOutline" onClick={() => setCancelar(r.id)}>
              Cancelar
            </Button>
            <Button variant="secondary" onClick={() => setSolicitar(r)}>
              Solicitar préstamo
            </Button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Sin acciones disponibles</span>
        ),
    },
  ]
  return (
    <div>
      <PageHeader
        title={datos.admin ? 'Reservas' : 'Mis reservas'}
        description="Reservas por libro y sede. Al prestar el mismo libro desde esa sede se cumple la reserva propia."
        actions={<Button onClick={() => setNuevo(true)}>Nueva reserva</Button>}
      />
      {feedback && (
        <Alert tone={feedback.tone} onClose={cerrarFeedback}>
          {feedback.mensaje}
        </Alert>
      )}
      <div className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Estado">
          <EstadoFiltroSelect
            valor={filtros.estado ?? ''}
            onChange={(estado) => setFiltros((prev) => ({ ...prev, estado: estado || undefined }))}
            estados={ESTADOS_RESERVA}
          />
        </FormField>
        <FormField label="Libro" htmlFor="reservas-libro">
          <select
            id="reservas-libro"
            className={fieldClass}
            value={filtros.libro_id ?? ''}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, libro_id: Number(e.target.value) || undefined }))
            }
          >
            <option value="">Todos los libros</option>
            {datos.libros.map((l) => (
              <option key={l.id} value={l.id}>
                {l.titulo}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Sede" htmlFor="reservas-sede">
          <select
            id="reservas-sede"
            className={fieldClass}
            value={filtros.sede_id ?? ''}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, sede_id: Number(e.target.value) || undefined }))
            }
          >
            <option value="">Todas las sedes</option>
            {datos.sedes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </FormField>
        {datos.admin && (
          <FormField label="Socio" htmlFor="reservas-socio">
            <select
              id="reservas-socio"
              className={fieldClass}
              value={filtros.socio_id ?? ''}
              onChange={(e) =>
                setFiltros((prev) => ({ ...prev, socio_id: Number(e.target.value) || undefined }))
              }
            >
              <option value="">Todos los socios</option>
              {datos.socios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.apellido}, {s.nombre}
                </option>
              ))}
            </select>
          </FormField>
        )}
        <Button variant="ghost" onClick={() => setFiltros({})}>
          Limpiar filtros
        </Button>
      </div>
      {(query.isLoading || datos.isLoading) && <LoadingState mensaje="Cargando reservas…" />}
      {(query.error || datos.error) && (
        <ErrorState mensaje={mensajeDeError(query.error ?? datos.error)} />
      )}
      {query.isSuccess && !datos.isLoading && !datos.error && (
        <DataTable
          columnas={columnas}
          filas={query.data}
          clave={(r) => r.id}
          ariaLabel="Reservas"
          vacio={<EmptyState titulo="No hay reservas para estos filtros" />}
        />
      )}
      {nuevo && (
        <SolicitudModal
          tipo="reserva"
          onCerrar={() => setNuevo(false)}
          onSaved={(mensaje) => {
            setNuevo(false)
            mostrarExito(mensaje)
          }}
        />
      )}
      {solicitar !== null && (
        <SolicitudModal
          tipo="prestamo"
          reservaInicial={solicitar}
          onCerrar={() => setSolicitar(null)}
          onSaved={(mensaje) => {
            setSolicitar(null)
            mostrarExito(mensaje)
          }}
        />
      )}
      {cancelar !== null && (
        <CancelarOperacionModal
          tipo="reserva"
          id={cancelar}
          onCerrar={() => setCancelar(null)}
          onSaved={(mensaje) => {
            setCancelar(null)
            mostrarExito(mensaje)
          }}
        />
      )}
    </div>
  )
}
