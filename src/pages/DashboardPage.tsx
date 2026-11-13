import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  CalendarClock,
  ClipboardList,
  FileText,
  Library,
  RotateCcw,
  Search,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface QuickLink {
  to: string
  label: string
  description: string
  icon: LucideIcon
}

const links: QuickLink[] = [
  {
    to: '/admin/sedes',
    label: 'Sedes',
    description: 'Administrar sedes y su estado.',
    icon: Building2,
  },
  {
    to: '/admin/socios',
    label: 'Socios',
    description: 'Registrar socios y habilitaciones.',
    icon: Users,
  },
  {
    to: '/catalogo',
    label: 'Catálogo',
    description: 'Consultar libros y disponibilidad.',
    icon: BookOpen,
  },
  {
    to: '/admin/libros',
    label: 'Libros',
    description: 'Administrar catálogo bibliográfico.',
    icon: Library,
  },
  {
    to: '/admin/ejemplares',
    label: 'Ejemplares',
    description: 'Registrar ejemplares por sede.',
    icon: BookOpen,
  },
  {
    to: '/admin/prestamos',
    label: 'Préstamos',
    description: 'Registrar préstamos locales e interbibliotecarios.',
    icon: ClipboardList,
  },
  {
    to: '/admin/reservas',
    label: 'Reservas',
    description: 'Crear y cancelar reservas.',
    icon: CalendarClock,
  },
  {
    to: '/admin/remitos',
    label: 'Remitos',
    description: 'Empaquetar, despachar y recibir.',
    icon: FileText,
  },
  {
    to: '/admin/devoluciones',
    label: 'Devoluciones',
    description: 'Registrar devoluciones y estado físico.',
    icon: RotateCcw,
  },
  {
    to: '/disponibilidad',
    label: 'Disponibilidad',
    description: 'Consultar ejemplares por sede.',
    icon: Search,
  },
  {
    to: '/admin/reportes',
    label: 'Reportes',
    description: 'Consultar cuatro reportes operativos.',
    icon: BarChart3,
  },
]

export function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Sistema de préstamos interbibliotecarios
        </h1>
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
