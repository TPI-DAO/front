import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenerLibro } from '@/api/catalogo'
import { consultarDisponibilidad } from '@/api/disponibilidad'
import { DisponibilidadTable } from '@/components/disponibilidad/DisponibilidadTable'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { mensajeDeError } from '@/lib/errors'
import { queryKeys } from '@/lib/queryKeys'
import { useFeedback } from '@/lib/useFeedback'
import { SolicitudModal } from '@/features/operaciones/SolicitudModal'

export function LibroDetallePage() {
  const [solicitud, setSolicitud] = useState<'prestamo' | 'reserva' | null>(null)
  const { feedback, mostrarExito, cerrarFeedback } = useFeedback()
  const { libroId: libroIdParam } = useParams<{ libroId: string }>()
  const libroId = Number(libroIdParam)
  const idValido = Number.isInteger(libroId) && libroId > 0

  const libroQuery = useQuery({
    queryKey: queryKeys.libro(libroId),
    queryFn: () => obtenerLibro(libroId),
    enabled: idValido,
  })

  const disponibilidadQuery = useQuery({
    queryKey: queryKeys.disponibilidadLista({ libro_id: libroId }),
    queryFn: () => consultarDisponibilidad({ libro_id: libroId }),
    enabled: idValido,
  })

  if (!idValido) {
    return <ErrorState mensaje="El libro indicado no es válido." />
  }

  if (libroQuery.isLoading) {
    return <LoadingState mensaje="Cargando libro…" />
  }

  if (libroQuery.isError) {
    return <ErrorState mensaje={mensajeDeError(libroQuery.error)} />
  }

  const libro = libroQuery.data
  if (!libro) {
    return <ErrorState mensaje="No se encontró el libro." />
  }

  const filas = disponibilidadQuery.data ?? []
  const totalNeto = filas.reduce((total, fila) => total + fila.disponibles_netos, 0)

  return (
    <div>
      <Link
        to="/catalogo"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Volver al catálogo
      </Link>

      <PageHeader
        title={libro.titulo}
        description={`${libro.autor.nombre} · ${libro.genero.nombre}`}
        actions={
          <>
            <Badge tone={totalNeto > 0 ? 'success' : 'neutral'}>
              {totalNeto > 0
                ? `${totalNeto} disponible${totalNeto === 1 ? '' : 's'}`
                : 'Sin stock neto'}
            </Badge>
            <Button onClick={() => setSolicitud('prestamo')}>Solicitar préstamo</Button>
            <Button variant="secondary" onClick={() => setSolicitud('reserva')}>
              Reservar
            </Button>
          </>
        }
      />

      {feedback && (
        <Alert tone={feedback.tone} onClose={cerrarFeedback}>
          {feedback.mensaje}
        </Alert>
      )}

      <div className="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">ISBN</p>
          <p className="mt-1 text-sm text-slate-800">{libro.isbn}</p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Género</p>
          <p className="mt-1 text-sm text-slate-800">{libro.genero.nombre}</p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Autor</p>
          <p className="mt-1 text-sm text-slate-800">{libro.autor.nombre}</p>
        </div>
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Editorial</p>
          <p className="mt-1 text-sm text-slate-800">{libro.editorial.descripcion}</p>
        </div>
      </div>

      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Disponibilidad por sede</h2>
          <p className="text-sm text-slate-500">
            Los disponibles netos descuentan las reservas activas.
          </p>
        </div>
      </div>

      {disponibilidadQuery.isLoading && <LoadingState mensaje="Consultando disponibilidad…" />}
      {disponibilidadQuery.isError && (
        <ErrorState mensaje={mensajeDeError(disponibilidadQuery.error)} />
      )}
      {disponibilidadQuery.isSuccess && filas.length === 0 && (
        <EmptyState
          titulo="Sin ejemplares registrados"
          descripcion="Este libro todavía no tiene ejemplares asociados a ninguna sede."
        />
      )}

      {disponibilidadQuery.isSuccess && filas.length > 0 && <DisponibilidadTable filas={filas} />}
      {solicitud && (
        <SolicitudModal
          tipo={solicitud}
          libroId={libroId}
          onCerrar={() => setSolicitud(null)}
          onSaved={(mensaje) => {
            setSolicitud(null)
            mostrarExito(mensaje)
          }}
        />
      )}
    </div>
  )
}
