import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { registrarDevolucion } from '@/api/devoluciones'
import { despacharRemito, generarRemito, recibirRemito } from '@/api/remitos'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { mensajeDeError } from '@/lib/errors'
import { etiquetaEstado } from '@/lib/estados'
import { fieldClass } from '@/lib/formStyles'
import type { Prestamo } from '@/types/api'
import { ESTADOS_FISICOS, formatearMulta } from './reglas'
import { useOperacionMutation } from './useOperacionMutation'

export type AccionMaterial = 'generar' | 'despachar' | 'recibir' | 'devolver'
const titulos: Record<AccionMaterial, string> = {
  generar: 'Empaquetar y generar remito',
  despachar: 'Despachar remito',
  recibir: 'Registrar recepción',
  devolver: 'Registrar devolución',
}
const schema = z.object({
  id: z.number().int().positive('Seleccioná un préstamo'),
  estado_fisico: z.enum(['BUENO', 'DANADO', 'EXTRAVIADO', 'DESTRUIDO']),
  observacion: z.string().trim().max(255, 'Máximo 255 caracteres'),
})
type Values = z.infer<typeof schema>

export function AccionMaterialModal({
  accion,
  id,
  descripcion,
  prestamos = [],
  titulosLibros,
  onCerrar,
  onSaved,
}: {
  accion: AccionMaterial
  id?: number
  descripcion?: string
  prestamos?: Prestamo[]
  titulosLibros?: Map<number, string>
  onCerrar: () => void
  onSaved: (mensaje: string, retornoId?: number | null) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { id: id ?? 0, estado_fisico: 'BUENO', observacion: '' },
  })
  const requiereFisico = accion === 'recibir' || accion === 'devolver'
  const mutation = useOperacionMutation(
    async (values: Values) => {
      const observacion = values.observacion || undefined
      switch (accion) {
        case 'generar':
          return generarRemito(values.id, observacion)
        case 'despachar':
          return despacharRemito(values.id, observacion)
        case 'recibir':
          return recibirRemito(values.id, { estado_fisico: values.estado_fisico, observacion })
        case 'devolver':
          return registrarDevolucion(values.id, {
            estado_fisico: values.estado_fisico,
            observacion,
          })
      }
    },
    (resultado) => {
      if ('multa' in resultado) {
        onSaved(
          `Devolución #${resultado.id} registrada. Atraso: ${resultado.dias_atraso} días. Multa: ${formatearMulta(resultado.multa)}.`,
          resultado.remito_retorno_id,
        )
      } else onSaved(`Remito ${resultado.numero}: ${etiquetaEstado(resultado.estado)}.`)
    },
  )

  return (
    <Modal
      abierto
      titulo={titulos[accion]}
      descripcion={descripcion}
      onCerrar={onCerrar}
      bloqueado={mutation.isPending}
    >
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
        noValidate
      >
        {mutation.isError && <Alert tone="error">{mensajeDeError(mutation.error)}</Alert>}
        {!id && (
          <FormField label="Préstamo" htmlFor="material-prestamo" error={errors.id?.message}>
            <select
              id="material-prestamo"
              className={fieldClass}
              {...register('id', { valueAsNumber: true })}
              aria-invalid={!!errors.id}
            >
              <option value={0}>Seleccioná un préstamo</option>
              {prestamos.map((prestamo) => (
                <option key={prestamo.id} value={prestamo.id}>
                  #{prestamo.id} ·{' '}
                  {titulosLibros?.get(prestamo.libro_id) ?? `Libro #${prestamo.libro_id}`} · Socio #
                  {prestamo.socio_id}
                </option>
              ))}
            </select>
            {prestamos.length === 0 && (
              <p className="mt-1 text-sm text-slate-500">
                No hay préstamos habilitados para esta operación.
              </p>
            )}
          </FormField>
        )}
        {requiereFisico && (
          <FormField
            label="Estado físico del material"
            htmlFor="material-fisico"
            error={errors.estado_fisico?.message}
          >
            <select id="material-fisico" className={fieldClass} {...register('estado_fisico')}>
              {ESTADOS_FISICOS.map((estado) => (
                <option key={estado} value={estado}>
                  {etiquetaEstado(estado)}
                </option>
              ))}
            </select>
          </FormField>
        )}
        <FormField
          label="Observación"
          htmlFor="material-observacion"
          error={errors.observacion?.message}
        >
          <textarea
            id="material-observacion"
            rows={3}
            maxLength={255}
            className={fieldClass}
            {...register('observacion')}
            aria-invalid={!!errors.observacion}
          />
        </FormField>
        {accion === 'devolver' && (
          <Alert>
            El servidor calcula los días de atraso y la multa. Si corresponde, genera
            automáticamente un remito de retorno a la sede de origen.
          </Alert>
        )}
        {accion === 'recibir' && (
          <Alert>
            La recepción registra el estado físico. En un envío, solo un ejemplar en buen estado
            activa el préstamo; los daños, extravíos o destrucción afectan su disponibilidad.
          </Alert>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onCerrar} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending || (!id && prestamos.length === 0)}>
            {mutation.isPending ? 'Procesando…' : 'Confirmar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
