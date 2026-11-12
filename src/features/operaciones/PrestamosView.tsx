import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { controlarVencimientos, listarPrestamos, type PrestamosFiltros } from '@/api/prestamos'
import { listarRemitos } from '@/api/remitos'
import { Alert } from '@/components/ui/Alert'
import { Badge, EstadoBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, type ColumnaTabla } from '@/components/ui/DataTable'
import { EstadoFiltroSelect } from '@/components/ui/EstadoFiltroSelect'
import { FormField } from '@/components/ui/FormField'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { mensajeDeError } from '@/lib/errors'
import { ESTADOS_PRESTAMO } from '@/lib/estados'
import { fieldClass } from '@/lib/formStyles'
import { formatearFecha, formatearFechaHora } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import { useFeedback } from '@/lib/useFeedback'
import type { Prestamo } from '@/types/api'
import { AccionMaterialModal, type AccionMaterial } from './AccionMaterialModal'
import { CancelarOperacionModal } from './CancelarOperacionModal'
import { puedeDevolver, puedeGenerarRemito } from './reglas'
import { SolicitudModal } from './SolicitudModal'
import { useDatosOperaciones } from './useDatosOperaciones'
import { useOperacionMutation } from './useOperacionMutation'

export function PrestamosView() {
  const datos = useDatosOperaciones()
  const { feedback, mostrarExito, cerrarFeedback } = useFeedback()
  const [filtros, setFiltros] = useState<PrestamosFiltros>({})
  const [nuevo, setNuevo] = useState(false)
  const [cancelar, setCancelar] = useState<number | null>(null)
  const [accion, setAccion] = useState<{ tipo: AccionMaterial; prestamo: Prestamo } | null>(null)
  const query = useQuery({
    queryKey: queryKeys.prestamosLista(filtros),
    queryFn: () => listarPrestamos(filtros),
  })
  const remitos = useQuery({
    queryKey: queryKeys.remitosLista(),
    queryFn: () => listarRemitos(),
    enabled: datos.admin,
  })
  const control = useOperacionMutation(controlarVencimientos, (resultado) =>
    mostrarExito(`${resultado.prestamos_marcados_vencidos} préstamos marcados como vencidos.`),
  )
  const columnas: ColumnaTabla<Prestamo>[] = [
    {
      encabezado: 'Libro',
      render: (p) => (
        <>
          <p className="font-medium text-slate-800">
            {datos.titulos.get(p.libro_id) ?? `Libro #${p.libro_id}`}
          </p>
          <p className="text-xs text-slate-400">
            Préstamo #{p.id} · Ejemplar #{p.ejemplar_id}
          </p>
        </>
      ),
    },
    ...(datos.admin
      ? [
          {
            encabezado: 'Socio',
            render: (p: Prestamo) => datos.sociosPorId.get(p.socio_id) ?? `Socio #${p.socio_id}`,
          },
        ]
      : []),
    {
      encabezado: 'Recorrido',
      render: (p) => (
        <>
          <p>
            {datos.sedesPorId.get(p.sede_origen_id) ?? `Sede #${p.sede_origen_id}`} →{' '}
            {datos.sedesPorId.get(p.sede_destino_id) ?? `Sede #${p.sede_destino_id}`}
          </p>
          <Badge tone={p.interbibliotecario ? 'info' : 'neutral'}>
            {p.interbibliotecario ? 'Interbibliotecario' : 'Local'}
          </Badge>
        </>
      ),
    },
    { encabezado: 'Estado', render: (p) => <EstadoBadge estado={p.estado} /> },
    {
      encabezado: 'Fechas',
      render: (p) => (
        <div className="space-y-1 text-xs text-slate-500">
          <p>Solicitud: {formatearFechaHora(p.fecha_solicitud)}</p>
          <p>Vencimiento: {formatearFecha(p.fecha_vencimiento)}</p>
          <p>Devolución: {formatearFechaHora(p.fecha_devolucion)}</p>
        </div>
      ),
    },
    {
      encabezado: 'Acciones',
      render: (p) => (
        <div className="flex flex-wrap gap-2">
          {p.estado === 'SOLICITADO' && (
            <Button variant="dangerOutline" onClick={() => setCancelar(p.id)}>
              Cancelar
            </Button>
          )}
          {datos.admin && remitos.isSuccess && puedeGenerarRemito(p, remitos.data) && (
            <Button variant="secondary" onClick={() => setAccion({ tipo: 'generar', prestamo: p })}>
              Empaquetar
            </Button>
          )}
          {datos.admin && puedeDevolver(p) && (
            <Button
              variant="secondary"
              onClick={() => setAccion({ tipo: 'devolver', prestamo: p })}
            >
              Devolver
            </Button>
          )}
          {datos.admin && p.interbibliotecario && (
            <Link
              className="text-sm font-medium text-indigo-600 hover:underline"
              to={`/admin/remitos?prestamo_id=${p.id}`}
            >
              Remitos
            </Link>
          )}
          {datos.admin && p.estado === 'DEVUELTO' && (
            <Link
              className="text-sm font-medium text-indigo-600 hover:underline"
              to={`/admin/devoluciones?prestamo_id=${p.id}`}
            >
              Devolución
            </Link>
          )}
          {!datos.admin && p.estado !== 'SOLICITADO' && (
            <span className="text-xs text-slate-400">
              {puedeDevolver(p) ? 'Devolución a cargo del personal' : 'Sin acciones disponibles'}
            </span>
          )}
        </div>
      ),
    },
  ]
  return (
    <div>
      <PageHeader
        title={datos.admin ? 'Préstamos' : 'Mis préstamos'}
        description="Solicitudes locales e interbibliotecarias y seguimiento de sus estados."
        actions={
          <>
            {datos.admin && (
              <Button
                variant="secondary"
                disabled={control.isPending}
                onClick={() => control.mutate()}
              >
                {control.isPending ? 'Controlando…' : 'Controlar vencimientos'}
              </Button>
            )}
            <Button onClick={() => setNuevo(true)}>Solicitar préstamo</Button>
          </>
        }
      />
      {feedback && (
        <Alert tone={feedback.tone} onClose={cerrarFeedback}>
          {feedback.mensaje}
        </Alert>
      )}
      {control.isError && <Alert tone="error">{mensajeDeError(control.error)}</Alert>}
      {datos.admin && remitos.isError && (
        <Alert tone="error">
          No se pudieron consultar los remitos: {mensajeDeError(remitos.error)}
        </Alert>
      )}
      <div className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Estado">
          <EstadoFiltroSelect
            valor={filtros.estado ?? ''}
            onChange={(estado) => setFiltros((prev) => ({ ...prev, estado: estado || undefined }))}
            estados={ESTADOS_PRESTAMO}
          />
        </FormField>
        <FormField label="Sede" htmlFor="prestamos-sede">
          <select
            id="prestamos-sede"
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
          <FormField label="Socio" htmlFor="prestamos-socio">
            <select
              id="prestamos-socio"
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
        <FormField label="Tipo" htmlFor="prestamos-tipo">
          <select
            id="prestamos-tipo"
            className={fieldClass}
            value={
              filtros.interbibliotecario === undefined ? '' : String(filtros.interbibliotecario)
            }
            onChange={(e) =>
              setFiltros((prev) => ({
                ...prev,
                interbibliotecario: e.target.value === '' ? undefined : e.target.value === 'true',
              }))
            }
          >
            <option value="">Todos</option>
            <option value="false">Local</option>
            <option value="true">Interbibliotecario</option>
          </select>
        </FormField>
        <Button variant="ghost" onClick={() => setFiltros({})}>
          Limpiar filtros
        </Button>
      </div>
      {(query.isLoading || datos.isLoading) && <LoadingState mensaje="Cargando préstamos…" />}
      {(query.error || datos.error) && (
        <ErrorState mensaje={mensajeDeError(query.error ?? datos.error)} />
      )}
      {query.isSuccess && !datos.isLoading && !datos.error && (
        <DataTable
          columnas={columnas}
          filas={query.data}
          clave={(p) => p.id}
          minWidth="min-w-[1000px]"
          ariaLabel="Préstamos"
          vacio={<EmptyState titulo="No hay préstamos para estos filtros" />}
        />
      )}
      {nuevo && (
        <SolicitudModal
          tipo="prestamo"
          onCerrar={() => setNuevo(false)}
          onSaved={(mensaje) => {
            setNuevo(false)
            mostrarExito(mensaje)
          }}
        />
      )}
      {cancelar !== null && (
        <CancelarOperacionModal
          tipo="prestamo"
          id={cancelar}
          onCerrar={() => setCancelar(null)}
          onSaved={(mensaje) => {
            setCancelar(null)
            mostrarExito(mensaje)
          }}
        />
      )}
      {accion && (
        <AccionMaterialModal
          accion={accion.tipo}
          id={accion.prestamo.id}
          descripcion={`Préstamo #${accion.prestamo.id} · ${datos.titulos.get(accion.prestamo.libro_id) ?? ''}`}
          onCerrar={() => setAccion(null)}
          onSaved={(mensaje) => {
            setAccion(null)
            mostrarExito(mensaje)
          }}
        />
      )}
    </div>
  )
}
