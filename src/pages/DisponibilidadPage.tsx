import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { consultarDisponibilidad } from '@/api/disponibilidad'
import { listarSedes } from '@/api/sedes'
import { DisponibilidadTable } from '@/components/disponibilidad/DisponibilidadTable'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { mensajeDeError } from '@/lib/errors'
import { fieldClass } from '@/lib/formStyles'
import { queryKeys } from '@/lib/queryKeys'

export function DisponibilidadPage() {
  const [busqueda, setBusqueda] = useState('')
  const [tituloAplicado, setTituloAplicado] = useState('')
  const [sedeId, setSedeId] = useState<number | undefined>()
  const [soloDisponibles, setSoloDisponibles] = useState(false)

  const sedesQuery = useQuery({ queryKey: queryKeys.sedes, queryFn: () => listarSedes() })

  const filtrosDisponibilidad = {
    titulo: tituloAplicado || undefined,
    sede_id: sedeId,
    solo_disponibles: soloDisponibles,
  }

  const disponibilidadQuery = useQuery({
    queryKey: queryKeys.disponibilidadLista(filtrosDisponibilidad),
    queryFn: () => consultarDisponibilidad(filtrosDisponibilidad),
  })

  const aplicarBusqueda = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setTituloAplicado(busqueda.trim())
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setTituloAplicado('')
    setSedeId(undefined)
    setSoloDisponibles(false)
  }

  const filas = disponibilidadQuery.data ?? []
  const hayFiltros = tituloAplicado !== '' || sedeId !== undefined || soloDisponibles

  return (
    <div>
      <PageHeader
        title="Disponibilidad"
        description="Consultá ejemplares por libro y sede. Los disponibles netos descuentan reservas activas."
      />

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <form onSubmit={aplicarBusqueda} className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="flex-1">
            <label htmlFor="titulo" className="mb-1 block text-xs font-medium text-slate-500">
              Título del libro
            </label>
            <div className="flex gap-2">
              <input
                id="titulo"
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Ej.: Rayuela"
                className={fieldClass}
              />
              <Button type="submit">
                <Search size={16} />
                Buscar
              </Button>
            </div>
          </div>

          <div className="lg:w-56">
            <label htmlFor="sede" className="mb-1 block text-xs font-medium text-slate-500">
              Sede
            </label>
            <select
              id="sede"
              value={sedeId ?? ''}
              onChange={(event) =>
                setSedeId(event.target.value ? Number(event.target.value) : undefined)
              }
              className={fieldClass}
            >
              <option value="">Todas</option>
              {(sedesQuery.data ?? []).map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 pb-2 text-sm text-slate-600 lg:w-52">
            <input
              type="checkbox"
              checked={soloDisponibles}
              onChange={(event) => setSoloDisponibles(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Solo con stock neto
          </label>
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
        {disponibilidadQuery.isLoading
          ? 'Consultando…'
          : `${filas.length} ${filas.length === 1 ? 'fila' : 'filas'}`}
      </p>

      {disponibilidadQuery.isLoading && <LoadingState mensaje="Consultando disponibilidad…" />}
      {disponibilidadQuery.isError && (
        <ErrorState mensaje={mensajeDeError(disponibilidadQuery.error)} />
      )}
      {disponibilidadQuery.isSuccess && filas.length === 0 && (
        <EmptyState
          titulo="Sin resultados"
          descripcion="No hay ejemplares que coincidan con los filtros seleccionados."
        />
      )}

      {disponibilidadQuery.isSuccess && filas.length > 0 && (
        <DisponibilidadTable filas={filas} mostrarLibro enlazarLibro />
      )}
    </div>
  )
}
