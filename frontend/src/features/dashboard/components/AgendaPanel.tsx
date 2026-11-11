import { CalendarDays, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type {
  Appointment,
  IntegrationState,
} from '../dashboard.types'
import { AvatarBadge } from '@/components/people/AvatarBadge'
import { IntegrationPlaceholder } from './IntegrationPlaceholder'

interface AgendaPanelProps {
  appointments: Appointment[]
  state: IntegrationState
  days: Array<{ key: string; label: string; date: string; fullLabel: string; today: boolean }>
  selectedDate: string
  onSelectDate: (date: string) => void
  onViewCalendar: () => void
  onStartAttendance: (appointment: Appointment) => void
}

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
  days,
  selectedDate,
  onSelectDate,
  onViewCalendar,
  onStartAttendance,
}: AgendaPanelProps) {
  return (
    <section className="agenda-panel" aria-labelledby="agenda-heading">
      <div className="panel-heading agenda-heading-row">
        <h2 id="agenda-heading">
          <span className="round-heading-icon">
            <CalendarDays aria-hidden="true" />
          </span>
          Agenda da semana
        </h2>
        <Button
          variant="ghost"
          className="view-all-button"
          type="button"
          onClick={onViewCalendar}
        >
          ver todos <span aria-hidden="true">›</span>
        </Button>
      </div>

      <div className="agenda-filters agenda-weekdays" role="group" aria-label="Escolher dia da semana">
        {days.map((day) => (
          <Button
            variant="ghost"
            className={`${selectedDate === day.key ? 'selected' : ''} ${day.today ? 'today' : ''}`}
            key={day.key}
            type="button"
            aria-label={day.fullLabel}
            aria-pressed={selectedDate === day.key}
            onClick={() => onSelectDate(day.key)}
          >
            <span>{day.label}</span>
            <strong>{day.date}</strong>
          </Button>
        ))}
      </div>

      {state === 'pending' ? (
        <IntegrationPlaceholder title="Agenda ainda não integrada" />
      ) : appointments.length === 0 ? (
        <div className="agenda-empty">Nenhuma sessão agendada para este dia.</div>
      ) : (
        <div className="appointments-list">
          {appointments.map((appointment) => (
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
                    aria-label={`Iniciar atendimento de ${appointment.studentName}`}
                    onClick={() => onStartAttendance(appointment)}
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
                ) : appointment.status === 'Falta' ? (
                  <span className="appointment-status-default status-absence">Falta registrada</span>
                ) : appointment.status === 'Cancelado' ? (
                  <span className="appointment-status-default">Cancelado</span>
                ) : appointment.status === 'Realizado' ? (
                  <span className="status-complete">Realizado</span>
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
