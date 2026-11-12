import type { EstadoPrestamo, EstadoReserva } from '@/types/api'

export const ESTADOS_PRESTAMO: EstadoPrestamo[] = [
  'SOLICITADO',
  'EN_TRANSITO',
  'ACTIVO',
  'VENCIDO',
  'DEVUELTO',
  'CANCELADO',
]

export const ESTADOS_RESERVA: EstadoReserva[] = ['ACTIVA', 'CUMPLIDA', 'CANCELADA']

const ETIQUETAS: Record<string, string> = {
  ACTIVA: 'Activa',
  ACTIVO: 'Activo',
  BAJA: 'Baja',
  CANCELADA: 'Cancelada',
  CANCELADO: 'Cancelado',
  CUMPLIDA: 'Cumplida',
  DANADO: 'Dañado',
  DESPACHADO: 'Despachado',
  DESTRUIDO: 'Destruido',
  DEVUELTO: 'Devuelto',
  DISPONIBLE: 'Disponible',
  EMPAQUETADO: 'Empaquetado',
  EN_TRANSITO: 'En tránsito',
  ENVIO: 'Envío',
  EXTRAVIADO: 'Extraviado',
  HABILITADO: 'Habilitado',
  INCIDENCIA: 'Incidencia',
  INHABILITADO: 'Inhabilitado',
  PENDIENTE_RETORNO: 'Pendiente de retorno',
  PRESTADO: 'Prestado',
  RECIBIDO: 'Recibido',
  RESERVADO: 'Reservado',
  RETORNO: 'Retorno',
  SOLICITADO: 'Solicitado',
  VENCIDO: 'Vencido',
}

export function etiquetaEstado(estado: string): string {
  return ETIQUETAS[estado] ?? estado.replaceAll('_', ' ')
}
