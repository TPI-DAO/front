import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidarOperaciones } from './invalidarOperaciones'

// Una transición puede modificar simultáneamente préstamo, reserva, ejemplar y remito.
export function useOperacionMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  onSuccess: (data: TData) => void,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async (data) => {
      await invalidarOperaciones(queryClient)
      onSuccess(data)
    },
  })
}
