import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { actualizarSocio, crearSocio } from '@/api/socios'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { mensajeDeError } from '@/lib/errors'
import { fieldClass } from '@/lib/formStyles'
import { queryKeys } from '@/lib/queryKeys'
import type { Socio } from '@/types/api'

const socioSchema = z.object({
  dni: z
    .string()
    .trim()
    .min(6, 'El DNI debe tener al menos 6 caracteres')
    .max(20, 'Máximo 20 caracteres'),
  nombre: z.string().trim().min(1, 'Ingresá el nombre').max(255, 'Máximo 255 caracteres'),
  apellido: z.string().trim().min(1, 'Ingresá el apellido').max(255, 'Máximo 255 caracteres'),
  telefono: z.string().trim().max(255, 'Máximo 255 caracteres'),
})

type SocioFormValues = z.infer<typeof socioSchema>

export function SocioFormModal({
  socio,
  onCerrar,
  onSaved,
}: {
  socio?: Socio
  onCerrar: () => void
  onSaved: (mensaje: string) => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SocioFormValues>({
    resolver: zodResolver(socioSchema),
    defaultValues: {
      dni: socio?.dni ?? '',
      nombre: socio?.nombre ?? '',
      apellido: socio?.apellido ?? '',
      telefono: socio?.telefono ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: (values: SocioFormValues) => {
      const payload = {
        dni: values.dni,
        nombre: values.nombre,
        apellido: values.apellido,
        telefono: values.telefono || null,
      }
      return socio ? actualizarSocio(socio.id, payload) : crearSocio(payload)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.socios })
      onSaved(socio ? 'Socio actualizado correctamente.' : 'Socio registrado correctamente.')
    },
  })

  const onSubmit = handleSubmit((values) => mutation.mutate(values))

  return (
    <Modal
      abierto
      titulo={socio ? 'Editar socio' : 'Nuevo socio'}
      descripcion={
        socio ? 'Actualizá los datos personales del socio.' : 'Registrá un nuevo socio en la red.'
      }
      onCerrar={onCerrar}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {mutation.isError && <Alert tone="error">{mensajeDeError(mutation.error)}</Alert>}

        <FormField label="DNI" htmlFor="socio-dni" error={errors.dni?.message}>
          <input
            id="socio-dni"
            {...register('dni')}
            className={fieldClass}
            autoFocus
            aria-invalid={Boolean(errors.dni)}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Nombre" htmlFor="socio-nombre" error={errors.nombre?.message}>
            <input
              id="socio-nombre"
              {...register('nombre')}
              className={fieldClass}
              aria-invalid={Boolean(errors.nombre)}
            />
          </FormField>

          <FormField label="Apellido" htmlFor="socio-apellido" error={errors.apellido?.message}>
            <input
              id="socio-apellido"
              {...register('apellido')}
              className={fieldClass}
              aria-invalid={Boolean(errors.apellido)}
            />
          </FormField>
        </div>

        <FormField label="Teléfono" htmlFor="socio-telefono" error={errors.telefono?.message}>
          <input
            id="socio-telefono"
            type="tel"
            {...register('telefono')}
            className={fieldClass}
            aria-invalid={Boolean(errors.telefono)}
          />
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onCerrar} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando…' : socio ? 'Guardar cambios' : 'Registrar socio'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
