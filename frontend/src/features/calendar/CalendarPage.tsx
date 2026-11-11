import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Plus, UserRound, X } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api'
import { getStudents } from '@/features/students/student.service'
import type { Student } from '@/features/students/student.types'
import {
  createScheduledSession,
  getScheduledSessions,
  updateScheduledSession,
  updateScheduledSessionStatus,
  type ScheduledSession,
  type ScheduledSessionDraft,
} from './calendar.service'

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function addDays(date: Date, amount: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

function mondayOf(date: Date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = (result.getDay() + 6) % 7
  result.setDate(result.getDate() - day)
  return result
}

function dateLabel(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('pt-BR', options).format(date)
}

function sessionStatusLabel(status: ScheduledSession['status']) {
  if (status === 'FALTA') return 'Falta registrada'
  if (status === 'REALIZADA') return 'Realizada'
  if (status === 'CANCELADA') return 'Cancelada'
  return 'Agendada'
}

export function CalendarPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedDate = searchParams.get('data')
  const initialDate = requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)
    ? new Date(`${requestedDate}T12:00:00`)
    : new Date()
  const [weekStart, setWeekStart] = useState(() => mondayOf(initialDate))
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(initialDate))
  const [sessions, setSessions] = useState<ScheduledSession[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [time, setTime] = useState('14:00')
  const [observation, setObservation] = useState('')
  const [editing, setEditing] = useState<ScheduledSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busySessionId, setBusySessionId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart])
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])
  const selectedSessions = useMemo(
    () => sessions.filter((session) => session.dataHora.slice(0, 10) === selectedDate),
    [sessions, selectedDate],
  )

  const loadSessions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await getScheduledSessions(localDateKey(weekStart), localDateKey(weekEnd))
      setSessions(result)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível carregar as sessões.')
    } finally {
      setLoading(false)
    }
  }, [weekStart, weekEnd])

  useEffect(() => { void loadSessions() }, [loadSessions])

  useEffect(() => {
    void getStudents(0, '', 'all', 'active', 100)
      .then((page) => setStudents(page.content))
      .catch(() => setError('Não foi possível carregar os alunos ativos.'))
  }, [])

  const resetForm = () => {
    setEditing(null)
    setSelectedStudentId('')
    setTime('14:00')
    setObservation('')
  }

  const handleEdit = (session: ScheduledSession) => {
    setEditing(session)
    setSelectedStudentId(session.alunoId)
    setTime(session.dataHora.slice(11, 16))
    setObservation(session.observacao ?? '')
    setSelectedDate(session.dataHora.slice(0, 10))
  }

  const handleDateChange = (value: string) => {
    if (!value) return
    const date = new Date(`${value}T12:00:00`)
    setSelectedDate(value)
    setWeekStart(mondayOf(date))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedStudentId) return
    setSaving(true)
    setError('')
    const draft: ScheduledSessionDraft = {
      alunoId: selectedStudentId,
      dataHora: `${selectedDate}T${time}:00`,
      observacao: observation,
    }
    try {
      if (editing) await updateScheduledSession(editing.id, draft)
      else await createScheduledSession(draft)
      resetForm()
      setNotice(editing ? 'Sessão atualizada.' : 'Sessão agendada.')
      await loadSessions()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível salvar a sessão.')
    } finally {
      setSaving(false)
    }
  }

  const handleStatus = async (session: ScheduledSession, status: 'FALTA' | 'CANCELADA') => {
    if (status === 'CANCELADA' && !window.confirm(`Cancelar a sessão de ${session.nomeAluno}?`)) return
    setBusySessionId(session.id)
    setError('')
    try {
      await updateScheduledSessionStatus(session.id, status)
      setNotice(status === 'FALTA' ? 'Falta registrada no histórico do aluno.' : 'Sessão cancelada.')
      await loadSessions()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível atualizar a sessão.')
    } finally {
      setBusySessionId(null)
    }
  }

  const shiftWeek = (amount: number) => {
    const next = addDays(weekStart, amount * 7)
    setWeekStart(next)
    setSelectedDate(localDateKey(next))
    resetForm()
  }

  const showUnavailable = (feature: string) => setNotice(`${feature} estará disponível em breve.`)

  return <div className="app-shell calendar-shell">
    <Sidebar activePage="calendar" onUnavailable={showUnavailable} />
    <div className="workspace">
      <TopBar query="" results={[]} searching={false} onQueryChange={() => undefined} onUnavailable={showUnavailable} />
      <main className="calendar-surface">
        <header className="calendar-page-heading">
          <div><span className="calendar-title-icon"><CalendarDays aria-hidden="true" /></span><div><h1 className="app-gradient-title">Calendário</h1><p>Organize as sessões e acompanhe os atendimentos previstos.</p></div></div>
          <Button type="button" className="register-button calendar-new-session" onClick={resetForm}><Plus aria-hidden="true" />Nova sessão</Button>
        </header>

        {error && <div className="calendar-feedback calendar-feedback-error" role="alert">{error}</div>}
        <div className="calendar-week-toolbar">
          <div className="calendar-week-controls">
            <button type="button" aria-label="Semana anterior" onClick={() => shiftWeek(-1)}><ArrowLeft aria-hidden="true" /></button>
            <button type="button" aria-label="Próxima semana" onClick={() => shiftWeek(1)}><ArrowRight aria-hidden="true" /></button>
            <strong>{dateLabel(weekStart, { day: 'numeric', month: 'long' })} – {dateLabel(weekEnd, { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
          </div>
          <button className="calendar-today-button" type="button" onClick={() => { const today = new Date(); setWeekStart(mondayOf(today)); setSelectedDate(localDateKey(today)); resetForm() }}>Hoje</button>
        </div>

        <div className="calendar-week-strip" aria-label="Dias da semana">
          {days.map((day) => {
            const key = localDateKey(day)
            const count = sessions.filter((session) => session.dataHora.slice(0, 10) === key && session.status !== 'CANCELADA').length
            return <button type="button" key={key} className={key === selectedDate ? 'selected' : ''} aria-pressed={key === selectedDate} onClick={() => { setSelectedDate(key); resetForm() }}>
              <span>{dateLabel(day, { weekday: 'short' }).replace('.', '')}</span><strong>{day.getDate()}</strong><small>{count ? `${count} sessão${count === 1 ? '' : 's'}` : 'livre'}</small>
            </button>
          })}
        </div>

        <div className="calendar-content-grid">
          <section className="calendar-day-panel">
            <header><div><h2>{dateLabel(new Date(`${selectedDate}T12:00:00`), { weekday: 'long', day: 'numeric', month: 'long' })}</h2><p>{selectedSessions.length} sessão{selectedSessions.length === 1 ? '' : 'ões'} neste dia</p></div><Clock3 aria-hidden="true" /></header>
            {loading ? <p className="calendar-empty">Carregando sessões…</p> : selectedSessions.length === 0 ? <div className="calendar-empty"><CalendarDays aria-hidden="true" /><strong>Nenhuma sessão agendada</strong><span>Use o formulário para organizar um horário para este dia.</span></div> : <ol className="calendar-session-list">{selectedSessions.map((session) => <li key={session.id} className={`calendar-session status-${session.status.toLowerCase()}`}>
              <time>{session.dataHora.slice(11, 16)}</time><div className="calendar-session-main"><strong>{session.nomeAluno}</strong><span>{session.nomeTurma} · {session.nomeEscola}</span>{session.observacao && <p>{session.observacao}</p>}</div><span className="calendar-session-status">{sessionStatusLabel(session.status)}</span>
              {session.status === 'AGENDADA' && <div className="calendar-session-actions"><button type="button" disabled={busySessionId === session.id} onClick={() => handleEdit(session)}>Editar</button><button type="button" disabled={busySessionId === session.id} onClick={() => void handleStatus(session, 'FALTA')}>Registrar falta</button><button type="button" disabled={busySessionId === session.id} aria-label={`Cancelar sessão de ${session.nomeAluno}`} onClick={() => void handleStatus(session, 'CANCELADA')}><X aria-hidden="true" /></button></div>}
              {session.status === 'AGENDADA' && <button className="calendar-start-attendance" type="button" onClick={() => navigate(`/registro-atendimento?alunoId=${encodeURIComponent(session.alunoId)}&sessaoId=${encodeURIComponent(session.id)}&dataHora=${encodeURIComponent(session.dataHora)}`)}><UserRound aria-hidden="true" />Abrir atendimento</button>}
              {session.status === 'FALTA' && <span className="calendar-attendance-linked"><Check aria-hidden="true" />Falta salva no histórico</span>}
            </li>)}</ol>}
          </section>

          <form className="calendar-session-form" onSubmit={(event) => void handleSubmit(event)}>
            <header><span><Plus aria-hidden="true" /></span><div><h2>{editing ? 'Editar sessão' : 'Agendar sessão'}</h2><p>O horário ficará reservado para o aluno.</p></div></header>
            <label htmlFor="calendar-student">Aluno</label>
            <select id="calendar-student" required value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}><option value="">Selecione um aluno</option>{students.map((student) => <option key={student.id} value={student.id}>{student.nome} · {student.nomeTurma}</option>)}</select>
            <label htmlFor="calendar-date">Data</label>
            <input id="calendar-date" type="date" required value={selectedDate} min={localDateKey(new Date())} onChange={(event) => handleDateChange(event.target.value)} />
            <label htmlFor="calendar-time">Horário</label>
            <input id="calendar-time" type="time" required value={time} onChange={(event) => setTime(event.target.value)} />
            <label htmlFor="calendar-note">Observação <span>(opcional)</span></label>
            <textarea id="calendar-note" maxLength={1000} rows={3} value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Ex.: atendimento de leitura" />
            <div className="calendar-form-actions"><Button type="submit" disabled={saving || !selectedStudentId}>{saving ? 'Salvando…' : editing ? 'Salvar alterações' : 'Agendar sessão'}</Button>{editing && <Button variant="ghost" type="button" onClick={resetForm}>Cancelar edição</Button>}</div>
          </form>
        </div>
      </main>
    </div>
    <BottomNavigation activePage="calendar" onUnavailable={showUnavailable} />
    {notice && <div className="availability-toast" role="status">{notice}</div>}
  </div>
}
