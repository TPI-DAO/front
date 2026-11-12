import { cancelarPrestamo } from '@/api/prestamos'
import { cancelarReserva } from '@/api/reservas'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { mensajeDeError } from '@/lib/errors'
import { useOperacionMutation } from './useOperacionMutation'

export function CancelarOperacionModal({
  tipo,
  id,
  onCerrar,
  onSaved,
}: {
  tipo: 'prestamo' | 'reserva'
  id: number
  onCerrar: () => void
  onSaved: (mensaje: string) => void
}) {
  const mutation = useOperacionMutation(
    async () => {
      if (tipo === 'prestamo') await cancelarPrestamo(id)
      else await cancelarReserva(id)
    },
    () =>
      onSaved(
        `${tipo === 'prestamo' ? 'Préstamo' : 'Reserva'} #${id} ${tipo === 'prestamo' ? 'cancelado' : 'cancelada'}.`,
      ),
  )
  return (
    <Modal
      abierto
      titulo={`Cancelar ${tipo === 'prestamo' ? 'préstamo' : 'reserva'} #${id}`}
      onCerrar={onCerrar}
      bloqueado={mutation.isPending}
      footer={
        <>
          <Button variant="secondary" onClick={onCerrar} disabled={mutation.isPending}>
            Volver
          </Button>
          <Button variant="danger" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? 'Cancelando…' : 'Confirmar cancelación'}
          </Button>
        </>
      }
    >
      {mutation.isError && <Alert tone="error">{mensajeDeError(mutation.error)}</Alert>}
      <p className="text-sm text-slate-600">
        {tipo === 'prestamo'
          ? 'Se liberará el ejemplar y se cancelará su remito empaquetado, si existe. Solo se pueden cancelar préstamos solicitados.'
          : 'La reserva dejará de comprometer disponibilidad en esa sede. Solo se pueden cancelar reservas activas.'}
      </p>
    </Modal>
  )
}
