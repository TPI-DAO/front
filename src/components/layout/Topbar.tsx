export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-700">Biblioteca</p>
        <p className="text-xs text-slate-400">Sistema de préstamos interbibliotecarios</p>
      </div>
    </header>
  )
}
