export function LoadingState({ mensaje = 'Cargando…' }: { mensaje?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"
        role="status"
        aria-label="Cargando"
      />
      {mensaje}
    </div>
  )
}

export function ErrorState({ mensaje = 'No se pudieron cargar los datos.' }: { mensaje?: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
      {mensaje}
    </div>
  )
}

export function EmptyState({ titulo, descripcion }: { titulo: string; descripcion?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <p className="text-sm font-medium text-slate-900">{titulo}</p>
      {descripcion && <p className="mt-1 text-sm text-slate-500">{descripcion}</p>}
    </div>
  )
}
