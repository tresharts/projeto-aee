import { Database, FlaskConical } from 'lucide-react'
import type { DashboardDataMode } from '../../features/dashboard/dashboard.types'

interface ModeBannerProps {
  mode: DashboardDataMode
  summary: string
}

export function ModeBanner({ mode, summary }: ModeBannerProps) {
  const Icon = mode === 'demo' ? FlaskConical : Database

  return (
    <div className={`mode-banner mode-${mode}`} role="status">
      <Icon aria-hidden="true" />
      <span>{summary}</span>
    </div>
  )
}
