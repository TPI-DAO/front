import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from './Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error no controlado:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Algo salió mal</h1>
          <p className="mt-2 max-w-sm text-sm text-slate-500">
            Ocurrió un error inesperado. Recargá la página para volver a intentarlo.
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Recargar
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
