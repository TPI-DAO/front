import { useQuery } from '@tanstack/react-query'
import { BookOpen, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  listarAutores,
  listarEditoriales,
  listarGeneros,
  listarLibros,
  type LibrosFiltros,
} from '@/api/catalogo'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { mensajeDeError } from '@/lib/errors'
import { fieldClass } from '@/lib/formStyles'

export function CatalogoPage() {
  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState<LibrosFiltros>({})

  const librosQuery = useQuery({
    queryKey: ['libros', filtros],
    queryFn: () => listarLibros(filtros),
  })
  const generosQuery = useQuery({ queryKey: ['generos'], queryFn: listarGeneros })
  const autoresQuery = useQuery({ queryKey: ['autores'], queryFn: listarAutores })
  const editorialesQuery = useQuery({ queryKey: ['editoriales'], queryFn: listarEditoriales })

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

  const hayFiltros = Object.values(filtros).some((valor) => valor !== undefined)
  const libros = librosQuery.data ?? []

  return (
    <div>
      <PageHeader
        title="Catálogo"
        description="Buscá libros por título, autor, género o editorial."
      />

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <form onSubmit={aplicarBusqueda} className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label htmlFor="q" className="mb-1 block text-xs font-medium text-slate-500">
              Título
            </label>
            <div className="flex gap-2">
              <input
                id="q"
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Ej.: Cien años de soledad"
                className={fieldClass}
              />
              <Button type="submit">
                <Search size={16} />
                Buscar
              </Button>
            </div>
          </div>

          <div className="lg:w-44">
            <label htmlFor="genero" className="mb-1 block text-xs font-medium text-slate-500">
              Género
            </label>
            <select
              id="genero"
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
          </div>

          <div className="lg:w-48">
            <label htmlFor="autor" className="mb-1 block text-xs font-medium text-slate-500">
              Autor
            </label>
            <select
              id="autor"
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
          </div>

          <div className="lg:w-48">
            <label htmlFor="editorial" className="mb-1 block text-xs font-medium text-slate-500">
              Editorial
            </label>
            <select
              id="editorial"
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
          ? 'Buscando…'
          : `${libros.length} ${libros.length === 1 ? 'libro' : 'libros'}`}
      </p>

      {librosQuery.isLoading && <LoadingState mensaje="Cargando catálogo…" />}
      {librosQuery.isError && <ErrorState mensaje={mensajeDeError(librosQuery.error)} />}
      {librosQuery.isSuccess && libros.length === 0 && (
        <EmptyState
          titulo="No se encontraron libros"
          descripcion="Probá con otro título o quitá algunos filtros."
        />
      )}

      {librosQuery.isSuccess && libros.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {libros.map((libro) => (
            <Link
              key={libro.id}
              to={`/catalogo/${libro.id}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-indigo-700">
                    {libro.titulo}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{libro.autor.nombre}</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <BookOpen size={18} />
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge tone="info">{libro.genero.nombre}</Badge>
                <span className="text-xs text-slate-500">{libro.editorial.descripcion}</span>
              </div>

              <p className="mt-3 text-xs text-slate-400">ISBN {libro.isbn}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
