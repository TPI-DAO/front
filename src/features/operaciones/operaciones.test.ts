import { QueryClient } from '@tanstack/react-query'
import { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { api } from '@/api/client'
import { registrarDevolucion } from '@/api/devoluciones'
import { recibirRemito } from '@/api/remitos'
import { mensajeDeError } from '@/lib/errors'
import { ESTADOS_PRESTAMO } from '@/lib/estados'
import { queryKeys } from '@/lib/queryKeys'
import type { Prestamo, Remito, Usuario } from '@/types/api'
import { invalidarOperaciones } from './invalidarOperaciones'
import { idPositivo, puedeDevolver, puedeGenerarRemito } from './reglas'
import { registrarSolicitud, type SolicitudValues } from './solicitudes'

const socio: Usuario = {
  id: 7,
  username: 'lector',
  email: 'lector@example.com',
  rol: 'SOCIO',
  socio_id: 18,
  activo: true,
  fecha_alta: '2026-01-01T12:00:00Z',
}
const values: SolicitudValues = { socio_id: 999, libro_id: 4, origen: 2, destino: 2 }
const prestamo: Prestamo = {
  id: 21,
  socio_id: 18,
  libro_id: 4,
  ejemplar_id: 9,
  sede_origen_id: 2,
  sede_destino_id: 3,
  interbibliotecario: true,
  estado: 'SOLICITADO',
  fecha_solicitud: '2026-01-01T12:00:00Z',
  fecha_prestamo: null,
  fecha_vencimiento: null,
  fecha_devolucion: null,
}
const remito: Remito = {
  id: 30,
  numero: 'REM-000030',
  tipo: 'ENVIO',
  prestamo_id: 21,
  ejemplar_id: 9,
  sede_origen_id: 2,
  sede_destino_id: 3,
  estado: 'EMPAQUETADO',
  fecha_empaquetado: '2026-01-01T12:00:00Z',
  fecha_salida: null,
  fecha_llegada: null,
  estado_fisico_recepcion: null,
}

describe('Solicitudes y transporte sin servidor', () => {
  const adapterOriginal = api.defaults.adapter
  let solicitudes: InternalAxiosRequestConfig[]
  beforeEach(() => {
    solicitudes = []
    api.defaults.adapter = async (config) => {
      solicitudes.push(config)
      return { data: { id: 21 }, status: 201, statusText: 'Created', headers: {}, config }
    }
  })
  afterEach(() => {
    api.defaults.adapter = adapterOriginal
  })
  const body = () => JSON.parse(String(solicitudes[0].data)) as Record<string, unknown>

  it('ignora un socio manipulado en el formulario de un lector y conserva el préstamo local', async () => {
    await registrarSolicitud('prestamo', socio, values)
    expect(solicitudes[0].url).toBe('/prestamos')
    expect(body()).toEqual({ socio_id: 18, libro_id: 4, sede_origen_id: 2, sede_destino_id: 2 })
  })
  it('conserva sedes distintas al solicitar un préstamo interbibliotecario', async () => {
    await registrarSolicitud('prestamo', socio, { ...values, destino: 3 })
    expect(body()).toMatchObject({ sede_origen_id: 2, sede_destino_id: 3 })
  })
  it('permite al administrador seleccionar al socio de la operación', async () => {
    await registrarSolicitud('prestamo', { ...socio, rol: 'ADMIN', socio_id: null }, values)
    expect(body().socio_id).toBe(999)
  })
  it('la reserva usa una sola sede y no exige destino de préstamo', async () => {
    await registrarSolicitud('reserva', socio, { ...values, destino: 0 })
    expect(solicitudes[0].url).toBe('/reservas')
    expect(body()).toEqual({ socio_id: 18, libro_id: 4, sede_id: 2 })
  })
  it.each([
    ['sesión ausente', null, values],
    ['cuenta sin socio', { ...socio, socio_id: null }, values],
    ['libro no seleccionado', socio, { ...values, libro_id: 0 }],
    ['sede no seleccionada', socio, { ...values, origen: 0 }],
    ['destino no seleccionado', socio, { ...values, destino: 0 }],
    ['ID fraccionario', socio, { ...values, origen: 2.5 }],
  ] as const)('no envía solicitudes inválidas: %s', async (_caso, usuario, entrada) => {
    await expect(registrarSolicitud('prestamo', usuario, entrada)).rejects.toThrow()
    expect(solicitudes).toHaveLength(0)
  })
  it('no oculta una regla de negocio rechazada por la API', async () => {
    api.defaults.adapter = async (config) => {
      throw new AxiosError('Conflict', 'ERR_BAD_REQUEST', config, undefined, {
        data: { detail: 'El socio ya tiene una reserva activa de ese libro en esa sede.' },
        status: 409,
        statusText: 'Conflict',
        headers: {},
        config,
      })
    }
    const error = await registrarSolicitud('reserva', socio, values).catch((e: unknown) => e)
    expect(mensajeDeError(error)).toBe(
      'El socio ya tiene una reserva activa de ese libro en esa sede.',
    )
  })
  it('recepción y devolución conservan el estado físico y la observación', async () => {
    await recibirRemito(30, { estado_fisico: 'DANADO', observacion: 'Tapa dañada' })
    await registrarDevolucion(21, {
      estado_fisico: 'EXTRAVIADO',
      observacion: 'Material no recuperado',
    })
    expect(solicitudes.map((s) => s.url)).toEqual(['/remitos/30/recibir', '/devoluciones'])
    expect(body()).toEqual({ estado_fisico: 'DANADO', observacion: 'Tapa dañada' })
    expect(JSON.parse(String(solicitudes[1].data))).toEqual({
      prestamo_id: 21,
      estado_fisico: 'EXTRAVIADO',
      observacion: 'Material no recuperado',
    })
  })
})

describe('Acciones permitidas según el ciclo de vida', () => {
  it.each(ESTADOS_PRESTAMO)('devolución de préstamo %s', (estado) => {
    expect(puedeDevolver({ ...prestamo, estado })).toBe(['ACTIVO', 'VENCIDO'].includes(estado))
  })
  it('no permite empaquetar un préstamo local ni uno ya despachado', () => {
    expect(puedeGenerarRemito({ ...prestamo, interbibliotecario: false })).toBe(false)
    expect(puedeGenerarRemito({ ...prestamo, estado: 'EN_TRANSITO' })).toBe(false)
  })
  it('evita duplicar un envío vigente, pero no confunde un retorno con un envío', () => {
    expect(puedeGenerarRemito(prestamo, [remito])).toBe(false)
    expect(puedeGenerarRemito(prestamo, [{ ...remito, tipo: 'RETORNO' }])).toBe(true)
    expect(puedeGenerarRemito(prestamo, [{ ...remito, estado: 'CANCELADO' }])).toBe(true)
    expect(puedeGenerarRemito(prestamo, [{ ...remito, prestamo_id: 22 }])).toBe(true)
  })
  it.each([null, '', '0', '-1', '2.5', 'NaN', 'Infinity', '9007199254740992'])(
    'rechaza ID de URL inválido: %s',
    (id) => {
      expect(idPositivo(id)).toBeUndefined()
    },
  )
})

it('una transición invalida listas filtradas y trazabilidad, conservando el catálogo bibliográfico', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } })
  const relacionadas = [
    queryKeys.prestamosLista({ estado: 'ACTIVO' }),
    queryKeys.reservasLista({ sede_id: 2 }),
    queryKeys.remitosLista({ tipo: 'RETORNO' }),
    queryKeys.trazabilidad(30),
    queryKeys.trazabilidad('REM-000030'),
    queryKeys.devolucionesLista(),
    queryKeys.ejemplaresLista({ libro_id: 4 }),
    queryKeys.disponibilidadLista({ libro_id: 4 }),
    [...queryKeys.reportes, 'multas'],
  ]
  for (const key of [...relacionadas, queryKeys.libro(4), queryKeys.sedes])
    client.setQueryData(key, { id: 1 })
  await invalidarOperaciones(client)
  for (const key of relacionadas) expect(client.getQueryState(key)?.isInvalidated).toBe(true)
  expect(client.getQueryState(queryKeys.libro(4))?.isInvalidated).toBe(false)
  expect(client.getQueryState(queryKeys.sedes)?.isInvalidated).toBe(false)
  client.clear()
})
