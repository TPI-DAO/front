import { Construction } from 'lucide-react'

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
          <Construction size={20} />
        </span>
        <div>
          <p className="text-sm font-medium text-slate-900">Módulo en construcción</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  )
}
