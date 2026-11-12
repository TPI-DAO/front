import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { listarLibros } from '@/api/catalogo'
import { listarSedes } from '@/api/sedes'

export function useLibrosSedes() {
  const librosQuery = useQuery({ queryKey: ['libros', {}], queryFn: () => listarLibros({}) })
  const sedesQuery = useQuery({ queryKey: ['sedes'], queryFn: listarSedes })

  const titulos = useMemo(
    () => new Map((librosQuery.data ?? []).map((libro) => [libro.id, libro.titulo] as const)),
    [librosQuery.data],
  )
  const sedes = useMemo(
    () => new Map((sedesQuery.data ?? []).map((sede) => [sede.id, sede.nombre] as const)),
    [sedesQuery.data],
  )

  return {
    titulos,
    sedes,
    isLoading: librosQuery.isLoading || sedesQuery.isLoading,
    error: librosQuery.error ?? sedesQuery.error,
  }
}
