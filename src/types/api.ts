export type Rol = 'ADMIN' | 'SOCIO'

export type EstadoSede = 'ACTIVA' | 'BAJA'

export type EstadoSocio = 'HABILITADO' | 'INHABILITADO'

export type EstadoPrestamo =
  'SOLICITADO' | 'EN_TRANSITO' | 'ACTIVO' | 'VENCIDO' | 'DEVUELTO' | 'CANCELADO'

export type EstadoReserva = 'ACTIVA' | 'CUMPLIDA' | 'CANCELADA'

export interface Usuario {
  id: number
  username: string
  email: string
  rol: Rol
  socio_id: number | null
  activo: boolean
  fecha_alta: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  username: string
  rol: Rol
  socio_id: number | null
  expira_en_minutos: number
}

export interface Genero {
  id: number
  nombre: string
}

export interface Autor {
  id: number
  nombre: string
}

export interface Editorial {
  id: number
  descripcion: string
}

export interface Libro {
  id: number
  titulo: string
  isbn: string
  genero: Genero
  autor: Autor
  editorial: Editorial
}

export interface Sede {
  id: number
  nombre: string
  direccion: string
  correo: string | null
  telefono: string | null
  horarios: string | null
  estado: EstadoSede
}

export interface Socio {
  id: number
  dni: string
  nombre: string
  apellido: string
  telefono: string | null
  estado: EstadoSocio
  fecha_alta: string
}

export interface DisponibilidadFila {
  libro_id: number
  titulo: string
  isbn: string
  sede_id: number
  sede: string
  total_ejemplares: number
  disponibles: number
  prestados: number
  en_transito: number
  reservas_activas: number
  disponibles_netos: number
}

export interface Prestamo {
  id: number
  socio_id: number
  libro_id: number
  ejemplar_id: number
  sede_origen_id: number
  sede_destino_id: number
  estado: EstadoPrestamo
  interbibliotecario: boolean
  fecha_solicitud: string
  fecha_prestamo: string | null
  fecha_vencimiento: string | null
  fecha_devolucion: string | null
}

export interface Reserva {
  id: number
  socio_id: number
  libro_id: number
  sede_id: number
  fecha: string
  estado: EstadoReserva
}
