import type { Key, ReactNode } from 'react'

export interface ColumnaTabla<T> {
  id?: string
  encabezado: string
  render: (fila: T) => ReactNode
  className?: string
}

export function DataTable<T>({
  columnas,
  filas,
  clave,
  vacio,
  minWidth = 'min-w-[720px]',
  ariaLabel,
}: {
  columnas: ColumnaTabla<T>[]
  filas: T[]
  clave: (fila: T) => Key
  vacio?: ReactNode
  minWidth?: string
  ariaLabel?: string
}) {
  if (filas.length === 0) return <>{vacio}</>

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table aria-label={ariaLabel} className={`w-full ${minWidth} text-left text-sm`}>
        <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
          <tr>
            {columnas.map((columna, indice) => (
              <th
                key={columna.id ?? indice}
                scope="col"
                className={`px-4 py-3 font-medium ${columna.className ?? ''}`}
              >
                {columna.encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filas.map((fila) => (
            <tr key={clave(fila)}>
              {columnas.map((columna, indice) => (
                <td key={columna.id ?? indice} className={`px-4 py-3 ${columna.className ?? ''}`}>
                  {columna.render(fila)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
