import { SearchX } from 'lucide-react'
import { StatusPage } from '@/components/ui/StatusPage'

export function NotFoundPage() {
  return (
    <StatusPage
      icon={<SearchX size={28} />}
      title="Página no encontrada"
      description="La dirección que ingresaste no existe o fue movida."
    />
  )
}
