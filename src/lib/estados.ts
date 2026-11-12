import type {
  EstadoEjemplar,
  EstadoPrestamo,
  EstadoReserva,
  EstadoSede,
  EstadoSocio,
} from '@/types/api'

export const ESTADOS_SEDE: EstadoSede[] = ['ACTIVA', 'BAJA']

export const ESTADOS_SOCIO: EstadoSocio[] = ['HABILITADO', 'INHABILITADO']

export const ESTADOS_EJEMPLAR: EstadoEjemplar[] = [
  'DISPONIBLE',
  'RESERVADO',
  'PRESTADO',
  'EN_TRANSITO',
  'PENDIENTE_RETORNO',
  'DANADO',
  'EXTRAVIADO',
  'DESTRUIDO',
  'BAJA',
]

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
  BUENO: 'Bueno',
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
  INACTIVO: 'Inactivo',
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

export function etiquetaRol(rol: string): string {
  if (rol === 'ADMIN') return 'Administrador'
  if (rol === 'SOCIO') return 'Socio'
  return rol
}
