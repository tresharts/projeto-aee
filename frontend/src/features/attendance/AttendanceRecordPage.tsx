import { useEffect, useMemo, useState } from 'react'
import {
  BookOpenCheck,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  ClipboardList,
  Clock3,
  HelpCircle,
  Lightbulb,
  MessageSquareText,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { TopBar } from '@/components/layout/TopBar'
import { AvatarBadge } from '@/components/people/AvatarBadge'
import { Button } from '@/components/ui/button'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { apiFetch, ApiError } from '@/lib/api'
import type { Student } from '@/features/students/student.types'
import { updateScheduledSessionStatus } from '@/features/calendar/calendar.service'

type Tab = 'registro' | 'atividade' | 'habilidades' | 'observacoes'

const tabs: { id: Tab; label: string }[] = [
  { id: 'registro', label: 'Registro de atendimento' },
  { id: 'atividade', label: 'Atividade e recursos' },
  { id: 'habilidades', label: 'Habilidades trabalhadas' },
  { id: 'observacoes', label: 'Observações' },
]

const history = [
  'Desenvolvimento de habilidades sociais',
  'Atividade de leitura e escrita',
  'Comunicação alternativa',
  'Interação social',
]

const moods = [
  ['😊', 'Feliz'], ['😢', 'Triste'], ['😟', 'Disperso'], ['😡', 'Irritado'], ['•••', 'Outro'],
]

const participation = [
  'Participou ativamente', 'Participou parcialmente', 'Participou minimamente', 'Apresentou resistência', 'Não foi possível avaliar',
]

const development = [
  'Realizou com autonomia', 'Precisou de orientações verbais', 'Precisou de ajuda visual', 'Não concluiu a atividade', 'Não foi possível avaliar',
]

function ChoiceList({ name, options, value, onChange }: { name: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return <div className="attendance-choice-list">
    {options.map((option) => <label key={option}>
      <input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} />
      <span>{option}</span>
    </label>)}
  </div>
}

export function AttendanceRecordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const alunoId = searchParams.get('alunoId')
  const sessaoId = searchParams.get('sessaoId')
  const dataHoraSessao = searchParams.get('dataHora')
  const [student, setStudent] = useState<Student | null>(null)
  const [loadingStudent, setLoadingStudent] = useState(Boolean(alunoId))
  const [markingAbsence, setMarkingAbsence] = useState(false)
  const [absenceRegistered, setAbsenceRegistered] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('registro')
  const [mood, setMood] = useState('')
  const [participationValue, setParticipationValue] = useState('Não foi possível avaliar')
  const [developmentValue, setDevelopmentValue] = useState('Não foi possível avaliar')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const demoMode = import.meta.env.VITE_DASHBOARD_DATA_MODE !== 'api'
  const demoLabel = useMemo(() => demoMode ? 'Visualização demonstrativa' : 'Integração de dados pendente', [demoMode])

  useEffect(() => {
    if (!alunoId) return
    let active = true
    setLoadingStudent(true)
    void apiFetch<Student>(`/api/alunos/${encodeURIComponent(alunoId)}`)
      .then((result) => { if (active) setStudent(result) })
      .catch((cause) => { if (active) setNotice(cause instanceof ApiError ? cause.message : 'Não foi possível carregar o aluno.') })
      .finally(() => { if (active) setLoadingStudent(false) })
    return () => { active = false }
  }, [alunoId])

  const unavailable = (feature: string) => setNotice(`${feature} estará disponível em breve.`)
  const pendingSave = () => setNotice('O salvamento deste registro depende da ampliação do contrato de atendimentos.')
  const registerAbsence = async () => {
    if (!sessaoId || !dataHoraSessao || markingAbsence) return
    if (!window.confirm(`Registrar falta de ${student?.nome ?? 'aluno'} nesta sessão?`)) return
    setMarkingAbsence(true)
    try {
      await updateScheduledSessionStatus(sessaoId, 'FALTA')
      setAbsenceRegistered(true)
      setNotice('Falta registrada no histórico do aluno.')
      window.setTimeout(() => navigate(`/calendario?data=${encodeURIComponent(dataHoraSessao.slice(0, 10))}`), 900)
    } catch (cause) {
      setNotice(cause instanceof ApiError ? cause.message : 'Não foi possível registrar a falta.')
    } finally {
      setMarkingAbsence(false)
    }
  }

  const age = student?.dataNascimento
    ? (() => {
        const today = new Date()
        const birth = new Date(`${student.dataNascimento}T12:00:00`)
        const birthdayHasPassed = today.getMonth() > birth.getMonth()
          || (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate())
        return today.getFullYear() - birth.getFullYear() - (birthdayHasPassed ? 0 : 1)
      })()
    : null
  const sessionDateLabel = dataHoraSessao?.slice(0, 10).split('-').reverse().join('/') ?? '08.10.2026'
  const sessionTimeLabel = dataHoraSessao?.slice(11, 16) ?? '14:30'

  return <div className="app-shell attendance-shell">
    <Sidebar activePage="attendance" onUnavailable={unavailable} />
    <div className="workspace">
      <TopBar query={query} results={[]} searching={false} onQueryChange={setQuery} onUnavailable={unavailable} />
      <main className="attendance-surface">
        <header className="attendance-heading">
          <span className="attendance-title-icon"><ClipboardList aria-hidden="true" /></span>
          <div>
            <div className="attendance-heading-line"><h1>Registro do aluno</h1><span className="attendance-demo-label">{demoLabel}</span></div>
            <p>consulte o histórico e realize um novo encontro</p>
          </div>
        </header>

        <div className="attendance-top-grid">
          <section className="student-summary-card" aria-label="Resumo do aluno">
            <AvatarBadge name={student?.nome ?? 'Vinicius Pereira'} tone="pink" size="lg" />
            <div className="student-summary-copy">
              <h2>{loadingStudent ? 'Carregando aluno…' : student?.nome ?? 'Vinicius Pereira'}</h2>
              <p><UserRound aria-hidden="true" /> {student?.nomeTurma ?? 'R.A 2026.056'} <i /> {age === null ? '10 anos' : `${age} anos`}</p>
              <p><BookOpenCheck aria-hidden="true" /> {student?.nomeEscola ?? 'EMTI Francisco Sá'}</p>
              <p><UserRound aria-hidden="true" /> Professora responsável: Lara silva</p>
            </div>
            <div className="student-summary-bottom">
              <strong>{student?.diagnostico || 'Dados do aluno'}</strong>
              <div className="appointment-chips">
                <span><CalendarDays aria-hidden="true" /><small>Data do atendimento</small><b>{sessionDateLabel}</b></span>
                <span><Clock3 aria-hidden="true" /><small>horário</small><b>{sessionTimeLabel}</b></span>
                <span><Sparkles aria-hidden="true" /><small>Duração</small><b>50 MIN</b></span>
              </div>
            </div>
          </section>
          <section className="pei-card">
            <Target aria-hidden="true" />
            <h2>OBJETIVO DO PEI</h2>
            <p>INTEGRAR O ENSINO ADAPTADO UTILIZANDO AS FERRAMENTAS DE APOIO DISPONÍVEIS, AUXILIAR NO USO DAS MESMAS E POSSIBILITAR UM AUTOCONHECIMENTO</p>
          </section>
        </div>

        <div className="attendance-body-grid">
          <section className="attendance-form-panel" aria-label="Registro de atendimento">
            <div className="attendance-tabs" role="tablist" aria-label="Seções do registro">
              {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>{tab.id === 'registro' && <CalendarDays aria-hidden="true" />}{tab.label}</button>)}
            </div>
            <div className="attendance-intro">
              <span><UserRound aria-hidden="true" /></span>
              <div><h2>registro de atendimento</h2><p>preencha as informações sobre o atendimento realizado, as respostas podem ser selecionadas e complementadas com observações a qualquer momento</p></div>
            </div>
            <div className="attendance-form-cards">
              <section className="attendance-column mood-column">
                <h2><HelpCircle aria-hidden="true" />1- Como o aluno chegou?</h2>
                <h3>Humor do aluno no atendimento</h3>
                <div className="mood-options">{moods.map(([emoji, label]) => <button type="button" key={label} className={mood === label ? 'selected' : ''} aria-pressed={mood === label} onClick={() => setMood(label)}><b>{emoji}</b><span>{label}</span></button>)}</div>
                <h3>Como foi a participação?</h3>
                <ChoiceList name="participation" options={participation} value={participationValue} onChange={setParticipationValue} />
              </section>
              <section className="attendance-column development-column">
                <h2><Sparkles aria-hidden="true" />Desenvolvimento</h2>
                <ChoiceList name="development" options={development} value={developmentValue} onChange={setDevelopmentValue} />
                <h2 className="skills-heading"><Lightbulb aria-hidden="true" />Habilidades trabalhadas</h2>
                <textarea aria-label="Habilidades trabalhadas" placeholder="Habilidades trabalhadas na aula..." />
              </section>
              <section className="attendance-column observations-column">
                <h2><MessageSquareText aria-hidden="true" />Observações complementares</h2>
                <label>O que aconteceu na aula? <em>*</em><textarea required placeholder="Descreva o que foi observado durante a aula" /></label>
                <label>Estratégias utilizadas: <em>*</em><textarea required placeholder="Exemplo: recursos visuais, jogos pedagógicos, materiais concretos, tecnologias assistivas e etc..." /></label>
                <label>Próximos passos:<textarea placeholder="Quais os próximos objetivos a serem encaminhados?" /></label>
              </section>
            </div>
            <div className="attendance-footer">
              <label>Data da aula <em>*</em><span><CalendarDays aria-hidden="true" /><input type="date" defaultValue="2026-10-27" /></span></label>
              <label>Horário <em>*</em><span><Clock3 aria-hidden="true" /><input type="time" defaultValue="14:00" /></span></label>
              <Button type="button" className="attendance-save" onClick={pendingSave}>Salvar</Button>
              {sessaoId && <Button type="button" variant="outline" disabled={markingAbsence || absenceRegistered} onClick={() => void registerAbsence()}>{absenceRegistered ? 'Falta registrada' : markingAbsence ? 'Registrando falta…' : 'Registrar falta'}</Button>}
            </div>
          </section>
          <aside className="attendance-side-panel">
            <section className="history-card"><header><span><ClipboardList aria-hidden="true" /></span><h2>Histórico recente</h2><button type="button" onClick={() => unavailable('O histórico completo')}>ver todos ›</button></header><ol>{history.map((item, index) => <li key={item}><i /><div><time>27.10.2026</time><p>{item}</p></div><b className={index === 0 ? 'current' : ''}>{index === 0 ? 'Registro atual' : 'acompanhamento'}</b></li>)}</ol></section>
            <section className="evolution-card"><h2><ChartNoAxesColumnIncreasing aria-hidden="true" />Gráfico de evolução</h2><div>{[['Participação', '56%', 'lilac'], ['Comunicação', '80%', 'green'], ['Atenção', '56%', 'yellow'], ['Autonomia', '20%', 'blue']].map(([label, value, color]) => <article className={color} key={label}><CheckCircle2 aria-hidden="true" /><strong>{label}</strong><b>{value}</b></article>)}</div></section>
          </aside>
        </div>
      </main>
    </div>
    <BottomNavigation activePage="attendance" onUnavailable={unavailable} />
    {notice && <div className="availability-toast" role="status">{notice}</div>}
  </div>
}
