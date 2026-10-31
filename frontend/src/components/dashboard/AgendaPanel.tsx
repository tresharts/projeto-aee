import { CalendarDays, Pause, Play } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../ui/button'
import { getDayPeriod } from '../../lib/date'
import type {
  Appointment,
  DayPeriod,
  IntegrationState,
} from '../../features/dashboard/dashboard.types'
import { AvatarBadge } from './AvatarBadge'
import { IntegrationPlaceholder } from './IntegrationPlaceholder'

interface AgendaPanelProps {
  appointments: Appointment[]
  state: IntegrationState
  onUnavailable: (feature: string) => void
}

const filters: Array<{ id: DayPeriod; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'morning', label: 'Manhã' },
  { id: 'afternoon', label: 'Tarde' },
]

function tagClassName(tag: string) {
  const normalized = tag.toLocaleLowerCase('pt-BR')
  if (normalized.includes('visual')) return 'tag-aqua'
  if (normalized.includes('fobia')) return 'tag-peach'
  if (normalized.includes('surdez')) return 'tag-slate'
  if (normalized.includes('tdah')) return 'tag-violet'
  return 'tag-pink'
}

export function AgendaPanel({
  appointments,
  state,
  onUnavailable,
}: AgendaPanelProps) {
  const [period, setPeriod] = useState<DayPeriod>('all')
  const visibleAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          period === 'all' || getDayPeriod(appointment.time) === period,
      ),
    [appointments, period],
  )

  return (
    <section className="agenda-panel" aria-labelledby="agenda-heading">
      <div className="panel-heading agenda-heading-row">
        <h2 id="agenda-heading">
          <span className="round-heading-icon">
            <CalendarDays aria-hidden="true" />
          </span>
          Agenda do dia
        </h2>
        <Button
          variant="ghost"
          className="view-all-button"
          type="button"
          onClick={() => onUnavailable('A agenda completa')}
        >
          ver todos <span aria-hidden="true">›</span>
        </Button>
      </div>

      <div className="agenda-filters" aria-label="Filtrar agenda por período">
        {filters.map((filter) => (
          <Button
            variant="ghost"
            className={period === filter.id ? 'selected' : ''}
            key={filter.id}
            type="button"
            aria-pressed={period === filter.id}
            onClick={() => setPeriod(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {state === 'pending' ? (
        <IntegrationPlaceholder title="Agenda ainda não integrada" />
      ) : visibleAppointments.length === 0 ? (
        <div className="agenda-empty">Nenhum atendimento neste período.</div>
      ) : (
        <div className="appointments-list">
          {visibleAppointments.map((appointment) => (
            <article className="appointment-row" key={appointment.id}>
              <time>{appointment.time}</time>
              <AvatarBadge
                name={appointment.studentName}
                tone={appointment.avatarTone}
              />
              <div className="student-details">
                <div className="student-name-line">
                  <strong>{appointment.studentName}</strong>
                  <small>{appointment.schoolName}</small>
                </div>
                <div className="student-tags">
                  {appointment.tags.map((tag) => (
                    <span className={tagClassName(tag)} key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="appointment-status">
                {appointment.status === 'Aguardando' ? (
                  <Button
                    variant="ghost"
                    className="appointment-status-trigger"
                    type="button"
                    aria-label={`Status: aguardando. Iniciar atendimento para ${appointment.studentName}`}
                    onClick={() => onUnavailable('O início de atendimento')}
                  >
                    <span className="appointment-status-default">
                      <Pause className="appointment-status-play" aria-hidden="true" />
                      <span className="status-waiting">Aguardando</span>
                    </span>
                    <span className="appointment-status-action-label">
                      <Play className="appointment-status-action-icon" aria-hidden="true" />
                      <span>Iniciar atendimento</span>
                    </span>
                  </Button>
                ) : (
                  <span className="status-progress">Em andamento</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
