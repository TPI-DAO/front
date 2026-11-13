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
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

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
]

function NavGroup({ title, items }: { title?: string; items: NavItem[] }) {
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

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
      <Link to="/" className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <Library size={18} />
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-900">Biblioteca</span>
          <span className="block text-xs text-slate-500">Interbibliotecario</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        <NavGroup items={generalItems} />
        <NavGroup title="Operaciones" items={adminItems} />
      </nav>
    </aside>
  )
}
