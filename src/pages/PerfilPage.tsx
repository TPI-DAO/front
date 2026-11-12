import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { KeyRound, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { cambiarPassword } from '@/api/auth'
import { obtenerMiSocio } from '@/api/socios'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { ErrorState, LoadingState } from '@/components/ui/States'
import { useAuth } from '@/features/auth/useAuth'
import { mensajeDeError } from '@/lib/errors'
import { fieldClass } from '@/lib/formStyles'
import { formatearFecha } from '@/lib/format'

const passwordSchema = z
  .object({
    password_actual: z.string().min(1, 'Ingresá tu contraseña actual'),
    password_nueva: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
    confirmar: z.string().min(1, 'Repetí la nueva contraseña'),
  })
  .refine((data) => data.password_nueva === data.confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar'],
  })

type PasswordValues = z.infer<typeof passwordSchema>

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-slate-400 uppercase">{etiqueta}</dt>
      <dd className="mt-1 text-sm text-slate-800">{valor}</dd>
    </div>
  )
}

function PasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [exito, setExito] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password_actual: '', password_nueva: '', confirmar: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    setExito(false)
    try {
      await cambiarPassword(values.password_actual, values.password_nueva)
      reset()
      setExito(true)
    } catch (error) {
      setServerError(mensajeDeError(error))
    }
  })

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="password_actual" className="mb-1 block text-sm font-medium text-slate-700">
          Contraseña actual
        </label>
        <input
          id="password_actual"
          type="password"
          autoComplete="current-password"
          className={fieldClass}
          {...register('password_actual')}
        />
        {errors.password_actual && (
          <p className="mt-1 text-xs text-red-600">{errors.password_actual.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password_nueva" className="mb-1 block text-sm font-medium text-slate-700">
          Nueva contraseña
        </label>
        <input
          id="password_nueva"
          type="password"
          autoComplete="new-password"
          className={fieldClass}
          {...register('password_nueva')}
        />
        {errors.password_nueva && (
          <p className="mt-1 text-xs text-red-600">{errors.password_nueva.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmar" className="mb-1 block text-sm font-medium text-slate-700">
          Repetir nueva contraseña
        </label>
        <input
          id="confirmar"
          type="password"
          autoComplete="new-password"
          className={fieldClass}
          {...register('confirmar')}
        />
        {errors.confirmar && (
          <p className="mt-1 text-xs text-red-600">{errors.confirmar.message}</p>
        )}
      </div>

      {serverError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
      )}
      {exito && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Contraseña actualizada correctamente.
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Guardando…' : 'Cambiar contraseña'}
      </Button>
    </form>
  )
}

export function PerfilPage() {
  const { usuario } = useAuth()
  const esSocio = usuario?.rol === 'SOCIO'

  const socioQuery = useQuery({
    queryKey: ['socio', 'me'],
    queryFn: obtenerMiSocio,
    enabled: esSocio,
  })

  return (
    <div>
      <PageHeader
        title="Mi perfil"
        description="Consultá los datos de tu cuenta y actualizá tu contraseña."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <UserRound size={20} />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Cuenta</h2>
                <p className="text-xs text-slate-500">Datos de acceso al sistema</p>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <Dato etiqueta="Usuario" valor={usuario?.username ?? '—'} />
              <Dato etiqueta="Email" valor={usuario?.email ?? '—'} />
              <Dato etiqueta="Rol" valor={usuario?.rol ?? '—'} />
              <Dato etiqueta="Alta" valor={formatearFecha(usuario?.fecha_alta)} />
            </dl>

            <div className="mt-4">
              <Badge tone={usuario?.activo ? 'success' : 'danger'}>
                {usuario?.activo ? 'Cuenta activa' : 'Cuenta inactiva'}
              </Badge>
            </div>
          </section>

          {esSocio && (
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <UserRound size={20} />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Datos de socio</h2>
                  <p className="text-xs text-slate-500">Información registrada en la biblioteca</p>
                </div>
              </div>

              {socioQuery.isLoading && <LoadingState mensaje="Cargando datos del socio…" />}
              {socioQuery.isError && <ErrorState mensaje={mensajeDeError(socioQuery.error)} />}
              {socioQuery.data && (
                <>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <Dato
                      etiqueta="Nombre completo"
                      valor={`${socioQuery.data.nombre} ${socioQuery.data.apellido}`}
                    />
                    <Dato etiqueta="DNI" valor={socioQuery.data.dni} />
                    <Dato etiqueta="Teléfono" valor={socioQuery.data.telefono ?? '—'} />
                    <Dato etiqueta="Alta" valor={formatearFecha(socioQuery.data.fecha_alta)} />
                  </dl>
                  <div className="mt-4">
                    <Badge tone={socioQuery.data.estado === 'HABILITADO' ? 'success' : 'danger'}>
                      {socioQuery.data.estado}
                    </Badge>
                  </div>
                </>
              )}
            </section>
          )}
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <KeyRound size={20} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Seguridad</h2>
              <p className="text-xs text-slate-500">Cambiá tu contraseña de acceso</p>
            </div>
          </div>

          <PasswordForm />
        </section>
      </div>
    </div>
  )
}
