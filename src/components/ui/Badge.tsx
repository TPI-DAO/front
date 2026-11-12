import type { ReactNode } from 'react'
import { etiquetaEstado } from '@/lib/estados'

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const toneClasses: Record<BadgeTone, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  info: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

const estadoTones: Record<string, BadgeTone> = {
  BUENO: 'success',
  ACTIVO: 'success',
  ACTIVA: 'success',
  DISPONIBLE: 'success',
  HABILITADO: 'success',
  CUMPLIDA: 'success',
  DEVUELTO: 'neutral',
  CANCELADO: 'neutral',
  CANCELADA: 'neutral',
  BAJA: 'neutral',
  SOLICITADO: 'info',
  EMPAQUETADO: 'info',
  DESPACHADO: 'info',
  RECIBIDO: 'success',
  EN_TRANSITO: 'warning',
  PENDIENTE_RETORNO: 'warning',
  PRESTADO: 'info',
  RESERVADO: 'warning',
  VENCIDO: 'danger',
  INHABILITADO: 'danger',
  DANADO: 'danger',
  EXTRAVIADO: 'danger',
  DESTRUIDO: 'danger',
  INCIDENCIA: 'danger',
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}

export function EstadoBadge({ estado }: { estado: string }) {
  return <Badge tone={estadoTones[estado] ?? 'neutral'}>{etiquetaEstado(estado)}</Badge>
}
