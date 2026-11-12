import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarClock,
  ClipboardList,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'

interface QuickLink {
  to: string
  label: string
  description: string
  icon: LucideIcon
}

const adminLinks: QuickLink[] = [
  {
    to: '/admin/prestamos',
    label: 'Préstamos',
    description: 'Registrar y consultar préstamos interbibliotecarios.',
    icon: ClipboardList,
  },
  {
    to: '/admin/usuarios',
    label: 'Usuarios',
    description: 'Administrar cuentas, roles y accesos al sistema.',
    icon: UsersRound,
  },
  {
    to: '/admin/reportes',
    label: 'Reportes',
    description: 'Consultar los reportes operativos y estadísticos.',
    icon: BarChart3,
  },
]

const socioLinks: QuickLink[] = [
  {
    to: '/catalogo',
    label: 'Catálogo',
    description: 'Buscar libros y consultar su disponibilidad.',
    icon: BookOpen,
  },
  {
    to: '/mis-prestamos',
    label: 'Mis préstamos',
    description: 'Ver el estado de tus préstamos activos e históricos.',
    icon: ClipboardList,
  },
  {
    to: '/mis-reservas',
    label: 'Mis reservas',
    description: 'Consultar y gestionar tus reservas de ejemplares.',
    icon: CalendarClock,
  },
]

export function DashboardPage() {
  const { usuario } = useAuth()
  const links = usuario?.rol === 'ADMIN' ? adminLinks : socioLinks

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Hola, {usuario?.username ?? 'usuario'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {usuario?.rol === 'ADMIN'
            ? 'Panel de administración del sistema de préstamos.'
            : 'Panel personal del socio de la biblioteca.'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-200 hover:shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <link.icon size={20} />
              </span>
              <ArrowRight
                size={16}
                className="text-slate-300 transition-colors group-hover:text-indigo-500"
              />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">{link.label}</h2>
            <p className="mt-1 text-sm text-slate-500">{link.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
