import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'

export function Topbar() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-700">
          {usuario ? `Hola, ${usuario.username}` : 'Biblioteca'}
        </p>
        <p className="text-xs text-slate-400">Sistema de préstamos interbibliotecarios</p>
      </div>

      <div className="flex items-center gap-3">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
          {usuario?.rol}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut size={15} />
          Salir
        </button>
      </div>
    </header>
  )
}
