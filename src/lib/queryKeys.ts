type Filtros = object

export const queryKeys = {
  me: ['auth', 'me'] as const,
  auth: ['auth'] as const,

  libros: ['libros'] as const,
  librosLista: (filtros: Filtros = {}) => ['libros', 'lista', filtros] as const,
  libro: (id: number) => ['libros', 'detalle', id] as const,
  generos: ['generos'] as const,
  autores: ['autores'] as const,
  editoriales: ['editoriales'] as const,

  sedes: ['sedes'] as const,
  sedesLista: (filtros: Filtros = {}) => ['sedes', 'lista', filtros] as const,

  socios: ['socios'] as const,
  miSocio: ['socios', 'me'] as const,
  sociosLista: (filtros: Filtros = {}) => ['socios', 'lista', filtros] as const,

  ejemplares: ['ejemplares'] as const,
  ejemplaresLista: (filtros: Filtros = {}) => ['ejemplares', 'lista', filtros] as const,

  usuarios: ['usuarios'] as const,

  disponibilidad: ['disponibilidad'] as const,
  disponibilidadLista: (filtros: Filtros = {}) => ['disponibilidad', 'lista', filtros] as const,

  prestamos: ['prestamos'] as const,
  prestamosLista: (filtros: Filtros = {}) => ['prestamos', 'lista', filtros] as const,

  reservas: ['reservas'] as const,
  reservasLista: (filtros: Filtros = {}) => ['reservas', 'lista', filtros] as const,
  remitos: ['remitos'] as const,
  remitosLista: (filtros: Filtros = {}) => ['remitos', 'lista', filtros] as const,
  trazabilidad: (busqueda: string | number) => ['remitos', 'trazabilidad', busqueda] as const,
  devoluciones: ['devoluciones'] as const,
  devolucionesLista: (filtros: Filtros = {}) => ['devoluciones', 'lista', filtros] as const,
  reportes: ['reportes'] as const,
}
