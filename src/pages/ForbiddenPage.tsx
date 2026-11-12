import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
        <ShieldAlert size={28} />
      </span>
      <h1 className="text-2xl font-semibold text-slate-900">Acceso denegado</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Tu usuario no tiene permisos para acceder a esta sección.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
