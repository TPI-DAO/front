import { useQuery } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listarPrestamos } from '@/api/prestamos'
import { listarRemitos, type RemitosFiltros } from '@/api/remitos'
import { Alert } from '@/components/ui/Alert'
import { Badge, EstadoBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DataTable, type ColumnaTabla } from '@/components/ui/DataTable'
import { EstadoFiltroSelect } from '@/components/ui/EstadoFiltroSelect'
import { FormField } from '@/components/ui/FormField'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import {
  AccionMaterialModal,
  type AccionMaterial,
} from '@/features/operaciones/AccionMaterialModal'
import { ESTADOS_REMITO, idPositivo, puedeGenerarRemito } from '@/features/operaciones/reglas'
import { TrazabilidadModal } from '@/features/operaciones/TrazabilidadModal'
import { useDatosOperaciones } from '@/features/operaciones/useDatosOperaciones'
import { mensajeDeError } from '@/lib/errors'
import { etiquetaEstado } from '@/lib/estados'
import { fieldClass } from '@/lib/formStyles'
import { formatearFechaHora } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import { useFeedback } from '@/lib/useFeedback'
import type { Remito } from '@/types/api'

export function RemitosPage() {
  const datos = useDatosOperaciones()
  const { feedback, mostrarExito, cerrarFeedback } = useFeedback()
  const [params, setParams] = useSearchParams()
  const [filtros, setFiltros] = useState<RemitosFiltros>({})
  const [numero, setNumero] = useState('')
  const [traza, setTraza] = useState<number | string | null>(
    () => idPositivo(params.get('remito_id')) ?? null,
  )
  const [accion, setAccion] = useState<{ tipo: AccionMaterial; remito?: Remito } | null>(null)
  const prestamoId = idPositivo(params.get('prestamo_id'))
  const filtrosAplicados = { ...filtros, prestamo_id: prestamoId }
  const query = useQuery({
    queryKey: queryKeys.remitosLista(filtrosAplicados),
    queryFn: () => listarRemitos(filtrosAplicados),
  })
  const todos = useQuery({ queryKey: queryKeys.remitosLista(), queryFn: () => listarRemitos() })
  const prestamos = useQuery({
    queryKey: queryKeys.prestamosLista(),
    queryFn: () => listarPrestamos(),
  })
  const pendientes = prestamos.data?.filter((p) => puedeGenerarRemito(p, todos.data)) ?? []
  const columnas: ColumnaTabla<Remito>[] = [
    {
      encabezado: 'Remito',
      render: (r) => (
        <>
          <p className="font-medium text-slate-800">{r.numero}</p>
          <Badge tone="info">{etiquetaEstado(r.tipo)}</Badge>
          <p className="mt-1 text-xs text-slate-500">
            Préstamo #{r.prestamo_id} · Ejemplar #{r.ejemplar_id}
          </p>
        </>
      ),
    },
    {
      encabezado: 'Recorrido',
      render: (r) => (
        <>
          {datos.sedesPorId.get(r.sede_origen_id) ?? `Sede #${r.sede_origen_id}`} →{' '}
          {datos.sedesPorId.get(r.sede_destino_id) ?? `Sede #${r.sede_destino_id}`}
        </>
      ),
    },
    {
      encabezado: 'Estado',
      render: (r) => (
        <>
          <EstadoBadge estado={r.estado} />
          {r.estado_fisico_recepcion && (
            <p className="mt-1 text-xs text-slate-500">
              Físico: {etiquetaEstado(r.estado_fisico_recepcion)}
            </p>
          )}
        </>
      ),
    },
    {
      encabezado: 'Fechas',
      render: (r) => (
        <div className="space-y-1 text-xs text-slate-500">
          <p>Empaquetado: {formatearFechaHora(r.fecha_empaquetado)}</p>
          <p>Salida: {formatearFechaHora(r.fecha_salida)}</p>
          <p>Llegada: {formatearFechaHora(r.fecha_llegada)}</p>
        </div>
      ),
    },
    {
      encabezado: 'Acciones',
      render: (r) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setTraza(r.id)}>
            Trazabilidad
          </Button>
          {r.estado === 'EMPAQUETADO' && (
            <Button onClick={() => setAccion({ tipo: 'despachar', remito: r })}>Despachar</Button>
          )}
          {r.estado === 'DESPACHADO' && (
            <Button onClick={() => setAccion({ tipo: 'recibir', remito: r })}>Recibir</Button>
          )}
        </div>
      ),
    },
  ]
  const buscarNumero = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (numero.trim()) setTraza(numero.trim().toUpperCase())
  }
  const cerrarTraza = () => {
    setTraza(null)
    if (params.has('remito_id'))
      setParams(
        (prev) => {
          prev.delete('remito_id')
          return prev
        },
        { replace: true },
      )
  }

  return (
    <div>
      <PageHeader
        title="Remitos"
        description="Empaquetado, despacho, recepción y trazabilidad de envíos y retornos."
        actions={
          <Button
            onClick={() => setAccion({ tipo: 'generar' })}
            disabled={!prestamos.isSuccess || !todos.isSuccess || pendientes.length === 0}
          >
            Generar remito de envío
          </Button>
        }
      />
      {feedback && (
        <Alert tone={feedback.tone} onClose={cerrarFeedback}>
          {feedback.mensaje}
        </Alert>
      )}
      {(prestamos.error || todos.error) && (
        <Alert tone="error">
          No se pudieron cargar los préstamos o remitos para generar un envío.{' '}
          {mensajeDeError(prestamos.error ?? todos.error)}
        </Alert>
      )}
      <form
        onSubmit={buscarNumero}
        className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-4"
      >
        <div className="min-w-0 flex-1">
          <FormField label="Trazabilidad por número de remito" htmlFor="remito-numero">
            <input
              id="remito-numero"
              type="search"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="REM-000001"
              maxLength={50}
              className={fieldClass}
            />
          </FormField>
        </div>
        <Button type="submit" disabled={!numero.trim()}>
          Consultar trazabilidad
        </Button>
      </form>
      <div className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="Estado">
          <EstadoFiltroSelect
            valor={filtros.estado ?? ''}
            estados={ESTADOS_REMITO}
            onChange={(estado) => setFiltros((prev) => ({ ...prev, estado: estado || undefined }))}
          />
        </FormField>
        <FormField label="Tipo" htmlFor="remitos-tipo">
          <select
            id="remitos-tipo"
            className={fieldClass}
            value={filtros.tipo ?? ''}
            onChange={(e) => setFiltros((prev) => ({ ...prev, tipo: e.target.value || undefined }))}
          >
            <option value="">Todos</option>
            <option value="ENVIO">Envío</option>
            <option value="RETORNO">Retorno</option>
          </select>
        </FormField>
        <FormField label="Sede" htmlFor="remitos-sede">
          <select
            id="remitos-sede"
            className={fieldClass}
            value={filtros.sede_id ?? ''}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, sede_id: Number(e.target.value) || undefined }))
            }
          >
            <option value="">Todas</option>
            {datos.sedes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Préstamo" htmlFor="remitos-prestamo">
          <select
            id="remitos-prestamo"
            className={fieldClass}
            value={prestamoId ?? ''}
            onChange={(e) =>
              setParams((prev) => {
                if (e.target.value) prev.set('prestamo_id', e.target.value)
                else prev.delete('prestamo_id')
                return prev
              })
            }
          >
            <option value="">Todos</option>
            {prestamos.data?.map((p) => (
              <option key={p.id} value={p.id}>
                #{p.id} · {datos.titulos.get(p.libro_id) ?? `Libro #${p.libro_id}`}
              </option>
            ))}
          </select>
        </FormField>
        <Button
          variant="ghost"
          onClick={() => {
            setFiltros({})
            setParams({})
          }}
        >
          Limpiar filtros
        </Button>
      </div>
      {(query.isLoading || datos.isLoading) && <LoadingState mensaje="Cargando remitos…" />}
      {(query.error || datos.error) && (
        <ErrorState mensaje={mensajeDeError(query.error ?? datos.error)} />
      )}
      {query.isSuccess && !datos.isLoading && !datos.error && (
        <DataTable
          columnas={columnas}
          filas={query.data}
          clave={(r) => r.id}
          minWidth="min-w-[1000px]"
          ariaLabel="Remitos"
          vacio={
            <EmptyState
              titulo="No hay remitos para estos filtros"
              descripcion="Los envíos se generan para préstamos interbibliotecarios solicitados; los retornos se generan al registrar la devolución cuando corresponde."
            />
          }
        />
      )}
      {accion && (
        <AccionMaterialModal
          accion={accion.tipo}
          id={accion.remito?.id}
          descripcion={accion.remito?.numero}
          prestamos={pendientes}
          titulosLibros={datos.titulos}
          onCerrar={() => setAccion(null)}
          onSaved={(mensaje) => {
            setAccion(null)
            mostrarExito(mensaje)
          }}
        />
      )}
      {traza !== null && <TrazabilidadModal busqueda={traza} onCerrar={cerrarTraza} />}
    </div>
  )
}
