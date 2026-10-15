import { BellRing, CircleAlert } from 'lucide-react'
import type {
  DashboardAlert,
  IntegrationState,
} from '../../features/dashboard/dashboard.types'
import { IntegrationPlaceholder } from './IntegrationPlaceholder'

interface AlertsPanelProps {
  alerts: DashboardAlert[]
  state: IntegrationState
}

export function AlertsPanel({ alerts, state }: AlertsPanelProps) {
  return (
    <section className="alerts-panel" aria-labelledby="alerts-heading">
      <h2 id="alerts-heading">
        <span>
          <CircleAlert aria-hidden="true" />
        </span>
        Alertas automáticos
      </h2>
      {state === 'pending' ? (
        <IntegrationPlaceholder compact />
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <article className={`alert-row alert-${alert.tone}`} key={alert.id}>
              <span className="alert-bell">
                <BellRing aria-hidden="true" />
              </span>
              <p>
                <strong>{alert.studentName}</strong>
                {alert.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
