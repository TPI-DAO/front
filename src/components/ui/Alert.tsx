import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import type { ReactNode } from 'react'

type AlertTone = 'success' | 'error' | 'info'

const toneClass: Record<AlertTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-700',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
}

const toneIcon = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} satisfies Record<AlertTone, typeof Info>

export function Alert({
  tone = 'info',
  children,
  onClose,
}: {
  tone?: AlertTone
  children: ReactNode
  onClose?: () => void
}) {
  const Icon = toneIcon[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`mb-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${toneClass[tone]}`}
    >
      <Icon size={17} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded p-0.5 transition-opacity hover:opacity-70"
          aria-label="Cerrar aviso"
        >
          <X size={15} />
        </button>
      )}
    </div>
  )
}
