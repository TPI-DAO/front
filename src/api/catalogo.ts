import { api } from './client'
import type { Autor, Editorial, Genero, Libro } from '@/types/api'

export interface LibrosFiltros {
  q?: string
  genero_id?: number
  autor_id?: number
  editorial_id?: number
}

export async function listarLibros(filtros: LibrosFiltros = {}): Promise<Libro[]> {
  const { data } = await api.get<Libro[]>('/libros', { params: filtros })
  return data
}

export async function obtenerLibro(libroId: number): Promise<Libro> {
  const { data } = await api.get<Libro>(`/libros/${libroId}`)
  return data
}

export async function listarGeneros(): Promise<Genero[]> {
  const { data } = await api.get<Genero[]>('/generos')
  return data
}

export async function listarAutores(): Promise<Autor[]> {
  const { data } = await api.get<Autor[]>('/autores')
  return data
}

export async function listarEditoriales(): Promise<Editorial[]> {
  const { data } = await api.get<Editorial[]>('/editoriales')
  return data
}
