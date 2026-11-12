import { useEffect, useState } from 'react'

export interface Feedback {
  tone: 'success' | 'error'
  mensaje: string
}

export function useFeedback(duracionMs = 5000) {
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  useEffect(() => {
    if (!feedback) return
    const id = window.setTimeout(() => setFeedback(null), duracionMs)
    return () => window.clearTimeout(id)
  }, [feedback, duracionMs])

  return {
    feedback,
    mostrarExito: (mensaje: string) => setFeedback({ tone: 'success', mensaje }),
    mostrarError: (mensaje: string) => setFeedback({ tone: 'error', mensaje }),
    cerrarFeedback: () => setFeedback(null),
  }
}
