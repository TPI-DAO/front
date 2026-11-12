import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { listarSocios } from '@/api/socios'
import { cambiarEstadoUsuario, listarUsuarios } from '@/api/usuarios'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DataTable, type ColumnaTabla } from '@/components/ui/DataTable'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States'
import { UsuarioFormModal } from '@/features/admin/usuarios/UsuarioFormModal'
import { useAuth } from '@/features/auth/useAuth'
import { mensajeDeError } from '@/lib/errors'
import { etiquetaRol } from '@/lib/estados'
import { formatearFecha } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import { useFeedback } from '@/lib/useFeedback'
import type { Usuario } from '@/types/api'

export function UsuariosPage() {
  const queryClient = useQueryClient()
  const { usuario: usuarioActual } = useAuth()
  const { feedback, mostrarExito, mostrarError, cerrarFeedback } = useFeedback()
  const [modalAbierto, setModalAbierto] = useState(false)
  const [confirmar, setConfirmar] = useState<Usuario | null>(null)

  const usuariosQuery = useQuery({ queryKey: queryKeys.usuarios, queryFn: listarUsuarios })
  const sociosQuery = useQuery({ queryKey: queryKeys.socios, queryFn: () => listarSocios() })

  const estadoMutation = useMutation({
    mutationFn: (usuario: Usuario) => cambiarEstadoUsuario(usuario.id, !usuario.activo),
    onSuccess: (usuario) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.usuarios })
      mostrarExito(
        usuario.activo
          ? `La cuenta de "${usuario.username}" fue activada.`
          : `La cuenta de "${usuario.username}" fue desactivada.`,
      )
      setConfirmar(null)
    },
    onError: (error) => {
      mostrarError(mensajeDeError(error))
      setConfirmar(null)
    },
  })

  const usuarios = usuariosQuery.data ?? []
  const socios = sociosQuery.data ?? []
  const sociosPorId = new Map(socios.map((socio) => [socio.id, socio]))
  const sociosDisponibles = socios.filter(
    (socio) => !usuarios.some((usuario) => usuario.socio_id === socio.id),
  )
  const desactivar = confirmar?.activo === true
  const datosListos = usuariosQuery.isSuccess && sociosQuery.isSuccess

  const columnas: ColumnaTabla<Usuario>[] = [
    {
      id: 'usuario',
      encabezado: 'Usuario',
      render: (usuario) => (
        <div>
          <p className="font-medium text-slate-800">{usuario.username}</p>
          <p className="text-xs text-slate-500">{usuario.email}</p>
        </div>
      ),
    },
    {
      id: 'rol',
      encabezado: 'Rol',
      render: (usuario) => (
        <Badge tone={usuario.rol === 'ADMIN' ? 'info' : 'neutral'}>
          {etiquetaRol(usuario.rol)}
        </Badge>
      ),
    },
    {
      id: 'socio',
      encabezado: 'Socio asociado',
      render: (usuario) => {
        if (usuario.socio_id === null) return <span className="text-slate-400">—</span>
        const socio = sociosPorId.get(usuario.socio_id)
        return (
          <span className="text-slate-600">
            {socio ? `${socio.apellido}, ${socio.nombre}` : `Socio #${usuario.socio_id}`}
          </span>
        )
      },
    },
    {
      id: 'alta',
      encabezado: 'Alta',
      render: (usuario) => (
        <span className="text-slate-600">{formatearFecha(usuario.fecha_alta)}</span>
      ),
    },
    {
      id: 'estado',
      encabezado: 'Estado',
      render: (usuario) => (
        <Badge tone={usuario.activo ? 'success' : 'neutral'}>
          {usuario.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      id: 'acciones',
      encabezado: 'Acciones',
      className: 'text-right',
      render: (usuario) => {
        const esPropia = usuario.id === usuarioActual?.id
        return (
          <Button
            variant={usuario.activo ? 'dangerOutline' : 'secondary'}
            onClick={() => setConfirmar(usuario)}
            disabled={esPropia}
            title={esPropia ? 'No podés cambiar el estado de tu propia cuenta.' : undefined}
          >
            {usuario.activo ? 'Desactivar' : 'Activar'}
          </Button>
        )
      },
    },
  ]

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Creá cuentas de acceso, asigná roles y administrá su estado."
        actions={
          <Button onClick={() => setModalAbierto(true)} disabled={!datosListos}>
            <Plus size={16} />
            Nuevo usuario
          </Button>
        }
      />

      {feedback && (
        <Alert tone={feedback.tone} onClose={cerrarFeedback}>
          {feedback.mensaje}
        </Alert>
      )}

      <p className="mb-3 text-sm text-slate-500">
        {usuariosQuery.isLoading
          ? 'Cargando usuarios…'
          : `${usuarios.length} ${usuarios.length === 1 ? 'usuario' : 'usuarios'}`}
      </p>

      {usuariosQuery.isLoading && <LoadingState mensaje="Cargando usuarios…" />}
      {usuariosQuery.isError && <ErrorState mensaje={mensajeDeError(usuariosQuery.error)} />}
      {sociosQuery.isError && <ErrorState mensaje={mensajeDeError(sociosQuery.error)} />}

      {usuariosQuery.isSuccess && (
        <DataTable
          columnas={columnas}
          filas={usuarios}
          clave={(usuario) => usuario.id}
          minWidth="min-w-[920px]"
          ariaLabel="Listado de usuarios"
          vacio={<EmptyState titulo="No hay usuarios registrados" />}
        />
      )}

      {modalAbierto && (
        <UsuarioFormModal
          socios={sociosDisponibles}
          onCerrar={() => setModalAbierto(false)}
          onSaved={(mensaje) => {
            setModalAbierto(false)
            mostrarExito(mensaje)
          }}
        />
      )}

      <ConfirmDialog
        abierto={confirmar !== null}
        titulo={desactivar ? 'Desactivar usuario' : 'Activar usuario'}
        mensaje={
          confirmar
            ? desactivar
              ? `¿Desactivar la cuenta de "${confirmar.username}"? No podrá iniciar sesión hasta que la actives nuevamente.`
              : `¿Activar la cuenta de "${confirmar.username}"?`
            : ''
        }
        textoConfirmar={desactivar ? 'Desactivar' : 'Activar'}
        tono={desactivar ? 'danger' : 'primary'}
        cargando={estadoMutation.isPending}
        onConfirmar={() => {
          if (confirmar) estadoMutation.mutate(confirmar)
        }}
        onCerrar={() => setConfirmar(null)}
      />
    </div>
  )
}
