import { ShieldAlert } from 'lucide-react'
import { StatusPage } from '@/components/ui/StatusPage'

export function ForbiddenPage() {
  return (
    <StatusPage
      icon={<ShieldAlert size={28} />}
      tone="red"
      title="Acceso denegado"
      description="Tu usuario no tiene permisos para acceder a esta sección."
    />
  )
}
