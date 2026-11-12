import type { EstadoFisico, EstadoRemito, Prestamo, Remito } from '@/types/api'

export const ESTADOS_FISICOS: EstadoFisico[] = ['BUENO', 'DANADO', 'EXTRAVIADO', 'DESTRUIDO']
export const ESTADOS_REMITO: EstadoRemito[] = [
  'EMPAQUETADO',
  'DESPACHADO',
  'RECIBIDO',
  'INCIDENCIA',
  'CANCELADO',
]

export function puedeDevolver(prestamo: Prestamo): boolean {
  return prestamo.estado === 'ACTIVO' || prestamo.estado === 'VENCIDO'
}

export function puedeGenerarRemito(prestamo: Prestamo, remitos: readonly Remito[] = []): boolean {
  return (
    prestamo.interbibliotecario &&
    prestamo.estado === 'SOLICITADO' &&
    !remitos.some(
      (r) => r.prestamo_id === prestamo.id && r.tipo === 'ENVIO' && r.estado !== 'CANCELADO',
    )
  )
}

export function idPositivo(valor: string | null): number | undefined {
  if (!valor) return undefined
  const id = Number(valor)
  return Number.isSafeInteger(id) && id > 0 ? id : undefined
}

const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
export function formatearMulta(valor: string | number): string {
  const monto = Number(valor)
  return Number.isFinite(monto) ? moneda.format(monto) : '—'
}
