import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { actualizarEjemplar, crearEjemplar } from '@/api/ejemplares'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { mensajeDeError } from '@/lib/errors'
import { fieldClass } from '@/lib/formStyles'
import { queryKeys } from '@/lib/queryKeys'
import type { Ejemplar, Libro, Sede } from '@/types/api'

const ejemplarSchema = z.object({
  libro_id: z.number().int().positive('Seleccioná un libro'),
  sede_id: z.number().int().positive('Seleccioná una sede'),
  codigo_inventario: z.string().trim().max(50, 'Máximo 50 caracteres'),
  estado: z.enum(['DISPONIBLE', 'DANADO']),
})

type EjemplarFormValues = z.infer<typeof ejemplarSchema>

export function EjemplarFormModal({
  ejemplar,
  libros,
  sedes,
  onCerrar,
  onSaved,
}: {
  ejemplar?: Ejemplar
  libros: Libro[]
  sedes: Sede[]
  onCerrar: () => void
  onSaved: (mensaje: string) => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EjemplarFormValues>({
    resolver: zodResolver(ejemplarSchema),
    defaultValues: {
      libro_id: ejemplar?.libro.id ?? 0,
      sede_id: ejemplar?.sede_id ?? 0,
      codigo_inventario: ejemplar?.codigo_inventario ?? '',
      estado: ejemplar?.estado === 'DANADO' ? 'DANADO' : 'DISPONIBLE',
    },
  })

  const mutation = useMutation({
    mutationFn: (values: EjemplarFormValues) => {
      if (ejemplar) {
        return actualizarEjemplar(ejemplar.id, {
          sede_id: values.sede_id !== ejemplar.sede_id ? values.sede_id : undefined,
          codigo_inventario: values.codigo_inventario || undefined,
          estado: values.estado,
        })
      }
      return crearEjemplar({
        libro_id: values.libro_id,
        sede_id: values.sede_id,
        codigo_inventario: values.codigo_inventario || null,
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ejemplares })
      void queryClient.invalidateQueries({ queryKey: queryKeys.disponibilidad })
      onSaved(
        ejemplar ? 'Ejemplar actualizado correctamente.' : 'Ejemplar registrado correctamente.',
      )
    },
  })

  const onSubmit = handleSubmit((values) => mutation.mutate(values))

  return (
    <Modal
      abierto
      titulo={ejemplar ? 'Editar ejemplar' : 'Nuevo ejemplar'}
      descripcion={
        ejemplar
          ? 'Actualizá la sede, el código o el estado físico del ejemplar.'
          : 'Registrá un ejemplar físico y asignalo a una sede.'
      }
      onCerrar={onCerrar}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {mutation.isError && <Alert tone="error">{mensajeDeError(mutation.error)}</Alert>}

        {ejemplar ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="text-xs font-medium text-slate-500">Libro</p>
            <p className="mt-0.5 text-sm font-medium text-slate-800">{ejemplar.libro.titulo}</p>
            <p className="text-xs text-slate-500">ISBN {ejemplar.libro.isbn}</p>
          </div>
        ) : (
          <FormField label="Libro" htmlFor="ejemplar-libro" error={errors.libro_id?.message}>
            <select
              id="ejemplar-libro"
              {...register('libro_id', { valueAsNumber: true })}
              className={fieldClass}
              autoFocus
              aria-invalid={Boolean(errors.libro_id)}
            >
              <option value={0}>Seleccioná un libro</option>
              {libros.map((libro) => (
                <option key={libro.id} value={libro.id}>
                  {libro.titulo} ({libro.isbn})
                </option>
              ))}
            </select>
          </FormField>
        )}

        <FormField label="Sede" htmlFor="ejemplar-sede" error={errors.sede_id?.message}>
          <select
            id="ejemplar-sede"
            {...register('sede_id', { valueAsNumber: true })}
            className={fieldClass}
            aria-invalid={Boolean(errors.sede_id)}
          >
            <option value={0}>Seleccioná una sede</option>
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre}
                {sede.estado === 'BAJA' ? ' (baja)' : ''}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Código de inventario"
          htmlFor="ejemplar-codigo"
          hint={
            ejemplar
              ? 'Dejalo vacío para conservar el código actual.'
              : 'Si lo dejás vacío, se genera automáticamente.'
          }
          error={errors.codigo_inventario?.message}
        >
          <input
            id="ejemplar-codigo"
            {...register('codigo_inventario')}
            className={fieldClass}
            aria-invalid={Boolean(errors.codigo_inventario)}
          />
        </FormField>

        {ejemplar && (
          <FormField label="Estado físico" htmlFor="ejemplar-estado" error={errors.estado?.message}>
            <select
              id="ejemplar-estado"
              {...register('estado')}
              className={fieldClass}
              aria-invalid={Boolean(errors.estado)}
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="DANADO">Dañado</option>
            </select>
          </FormField>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onCerrar} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending
              ? 'Guardando…'
              : ejemplar
                ? 'Guardar cambios'
                : 'Registrar ejemplar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
