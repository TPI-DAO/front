import { zodResolver } from '@hookform/resolvers/zod'
import { Library } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '@/features/auth/useAuth'
import { mensajeDeError } from '@/lib/errors'

const loginSchema = z.object({
  username: z.string().min(1, 'Ingresá tu usuario'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)
    try {
      await login(values.username, values.password)
      navigate('/', { replace: true })
    } catch (error) {
      setServerError(mensajeDeError(error))
    }
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Library size={22} />
          </span>
          <h1 className="text-xl font-semibold text-slate-900">Biblioteca</h1>
          <p className="mt-1 text-sm text-slate-500">Préstamos interbibliotecarios</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              {...register('username')}
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
            )}
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-400">Usuario inicial: admin / admin1234</p>
      </div>
    </div>
  )
}
