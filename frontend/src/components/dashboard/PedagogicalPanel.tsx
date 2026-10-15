import { BarChart3, CircleDot, Target, UsersRound } from 'lucide-react'
import type {
  IntegrationState,
  PedagogicalIndicator,
} from '../../features/dashboard/dashboard.types'
import { IntegrationPlaceholder } from './IntegrationPlaceholder'

interface PedagogicalPanelProps {
  indicator: PedagogicalIndicator
  state: IntegrationState
}

export function PedagogicalPanel({
  indicator,
  state,
}: PedagogicalPanelProps) {
  return (
    <section className="pedagogical-panel" aria-labelledby="pedagogical-heading">
      <h2 id="pedagogical-heading">
        <BarChart3 aria-hidden="true" />
        Indicador pedagógico
      </h2>
      {state === 'pending' ? (
        <IntegrationPlaceholder title="Indicadores ainda não integrados" />
      ) : (
        <>
          <div className="indicator-overview">
            <div
              className="attendance-donut"
              style={{ '--rate': indicator.attendanceRate ?? 0 } as React.CSSProperties}
              role="img"
              aria-label={`${indicator.attendanceRate}% de presença efetiva`}
            >
              <div>
                <strong>{indicator.attendanceRate}%</strong>
                <span>presença efetiva</span>
              </div>
            </div>
            <div className="indicator-kpis">
              <div>
                <span>Meta Municipal</span>
                <strong>{indicator.municipalTarget?.toFixed(1)}%</strong>
                <small>✓ meta atingida</small>
              </div>
              <div>
                <span>Faltas justificadas</span>
                <strong>{indicator.justifiedAbsenceRate?.toFixed(1)}%</strong>
                <small>✓ {indicator.justifiedAbsenceLabel}</small>
              </div>
            </div>
          </div>

          <div className="indicator-links">
            <div>
              <UsersRound aria-hidden="true" />
              <strong>{indicator.activeStudents} alunos</strong>
              <span>ativos no polo</span>
            </div>
            <div>
              <CircleDot aria-hidden="true" />
              <strong>{indicator.atRiskStudents} em risco</strong>
              <span>de evasão</span>
            </div>
            <div>
              <Target aria-hidden="true" />
              <strong>Busca ativa</strong>
            </div>
          </div>

          <p className="frequency-title">
            Evolução da frequência <span>(Últimas 5 semanas)</span>
          </p>
          <div className="frequency-chart" aria-label="Evolução da frequência">
            {indicator.weeklyFrequency.map((value, index) => (
              <div className="chart-bar-wrap" key={`${index}-${value}`}>
                <span className="chart-bar" style={{ height: `${value}%` }} />
                <small>Sem {index + 1}</small>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
