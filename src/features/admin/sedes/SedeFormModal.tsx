import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { actualizarSede, crearSede } from '@/api/sedes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { mensajeDeError } from '@/lib/errors'
import { fieldClass } from '@/lib/formStyles'
import { queryKeys } from '@/lib/queryKeys'
import type { Sede } from '@/types/api'

const sedeSchema = z.object({
  nombre: z.string().trim().min(1, 'Ingresá el nombre').max(255, 'Máximo 255 caracteres'),
  direccion: z.string().trim().min(1, 'Ingresá la dirección').max(255, 'Máximo 255 caracteres'),
  correo: z
    .string()
    .trim()
    .max(255, 'Máximo 255 caracteres')
    .refine(
      (valor) => valor === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor),
      'Ingresá un correo válido',
    ),
  telefono: z.string().trim().max(255, 'Máximo 255 caracteres'),
  horarios: z.string().trim().max(255, 'Máximo 255 caracteres'),
})

type SedeFormValues = z.infer<typeof sedeSchema>

export function SedeFormModal({
  sede,
  onCerrar,
  onSaved,
}: {
  sede?: Sede
  onCerrar: () => void
  onSaved: (mensaje: string) => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SedeFormValues>({
    resolver: zodResolver(sedeSchema),
    defaultValues: {
      nombre: sede?.nombre ?? '',
      direccion: sede?.direccion ?? '',
      correo: sede?.correo ?? '',
      telefono: sede?.telefono ?? '',
      horarios: sede?.horarios ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: (values: SedeFormValues) => {
      const payload = {
        nombre: values.nombre,
        direccion: values.direccion,
        correo: values.correo || null,
        telefono: values.telefono || null,
        horarios: values.horarios || null,
      }
      return sede ? actualizarSede(sede.id, payload) : crearSede(payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.sedes })
      void queryClient.invalidateQueries({ queryKey: queryKeys.disponibilidad })
      onSaved(sede ? 'Sede actualizada correctamente.' : 'Sede creada correctamente.')
    },
  })

  const onSubmit = handleSubmit((values) => mutation.mutate(values))

  return (
    <Modal
      abierto
      titulo={sede ? 'Editar sede' : 'Nueva sede'}
      descripcion={
        sede
          ? 'Actualizá los datos de contacto y horarios de la sede.'
          : 'Registrá una nueva sede de la red.'
      }
      onCerrar={onCerrar}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {mutation.isError && <Alert tone="error">{mensajeDeError(mutation.error)}</Alert>}

        <FormField label="Nombre" htmlFor="sede-nombre" error={errors.nombre?.message}>
          <input
            id="sede-nombre"
            {...register('nombre')}
            className={fieldClass}
            autoFocus
            aria-invalid={Boolean(errors.nombre)}
          />
        </FormField>

        <FormField label="Dirección" htmlFor="sede-direccion" error={errors.direccion?.message}>
          <input
            id="sede-direccion"
            {...register('direccion')}
            className={fieldClass}
            aria-invalid={Boolean(errors.direccion)}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Correo" htmlFor="sede-correo" error={errors.correo?.message}>
            <input
              id="sede-correo"
              type="email"
              {...register('correo')}
              className={fieldClass}
              aria-invalid={Boolean(errors.correo)}
            />
          </FormField>

          <FormField label="Teléfono" htmlFor="sede-telefono" error={errors.telefono?.message}>
            <input
              id="sede-telefono"
              type="tel"
              {...register('telefono')}
              className={fieldClass}
              aria-invalid={Boolean(errors.telefono)}
            />
          </FormField>
        </div>

        <FormField
          label="Horarios"
          htmlFor="sede-horarios"
          hint="Ej.: lunes a viernes de 9 a 18 h."
          error={errors.horarios?.message}
        >
          <input
            id="sede-horarios"
            {...register('horarios')}
            className={fieldClass}
            aria-invalid={Boolean(errors.horarios)}
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onCerrar} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando…' : sede ? 'Guardar cambios' : 'Crear sede'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
