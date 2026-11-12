import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { listarLibros } from '@/api/catalogo'
import { listarSedes } from '@/api/sedes'
import { listarSocios } from '@/api/socios'
import { useAuth } from '@/features/auth/useAuth'
import { queryKeys } from '@/lib/queryKeys'

export function useDatosOperaciones() {
  const { usuario } = useAuth()
  const admin = usuario?.rol === 'ADMIN'
  const librosQuery = useQuery({ queryKey: queryKeys.librosLista(), queryFn: () => listarLibros() })
  const sedesQuery = useQuery({ queryKey: queryKeys.sedes, queryFn: () => listarSedes() })
  const sociosQuery = useQuery({
    queryKey: queryKeys.socios,
    queryFn: () => listarSocios(),
    enabled: admin,
  })
  const titulos = useMemo(
    () => new Map(librosQuery.data?.map((libro) => [libro.id, libro.titulo])),
    [librosQuery.data],
  )
  const sedesPorId = useMemo(
    () => new Map(sedesQuery.data?.map((sede) => [sede.id, sede.nombre])),
    [sedesQuery.data],
  )
  const sociosPorId = useMemo(
    () =>
      new Map(sociosQuery.data?.map((socio) => [socio.id, `${socio.apellido}, ${socio.nombre}`])),
    [sociosQuery.data],
  )

  return {
    admin,
    usuario,
    libros: librosQuery.data ?? [],
    sedes: sedesQuery.data ?? [],
    socios: sociosQuery.data ?? [],
    titulos,
    sedesPorId,
    sociosPorId,
    isLoading: librosQuery.isLoading || sedesQuery.isLoading || (admin && sociosQuery.isLoading),
    error: librosQuery.error ?? sedesQuery.error ?? (admin ? sociosQuery.error : null),
  }
}
