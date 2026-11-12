import { Link } from 'react-router-dom'
import type { DisponibilidadFila } from '@/types/api'

export function DisponibilidadTable({
  filas,
  mostrarLibro = false,
  enlazarLibro = false,
}: {
  filas: DisponibilidadFila[]
  mostrarLibro?: boolean
  enlazarLibro?: boolean
}) {
  const minWidth = mostrarLibro ? 'min-w-[760px]' : 'min-w-[640px]'

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className={`w-full ${minWidth} text-left text-sm`}>
        <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 uppercase">
          <tr>
            {mostrarLibro && (
              <th scope="col" className="px-4 py-3 font-medium">
                Libro
              </th>
            )}
            <th scope="col" className="px-4 py-3 font-medium">
              Sede
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Total
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Disponibles
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Prestados
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              En tránsito
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Reservas
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Netos
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filas.map((fila) => (
            <tr key={`${fila.libro_id}-${fila.sede_id}`}>
              {mostrarLibro && (
                <td className="px-4 py-3">
                  {enlazarLibro ? (
                    <Link
                      to={`/catalogo/${fila.libro_id}`}
                      className="font-medium text-slate-800 hover:text-indigo-700"
                    >
                      {fila.titulo}
                    </Link>
                  ) : (
                    <span className="font-medium text-slate-800">{fila.titulo}</span>
                  )}
                  <p className="text-xs text-slate-400">ISBN {fila.isbn}</p>
                </td>
              )}
              <td className="px-4 py-3 text-slate-600">{fila.sede}</td>
              <td className="px-4 py-3 text-right text-slate-600">{fila.total_ejemplares}</td>
              <td className="px-4 py-3 text-right text-slate-600">{fila.disponibles}</td>
              <td className="px-4 py-3 text-right text-slate-600">{fila.prestados}</td>
              <td className="px-4 py-3 text-right text-slate-600">{fila.en_transito}</td>
              <td className="px-4 py-3 text-right text-slate-600">{fila.reservas_activas}</td>
              <td className="px-4 py-3 text-right">
                <span
                  className={
                    fila.disponibles_netos > 0
                      ? 'font-semibold text-emerald-600'
                      : 'font-semibold text-slate-400'
                  }
                >
                  {fila.disponibles_netos}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
