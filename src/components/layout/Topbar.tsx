import { LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'

export function Topbar({ onAbrirMenu }: { onAbrirMenu: () => void }) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onAbrirMenu}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-700">
            {usuario ? `Hola, ${usuario.username}` : 'Biblioteca'}
          </p>
          <p className="hidden text-xs text-slate-400 sm:block">
            Sistema de préstamos interbibliotecarios
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 sm:inline">
          {usuario?.rol}
        </span>
        <Button variant="secondary" onClick={handleLogout}>
          <LogOut size={15} />
          Salir
        </Button>
      </div>
    </header>
  )
}
