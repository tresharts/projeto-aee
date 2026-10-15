import {
  CalendarDays,
  ClipboardCheck,
  RotateCcw,
  TriangleAlert,
} from 'lucide-react'
import type { MetricItem } from '../../features/dashboard/dashboard.types'

const iconByMetric = {
  appointments: CalendarDays,
  'attendance-alert': TriangleAlert,
  pei: ClipboardCheck,
  'school-returns': RotateCcw,
} as const

interface MetricCardsProps {
  metrics: MetricItem[]
}

export function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <section className="metrics-grid" aria-label="Indicadores do dia">
      {metrics.map((metric) => {
        const Icon = iconByMetric[metric.id]

        return (
          <article className="metric-card" key={metric.id}>
            <div className="metric-heading">
              <span className={`metric-icon metric-${metric.tone}`}>
                <Icon aria-hidden="true" />
              </span>
              <h2>{metric.title}</h2>
            </div>
            <p className="metric-value">
              {metric.value}
              {metric.suffix && <small>{metric.suffix}</small>}
            </p>
            <p
              className={`metric-description ${metric.tone === 'red' ? 'text-alert' : ''}`}
            >
              {metric.description}
            </p>
            <div
              className="metric-progress"
              role="progressbar"
              aria-label={`${metric.title}: ${metric.description}`}
              aria-valuenow={metric.available ? metric.progress : undefined}
              aria-valuemin={metric.available ? 0 : undefined}
              aria-valuemax={metric.available ? 100 : undefined}
            >
              <span
                className={`progress-${metric.tone}`}
                style={{ width: `${metric.progress}%` }}
              />
            </div>
          </article>
        )
      })}
    </section>
  )
}
