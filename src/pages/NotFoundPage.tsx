import { SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <SearchX size={28} />
      </span>
      <h1 className="text-2xl font-semibold text-slate-900">Página no encontrada</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        La dirección que ingresaste no existe o fue movida.
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
