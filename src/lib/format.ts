const fechaFormatter = new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium' })

const fechaHoraFormatter = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function parseFecha(valor: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [anio, mes, dia] = valor.split('-').map(Number)
    return new Date(anio, mes - 1, dia)
  }
  return new Date(valor)
}

export function formatearFecha(valor?: string | null): string {
  if (!valor) return '—'
  const fecha = parseFecha(valor)
  if (Number.isNaN(fecha.getTime())) return valor
  return fechaFormatter.format(fecha)
}

export function formatearFechaHora(valor?: string | null): string {
  if (!valor) return '—'
  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return valor
  return fechaHoraFormatter.format(fecha)
}
