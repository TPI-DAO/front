import { z } from 'zod'
import { solicitarPrestamo } from '@/api/prestamos'
import { crearReserva } from '@/api/reservas'
import type { Usuario } from '@/types/api'

export type TipoSolicitud = 'prestamo' | 'reserva'

export function solicitudSchema(tipo: TipoSolicitud) {
  return z
    .object({
      socio_id: z.number().int().positive('Seleccioná un socio'),
      libro_id: z.number().int().positive('Seleccioná un libro'),
      origen: z.number().int().positive('Seleccioná una sede'),
      destino: z.number().int(),
    })
    .superRefine((values, ctx) => {
      if (tipo === 'prestamo' && values.destino <= 0)
        ctx.addIssue({
          code: 'custom',
          path: ['destino'],
          message: 'Seleccioná la sede de destino',
        })
    })
}

export type SolicitudValues = z.infer<ReturnType<typeof solicitudSchema>>

export async function registrarSolicitud(
  tipo: TipoSolicitud,
  usuario: Usuario | null,
  values: SolicitudValues,
) {
  // La selección del formulario solo identifica al socio en cuentas ADMIN.
  // La autorización definitiva y el estado del socio siempre los valida la API.
  const socio_id = usuario?.rol === 'ADMIN' ? values.socio_id : (usuario?.socio_id ?? 0)
  const datos = solicitudSchema(tipo).parse({ ...values, socio_id })
  return tipo === 'prestamo'
    ? solicitarPrestamo({
        socio_id,
        libro_id: datos.libro_id,
        sede_origen_id: datos.origen,
        sede_destino_id: datos.destino,
      })
    : crearReserva({ socio_id, libro_id: datos.libro_id, sede_id: datos.origen })
}
