import { etiquetaEstado } from '@/lib/estados'
import { fieldClass } from '@/lib/formStyles'

export function EstadoFiltroSelect({
  valor,
  onChange,
  estados,
  etiqueta = 'Filtrar por estado',
}: {
  valor: string
  onChange: (valor: string) => void
  estados: readonly string[]
  etiqueta?: string
}) {
  return (
    <select
      value={valor}
      onChange={(event) => onChange(event.target.value)}
      className={fieldClass}
      aria-label={etiqueta}
    >
      <option value="">Todos los estados</option>
      {estados.map((estado) => (
        <option key={estado} value={estado}>
          {etiquetaEstado(estado)}
        </option>
      ))}
    </select>
  )
}
