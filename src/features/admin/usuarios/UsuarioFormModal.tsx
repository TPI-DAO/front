import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { crearUsuario } from '@/api/usuarios'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { mensajeDeError } from '@/lib/errors'
import { fieldClass } from '@/lib/formStyles'
import { queryKeys } from '@/lib/queryKeys'
import type { Socio } from '@/types/api'

const usuarioSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Mínimo 3 caracteres')
      .max(50, 'Máximo 50 caracteres')
      .regex(/^[A-Za-z0-9._-]+$/, 'Solo letras, números, puntos, guiones y guiones bajos'),
    email: z.string().trim().email('Ingresá un correo válido').max(255, 'Máximo 255 caracteres'),
    password: z.string().min(8, 'Mínimo 8 caracteres').max(128, 'Máximo 128 caracteres'),
    rol: z.enum(['ADMIN', 'SOCIO']),
    socio_id: z.number().int(),
  })
  .superRefine((values, ctx) => {
    if (values.rol === 'SOCIO' && values.socio_id <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['socio_id'],
        message: 'Seleccioná el socio asociado',
      })
    }
  })

type UsuarioFormValues = z.infer<typeof usuarioSchema>

export function UsuarioFormModal({
  socios,
  onCerrar,
  onSaved,
}: {
  socios: Socio[]
  onCerrar: () => void
  onSaved: (mensaje: string) => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      rol: 'SOCIO',
      socio_id: 0,
    },
  })

  const rol = useWatch({ control, name: 'rol' })

  const mutation = useMutation({
    mutationFn: (values: UsuarioFormValues) =>
      crearUsuario({
        username: values.username,
        email: values.email,
        password: values.password,
        rol: values.rol,
        socio_id: values.rol === 'SOCIO' ? values.socio_id : null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.usuarios })
      onSaved('Usuario creado correctamente.')
    },
  })

  const onSubmit = handleSubmit((values) => mutation.mutate(values))

  return (
    <Modal
      abierto
      titulo="Nuevo usuario"
      descripcion="Creá una cuenta de acceso y asignale un rol."
      onCerrar={onCerrar}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {mutation.isError && <Alert tone="error">{mensajeDeError(mutation.error)}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Usuario" htmlFor="usuario-username" error={errors.username?.message}>
            <input
              id="usuario-username"
              {...register('username')}
              className={fieldClass}
              autoFocus
              autoComplete="off"
              aria-invalid={Boolean(errors.username)}
            />
          </FormField>

          <FormField label="Correo" htmlFor="usuario-email" error={errors.email?.message}>
            <input
              id="usuario-email"
              type="email"
              {...register('email')}
              className={fieldClass}
              autoComplete="off"
              aria-invalid={Boolean(errors.email)}
            />
          </FormField>
        </div>

        <FormField
          label="Contraseña"
          htmlFor="usuario-password"
          hint="Mínimo 8 caracteres."
          error={errors.password?.message}
        >
          <input
            id="usuario-password"
            type="password"
            {...register('password')}
            className={fieldClass}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
          />
        </FormField>

        <FormField label="Rol" htmlFor="usuario-rol" error={errors.rol?.message}>
          <select
            id="usuario-rol"
            {...register('rol')}
            className={fieldClass}
            aria-invalid={Boolean(errors.rol)}
          >
            <option value="SOCIO">Socio</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </FormField>

        {rol === 'SOCIO' && (
          <FormField
            label="Socio asociado"
            htmlFor="usuario-socio"
            hint={
              socios.length === 0
                ? 'Todos los socios ya tienen una cuenta asociada.'
                : 'Cada socio puede tener una sola cuenta.'
            }
            error={errors.socio_id?.message}
          >
            <select
              id="usuario-socio"
              {...register('socio_id', { valueAsNumber: true })}
              className={fieldClass}
              aria-invalid={Boolean(errors.socio_id)}
            >
              <option value={0}>Seleccioná un socio</option>
              {socios.map((socio) => (
                <option key={socio.id} value={socio.id}>
                  {socio.apellido}, {socio.nombre} (DNI {socio.dni})
                  {socio.estado === 'INHABILITADO' ? ' — inhabilitado' : ''}
                </option>
              ))}
            </select>
          </FormField>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onCerrar} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creando…' : 'Crear usuario'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
