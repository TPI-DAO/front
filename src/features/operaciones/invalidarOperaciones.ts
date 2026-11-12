import type { QueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'

export async function invalidarOperaciones(queryClient: QueryClient) {
  await Promise.all(
    [
      queryKeys.prestamos,
      queryKeys.reservas,
      queryKeys.remitos,
      queryKeys.devoluciones,
      queryKeys.ejemplares,
      queryKeys.disponibilidad,
      queryKeys.reportes,
    ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  )
}
