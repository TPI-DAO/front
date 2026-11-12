import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Archive, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { listarLibros } from '@/api/catalogo'
import { darBajaEjemplar, listarEjemplares, type EjemplaresFiltros } from '@/api/ejemplares'
import { listarSedes } from '@/api/sedes'
import { Alert } from '@/components/ui/Alert'
import { EstadoBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DataTable, type ColumnaTabla } from '@/components/ui/DataTable'
import { EstadoFiltroSelect } from '@/components/ui/EstadoFiltroSelect'
import { FormField } from '@/components/ui/FormField'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { EjemplarFormModal } from '@/features/admin/ejemplares/EjemplarFormModal'
import { mensajeDeError } from '@/lib/errors'
import { ESTADOS_EJEMPLAR } from '@/lib/estados'
import { fieldClass } from '@/lib/formStyles'
import { formatearFecha } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import { useFeedback } from '@/lib/useFeedback'
import type { Ejemplar } from '@/types/api'

const estadoEditable = (estado: string) => estado === 'DISPONIBLE' || estado === 'DANADO'

export function EjemplaresPage() {
  const queryClient = useQueryClient()
  const { feedback, mostrarExito, mostrarError, cerrarFeedback } = useFeedback()
  const [filtros, setFiltros] = useState<EjemplaresFiltros>({})
  const [modal, setModal] = useState<{ ejemplar?: Ejemplar } | null>(null)
  const [confirmar, setConfirmar] = useState<Ejemplar | null>(null)

  const ejemplaresQuery = useQuery({
    queryKey: queryKeys.ejemplaresLista(filtros),
    queryFn: () => listarEjemplares(filtros),
  })
  const librosQuery = useQuery({
    queryKey: queryKeys.librosLista(),
    queryFn: () => listarLibros({}),
  })
  const sedesQuery = useQuery({ queryKey: queryKeys.sedes, queryFn: () => listarSedes() })

  const bajaMutation = useMutation({
    mutationFn: (ejemplar: Ejemplar) => darBajaEjemplar(ejemplar.id),
    onSuccess: (ejemplar) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ejemplares })
      void queryClient.invalidateQueries({ queryKey: queryKeys.disponibilidad })
      mostrarExito(
        `El ejemplar ${ejemplar.codigo_inventario ?? `#${ejemplar.id}`} fue dado de baja.`,
      )
      setConfirmar(null)
    },
    onError: (error) => {
      mostrarError(mensajeDeError(error))
      setConfirmar(null)
    },
  })

  const ejemplares = ejemplaresQuery.data ?? []
  const libros = librosQuery.data ?? []
  const sedes = sedesQuery.data ?? []
  const sedesPorId = new Map(sedes.map((sede) => [sede.id, sede.nombre]))
  const hayFiltros = Object.values(filtros).some((valor) => valor !== undefined)
  const catalogosListos = librosQuery.isSuccess && sedesQuery.isSuccess
  const errorCatalogos = librosQuery.error ?? sedesQuery.error

  const actualizarFiltro = (campo: 'libro_id' | 'sede_id', valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor ? Number(valor) : undefined,
    }))
  }

  const columnas: ColumnaTabla<Ejemplar>[] = [
    {
      id: 'ejemplar',
      encabezado: 'Ejemplar',
      render: (ejemplar) => (
        <div>
          <p className="font-medium text-slate-800">
            {ejemplar.codigo_inventario ?? `#${ejemplar.id}`}
          </p>
          <p className="text-xs text-slate-500">Alta {formatearFecha(ejemplar.fecha_alta)}</p>
        </div>
      ),
    },
    {
      id: 'libro',
      encabezado: 'Libro',
      render: (ejemplar) => (
        <div>
          <p className="text-slate-700">{ejemplar.libro.titulo}</p>
          <p className="text-xs text-slate-400">ISBN {ejemplar.libro.isbn}</p>
        </div>
      ),
    },
    {
      id: 'sede',
      encabezado: 'Sede',
      render: (ejemplar) => (
        <span className="text-slate-600">
          {sedesPorId.get(ejemplar.sede_id) ?? `Sede ${ejemplar.sede_id}`}
        </span>
      ),
    },
    {
      id: 'estado',
      encabezado: 'Estado',
      render: (ejemplar) => <EstadoBadge estado={ejemplar.estado} />,
    },
    {
      id: 'acciones',
      encabezado: 'Acciones',
      className: 'text-right',
      render: (ejemplar) => {
        const editable = estadoEditable(ejemplar.estado)
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setModal({ ejemplar })}
              disabled={!editable}
              title={
                editable ? undefined : 'Solo se pueden editar ejemplares disponibles o dañados.'
              }
            >
              <Pencil size={14} />
              Editar
            </Button>
            <Button
              variant="dangerOutline"
              onClick={() => setConfirmar(ejemplar)}
              disabled={!editable}
              title={
                editable
                  ? undefined
                  : 'Solo se pueden dar de baja ejemplares disponibles o dañados.'
              }
            >
              <Archive size={14} />
              Dar de baja
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Ejemplares"
        description="Administrá los ejemplares físicos y la sede a la que pertenecen."
        actions={
          <Button onClick={() => setModal({})} disabled={!catalogosListos}>
            <Plus size={16} />
            Nuevo ejemplar
          </Button>
        }
      />

      {feedback && (
        <Alert tone={feedback.tone} onClose={cerrarFeedback}>
          {feedback.mensaje}
        </Alert>
      )}

      {errorCatalogos && (
        <Alert tone="error">
          No se pudieron cargar los catálogos de libros o sedes. Recargá la página para reintentar.
        </Alert>
      )}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <FormField label="Libro" htmlFor="ejemplar-filtro-libro">
              <select
                id="ejemplar-filtro-libro"
                value={filtros.libro_id ?? ''}
                onChange={(event) => actualizarFiltro('libro_id', event.target.value)}
                className={fieldClass}
              >
                <option value="">Todos los libros</option>
                {libros.map((libro) => (
                  <option key={libro.id} value={libro.id}>
                    {libro.titulo}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="lg:w-56">
            <FormField label="Sede" htmlFor="ejemplar-filtro-sede">
              <select
                id="ejemplar-filtro-sede"
                value={filtros.sede_id ?? ''}
                onChange={(event) => actualizarFiltro('sede_id', event.target.value)}
                className={fieldClass}
              >
                <option value="">Todas las sedes</option>
                {sedes.map((sede) => (
                  <option key={sede.id} value={sede.id}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="lg:w-56">
            <FormField label="Estado">
              <EstadoFiltroSelect
                valor={filtros.estado ?? ''}
                onChange={(valor) =>
                  setFiltros((prev) => ({ ...prev, estado: valor || undefined }))
                }
                estados={ESTADOS_EJEMPLAR}
              />
            </FormField>
          </div>
        </div>

        {hayFiltros && (
          <button
            type="button"
            onClick={() => setFiltros({})}
            className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <p className="mb-3 text-sm text-slate-500">
        {ejemplaresQuery.isLoading
          ? 'Cargando ejemplares…'
          : `${ejemplares.length} ${ejemplares.length === 1 ? 'ejemplar' : 'ejemplares'}`}
      </p>

      {ejemplaresQuery.isLoading && <LoadingState mensaje="Cargando ejemplares…" />}
      {ejemplaresQuery.isError && <ErrorState mensaje={mensajeDeError(ejemplaresQuery.error)} />}

      {ejemplaresQuery.isSuccess && (
        <DataTable
          columnas={columnas}
          filas={ejemplares}
          clave={(ejemplar) => ejemplar.id}
          minWidth="min-w-[900px]"
          ariaLabel="Listado de ejemplares"
          vacio={
            <EmptyState
              titulo="No se encontraron ejemplares"
              descripcion="Probá con otros filtros o registrá el primer ejemplar."
            />
          }
        />
      )}

      {modal && (
        <EjemplarFormModal
          ejemplar={modal.ejemplar}
          libros={libros}
          sedes={sedes}
          onCerrar={() => setModal(null)}
          onSaved={(mensaje) => {
            setModal(null)
            mostrarExito(mensaje)
          }}
        />
      )}

      <ConfirmDialog
        abierto={confirmar !== null}
        titulo="Dar de baja ejemplar"
        mensaje={
          confirmar
            ? `¿Dar de baja el ejemplar ${confirmar.codigo_inventario ?? `#${confirmar.id}`} de "${confirmar.libro.titulo}"? Esta acción no se puede deshacer.`
            : ''
        }
        textoConfirmar="Dar de baja"
        tono="danger"
        cargando={bajaMutation.isPending}
        onConfirmar={() => {
          if (confirmar) bajaMutation.mutate(confirmar)
        }}
        onCerrar={() => setConfirmar(null)}
      />
    </div>
  )
}
