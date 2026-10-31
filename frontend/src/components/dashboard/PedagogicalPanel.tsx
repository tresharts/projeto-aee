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
  const attendanceRate = indicator.attendanceRate ?? 0
  const municipalTarget = indicator.municipalTarget ?? 0
  const targetDifference = Math.round(attendanceRate - municipalTarget)
  const firstWeek = indicator.weeklyFrequency[0]
  const lastWeek = indicator.weeklyFrequency[indicator.weeklyFrequency.length - 1]
  const weeklyDifference =
    indicator.weeklyFrequency.length > 1 &&
    firstWeek !== undefined &&
    lastWeek !== undefined
      ? Math.round(lastWeek - firstWeek)
      : null

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
                <span>
                  presença
                  <br />
                  efetiva
                </span>
              </div>
            </div>
            <div className="indicator-kpis">
              <div>
                <span>Meta Municipal</span>
                <strong>{municipalTarget.toFixed(0)}%</strong>
                <small>
                  {targetDifference > 0
                    ? `+${targetDifference} pontos acima da meta`
                    : targetDifference < 0
                      ? `${targetDifference} pontos abaixo da meta`
                      : 'na meta'}
                </small>
              </div>
              <div className="indicator-kpi--single-line">
                <span>Faltas justificadas</span>
                <strong>{indicator.justifiedAbsenceRate?.toFixed(0)}%</strong>
              </div>
            </div>
          </div>

          <div className="indicator-links">
            <div>
              <UsersRound aria-hidden="true" />
              <strong>{indicator.activeStudents} ativos</strong>
            </div>
            <div>
              <CircleDot aria-hidden="true" />
              <strong>{indicator.atRiskStudents} em risco</strong>
            </div>
            <div>
              <Target aria-hidden="true" />
              <strong>Busca ativa</strong>
            </div>
          </div>

          <div className="frequency-heading">
            <p className="frequency-title">
              Frequência <span>últimas 5 semanas</span>
            </p>
            {weeklyDifference !== null && (
              <strong
                className={`frequency-trend ${weeklyDifference >= 0 ? 'trend-positive' : 'trend-negative'}`}
              >
                {weeklyDifference > 0 ? '+' : ''}
                {weeklyDifference} pontos
              </strong>
            )}
          </div>
          <div
            className="frequency-chart"
            role="img"
            aria-label={`Evolução da frequência nas últimas cinco semanas${
              weeklyDifference === null
                ? ''
                : `: ${weeklyDifference > 0 ? '+' : ''}${weeklyDifference} pontos percentuais`
            }`}
          >
            {indicator.weeklyFrequency.map((value, index) => (
              <div className="chart-bar-wrap" key={`${index}-${value}`}>
                <div className="chart-bar-area">
                  <span className="chart-bar" style={{ height: `${value}%` }} />
                </div>
                <small>S{index + 1} {value}%</small>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
