import { LoaderCircle, LockKeyhole, RefreshCw, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardStateProps {
  status: 'loading' | 'error' | 'unauthorized'
  message?: string
  onRetry: () => void
}

export function DashboardState({
  status,
  message,
  onRetry,
}: DashboardStateProps) {
  const Icon =
    status === 'loading'
      ? LoaderCircle
      : status === 'unauthorized'
        ? LockKeyhole
        : WifiOff

  const title =
    status === 'loading'
      ? 'Carregando o dashboard…'
      : status === 'unauthorized'
        ? 'Acesso não autorizado'
        : 'Backend indisponível'

  return (
    <section className="dashboard-state" aria-live="polite">
      <Icon className={status === 'loading' ? 'spin' : ''} aria-hidden="true" />
      <h1>{title}</h1>
      <p>
        {message ??
          'Aguarde enquanto buscamos os dados disponíveis no backend do AEE Conecta.'}
      </p>
      {status !== 'loading' && (
        <Button type="button" onClick={onRetry}>
          <RefreshCw aria-hidden="true" /> Tentar novamente
        </Button>
      )}
    </section>
  )
}
