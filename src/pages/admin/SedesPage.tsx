import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { cambiarEstadoSede, listarSedes } from '@/api/sedes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DataTable, type ColumnaTabla } from '@/components/ui/DataTable'
import { EstadoBadge } from '@/components/ui/Badge'
import { EstadoFiltroSelect } from '@/components/ui/EstadoFiltroSelect'
import { FormField } from '@/components/ui/FormField'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { SedeFormModal } from '@/features/admin/sedes/SedeFormModal'
import { mensajeDeError } from '@/lib/errors'
import { ESTADOS_SEDE } from '@/lib/estados'
import { queryKeys } from '@/lib/queryKeys'
import { useFeedback } from '@/lib/useFeedback'
import type { Sede } from '@/types/api'

export function SedesPage() {
  const queryClient = useQueryClient()
  const { feedback, mostrarExito, mostrarError, cerrarFeedback } = useFeedback()
  const [estado, setEstado] = useState('')
  const [modal, setModal] = useState<{ sede?: Sede } | null>(null)
  const [confirmar, setConfirmar] = useState<Sede | null>(null)

  const filtros = { estado: estado || undefined }
  const sedesQuery = useQuery({
    queryKey: queryKeys.sedesLista(filtros),
    queryFn: () => listarSedes(filtros),
  })

  const estadoMutation = useMutation({
    mutationFn: (sede: Sede) =>
      cambiarEstadoSede(sede.id, sede.estado === 'ACTIVA' ? 'BAJA' : 'ACTIVA'),
    onSuccess: (sede) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sedes })
      void queryClient.invalidateQueries({ queryKey: queryKeys.disponibilidad })
      void queryClient.invalidateQueries({ queryKey: queryKeys.reservas })
      mostrarExito(
        sede.estado === 'ACTIVA'
          ? `La sede "${sede.nombre}" fue reactivada.`
          : `La sede "${sede.nombre}" fue dada de baja.`,
      )
      setConfirmar(null)
    },
    onError: (error) => {
      mostrarError(mensajeDeError(error))
      setConfirmar(null)
    },
  })

  const sedes = sedesQuery.data ?? []
  const darDeBaja = confirmar?.estado === 'ACTIVA'

  const columnas: ColumnaTabla<Sede>[] = [
    {
      id: 'nombre',
      encabezado: 'Sede',
      render: (sede) => (
        <div>
          <p className="font-medium text-slate-800">{sede.nombre}</p>
          <p className="text-xs text-slate-500">{sede.direccion}</p>
        </div>
      ),
    },
    {
      id: 'contacto',
      encabezado: 'Contacto',
      render: (sede) => (
        <div className="text-slate-600">
          <p>{sede.correo ?? '—'}</p>
          <p className="text-xs text-slate-400">{sede.telefono ?? 'Sin teléfono'}</p>
        </div>
      ),
    },
    {
      id: 'horarios',
      encabezado: 'Horarios',
      render: (sede) => <span className="text-slate-600">{sede.horarios ?? '—'}</span>,
    },
    {
      id: 'estado',
      encabezado: 'Estado',
      render: (sede) => <EstadoBadge estado={sede.estado} />,
    },
    {
      id: 'acciones',
      encabezado: 'Acciones',
      className: 'text-right',
      render: (sede) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModal({ sede })}>
            <Pencil size={14} />
            Editar
          </Button>
          <Button
            variant={sede.estado === 'ACTIVA' ? 'dangerOutline' : 'secondary'}
            onClick={() => setConfirmar(sede)}
          >
            {sede.estado === 'ACTIVA' ? 'Dar de baja' : 'Reactivar'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Sedes"
        description="Administrá las sedes que conforman la red de bibliotecas."
        actions={
          <Button onClick={() => setModal({})}>
            <Plus size={16} />
            Nueva sede
          </Button>
        }
      />

      {feedback && (
        <Alert tone={feedback.tone} onClose={cerrarFeedback}>
          {feedback.mensaje}
        </Alert>
      )}

      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="w-full sm:w-56">
          <FormField label="Estado">
            <EstadoFiltroSelect valor={estado} onChange={setEstado} estados={ESTADOS_SEDE} />
          </FormField>
        </div>
        {estado && (
          <Button variant="ghost" className="mb-0.5" onClick={() => setEstado('')}>
            Limpiar filtros
          </Button>
        )}
      </div>

      <p className="mb-3 text-sm text-slate-500">
        {sedesQuery.isLoading
          ? 'Cargando sedes…'
          : `${sedes.length} ${sedes.length === 1 ? 'sede' : 'sedes'}`}
      </p>

      {sedesQuery.isLoading && <LoadingState mensaje="Cargando sedes…" />}
      {sedesQuery.isError && <ErrorState mensaje={mensajeDeError(sedesQuery.error)} />}

      {sedesQuery.isSuccess && (
        <DataTable
          columnas={columnas}
          filas={sedes}
          clave={(sede) => sede.id}
          minWidth="min-w-[900px]"
          ariaLabel="Listado de sedes"
          vacio={
            <EmptyState
              titulo="No hay sedes registradas"
              descripcion="Creá la primera sede para empezar a operar con la red."
            />
          }
        />
      )}

      {modal && (
        <SedeFormModal
          sede={modal.sede}
          onCerrar={() => setModal(null)}
          onSaved={(mensaje) => {
            setModal(null)
            mostrarExito(mensaje)
          }}
        />
      )}

      <ConfirmDialog
        abierto={confirmar !== null}
        titulo={darDeBaja ? 'Dar de baja sede' : 'Reactivar sede'}
        mensaje={
          confirmar
            ? darDeBaja
              ? `¿Dar de baja la sede "${confirmar.nombre}"? Se cancelarán sus reservas activas y no podrá operar hasta que la reactives.`
              : `¿Reactivar la sede "${confirmar.nombre}"?`
            : ''
        }
        textoConfirmar={darDeBaja ? 'Dar de baja' : 'Reactivar'}
        tono={darDeBaja ? 'danger' : 'primary'}
        cargando={estadoMutation.isPending}
        onConfirmar={() => {
          if (confirmar) estadoMutation.mutate(confirmar)
        }}
        onCerrar={() => setConfirmar(null)}
      />
    </div>
  )
}
