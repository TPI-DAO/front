interface ChartSeries {
  label: string
  color: string
}

interface ChartRow {
  label: string
  values: number[]
}

const numberFormat = new Intl.NumberFormat('es-AR')

export function ReportBarChart({
  title,
  description,
  series,
  rows,
  formatValue = (value) => numberFormat.format(value),
}: {
  title: string
  description: string
  series: ChartSeries[]
  rows: ChartRow[]
  formatValue?: (value: number) => string
}) {
  const maximum = Math.max(0, ...rows.flatMap((row) => row.values))

  return (
    <figure className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
      <figcaption className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </figcaption>
      <ul
        className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600"
        aria-label="Leyenda"
      >
        {series.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-sm ${item.color}`} aria-hidden="true" />
            {item.label}
          </li>
        ))}
      </ul>
      {maximum === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          No hay valores para graficar con los filtros actuales.
        </p>
      ) : (
        <ul className="space-y-4">
          {rows.map((row, index) => (
            <li key={index} className="grid gap-2 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-4">
              <span className="self-center text-sm font-medium break-words text-slate-700">
                {row.label}
              </span>
              <div className="min-w-0 space-y-2">
                {series.map((item, seriesIndex) => {
                  const value = row.values[seriesIndex] ?? 0
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div
                        className="h-4 flex-1 overflow-hidden rounded bg-slate-200/70"
                        aria-hidden="true"
                      >
                        <div
                          className={`h-full rounded ${item.color}`}
                          style={{ width: `${(value / maximum) * 100}%` }}
                        />
                      </div>
                      <span className="min-w-12 shrink-0 text-right text-xs font-semibold text-slate-700 tabular-nums">
                        <span className="sr-only">{item.label}: </span>
                        {formatValue(value)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </li>
          ))}
        </ul>
      )}
    </figure>
  )
}
