import { X } from 'lucide-react'
import { useEffect, useEffectEvent, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

const sizeClass: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({
  abierto,
  titulo,
  descripcion,
  onCerrar,
  children,
  footer,
  tamano = 'md',
  bloqueado = false,
}: {
  abierto: boolean
  titulo: string
  descripcion?: string
  onCerrar: () => void
  children: ReactNode
  footer?: ReactNode
  tamano?: ModalSize
  bloqueado?: boolean
}) {
  const tituloId = useId()
  const descripcionId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const cerrarDesdeTeclado = useEffectEvent(() => {
    if (!bloqueado) onCerrar()
  })

  useEffect(() => {
    if (!abierto) return

    const focoAnterior = document.activeElement
    const panel = panelRef.current
    const elementosEnfocables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
        ) ?? [],
      ).filter((elemento) => elemento.getClientRects().length > 0)

    const alPresionar = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        cerrarDesdeTeclado()
      }
      if (event.key !== 'Tab') return

      const elementos = elementosEnfocables()
      const primero = elementos[0]
      const ultimo = elementos[elementos.length - 1]
      if (!primero || !ultimo) {
        event.preventDefault()
        panel?.focus()
      } else if (
        event.shiftKey &&
        (document.activeElement === primero || document.activeElement === panel)
      ) {
        event.preventDefault()
        ultimo.focus()
      } else if (
        !event.shiftKey &&
        (document.activeElement === ultimo || document.activeElement === panel)
      ) {
        event.preventDefault()
        primero.focus()
      }
    }

    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', alPresionar)
    if (!panel?.contains(document.activeElement)) panel?.focus()

    return () => {
      document.body.style.overflow = overflowAnterior
      document.removeEventListener('keydown', alPresionar)
      if (focoAnterior instanceof HTMLElement && focoAnterior.isConnected) focoAnterior.focus()
    }
  }, [abierto])

  if (!abierto) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (!bloqueado && event.target === event.currentTarget) onCerrar()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={descripcion ? descripcionId : undefined}
        tabIndex={-1}
        className={`my-8 w-full rounded-xl bg-white shadow-xl outline-none ${sizeClass[tamano]}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id={tituloId} className="text-base font-semibold text-slate-900">
              {titulo}
            </h2>
            {descripcion && (
              <p id={descripcionId} className="mt-1 text-sm text-slate-500">
                {descripcion}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={bloqueado}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">{children}</div>

        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
