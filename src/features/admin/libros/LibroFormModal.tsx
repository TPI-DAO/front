import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { actualizarLibro, crearLibro } from '@/api/catalogo'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { FormField } from '@/components/ui/FormField'
import { Modal } from '@/components/ui/Modal'
import { mensajeDeError } from '@/lib/errors'
import { fieldClass } from '@/lib/formStyles'
import { queryKeys } from '@/lib/queryKeys'
import type { Autor, Editorial, Genero, Libro } from '@/types/api'

const libroSchema = z.object({
  titulo: z.string().trim().min(1, 'Ingresá el título').max(255, 'Máximo 255 caracteres'),
  isbn: z
    .string()
    .trim()
    .min(10, 'El ISBN debe tener al menos 10 caracteres')
    .max(20, 'Máximo 20 caracteres'),
  genero_id: z.number().int().positive('Seleccioná un género'),
  autor_id: z.number().int().positive('Seleccioná un autor'),
  editorial_id: z.number().int().positive('Seleccioná una editorial'),
})

type LibroFormValues = z.infer<typeof libroSchema>

export function LibroFormModal({
  libro,
  generos,
  autores,
  editoriales,
  onCerrar,
  onSaved,
}: {
  libro?: Libro
  generos: Genero[]
  autores: Autor[]
  editoriales: Editorial[]
  onCerrar: () => void
  onSaved: (mensaje: string) => void
}) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LibroFormValues>({
    resolver: zodResolver(libroSchema),
    defaultValues: {
      titulo: libro?.titulo ?? '',
      isbn: libro?.isbn ?? '',
      genero_id: libro?.genero.id ?? 0,
      autor_id: libro?.autor.id ?? 0,
      editorial_id: libro?.editorial.id ?? 0,
    },
  })

  const mutation = useMutation({
    mutationFn: (values: LibroFormValues) =>
      libro ? actualizarLibro(libro.id, values) : crearLibro(values),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.libros })
      void queryClient.invalidateQueries({ queryKey: queryKeys.disponibilidad })
      void queryClient.invalidateQueries({ queryKey: queryKeys.ejemplares })
      onSaved(libro ? 'Libro actualizado correctamente.' : 'Libro registrado correctamente.')
    },
  })

  const onSubmit = handleSubmit((values) => mutation.mutate(values))

  return (
    <Modal
      abierto
      titulo={libro ? 'Editar libro' : 'Nuevo libro'}
      descripcion={
        libro
          ? 'Actualizá los datos bibliográficos del libro.'
          : 'Registrá un nuevo título en el catálogo.'
      }
      onCerrar={onCerrar}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {mutation.isError && <Alert tone="error">{mensajeDeError(mutation.error)}</Alert>}

        <FormField label="Título" htmlFor="libro-titulo" error={errors.titulo?.message}>
          <input
            id="libro-titulo"
            {...register('titulo')}
            className={fieldClass}
            autoFocus
            aria-invalid={Boolean(errors.titulo)}
          />
        </FormField>

        <FormField
          label="ISBN"
          htmlFor="libro-isbn"
          hint="Se normaliza sin guiones ni espacios."
          error={errors.isbn?.message}
        >
          <input
            id="libro-isbn"
            {...register('isbn')}
            className={fieldClass}
            aria-invalid={Boolean(errors.isbn)}
          />
        </FormField>

        <FormField label="Género" htmlFor="libro-genero" error={errors.genero_id?.message}>
          <select
            id="libro-genero"
            {...register('genero_id', { valueAsNumber: true })}
            className={fieldClass}
            aria-invalid={Boolean(errors.genero_id)}
          >
            <option value={0}>Seleccioná un género</option>
            {generos.map((genero) => (
              <option key={genero.id} value={genero.id}>
                {genero.nombre}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Autor" htmlFor="libro-autor" error={errors.autor_id?.message}>
          <select
            id="libro-autor"
            {...register('autor_id', { valueAsNumber: true })}
            className={fieldClass}
            aria-invalid={Boolean(errors.autor_id)}
          >
            <option value={0}>Seleccioná un autor</option>
            {autores.map((autor) => (
              <option key={autor.id} value={autor.id}>
                {autor.nombre}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Editorial" htmlFor="libro-editorial" error={errors.editorial_id?.message}>
          <select
            id="libro-editorial"
            {...register('editorial_id', { valueAsNumber: true })}
            className={fieldClass}
            aria-invalid={Boolean(errors.editorial_id)}
          >
            <option value={0}>Seleccioná una editorial</option>
            {editoriales.map((editorial) => (
              <option key={editorial.id} value={editorial.id}>
                {editorial.descripcion}
              </option>
            ))}
          </select>
        </FormField>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onCerrar} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Guardando…' : libro ? 'Guardar cambios' : 'Registrar libro'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
