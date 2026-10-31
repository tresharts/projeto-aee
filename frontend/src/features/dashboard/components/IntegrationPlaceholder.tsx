import { Clock3 } from 'lucide-react'

interface IntegrationPlaceholderProps {
  title?: string
  compact?: boolean
}

export function IntegrationPlaceholder({
  title = 'Integração pendente',
  compact = false,
}: IntegrationPlaceholderProps) {
  return (
    <div className={`integration-placeholder ${compact ? 'compact' : ''}`}>
      <Clock3 aria-hidden="true" />
      <strong>{title}</strong>
      <span>O backend atual ainda não disponibiliza estes dados.</span>
    </div>
  )
}
