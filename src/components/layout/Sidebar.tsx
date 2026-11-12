import {
  BarChart3,
  BookOpen,
  BookPlus,
  Building2,
  CalendarClock,
  ClipboardList,
  FileText,
  Home,
  Library,
  RotateCcw,
  Search,
  UserCog,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const generalItems: NavItem[] = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/catalogo', label: 'Catálogo', icon: BookOpen },
  { to: '/disponibilidad', label: 'Disponibilidad', icon: Search },
  { to: '/perfil', label: 'Mi perfil', icon: UserRound },
]

const socioItems: NavItem[] = [
  { to: '/mis-prestamos', label: 'Mis préstamos', icon: ClipboardList },
  { to: '/mis-reservas', label: 'Mis reservas', icon: CalendarClock },
]

const adminItems: NavItem[] = [
  { to: '/admin/sedes', label: 'Sedes', icon: Building2 },
  { to: '/admin/socios', label: 'Socios', icon: Users },
  { to: '/admin/libros', label: 'Libros', icon: BookPlus },
  { to: '/admin/ejemplares', label: 'Ejemplares', icon: Library },
  { to: '/admin/prestamos', label: 'Préstamos', icon: ClipboardList },
  { to: '/admin/reservas', label: 'Reservas', icon: CalendarClock },
  { to: '/admin/remitos', label: 'Remitos', icon: FileText },
  { to: '/admin/devoluciones', label: 'Devoluciones', icon: RotateCcw },
  { to: '/admin/reportes', label: 'Reportes', icon: BarChart3 },
  { to: '/admin/usuarios', label: 'Usuarios', icon: UserCog },
]

function NavGroup({
  title,
  items,
  onNavigate,
}: {
  title?: string
  items: NavItem[]
  onNavigate?: () => void
}) {
  return (
    <div>
      {title && (
        <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {title}
        </p>
      )}
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Sidebar({ abierta, onCerrar }: { abierta: boolean; onCerrar: () => void }) {
  const { usuario } = useAuth()

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 transition-opacity md:hidden ${
          abierta ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onCerrar}
        aria-hidden="true"
      />

      <aside
        aria-label="Navegación principal"
        className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform md:static md:translate-x-0 ${
          abierta ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center border-b border-slate-200">
          <Link to="/" onClick={onCerrar} className="flex flex-1 items-center gap-2.5 px-5 py-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Library size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-slate-900">Biblioteca</span>
              <span className="block text-xs text-slate-500">Interbibliotecario</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onCerrar}
            className="mr-3 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto p-4">
          <NavGroup items={generalItems} onNavigate={onCerrar} />
          {usuario?.rol === 'SOCIO' && (
            <NavGroup title="Mi cuenta" items={socioItems} onNavigate={onCerrar} />
          )}
          {usuario?.rol === 'ADMIN' && (
            <NavGroup title="Administración" items={adminItems} onNavigate={onCerrar} />
          )}
        </nav>
      </aside>
    </>
  )
}
