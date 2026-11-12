import type { ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

export function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  tono = 'primary',
  cargando = false,
  onConfirmar,
  onCerrar,
}: {
  abierto: boolean
  titulo: string
  mensaje: ReactNode
  textoConfirmar?: string
  tono?: 'primary' | 'danger'
  cargando?: boolean
  onConfirmar: () => void
  onCerrar: () => void
}) {
  return (
    <Modal
      abierto={abierto}
      titulo={titulo}
      onCerrar={onCerrar}
      tamano="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCerrar} disabled={cargando}>
            Cancelar
          </Button>
          <Button variant={tono} onClick={onConfirmar} disabled={cargando}>
            {cargando ? 'Procesando…' : textoConfirmar}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">{mensaje}</p>
    </Modal>
  )
}
