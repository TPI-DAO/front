import { useState, type FormEvent, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { mensajeDeError } from '@/lib/errors'
import { ReportBarChart } from '@/components/ui/ReportBarChart'

type Section =
  | 'catalogo'
  | 'disponibilidad'
  | 'sedes'
  | 'socios'
  | 'libros'
  | 'ejemplares'
  | 'prestamos'
  | 'reservas'
  | 'remitos'
  | 'devoluciones'
  | 'reportes'

type EstadoFisico = 'BUENO' | 'DANADO' | 'EXTRAVIADO' | 'DESTRUIDO'

interface Sede {
  id: number
  nombre: string
  direccion: string
  correo: string | null
  telefono: string | null
  horarios: string | null
  estado: 'ACTIVA' | 'BAJA'
}

interface Socio {
  id: number
  dni: string
  nombre: string
  apellido: string
  telefono: string | null
  estado: 'HABILITADO' | 'INHABILITADO'
}

interface Libro {
  id: number
  titulo: string
  isbn: string
  genero: { id: number; nombre: string }
  autor: { id: number; nombre: string }
  editorial: { id: number; descripcion: string }
}

interface Ejemplar {
  id: number
  codigo_inventario: string | null
  sede_id: number
  estado: string
  libro: { id: number; titulo: string; isbn: string }
}

interface Prestamo {
  id: number
  socio_id: number
  libro_id: number
  ejemplar_id: number
  sede_origen_id: number
  sede_destino_id: number
  estado: string
  interbibliotecario: boolean
  fecha_solicitud: string
  fecha_vencimiento: string | null
}

interface Reserva {
  id: number
  socio_id: number
  libro_id: number
  sede_id: number
  fecha: string
  estado: string
}

interface Remito {
  id: number
  numero: string
  tipo: string
  prestamo_id: number
  ejemplar_id: number
  sede_origen_id: number
  sede_destino_id: number
  estado: string
  fecha_empaquetado: string
  fecha_salida: string | null
  fecha_llegada: string | null
  estado_fisico_recepcion: string | null
}

interface Devolucion {
  id: number
  prestamo_id: number
  sede_id: number
  fecha: string
  estado_fisico: string
  dias_atraso: number
  multa: number
}

interface Disponibilidad {
  libro_id: number
  titulo: string
  isbn: string
  sede_id: number
  sede: string
  total_ejemplares: number
  disponibles: number
  prestados: number
  en_transito: number
  reservas_activas: number
  disponibles_netos: number
}

interface Columna<T> {
  titulo: string
  mostrar: (fila: T) => ReactNode
}

const inputClass =
  'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
const buttonClass =
  'inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60'
const secondaryButtonClass =
  'inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'

function Page({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {children}
    </div>
  )
}

function SectionPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  )
}

function Field({
  label,
  name,
  required = false,
  type = 'text',
  defaultValue,
  placeholder,
}: {
  label: string
  name: string
  required?: boolean
  type?: string
  defaultValue?: string | number
  placeholder?: string
}) {
  return (
    <label className="block space-y-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        className={inputClass}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
      />
    </label>
  )
}

function SelectField({
  label,
  name,
  options,
  required = true,
  defaultValue,
  disabled = false,
}: {
  label: string
  name: string
  options: { value: string | number; label: string }[]
  required?: boolean
  defaultValue?: string | number
  disabled?: boolean
}) {
  return (
    <label className="block space-y-1 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <select
        className={inputClass}
        name={name}
        required={required}
        defaultValue={defaultValue ?? ''}
        disabled={disabled}
      >
        <option value="" disabled>
          Seleccionar
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function DataTable<T>({
  rows,
  columns,
  empty = 'No hay registros para mostrar.',
}: {
  rows: T[]
  columns: Columna<T>[]
  empty?: string
}) {
  if (!rows.length) return <p className="text-sm text-slate-500">{empty}</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
            {columns.map((column) => (
              <th className="px-3 py-2" key={column.titulo}>
                {column.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr className="border-b border-slate-100 last:border-0" key={index}>
              {columns.map((column) => (
                <td className="px-3 py-2.5 text-slate-700" key={column.titulo}>
                  {column.mostrar(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function QueryFeedback({ loading, error }: { loading: boolean; error: unknown }) {
  if (loading) return <p className="text-sm text-slate-500">Cargando datos…</p>
  if (error) return <p className="text-sm text-red-700">{mensajeDeError(error)}</p>
  return null
}

function useAction() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function run(operation: () => Promise<unknown>, success: string) {
    setPending(true)
    setError(null)
    setMessage(null)
    try {
      await operation()
      await queryClient.invalidateQueries()
      setMessage(success)
      return true
    } catch (reason) {
      setError(mensajeDeError(reason))
      return false
    } finally {
      setPending(false)
    }
  }

  return { run, error, message, pending }
}

function Feedback({ error, message }: { error: string | null; message: string | null }) {
  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm text-emerald-700">
          {message}
        </p>
      )}
    </>
  )
}

function value(form: HTMLFormElement, name: string) {
  return String(new FormData(form).get(name) ?? '').trim()
}

function optionalValue(form: HTMLFormElement, name: string) {
  return value(form, name) || null
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString('es-AR') : '—'
}

function money(value: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
}

function SedesPage() {
  const query = useQuery({
    queryKey: ['sedes'],
    queryFn: async () => (await api.get<Sede[]>('/sedes')).data,
  })
  const action = useAction()
  const [editing, setEditing] = useState<Sede | null>(null)

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const payload = {
      nombre: value(form, 'nombre'),
      direccion: value(form, 'direccion'),
      correo: optionalValue(form, 'correo'),
      telefono: optionalValue(form, 'telefono'),
      horarios: optionalValue(form, 'horarios'),
    }
    const ok = await action.run(
      () => (editing ? api.put(`/sedes/${editing.id}`, payload) : api.post('/sedes', payload)),
      editing ? 'Sede actualizada.' : 'Sede registrada.',
    )
    if (ok) {
      setEditing(null)
      form.reset()
    }
  }

  return (
    <Page title="Sedes">
      <SectionPanel title={editing ? 'Editar sede' : 'Registrar sede'}>
        <form
          key={editing?.id ?? 'new'}
          onSubmit={save}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <Field label="Nombre" name="nombre" required defaultValue={editing?.nombre} />
          <Field label="Dirección" name="direccion" required defaultValue={editing?.direccion} />
          <Field label="Correo" name="correo" type="email" defaultValue={editing?.correo ?? ''} />
          <Field label="Teléfono" name="telefono" defaultValue={editing?.telefono ?? ''} />
          <Field label="Horarios" name="horarios" defaultValue={editing?.horarios ?? ''} />
          <div className="flex items-end gap-2">
            <button className={buttonClass} disabled={action.pending}>
              {editing ? 'Guardar cambios' : 'Registrar'}
            </button>
            {editing && (
              <button
                className={secondaryButtonClass}
                type="button"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>
            )}
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <Feedback error={action.error} message={action.message} />
          </div>
        </form>
      </SectionPanel>
      <SectionPanel title="Sedes registradas">
        <QueryFeedback loading={query.isPending} error={query.error} />
        {query.data && (
          <DataTable
            rows={query.data}
            columns={[
              { titulo: 'Nombre', mostrar: (s) => s.nombre },
              { titulo: 'Dirección', mostrar: (s) => s.direccion },
              {
                titulo: 'Contacto',
                mostrar: (s) => [s.telefono, s.correo].filter(Boolean).join(' · ') || '—',
              },
              { titulo: 'Horarios', mostrar: (s) => s.horarios || '—' },
              { titulo: 'Estado', mostrar: (s) => s.estado },
              {
                titulo: 'Acciones',
                mostrar: (s) => (
                  <div className="flex gap-2">
                    <button className={secondaryButtonClass} onClick={() => setEditing(s)}>
                      Editar
                    </button>
                    <button
                      className={secondaryButtonClass}
                      onClick={() =>
                        void action.run(
                          () =>
                            api.patch(`/sedes/${s.id}/estado`, {
                              estado: s.estado === 'ACTIVA' ? 'BAJA' : 'ACTIVA',
                            }),
                          s.estado === 'ACTIVA' ? 'Sede dada de baja.' : 'Sede activada.',
                        )
                      }
                    >
                      {s.estado === 'ACTIVA' ? 'Dar de baja' : 'Activar'}
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </SectionPanel>
      <Feedback error={action.error} message={action.message} />
    </Page>
  )
}

function SociosPage() {
  const query = useQuery({
    queryKey: ['socios'],
    queryFn: async () => (await api.get<Socio[]>('/socios')).data,
  })
  const action = useAction()
  const [editing, setEditing] = useState<Socio | null>(null)

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const payload = {
      dni: value(form, 'dni'),
      nombre: value(form, 'nombre'),
      apellido: value(form, 'apellido'),
      telefono: optionalValue(form, 'telefono'),
    }
    const ok = await action.run(
      () => (editing ? api.put(`/socios/${editing.id}`, payload) : api.post('/socios', payload)),
      editing ? 'Socio actualizado.' : 'Socio registrado.',
    )
    if (ok) {
      setEditing(null)
      form.reset()
    }
  }

  return (
    <Page title="Socios">
      <SectionPanel title={editing ? 'Editar socio' : 'Registrar socio'}>
        <form
          key={editing?.id ?? 'new'}
          onSubmit={save}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <Field label="DNI" name="dni" required defaultValue={editing?.dni} />
          <Field label="Nombre" name="nombre" required defaultValue={editing?.nombre} />
          <Field label="Apellido" name="apellido" required defaultValue={editing?.apellido} />
          <Field label="Teléfono" name="telefono" defaultValue={editing?.telefono ?? ''} />
          <div className="flex items-end gap-2">
            <button className={buttonClass} disabled={action.pending}>
              {editing ? 'Guardar cambios' : 'Registrar'}
            </button>
            {editing && (
              <button
                className={secondaryButtonClass}
                type="button"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>
            )}
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <Feedback error={action.error} message={action.message} />
          </div>
        </form>
      </SectionPanel>
      <SectionPanel title="Socios registrados">
        <QueryFeedback loading={query.isPending} error={query.error} />
        {query.data && (
          <DataTable
            rows={query.data}
            columns={[
              { titulo: 'DNI', mostrar: (s) => s.dni },
              { titulo: 'Apellido y nombre', mostrar: (s) => `${s.apellido}, ${s.nombre}` },
              { titulo: 'Teléfono', mostrar: (s) => s.telefono || '—' },
              { titulo: 'Estado', mostrar: (s) => s.estado },
              {
                titulo: 'Acciones',
                mostrar: (s) => (
                  <div className="flex gap-2">
                    <button className={secondaryButtonClass} onClick={() => setEditing(s)}>
                      Editar
                    </button>
                    <button
                      className={secondaryButtonClass}
                      onClick={() =>
                        void action.run(
                          () =>
                            api.patch(`/socios/${s.id}/estado`, {
                              estado: s.estado === 'HABILITADO' ? 'INHABILITADO' : 'HABILITADO',
                            }),
                          s.estado === 'HABILITADO' ? 'Socio inhabilitado.' : 'Socio habilitado.',
                        )
                      }
                    >
                      {s.estado === 'HABILITADO' ? 'Inhabilitar' : 'Habilitar'}
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </SectionPanel>
      <Feedback error={action.error} message={action.message} />
    </Page>
  )
}

function CatalogPage({ manage = false }: { manage?: boolean }) {
  const [search, setSearch] = useState('')
  const query = useQuery({
    queryKey: ['libros', search],
    queryFn: async () =>
      (await api.get<Libro[]>('/libros', { params: search ? { q: search } : {} })).data,
  })
  const refs = useQuery({
    queryKey: ['catalogo-referencias'],
    enabled: manage,
    queryFn: async () => {
      const [generos, autores, editoriales] = await Promise.all([
        api.get<{ id: number; nombre: string }[]>('/generos'),
        api.get<{ id: number; nombre: string }[]>('/autores'),
        api.get<{ id: number; descripcion: string }[]>('/editoriales'),
      ])
      return { generos: generos.data, autores: autores.data, editoriales: editoriales.data }
    },
  })
  const action = useAction()
  const [editing, setEditing] = useState<Libro | null>(null)

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const payload = {
      titulo: value(form, 'titulo'),
      isbn: value(form, 'isbn'),
      genero_id: Number(value(form, 'genero_id')),
      autor_id: Number(value(form, 'autor_id')),
      editorial_id: Number(value(form, 'editorial_id')),
    }
    const ok = await action.run(
      () => (editing ? api.put(`/libros/${editing.id}`, payload) : api.post('/libros', payload)),
      editing ? 'Libro actualizado.' : 'Libro registrado.',
    )
    if (ok) {
      setEditing(null)
      form.reset()
    }
  }

  return (
    <Page title={manage ? 'Administrar catálogo' : 'Catálogo'}>
      {manage && (
        <SectionPanel title={editing ? 'Editar libro' : 'Registrar libro'}>
          <QueryFeedback loading={refs.isPending} error={refs.error} />
          {refs.data && (
            <form
              key={editing?.id ?? 'new'}
              onSubmit={save}
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            >
              <Field label="Título" name="titulo" required defaultValue={editing?.titulo} />
              <Field label="ISBN" name="isbn" required defaultValue={editing?.isbn} />
              <SelectField
                label="Género"
                name="genero_id"
                options={refs.data.generos.map((x) => ({ value: x.id, label: x.nombre }))}
                defaultValue={editing?.genero.id}
              />
              <SelectField
                label="Autor"
                name="autor_id"
                options={refs.data.autores.map((x) => ({ value: x.id, label: x.nombre }))}
                defaultValue={editing?.autor.id}
              />
              <SelectField
                label="Editorial"
                name="editorial_id"
                options={refs.data.editoriales.map((x) => ({ value: x.id, label: x.descripcion }))}
                defaultValue={editing?.editorial.id}
              />
              <div className="flex items-end gap-2">
                <button className={buttonClass} disabled={action.pending}>
                  {editing ? 'Guardar cambios' : 'Registrar'}
                </button>
                {editing && (
                  <button
                    className={secondaryButtonClass}
                    type="button"
                    onClick={() => setEditing(null)}
                  >
                    Cancelar
                  </button>
                )}
              </div>
              <div className="sm:col-span-2 lg:col-span-4">
                <Feedback error={action.error} message={action.message} />
              </div>
            </form>
          )}
        </SectionPanel>
      )}
      <SectionPanel title="Libros">
        <label className="mb-4 block max-w-sm space-y-1 text-sm font-medium text-slate-700">
          <span>Buscar por título</span>
          <input
            className={inputClass}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <QueryFeedback loading={query.isPending} error={query.error} />
        {query.data && (
          <DataTable
            rows={query.data}
            columns={[
              { titulo: 'Título', mostrar: (l) => l.titulo },
              { titulo: 'ISBN', mostrar: (l) => l.isbn },
              { titulo: 'Autor', mostrar: (l) => l.autor.nombre },
              { titulo: 'Género', mostrar: (l) => l.genero.nombre },
              { titulo: 'Editorial', mostrar: (l) => l.editorial.descripcion },
              ...(manage
                ? [
                    {
                      titulo: 'Acciones',
                      mostrar: (l: Libro) => (
                        <button className={secondaryButtonClass} onClick={() => setEditing(l)}>
                          Editar
                        </button>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        )}
      </SectionPanel>
      {manage && <Feedback error={action.error} message={action.message} />}
    </Page>
  )
}

function EjemplaresPage() {
  const query = useQuery({
    queryKey: ['ejemplares-y-referencias'],
    queryFn: async () => {
      const [ejemplares, libros, sedes] = await Promise.all([
        api.get<Ejemplar[]>('/ejemplares'),
        api.get<Libro[]>('/libros'),
        api.get<Sede[]>('/sedes'),
      ])
      return { ejemplares: ejemplares.data, libros: libros.data, sedes: sedes.data }
    },
  })
  const action = useAction()
  const [editing, setEditing] = useState<Ejemplar | null>(null)

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const payload = {
      libro_id: Number(value(form, 'libro_id')),
      sede_id: Number(value(form, 'sede_id')),
      codigo_inventario: optionalValue(form, 'codigo_inventario'),
    }
    const operation = editing
      ? () =>
          api.put(`/ejemplares/${editing.id}`, {
            sede_id: payload.sede_id,
            codigo_inventario: payload.codigo_inventario,
            estado: value(form, 'estado'),
          })
      : () => api.post('/ejemplares', payload)
    if (await action.run(operation, editing ? 'Ejemplar actualizado.' : 'Ejemplar registrado.')) {
      setEditing(null)
      form.reset()
    }
  }

  return (
    <Page title="Ejemplares">
      <SectionPanel title="Registrar ejemplar">
        <QueryFeedback loading={query.isPending} error={query.error} />
        {query.data && (
          <form
            key={editing?.id ?? 'new'}
            onSubmit={save}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <SelectField
              label="Libro"
              name="libro_id"
              options={query.data.libros.map((l) => ({ value: l.id, label: l.titulo }))}
              defaultValue={
                editing ? query.data.libros.find((l) => l.id === editing.libro.id)?.id : undefined
              }
              disabled={Boolean(editing)}
            />
            <SelectField
              label="Sede propietaria"
              name="sede_id"
              options={query.data.sedes
                .filter((s) => s.estado === 'ACTIVA')
                .map((s) => ({ value: s.id, label: s.nombre }))}
              defaultValue={editing?.sede_id}
            />
            <Field
              label="Código de inventario (opcional)"
              name="codigo_inventario"
              defaultValue={editing?.codigo_inventario ?? ''}
            />
            {editing && (
              <SelectField
                label="Estado"
                name="estado"
                options={[
                  { value: 'DISPONIBLE', label: 'Disponible' },
                  { value: 'DANADO', label: 'Dañado' },
                ]}
                defaultValue={editing.estado}
              />
            )}
            <div className="flex items-end gap-2">
              <button className={buttonClass} disabled={action.pending}>
                {editing ? 'Guardar cambios' : 'Registrar'}
              </button>
              {editing && (
                <button
                  className={secondaryButtonClass}
                  type="button"
                  onClick={() => setEditing(null)}
                >
                  Cancelar
                </button>
              )}
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Feedback error={action.error} message={action.message} />
            </div>
          </form>
        )}
      </SectionPanel>
      <SectionPanel title="Ejemplares registrados">
        {query.data && (
          <DataTable
            rows={query.data.ejemplares}
            columns={[
              { titulo: 'Código', mostrar: (e) => e.codigo_inventario || `#${e.id}` },
              { titulo: 'Libro', mostrar: (e) => e.libro.titulo },
              {
                titulo: 'Sede',
                mostrar: (e) =>
                  query.data?.sedes.find((s) => s.id === e.sede_id)?.nombre ?? `#${e.sede_id}`,
              },
              { titulo: 'Estado', mostrar: (e) => e.estado },
              {
                titulo: 'Acciones',
                mostrar: (e) => {
                  const sedeActiva = query.data?.sedes.some(
                    (s) => s.id === e.sede_id && s.estado === 'ACTIVA',
                  )
                  const editable = sedeActiva && ['DISPONIBLE', 'DANADO'].includes(e.estado)
                  return editable ? (
                    <div className="flex gap-2">
                      <button className={secondaryButtonClass} onClick={() => setEditing(e)}>
                        Editar
                      </button>
                      <button
                        className={secondaryButtonClass}
                        onClick={() =>
                          void action.run(
                            () => api.post(`/ejemplares/${e.id}/baja`),
                            'Ejemplar dado de baja.',
                          )
                        }
                      >
                        Dar de baja
                      </button>
                    </div>
                  ) : (
                    '—'
                  )
                },
              },
            ]}
          />
        )}
      </SectionPanel>
      <Feedback error={action.error} message={action.message} />
      <Feedback error={action.error} message={action.message} />
    </Page>
  )
}

function PrestamosPage() {
  const query = useQuery({
    queryKey: ['prestamos-y-referencias'],
    queryFn: async () => {
      const [prestamos, socios, libros, sedes] = await Promise.all([
        api.get<Prestamo[]>('/prestamos'),
        api.get<Socio[]>('/socios'),
        api.get<Libro[]>('/libros'),
        api.get<Sede[]>('/sedes'),
      ])
      return {
        prestamos: prestamos.data,
        socios: socios.data,
        libros: libros.data,
        sedes: sedes.data,
      }
    },
  })
  const action = useAction()

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const payload = {
      socio_id: Number(value(form, 'socio_id')),
      libro_id: Number(value(form, 'libro_id')),
      sede_origen_id: Number(value(form, 'sede_origen_id')),
      sede_destino_id: Number(value(form, 'sede_destino_id')),
    }
    if (
      await action.run(() => api.post('/prestamos', payload), 'Solicitud de préstamo registrada.')
    )
      form.reset()
  }

  return (
    <Page title="Préstamos">
      <SectionPanel title="Registrar solicitud local o interbibliotecaria">
        <QueryFeedback loading={query.isPending} error={query.error} />
        {query.data && (
          <form onSubmit={save} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField
              label="Socio"
              name="socio_id"
              options={query.data.socios.map((s) => ({
                value: s.id,
                label: `${s.apellido}, ${s.nombre} · ${s.estado}`,
              }))}
            />
            <SelectField
              label="Libro"
              name="libro_id"
              options={query.data.libros.map((l) => ({ value: l.id, label: l.titulo }))}
            />
            <SelectField
              label="Sede de origen"
              name="sede_origen_id"
              options={query.data.sedes.map((s) => ({
                value: s.id,
                label: `${s.nombre} · ${s.estado}`,
              }))}
            />
            <SelectField
              label="Sede de destino"
              name="sede_destino_id"
              options={query.data.sedes.map((s) => ({
                value: s.id,
                label: `${s.nombre} · ${s.estado}`,
              }))}
            />
            <div className="flex items-end">
              <button className={buttonClass} disabled={action.pending}>
                Solicitar
              </button>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Feedback error={action.error} message={action.message} />
            </div>
          </form>
        )}
      </SectionPanel>
      <SectionPanel title="Préstamos registrados">
        {query.data && (
          <DataTable
            rows={query.data.prestamos}
            columns={[
              { titulo: 'N.º', mostrar: (p) => p.id },
              {
                titulo: 'Socio',
                mostrar: (p) => {
                  const s = query.data?.socios.find((x) => x.id === p.socio_id)
                  return s ? `${s.apellido}, ${s.nombre}` : p.socio_id
                },
              },
              {
                titulo: 'Libro',
                mostrar: (p) =>
                  query.data?.libros.find((x) => x.id === p.libro_id)?.titulo ?? p.libro_id,
              },
              {
                titulo: 'Origen',
                mostrar: (p) =>
                  query.data?.sedes.find((x) => x.id === p.sede_origen_id)?.nombre ??
                  p.sede_origen_id,
              },
              {
                titulo: 'Destino',
                mostrar: (p) =>
                  query.data?.sedes.find((x) => x.id === p.sede_destino_id)?.nombre ??
                  p.sede_destino_id,
              },
              { titulo: 'Estado', mostrar: (p) => p.estado },
              { titulo: 'Vencimiento', mostrar: (p) => p.fecha_vencimiento ?? '—' },
              {
                titulo: 'Acción',
                mostrar: (p) =>
                  p.estado === 'SOLICITADO' ? (
                    <button
                      className={secondaryButtonClass}
                      onClick={() =>
                        void action.run(
                          () => api.post(`/prestamos/${p.id}/cancelar`),
                          'Préstamo cancelado.',
                        )
                      }
                    >
                      Cancelar
                    </button>
                  ) : (
                    '—'
                  ),
              },
            ]}
          />
        )}
      </SectionPanel>
      <div className="flex flex-wrap items-center gap-3">
        <button
          className={secondaryButtonClass}
          disabled={action.pending}
          onClick={() =>
            void action.run(
              () => api.post('/prestamos/controlar-vencimientos'),
              'Vencimientos controlados.',
            )
          }
        >
          Controlar vencimientos
        </button>
        <Feedback error={action.error} message={action.message} />
      </div>
    </Page>
  )
}

function ReservasPage() {
  const query = useQuery({
    queryKey: ['reservas-y-referencias'],
    queryFn: async () => {
      const [reservas, socios, libros, sedes] = await Promise.all([
        api.get<Reserva[]>('/reservas'),
        api.get<Socio[]>('/socios'),
        api.get<Libro[]>('/libros'),
        api.get<Sede[]>('/sedes'),
      ])
      return {
        reservas: reservas.data,
        socios: socios.data,
        libros: libros.data,
        sedes: sedes.data,
      }
    },
  })
  const action = useAction()

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const payload = {
      socio_id: Number(value(form, 'socio_id')),
      libro_id: Number(value(form, 'libro_id')),
      sede_id: Number(value(form, 'sede_id')),
    }
    if (await action.run(() => api.post('/reservas', payload), 'Reserva registrada.')) form.reset()
  }

  return (
    <Page title="Reservas">
      <SectionPanel title="Registrar reserva">
        <QueryFeedback loading={query.isPending} error={query.error} />
        {query.data && (
          <form onSubmit={save} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField
              label="Socio"
              name="socio_id"
              options={query.data.socios.map((s) => ({
                value: s.id,
                label: `${s.apellido}, ${s.nombre} · ${s.estado}`,
              }))}
            />
            <SelectField
              label="Libro"
              name="libro_id"
              options={query.data.libros.map((l) => ({ value: l.id, label: l.titulo }))}
            />
            <SelectField
              label="Sede"
              name="sede_id"
              options={query.data.sedes.map((s) => ({
                value: s.id,
                label: `${s.nombre} · ${s.estado}`,
              }))}
            />
            <div className="flex items-end">
              <button className={buttonClass} disabled={action.pending}>
                Reservar
              </button>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Feedback error={action.error} message={action.message} />
            </div>
          </form>
        )}
      </SectionPanel>
      <SectionPanel title="Reservas registradas">
        {query.data && (
          <DataTable
            rows={query.data.reservas}
            columns={[
              { titulo: 'N.º', mostrar: (r) => r.id },
              {
                titulo: 'Socio',
                mostrar: (r) => {
                  const s = query.data?.socios.find((x) => x.id === r.socio_id)
                  return s ? `${s.apellido}, ${s.nombre}` : r.socio_id
                },
              },
              {
                titulo: 'Libro',
                mostrar: (r) =>
                  query.data?.libros.find((x) => x.id === r.libro_id)?.titulo ?? r.libro_id,
              },
              {
                titulo: 'Sede',
                mostrar: (r) =>
                  query.data?.sedes.find((x) => x.id === r.sede_id)?.nombre ?? r.sede_id,
              },
              { titulo: 'Fecha', mostrar: (r) => formatDate(r.fecha) },
              { titulo: 'Estado', mostrar: (r) => r.estado },
              {
                titulo: 'Acción',
                mostrar: (r) =>
                  r.estado === 'ACTIVA' ? (
                    <button
                      className={secondaryButtonClass}
                      onClick={() =>
                        void action.run(
                          () => api.post(`/reservas/${r.id}/cancelar`),
                          'Reserva cancelada.',
                        )
                      }
                    >
                      Cancelar
                    </button>
                  ) : (
                    '—'
                  ),
              },
            ]}
          />
        )}
      </SectionPanel>
      <Feedback error={action.error} message={action.message} />
    </Page>
  )
}

function RemitosPage() {
  const query = useQuery({
    queryKey: ['remitos-y-prestamos'],
    queryFn: async () => {
      const [remitos, prestamos] = await Promise.all([
        api.get<Remito[]>('/remitos'),
        api.get<Prestamo[]>('/prestamos'),
      ])
      return { remitos: remitos.data, prestamos: prestamos.data }
    },
  })
  const action = useAction()
  const [selected, setSelected] = useState<number | null>(null)
  const trace = useQuery({
    queryKey: ['trazabilidad-remito', selected],
    enabled: selected !== null,
    queryFn: async () =>
      (
        await api.get<{
          remito: Remito
          historial: {
            id: number
            fecha: string
            estado_anterior: string | null
            estado_nuevo: string
            observacion: string | null
          }[]
        }>(`/remitos/${selected}/trazabilidad`)
      ).data,
  })

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const payload = {
      prestamo_id: Number(value(form, 'prestamo_id')),
      observacion: optionalValue(form, 'observacion'),
    }
    if (await action.run(() => api.post('/remitos', payload), 'Remito empaquetado.')) form.reset()
  }

  return (
    <Page title="Remitos">
      <SectionPanel title="Empaquetar ejemplar y generar remito">
        <QueryFeedback loading={query.isPending} error={query.error} />
        {query.data && (
          <form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Préstamo interbibliotecario solicitado"
              name="prestamo_id"
              options={query.data.prestamos
                .filter((p) => p.interbibliotecario && p.estado === 'SOLICITADO')
                .map((p) => ({ value: p.id, label: `Préstamo #${p.id} · libro #${p.libro_id}` }))}
            />
            <Field label="Observación" name="observacion" />
            <div className="flex items-end">
              <button className={buttonClass} disabled={action.pending}>
                Empaquetar
              </button>
            </div>
            <div className="sm:col-span-2">
              <Feedback error={action.error} message={action.message} />
            </div>
          </form>
        )}
      </SectionPanel>
      <SectionPanel title="Seguimiento de remitos">
        {query.data && (
          <DataTable
            rows={query.data.remitos}
            columns={[
              { titulo: 'Remito', mostrar: (r) => r.numero },
              { titulo: 'Tipo', mostrar: (r) => r.tipo },
              { titulo: 'Préstamo', mostrar: (r) => r.prestamo_id },
              { titulo: 'Estado', mostrar: (r) => r.estado },
              { titulo: 'Empaquetado', mostrar: (r) => formatDate(r.fecha_empaquetado) },
              {
                titulo: 'Acciones',
                mostrar: (r) => (
                  <div className="flex flex-wrap gap-2">
                    {r.estado === 'EMPAQUETADO' && (
                      <button
                        className={secondaryButtonClass}
                        onClick={() =>
                          void action.run(
                            () => api.post(`/remitos/${r.id}/despachar`, {}),
                            'Remito despachado.',
                          )
                        }
                      >
                        Despachar
                      </button>
                    )}
                    {r.estado === 'DESPACHADO' && (
                      <form
                        className="flex gap-2"
                        onSubmit={(event) => {
                          event.preventDefault()
                          const form = event.currentTarget
                          void action.run(
                            () =>
                              api.post(`/remitos/${r.id}/recibir`, {
                                estado_fisico: value(form, 'estado_fisico') as EstadoFisico,
                              }),
                            'Recepción registrada.',
                          )
                        }}
                      >
                        <select
                          aria-label="Estado físico de recepción"
                          name="estado_fisico"
                          className={inputClass}
                          defaultValue="BUENO"
                        >
                          {(['BUENO', 'DANADO', 'EXTRAVIADO', 'DESTRUIDO'] as EstadoFisico[]).map(
                            (estado) => (
                              <option key={estado}>{estado}</option>
                            ),
                          )}
                        </select>
                        <button className={secondaryButtonClass}>Recibir</button>
                      </form>
                    )}
                    <button className={secondaryButtonClass} onClick={() => setSelected(r.id)}>
                      Trazabilidad
                    </button>
                  </div>
                ),
              },
            ]}
          />
        )}
        <Feedback error={action.error} message={action.message} />
      </SectionPanel>
      {selected !== null && (
        <SectionPanel title={`Trazabilidad del remito #${selected}`}>
          <button className={`${secondaryButtonClass} mb-3`} onClick={() => setSelected(null)}>
            Cerrar
          </button>
          <QueryFeedback loading={trace.isPending} error={trace.error} />
          {trace.data && (
            <DataTable
              rows={trace.data.historial}
              columns={[
                { titulo: 'Fecha', mostrar: (h) => formatDate(h.fecha) },
                { titulo: 'Estado anterior', mostrar: (h) => h.estado_anterior ?? '—' },
                { titulo: 'Estado nuevo', mostrar: (h) => h.estado_nuevo },
                { titulo: 'Observación', mostrar: (h) => h.observacion ?? '—' },
              ]}
            />
          )}
        </SectionPanel>
      )}
    </Page>
  )
}

function DevolucionesPage() {
  const query = useQuery({
    queryKey: ['devoluciones-y-prestamos'],
    queryFn: async () => {
      const [devoluciones, prestamos] = await Promise.all([
        api.get<Devolucion[]>('/devoluciones'),
        api.get<Prestamo[]>('/prestamos'),
      ])
      return { devoluciones: devoluciones.data, prestamos: prestamos.data }
    },
  })
  const action = useAction()

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const payload = {
      prestamo_id: Number(value(form, 'prestamo_id')),
      estado_fisico: value(form, 'estado_fisico') as EstadoFisico,
      observacion: optionalValue(form, 'observacion'),
    }
    if (await action.run(() => api.post('/devoluciones', payload), 'Devolución registrada.'))
      form.reset()
  }

  return (
    <Page title="Devoluciones">
      <SectionPanel title="Registrar devolución">
        <QueryFeedback loading={query.isPending} error={query.error} />
        {query.data && (
          <form onSubmit={save} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField
              label="Préstamo activo o vencido"
              name="prestamo_id"
              options={query.data.prestamos
                .filter((p) => ['ACTIVO', 'VENCIDO'].includes(p.estado))
                .map((p) => ({
                  value: p.id,
                  label: `#${p.id} · libro #${p.libro_id} · ${p.estado}`,
                }))}
            />
            <SelectField
              label="Estado físico"
              name="estado_fisico"
              options={(['BUENO', 'DANADO', 'EXTRAVIADO', 'DESTRUIDO'] as EstadoFisico[]).map(
                (estado) => ({ value: estado, label: estado }),
              )}
            />
            <Field label="Observación" name="observacion" />
            <div className="flex items-end">
              <button className={buttonClass} disabled={action.pending}>
                Registrar devolución
              </button>
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <Feedback error={action.error} message={action.message} />
            </div>
          </form>
        )}
      </SectionPanel>
      <SectionPanel title="Devoluciones registradas">
        {query.data && (
          <DataTable
            rows={query.data.devoluciones}
            columns={[
              { titulo: 'Préstamo', mostrar: (d) => d.prestamo_id },
              { titulo: 'Fecha', mostrar: (d) => formatDate(d.fecha) },
              { titulo: 'Estado físico', mostrar: (d) => d.estado_fisico },
              { titulo: 'Días de atraso', mostrar: (d) => d.dias_atraso },
              { titulo: 'Multa', mostrar: (d) => money(d.multa) },
            ]}
          />
        )}
      </SectionPanel>
      <Feedback error={action.error} message={action.message} />
    </Page>
  )
}

type ReportKey = 'activos' | 'vencidos' | 'solicitados' | 'disponibilidad'

function ReportesPage() {
  const [report, setReport] = useState<ReportKey>('activos')
  const [sedeId, setSedeId] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [filters, setFilters] = useState({ sedeId: '', desde: '', hasta: '' })
  const sedes = useQuery({
    queryKey: ['sedes', 'reportes'],
    queryFn: async () => (await api.get<Sede[]>('/sedes')).data,
  })
  const query = useQuery({
    queryKey: ['reportes', report, filters],
    queryFn: async () => {
      const params: Record<string, string | number> = {}
      if (filters.sedeId && (report === 'activos' || report === 'disponibilidad'))
        params.sede_id = Number(filters.sedeId)
      if (filters.desde && report === 'solicitados') params.desde = filters.desde
      if (filters.hasta && report === 'solicitados') params.hasta = filters.hasta
      const endpoint: Record<ReportKey, string> = {
        activos: '/reportes/prestamos-activos-y-en-transito',
        vencidos: '/reportes/prestamos-vencidos-y-multas',
        solicitados: '/reportes/libros-mas-solicitados',
        disponibilidad: '/reportes/disponibilidad-por-sede',
      }
      return (await api.get(endpoint[report], { params })).data
    },
  })

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFilters({ sedeId, desde, hasta })
  }

  const reportOptions: { key: ReportKey; label: string }[] = [
    { key: 'activos', label: 'Préstamos activos y en tránsito' },
    { key: 'vencidos', label: 'Préstamos vencidos y multas' },
    { key: 'solicitados', label: 'Libros más solicitados' },
    { key: 'disponibilidad', label: 'Disponibilidad por sede' },
  ]

  return (
    <Page title="Reportes">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Reportes">
        {reportOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={report === option.key}
            className={report === option.key ? buttonClass : secondaryButtonClass}
            onClick={() => setReport(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {(report === 'activos' || report === 'disponibilidad' || report === 'solicitados') && (
        <SectionPanel title="Filtros">
          <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-3">
            {(report === 'activos' || report === 'disponibilidad') && (
              <label className="min-w-52 space-y-1 text-sm font-medium text-slate-700">
                <span>Sede</span>
                <select
                  className={inputClass}
                  value={sedeId}
                  onChange={(event) => setSedeId(event.target.value)}
                >
                  <option value="">Todas las sedes</option>
                  {sedes.data?.map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {report === 'solicitados' && (
              <>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Desde</span>
                  <input
                    className={inputClass}
                    type="date"
                    value={desde}
                    onChange={(event) => setDesde(event.target.value)}
                  />
                </label>
                <label className="space-y-1 text-sm font-medium text-slate-700">
                  <span>Hasta</span>
                  <input
                    className={inputClass}
                    type="date"
                    value={hasta}
                    onChange={(event) => setHasta(event.target.value)}
                  />
                </label>
              </>
            )}
            <button className={secondaryButtonClass}>Aplicar</button>
          </form>
        </SectionPanel>
      )}
      <SectionPanel
        title={reportOptions.find((option) => option.key === report)?.label ?? 'Reporte'}
      >
        <QueryFeedback loading={query.isPending} error={query.error} />
        {report === 'activos' && query.data && (
          <ActivosReport
            data={
              query.data as {
                totales: { prestamos_activos: number; material_en_transito: number }
                prestamos_activos: {
                  prestamo_id: number
                  estado: string
                  socio: string
                  libro: string
                  sede_origen: string
                  sede_destino: string
                  fecha_vencimiento: string | null
                }[]
                material_en_transito: {
                  remito: string
                  tipo: string
                  libro: string
                  sede_origen: string
                  sede_destino: string
                  fecha_salida: string
                  horas_en_transito: number
                }[]
              }
            }
          />
        )}
        {report === 'vencidos' && query.data && (
          <VencidosReport
            data={
              query.data as {
                total_prestamos_vencidos: number
                multa_pendiente_total: number
                prestamos: {
                  prestamo_id: number
                  socio_id: number
                  socio: string
                  libro: string
                  sede_destino: string
                  fecha_vencimiento: string
                  dias_atraso: number
                  multa_proyectada: number
                }[]
              }
            }
          />
        )}
        {report === 'solicitados' && query.data && (
          <div className="mb-6">
            <ReportBarChart
              title="Ranking de libros más solicitados"
              description="Solicitudes interbibliotecarias en el período seleccionado, de mayor a menor."
              series={[{ label: 'Solicitudes', color: 'bg-indigo-500' }]}
              rows={[...(query.data as { titulo: string; solicitudes: number }[])]
                .sort((a, b) => b.solicitudes - a.solicitudes)
                .map((libro) => ({ label: libro.titulo, values: [libro.solicitudes] }))}
            />
          </div>
        )}
        {report === 'solicitados' && query.data && (
          <DataTable
            rows={
              query.data as {
                libro_id: number
                titulo: string
                isbn: string
                solicitudes: number
                sedes_destino_distintas: number
                socios_distintos: number
              }[]
            }
            columns={[
              { titulo: 'Libro', mostrar: (l) => l.titulo },
              { titulo: 'ISBN', mostrar: (l) => l.isbn },
              { titulo: 'Solicitudes', mostrar: (l) => l.solicitudes },
              { titulo: 'Sedes destino', mostrar: (l) => l.sedes_destino_distintas },
              { titulo: 'Socios', mostrar: (l) => l.socios_distintos },
            ]}
          />
        )}
        {report === 'disponibilidad' && query.data && (
          <DisponibilidadReport
            data={
              query.data as {
                sede_id: number
                sede: string
                total_ejemplares: number
                disponibles: number
                titulos_distintos: number
                libros: Disponibilidad[]
              }[]
            }
          />
        )}
      </SectionPanel>
    </Page>
  )
}

function ActivosReport({
  data,
}: {
  data: {
    totales: { prestamos_activos: number; material_en_transito: number }
    prestamos_activos: {
      prestamo_id: number
      estado: string
      socio: string
      libro: string
      sede_origen: string
      sede_destino: string
      fecha_vencimiento: string | null
    }[]
    material_en_transito: {
      remito: string
      tipo: string
      libro: string
      sede_origen: string
      sede_destino: string
      fecha_salida: string
      horas_en_transito: number
    }[]
  }
}) {
  return (
    <div className="space-y-6">
      <ReportBarChart
        title="Resumen de actividad"
        description="Comparación de préstamos activos o vencidos y remitos despachados. Son indicadores independientes."
        series={[{ label: 'Cantidad', color: 'bg-indigo-500' }]}
        rows={[
          { label: 'Préstamos activos y vencidos', values: [data.totales.prestamos_activos] },
          { label: 'Material en tránsito', values: [data.totales.material_en_transito] },
        ]}
      />
      <p className="text-sm text-slate-700">
        Préstamos activos: <strong>{data.totales.prestamos_activos}</strong> · Material en tránsito:{' '}
        <strong>{data.totales.material_en_transito}</strong>
      </p>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-800">Préstamos activos</h3>
        <DataTable
          rows={data.prestamos_activos}
          columns={[
            { titulo: 'Préstamo', mostrar: (p) => p.prestamo_id },
            { titulo: 'Estado', mostrar: (p) => p.estado },
            { titulo: 'Socio', mostrar: (p) => p.socio },
            { titulo: 'Libro', mostrar: (p) => p.libro },
            { titulo: 'Origen', mostrar: (p) => p.sede_origen },
            { titulo: 'Destino', mostrar: (p) => p.sede_destino },
            { titulo: 'Vencimiento', mostrar: (p) => p.fecha_vencimiento ?? '—' },
          ]}
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-800">Material en tránsito</h3>
        <DataTable
          rows={data.material_en_transito}
          columns={[
            { titulo: 'Remito', mostrar: (r) => r.remito },
            { titulo: 'Tipo', mostrar: (r) => r.tipo },
            { titulo: 'Libro', mostrar: (r) => r.libro },
            { titulo: 'Origen', mostrar: (r) => r.sede_origen },
            { titulo: 'Destino', mostrar: (r) => r.sede_destino },
            { titulo: 'Salida', mostrar: (r) => formatDate(r.fecha_salida) },
            { titulo: 'Horas en tránsito', mostrar: (r) => r.horas_en_transito },
          ]}
        />
      </div>
    </div>
  )
}

function VencidosReport({
  data,
}: {
  data: {
    total_prestamos_vencidos: number
    multa_pendiente_total: number
    prestamos: {
      prestamo_id: number
      socio_id: number
      socio: string
      libro: string
      sede_destino: string
      fecha_vencimiento: string
      dias_atraso: number
      multa_proyectada: number
    }[]
  }
}) {
  const multasPorSocio = new Map<number, { nombre: string; multa: number }>()
  for (const prestamo of data.prestamos) {
    multasPorSocio.set(prestamo.socio_id, {
      nombre: prestamo.socio,
      multa:
        (multasPorSocio.get(prestamo.socio_id)?.multa ?? 0) + Number(prestamo.multa_proyectada),
    })
  }

  return (
    <div className="space-y-4">
      <ReportBarChart
        title="Multas pendientes por socio"
        description="Los 10 socios con mayor multa proyectada por préstamos vencidos."
        series={[{ label: 'Multa proyectada', color: 'bg-amber-500' }]}
        rows={[...multasPorSocio.values()]
          .sort((a, b) => b.multa - a.multa)
          .slice(0, 10)
          .map((socio) => ({ label: socio.nombre, values: [socio.multa] }))}
        formatValue={money}
      />
      <p className="text-sm text-slate-700">
        Préstamos vencidos: <strong>{data.total_prestamos_vencidos}</strong> · Multa pendiente:{' '}
        <strong>{money(data.multa_pendiente_total)}</strong>
      </p>
      <DataTable
        rows={data.prestamos}
        columns={[
          { titulo: 'Préstamo', mostrar: (p) => p.prestamo_id },
          { titulo: 'Socio', mostrar: (p) => p.socio },
          { titulo: 'Libro', mostrar: (p) => p.libro },
          { titulo: 'Sede destino', mostrar: (p) => p.sede_destino },
          { titulo: 'Vencimiento', mostrar: (p) => p.fecha_vencimiento },
          { titulo: 'Días de atraso', mostrar: (p) => p.dias_atraso },
          { titulo: 'Multa proyectada', mostrar: (p) => money(p.multa_proyectada) },
        ]}
      />
    </div>
  )
}

function DisponibilidadReport({
  data,
}: {
  data: {
    sede_id: number
    sede: string
    total_ejemplares: number
    disponibles: number
    titulos_distintos: number
    libros: Disponibilidad[]
  }[]
}) {
  const rows = data.flatMap((sede) => sede.libros.map((libro) => ({ ...libro, sede: sede.sede })))
  return (
    <div className="space-y-6">
      <ReportBarChart
        title="Disponibilidad por sede"
        description="Ejemplares disponibles respecto del total de cada sede, en una misma escala."
        series={[
          { label: 'Total de ejemplares', color: 'bg-indigo-500' },
          { label: 'Disponibles', color: 'bg-emerald-500' },
        ]}
        rows={data.map((sede) => ({
          label: sede.sede,
          values: [sede.total_ejemplares, sede.disponibles],
        }))}
      />
      <DataTable
        rows={rows}
        columns={[
          { titulo: 'Sede', mostrar: (x) => x.sede },
          { titulo: 'Libro', mostrar: (x) => x.titulo },
          { titulo: 'ISBN', mostrar: (x) => x.isbn },
          { titulo: 'Total', mostrar: (x) => x.total_ejemplares },
          { titulo: 'Disponibles', mostrar: (x) => x.disponibles },
          { titulo: 'Prestados', mostrar: (x) => x.prestados },
          { titulo: 'En tránsito', mostrar: (x) => x.en_transito },
          { titulo: 'Reservas', mostrar: (x) => x.reservas_activas },
          { titulo: 'Disponibles netos', mostrar: (x) => x.disponibles_netos },
        ]}
      />
    </div>
  )
}

function DisponibilidadPage() {
  const [filters, setFilters] = useState({ titulo: '', sede_id: '' })
  const [applied, setApplied] = useState(filters)
  const query = useQuery({
    queryKey: ['disponibilidad', applied],
    queryFn: async () =>
      (
        await api.get<Disponibilidad[]>('/disponibilidad', {
          params: {
            ...(applied.titulo ? { titulo: applied.titulo } : {}),
            ...(applied.sede_id ? { sede_id: Number(applied.sede_id) } : {}),
          },
        })
      ).data,
  })
  const sedes = useQuery({
    queryKey: ['sedes-disponibilidad'],
    queryFn: async () => (await api.get<Sede[]>('/sedes')).data,
  })

  return (
    <Page title="Disponibilidad">
      <SectionPanel title="Consultar catálogo por sede">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setApplied(filters)
          }}
          className="grid gap-3 sm:grid-cols-3"
        >
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Título</span>
            <input
              className={inputClass}
              value={filters.titulo}
              onChange={(event) => setFilters({ ...filters, titulo: event.target.value })}
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Sede</span>
            <select
              className={inputClass}
              value={filters.sede_id}
              onChange={(event) => setFilters({ ...filters, sede_id: event.target.value })}
            >
              <option value="">Todas</option>
              {sedes.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button className={buttonClass}>Consultar</button>
          </div>
        </form>
      </SectionPanel>
      <SectionPanel title="Ejemplares y disponibilidad">
        <QueryFeedback loading={query.isPending} error={query.error} />
        {query.data && (
          <DataTable
            rows={query.data}
            columns={[
              { titulo: 'Libro', mostrar: (x) => x.titulo },
              { titulo: 'ISBN', mostrar: (x) => x.isbn },
              { titulo: 'Sede', mostrar: (x) => x.sede },
              { titulo: 'Total', mostrar: (x) => x.total_ejemplares },
              { titulo: 'Disponibles', mostrar: (x) => x.disponibles },
              { titulo: 'Prestados', mostrar: (x) => x.prestados },
              { titulo: 'En tránsito', mostrar: (x) => x.en_transito },
              { titulo: 'Reservas', mostrar: (x) => x.reservas_activas },
              { titulo: 'Disponibles netos', mostrar: (x) => x.disponibles_netos },
            ]}
          />
        )}
      </SectionPanel>
    </Page>
  )
}

export function OperationsPage({ section }: { section: Section }) {
  switch (section) {
    case 'catalogo':
      return <CatalogPage />
    case 'disponibilidad':
      return <DisponibilidadPage />
    case 'sedes':
      return <SedesPage />
    case 'socios':
      return <SociosPage />
    case 'libros':
      return <CatalogPage manage />
    case 'ejemplares':
      return <EjemplaresPage />
    case 'prestamos':
      return <PrestamosPage />
    case 'reservas':
      return <ReservasPage />
    case 'remitos':
      return <RemitosPage />
    case 'devoluciones':
      return <DevolucionesPage />
    case 'reportes':
      return <ReportesPage />
  }
}
