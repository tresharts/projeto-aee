import { BellRing, CircleAlert, Clock3 } from 'lucide-react'
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
      ) : alerts.length === 0 ? (
        <div className="integration-placeholder compact">
          <Clock3 aria-hidden="true" />
          <strong>Sem alertas automáticos</strong>
          <span>Não há alertas para exibir no momento.</span>
        </div>
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
