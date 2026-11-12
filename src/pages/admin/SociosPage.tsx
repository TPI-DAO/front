import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { cambiarEstadoSocio, listarSocios } from '@/api/socios'
import { Alert } from '@/components/ui/Alert'
import { EstadoBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DataTable, type ColumnaTabla } from '@/components/ui/DataTable'
import { EstadoFiltroSelect } from '@/components/ui/EstadoFiltroSelect'
import { FormField } from '@/components/ui/FormField'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { SocioFormModal } from '@/features/admin/socios/SocioFormModal'
import { mensajeDeError } from '@/lib/errors'
import { ESTADOS_SOCIO } from '@/lib/estados'
import { fieldClass } from '@/lib/formStyles'
import { formatearFecha } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import { useFeedback } from '@/lib/useFeedback'
import type { Socio } from '@/types/api'

export function SociosPage() {
  const queryClient = useQueryClient()
  const { feedback, mostrarExito, mostrarError, cerrarFeedback } = useFeedback()
  const [busqueda, setBusqueda] = useState('')
  const [busquedaAplicada, setBusquedaAplicada] = useState('')
  const [estado, setEstado] = useState('')
  const [modal, setModal] = useState<{ socio?: Socio } | null>(null)
  const [confirmar, setConfirmar] = useState<Socio | null>(null)

  const filtros = {
    q: busquedaAplicada || undefined,
    estado: estado || undefined,
  }

  const sociosQuery = useQuery({
    queryKey: queryKeys.sociosLista(filtros),
    queryFn: () => listarSocios(filtros),
  })

  const estadoMutation = useMutation({
    mutationFn: (socio: Socio) =>
      cambiarEstadoSocio(socio.id, socio.estado === 'HABILITADO' ? 'INHABILITADO' : 'HABILITADO'),
    onSuccess: (socio) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.socios })
      mostrarExito(
        socio.estado === 'HABILITADO'
          ? `El socio ${socio.apellido}, ${socio.nombre} fue habilitado.`
          : `El socio ${socio.apellido}, ${socio.nombre} fue inhabilitado.`,
      )
      setConfirmar(null)
    },
    onError: (error) => {
      mostrarError(mensajeDeError(error))
      setConfirmar(null)
    },
  })

  const socios = sociosQuery.data ?? []
  const inhabilitar = confirmar?.estado === 'HABILITADO'
  const hayFiltros = busquedaAplicada !== '' || estado !== ''

  const aplicarBusqueda = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusquedaAplicada(busqueda.trim())
  }

  const limpiarFiltros = () => {
    setBusqueda('')
    setBusquedaAplicada('')
    setEstado('')
  }

  const columnas: ColumnaTabla<Socio>[] = [
    {
      id: 'socio',
      encabezado: 'Socio',
      render: (socio) => (
        <div>
          <p className="font-medium text-slate-800">
            {socio.apellido}, {socio.nombre}
          </p>
          <p className="text-xs text-slate-500">DNI {socio.dni}</p>
        </div>
      ),
    },
    {
      id: 'telefono',
      encabezado: 'Teléfono',
      render: (socio) => <span className="text-slate-600">{socio.telefono ?? '—'}</span>,
    },
    {
      id: 'alta',
      encabezado: 'Alta',
      render: (socio) => <span className="text-slate-600">{formatearFecha(socio.fecha_alta)}</span>,
    },
    {
      id: 'estado',
      encabezado: 'Estado',
      render: (socio) => <EstadoBadge estado={socio.estado} />,
    },
    {
      id: 'acciones',
      encabezado: 'Acciones',
      className: 'text-right',
      render: (socio) => (
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setModal({ socio })}>
            <Pencil size={14} />
            Editar
          </Button>
          <Button
            variant={socio.estado === 'HABILITADO' ? 'dangerOutline' : 'secondary'}
            onClick={() => setConfirmar(socio)}
          >
            {socio.estado === 'HABILITADO' ? 'Inhabilitar' : 'Habilitar'}
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Socios"
        description="Administrá los socios habilitados para solicitar préstamos."
        actions={
          <Button onClick={() => setModal({})}>
            <Plus size={16} />
            Nuevo socio
          </Button>
        }
      />

      {feedback && (
        <Alert tone={feedback.tone} onClose={cerrarFeedback}>
          {feedback.mensaje}
        </Alert>
      )}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
        <form onSubmit={aplicarBusqueda} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <FormField label="Buscar" htmlFor="socio-q">
              <div className="flex gap-2">
                <input
                  id="socio-q"
                  type="search"
                  value={busqueda}
                  onChange={(event) => setBusqueda(event.target.value)}
                  placeholder="Nombre, apellido o DNI"
                  className={fieldClass}
                />
                <Button type="submit">
                  <Search size={16} />
                  Buscar
                </Button>
              </div>
            </FormField>
          </div>

          <div className="w-full sm:w-56">
            <FormField label="Estado">
              <EstadoFiltroSelect valor={estado} onChange={setEstado} estados={ESTADOS_SOCIO} />
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
        {sociosQuery.isLoading
          ? 'Cargando socios…'
          : `${socios.length} ${socios.length === 1 ? 'socio' : 'socios'}`}
      </p>

      {sociosQuery.isLoading && <LoadingState mensaje="Cargando socios…" />}
      {sociosQuery.isError && <ErrorState mensaje={mensajeDeError(sociosQuery.error)} />}

      {sociosQuery.isSuccess && (
        <DataTable
          columnas={columnas}
          filas={socios}
          clave={(socio) => socio.id}
          minWidth="min-w-[820px]"
          ariaLabel="Listado de socios"
          vacio={
            <EmptyState
              titulo="No se encontraron socios"
              descripcion="Probá con otra búsqueda o registrá el primer socio."
            />
          }
        />
      )}

      {modal && (
        <SocioFormModal
          socio={modal.socio}
          onCerrar={() => setModal(null)}
          onSaved={(mensaje) => {
            setModal(null)
            mostrarExito(mensaje)
          }}
        />
      )}

      <ConfirmDialog
        abierto={confirmar !== null}
        titulo={inhabilitar ? 'Inhabilitar socio' : 'Habilitar socio'}
        mensaje={
          confirmar
            ? inhabilitar
              ? `¿Inhabilitar a ${confirmar.apellido}, ${confirmar.nombre}? No podrá solicitar préstamos ni reservas.`
              : `¿Habilitar a ${confirmar.apellido}, ${confirmar.nombre}?`
            : ''
        }
        textoConfirmar={inhabilitar ? 'Inhabilitar' : 'Habilitar'}
        tono={inhabilitar ? 'danger' : 'primary'}
        cargando={estadoMutation.isPending}
        onConfirmar={() => {
          if (confirmar) estadoMutation.mutate(confirmar)
        }}
        onCerrar={() => setConfirmar(null)}
      />
    </div>
  )
}
