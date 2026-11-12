import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import {
  eliminarLibro,
  listarAutores,
  listarEditoriales,
  listarGeneros,
  listarLibros,
  type LibrosFiltros,
} from '@/api/catalogo'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DataTable, type ColumnaTabla } from '@/components/ui/DataTable'
import { FormField } from '@/components/ui/FormField'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { LibroFormModal } from '@/features/admin/libros/LibroFormModal'
import { mensajeDeError } from '@/lib/errors'
import { fieldClass } from '@/lib/formStyles'
import { queryKeys } from '@/lib/queryKeys'
import { useFeedback } from '@/lib/useFeedback'
import type { Libro } from '@/types/api'

export function LibrosPage() {
  const queryClient = useQueryClient()
  const { feedback, mostrarExito, mostrarError, cerrarFeedback } = useFeedback()
  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState<LibrosFiltros>({})
  const [modal, setModal] = useState<{ libro?: Libro } | null>(null)
  const [confirmar, setConfirmar] = useState<Libro | null>(null)

  const librosQuery = useQuery({
    queryKey: queryKeys.librosLista(filtros),
    queryFn: () => listarLibros(filtros),
  })
  const generosQuery = useQuery({ queryKey: queryKeys.generos, queryFn: listarGeneros })
  const autoresQuery = useQuery({ queryKey: queryKeys.autores, queryFn: listarAutores })
  const editorialesQuery = useQuery({
    queryKey: queryKeys.editoriales,
    queryFn: listarEditoriales,
  })

  const eliminarMutation = useMutation({
    mutationFn: (libro: Libro) => eliminarLibro(libro.id),
    onSuccess: (_, libro) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.libros })
      void queryClient.invalidateQueries({ queryKey: queryKeys.disponibilidad })
      void queryClient.invalidateQueries({ queryKey: queryKeys.ejemplares })
      mostrarExito(`El libro "${libro.titulo}" fue eliminado.`)
      setConfirmar(null)
    },
    onError: (error) => {
      mostrarError(mensajeDeError(error))
      setConfirmar(null)
    },
  })

  const libros = librosQuery.data ?? []
  const hayFiltros = Object.values(filtros).some((valor) => valor !== undefined)
  const catalogosListos =
    generosQuery.isSuccess && autoresQuery.isSuccess && editorialesQuery.isSuccess
  const errorCatalogos = generosQuery.error ?? autoresQuery.error ?? editorialesQuery.error

  const aplicarBusqueda = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFiltros((prev) => ({ ...prev, q: busqueda.trim() || undefined }))
  }

  const actualizarId = (campo: 'genero_id' | 'autor_id' | 'editorial_id', valor: string) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor ? Number(valor) : undefined }))
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setFiltros({})
  }

  const columnas: ColumnaTabla<Libro>[] = [
    {
      id: 'libro',
      encabezado: 'Libro',
      render: (libro) => (
        <div>
          <p className="font-medium text-slate-800">{libro.titulo}</p>
          <p className="text-xs text-slate-500">ISBN {libro.isbn}</p>
        </div>
      ),
    },
    {
      id: 'autor',
      encabezado: 'Autor',
      render: (libro) => <span className="text-slate-600">{libro.autor.nombre}</span>,
    },
    {
      id: 'genero',
      encabezado: 'Género',
      render: (libro) => <Badge tone="info">{libro.genero.nombre}</Badge>,
    },
    {
      id: 'editorial',
      encabezado: 'Editorial',
      render: (libro) => <span className="text-slate-600">{libro.editorial.descripcion}</span>,
    },
    {
      id: 'acciones',
      encabezado: 'Acciones',
      className: 'text-right',
      render: (libro) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModal({ libro })}>
            <Pencil size={14} />
            Editar
          </Button>
          <Button variant="dangerOutline" onClick={() => setConfirmar(libro)}>
            <Trash2 size={14} />
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Libros"
        description="Administrá el catálogo bibliográfico y sus datos de referencia."
        actions={
          <Button onClick={() => setModal({})} disabled={!catalogosListos}>
            <Plus size={16} />
            Nuevo libro
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
          No se pudieron cargar los catálogos auxiliares. Recargá la página para reintentar.
        </Alert>
      )}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <form onSubmit={aplicarBusqueda} className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <FormField label="Título" htmlFor="admin-libro-q">
              <div className="flex gap-2">
                <input
                  id="admin-libro-q"
                  type="search"
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  placeholder="Buscar por título"
                  className={fieldClass}
                />
                <Button type="submit">
                  <Search size={16} />
                  Buscar
                </Button>
              </div>
            </FormField>
          </div>

          <div className="lg:w-44">
            <FormField label="Género" htmlFor="admin-libro-genero">
              <select
                id="admin-libro-genero"
                value={filtros.genero_id ?? ''}
                onChange={(event) => actualizarId('genero_id', event.target.value)}
                className={fieldClass}
              >
                <option value="">Todos</option>
                {(generosQuery.data ?? []).map((genero) => (
                  <option key={genero.id} value={genero.id}>
                    {genero.nombre}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="lg:w-48">
            <FormField label="Autor" htmlFor="admin-libro-autor">
              <select
                id="admin-libro-autor"
                value={filtros.autor_id ?? ''}
                onChange={(event) => actualizarId('autor_id', event.target.value)}
                className={fieldClass}
              >
                <option value="">Todos</option>
                {(autoresQuery.data ?? []).map((autor) => (
                  <option key={autor.id} value={autor.id}>
                    {autor.nombre}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="lg:w-48">
            <FormField label="Editorial" htmlFor="admin-libro-editorial">
              <select
                id="admin-libro-editorial"
                value={filtros.editorial_id ?? ''}
                onChange={(event) => actualizarId('editorial_id', event.target.value)}
                className={fieldClass}
              >
                <option value="">Todas</option>
                {(editorialesQuery.data ?? []).map((editorial) => (
                  <option key={editorial.id} value={editorial.id}>
                    {editorial.descripcion}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </form>

        {hayFiltros && (
          <button
            type="button"
            onClick={limpiarFiltros}
            className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <p className="mb-3 text-sm text-slate-500">
        {librosQuery.isLoading
          ? 'Cargando libros…'
          : `${libros.length} ${libros.length === 1 ? 'libro' : 'libros'}`}
      </p>

      {librosQuery.isLoading && <LoadingState mensaje="Cargando libros…" />}
      {librosQuery.isError && <ErrorState mensaje={mensajeDeError(librosQuery.error)} />}

      {librosQuery.isSuccess && (
        <DataTable
          columnas={columnas}
          filas={libros}
          clave={(libro) => libro.id}
          minWidth="min-w-[900px]"
          ariaLabel="Listado de libros"
          vacio={
            <EmptyState
              titulo="No se encontraron libros"
              descripcion="Probá con otra búsqueda o registrá el primer título."
            />
          }
        />
      )}

      {modal && (
        <LibroFormModal
          libro={modal.libro}
          generos={generosQuery.data ?? []}
          autores={autoresQuery.data ?? []}
          editoriales={editorialesQuery.data ?? []}
          onCerrar={() => setModal(null)}
          onSaved={(mensaje) => {
            setModal(null)
            mostrarExito(mensaje)
          }}
        />
      )}

      <ConfirmDialog
        abierto={confirmar !== null}
        titulo="Eliminar libro"
        mensaje={
          confirmar
            ? `¿Eliminar el libro "${confirmar.titulo}"? Solo es posible si no tiene ejemplares registrados.`
            : ''
        }
        textoConfirmar="Eliminar"
        tono="danger"
        cargando={eliminarMutation.isPending}
        onConfirmar={() => {
          if (confirmar) eliminarMutation.mutate(confirmar)
        }}
        onCerrar={() => setConfirmar(null)}
      />
    </div>
  )
}
