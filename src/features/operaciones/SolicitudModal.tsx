import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { consultarDisponibilidad } from '@/api/disponibilidad'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { LoadingState } from '@/components/ui/States'
import { mensajeDeError } from '@/lib/errors'
import { fieldClass } from '@/lib/formStyles'
import { queryKeys } from '@/lib/queryKeys'
import type { Reserva } from '@/types/api'
import { registrarSolicitud, solicitudSchema, type SolicitudValues } from './solicitudes'
import { useDatosOperaciones } from './useDatosOperaciones'
import { useOperacionMutation } from './useOperacionMutation'

export function SolicitudModal({
  tipo,
  libroId,
  reservaInicial,
  onCerrar,
  onSaved,
}: {
  tipo: 'prestamo' | 'reserva'
  libroId?: number
  reservaInicial?: Reserva
  onCerrar: () => void
  onSaved: (mensaje: string) => void
}) {
  const datos = useDatosOperaciones()
  const esPrestamo = tipo === 'prestamo'
  const schema = solicitudSchema(tipo)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SolicitudValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      socio_id: datos.admin ? (reservaInicial?.socio_id ?? 0) : (datos.usuario?.socio_id ?? 0),
      libro_id: libroId ?? reservaInicial?.libro_id ?? 0,
      origen: reservaInicial?.sede_id ?? 0,
      destino: reservaInicial?.sede_id ?? 0,
    },
  })
  const libro = useWatch({ control, name: 'libro_id' })
  const origen = useWatch({ control, name: 'origen' })
  const destino = useWatch({ control, name: 'destino' })
  const disponibilidad = useQuery({
    queryKey: queryKeys.disponibilidadLista({ libro_id: libro }),
    queryFn: () => consultarDisponibilidad({ libro_id: libro }),
    enabled: libro > 0,
  })
  const mutation = useOperacionMutation(
    (values: SolicitudValues) => registrarSolicitud(tipo, datos.usuario, values),
    (resultado) =>
      onSaved(
        esPrestamo
          ? `Préstamo #${resultado.id} registrado.`
          : `Reserva #${resultado.id} registrada.`,
      ),
  )
  const fila = disponibilidad.data?.find((item) => item.sede_id === origen)
  const sedesActivas = datos.sedes.filter((sede) => sede.estado === 'ACTIVA')

  return (
    <Modal
      abierto
      titulo={esPrestamo ? 'Solicitar préstamo' : 'Nueva reserva'}
      onCerrar={onCerrar}
      bloqueado={mutation.isPending}
    >
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
        noValidate
      >
        {datos.isLoading && <LoadingState mensaje="Cargando libros, sedes y socios…" />}
        {datos.error && <Alert tone="error">{mensajeDeError(datos.error)}</Alert>}
        {mutation.isError && <Alert tone="error">{mensajeDeError(mutation.error)}</Alert>}
        {datos.admin && (
          <FormField label="Socio" htmlFor="solicitud-socio" error={errors.socio_id?.message}>
            <select
              id="solicitud-socio"
              className={fieldClass}
              {...register('socio_id', { valueAsNumber: true })}
              aria-invalid={!!errors.socio_id}
            >
              <option value={0}>Seleccioná un socio habilitado</option>
              {datos.socios
                .filter((socio) => socio.estado === 'HABILITADO')
                .map((socio) => (
                  <option key={socio.id} value={socio.id}>
                    {socio.apellido}, {socio.nombre} · DNI {socio.dni}
                  </option>
                ))}
            </select>
          </FormField>
        )}
        <FormField label="Libro" htmlFor="solicitud-libro" error={errors.libro_id?.message}>
          <select
            id="solicitud-libro"
            className={fieldClass}
            {...register('libro_id', { valueAsNumber: true })}
            aria-invalid={!!errors.libro_id}
          >
            <option value={0}>Seleccioná un libro</option>
            {datos.libros.map((item) => (
              <option key={item.id} value={item.id}>
                {item.titulo} · {item.isbn}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label={esPrestamo ? 'Sede de origen del ejemplar' : 'Sede de la reserva'}
          htmlFor="solicitud-origen"
          error={errors.origen?.message}
        >
          <select
            id="solicitud-origen"
            className={fieldClass}
            {...register('origen', { valueAsNumber: true })}
            aria-invalid={!!errors.origen}
          >
            <option value={0}>Seleccioná una sede activa</option>
            {sedesActivas.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre}
              </option>
            ))}
          </select>
        </FormField>
        {libro > 0 && disponibilidad.isLoading && (
          <p role="status" className="text-sm text-slate-500">
            Consultando disponibilidad…
          </p>
        )}
        {disponibilidad.isError && (
          <Alert tone="error">{mensajeDeError(disponibilidad.error)}</Alert>
        )}
        {origen > 0 && disponibilidad.isSuccess && (
          <p className="text-sm text-slate-600">
            Disponibles: {fila?.disponibles ?? 0} · Netos sin reservas:{' '}
            {fila?.disponibles_netos ?? 0}. El servidor valida tus reservas y el stock al confirmar.
          </p>
        )}
        {esPrestamo && (
          <FormField
            label="Sede de destino / retiro"
            htmlFor="solicitud-destino"
            error={errors.destino?.message}
          >
            <select
              id="solicitud-destino"
              className={fieldClass}
              {...register('destino', { valueAsNumber: true })}
              aria-invalid={!!errors.destino}
            >
              <option value={0}>Seleccioná una sede activa</option>
              {sedesActivas.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>
          </FormField>
        )}
        <Alert>
          {esPrestamo
            ? origen > 0 && destino === origen
              ? 'El préstamo local se activa al registrarse y comienza su plazo de devolución.'
              : 'El préstamo interbibliotecario queda solicitado hasta que el personal envíe y reciba el ejemplar.'
            : 'La reserva queda activa en la sede elegida; no inicia un préstamo automáticamente.'}
        </Alert>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCerrar} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending || datos.isLoading || !!datos.error}>
            {mutation.isPending ? 'Registrando…' : 'Confirmar solicitud'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
