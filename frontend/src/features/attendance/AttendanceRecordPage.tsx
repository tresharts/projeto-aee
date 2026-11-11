import { useEffect, useMemo, useState } from 'react'
import {
  BookOpenCheck,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  ClipboardList,
  Clock3,
  HelpCircle,
  Lightbulb,
  LoaderCircle,
  MessageSquareText,
  Plus,
  Search,
  Sparkles,
  Target,
  UserRound,
} from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { TopBar, type SearchResult } from '@/components/layout/TopBar'
import { AvatarBadge } from '@/components/people/AvatarBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ObservationChoices } from './ObservationChoices'
import { emptySelection, observationGroups, parseSelection, serializeSelection, type ObservationSelection } from './attendance.observations'
import { AttendanceDateTimeField } from './AttendanceDateTimeField'
import { ApiError } from '@/lib/api'
import { getSchoolSetup, getStudent, getStudents, type StudentStatusFilter } from '@/features/students/student.service'
import type { SchoolClass, Student } from '@/features/students/student.types'
import { createAttendance, getAttendances, getPeiObjectives, updateAttendance } from './attendance.service'
import { linkAttendanceToScheduledSession, updateScheduledSessionStatus } from '@/features/calendar/calendar.service'
import type {
  Atendimento,
  AtendimentoDraft,
  AtendimentoObjetivoRequest,
  Desenvolvimento,
  Humor,
  NivelEvolucao,
  ObjetivoPei,
  Participacao,
} from './attendance.types'

type Tab = 'registro' | 'atividade' | 'habilidades' | 'observacoes'
interface FormState {
  humor: Humor | ''
  participacao: Participacao
  desenvolvimento: Desenvolvimento
  humorOutro: string
  atividadeRealizada: string
  recursosUtilizados: string
  habilidadesTrabalhadas: string
  observacoes: ObservationSelection
  estrategiasUtilizadas: ObservationSelection
  proximosPassos: ObservationSelection
  evolucaoParticipacao: NivelEvolucao
  evolucaoComunicacao: NivelEvolucao
  evolucaoAtencao: NivelEvolucao
  evolucaoAutonomia: NivelEvolucao
  objetivosPei: AtendimentoObjetivoRequest[]
  data: string
  horario: string
}
type GoalProgress = { nivel: NivelEvolucao; observacao: string }

const tabs: { id: Tab; label: string }[] = [
  { id: 'registro', label: 'Registro de atendimento' },
  { id: 'atividade', label: 'Atividade e recursos' },
  { id: 'habilidades', label: 'Habilidades e PEI' },
  { id: 'observacoes', label: 'Observações' },
]

const moods: { emoji: string; label: string; value: Humor }[] = [
  { emoji: '😊', label: 'Feliz', value: 'FELIZ' },
  { emoji: '😢', label: 'Triste', value: 'TRISTE' },
  { emoji: '😟', label: 'Disperso', value: 'DISPERSO' },
  { emoji: '😡', label: 'Irritado', value: 'IRRITADO' },
  { emoji: '•••', label: 'Outro', value: 'OUTRO' },
]

const participationOptions: { label: string; value: Participacao }[] = [
  { label: 'Participou ativamente', value: 'ATIVA' },
  { label: 'Participou parcialmente', value: 'PARCIAL' },
  { label: 'Participou minimamente', value: 'MINIMA' },
  { label: 'Apresentou resistência', value: 'RESISTENCIA' },
  { label: 'Não foi possível avaliar', value: 'NAO_AVALIADA' },
]

const developmentOptions: { label: string; value: Desenvolvimento }[] = [
  { label: 'Realizou com autonomia', value: 'AUTONOMO' },
  { label: 'Precisou de orientações verbais', value: 'ORIENTACAO_VERBAL' },
  { label: 'Precisou de ajuda visual', value: 'AJUDA_VISUAL' },
  { label: 'Não concluiu a atividade', value: 'NAO_CONCLUIDO' },
  { label: 'Não foi possível avaliar', value: 'NAO_AVALIADO' },
]

const evolutionOptions: { label: string; value: NivelEvolucao }[] = [
  { label: 'Não avaliado', value: 'NAO_AVALIADO' },
  { label: 'Inicial', value: 'INICIAL' },
  { label: 'Em desenvolvimento', value: 'EM_DESENVOLVIMENTO' },
  { label: 'Consolidado', value: 'CONSOLIDADO' },
]

const evolutionFields: { label: string; key: 'evolucaoParticipacao' | 'evolucaoComunicacao' | 'evolucaoAtencao' | 'evolucaoAutonomia' }[] = [
  { label: 'Participação', key: 'evolucaoParticipacao' },
  { label: 'Comunicação', key: 'evolucaoComunicacao' },
  { label: 'Atenção', key: 'evolucaoAtencao' },
  { label: 'Autonomia', key: 'evolucaoAutonomia' },
]

const newForm = (): FormState => {
  const now = new Date()
  const data = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return {
    humor: '',
    participacao: 'NAO_AVALIADA',
    desenvolvimento: 'NAO_AVALIADO',
    humorOutro: '',
    atividadeRealizada: '',
    recursosUtilizados: '',
    habilidadesTrabalhadas: '',
    observacoes: emptySelection(),
    estrategiasUtilizadas: emptySelection(),
    proximosPassos: emptySelection(),
    evolucaoParticipacao: 'NAO_AVALIADO',
    evolucaoComunicacao: 'NAO_AVALIADO',
    evolucaoAtencao: 'NAO_AVALIADO',
    evolucaoAutonomia: 'NAO_AVALIADO',
    objetivosPei: [],
    data,
    horario: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
  }
}

function dateTimeParts(value: string) {
  return { data: value.slice(0, 10), horario: value.slice(11, 16) }
}

function formatDate(value: string) {
  if (!value) return '—'
  const [year, month, day] = value.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

function ageFrom(date: string) {
  if (!date) return null
  const birth = new Date(`${date.slice(0, 10)}T00:00:00`)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const beforeBirthday = today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  if (beforeBirthday) age -= 1
  return age >= 0 ? age : null
}

function levelLabel(value: NivelEvolucao | null) {
  return evolutionOptions.find((option) => option.value === value)?.label ?? 'Não avaliado'
}

function ChoiceList<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string
  options: { label: string; value: T }[]
  value: T
  onChange: (value: T) => void
}) {
  return <div className="attendance-choice-list">
    {options.map((option) => <label key={option.value}>
      <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
      <span>{option.label}</span>
    </label>)}
  </div>
}

function toDraft(alunoId: string, form: FormState): AtendimentoDraft {
  return {
    alunoId,
    dataHora: `${form.data}T${form.horario}:00`,
    humor: form.humor as Humor,
    participacao: form.participacao as Participacao,
    desenvolvimento: form.desenvolvimento as Desenvolvimento,
    humorOutro: form.humor === 'OUTRO' ? form.humorOutro.trim() : '',
    atividadeRealizada: form.atividadeRealizada,
    recursosUtilizados: form.recursosUtilizados,
    habilidadesTrabalhadas: form.habilidadesTrabalhadas,
    observacoes: serializeSelection(form.observacoes),
    estrategiasUtilizadas: serializeSelection(form.estrategiasUtilizadas),
    proximosPassos: serializeSelection(form.proximosPassos),
    evolucaoParticipacao: form.evolucaoParticipacao,
    evolucaoComunicacao: form.evolucaoComunicacao,
    evolucaoAtencao: form.evolucaoAtencao,
    evolucaoAutonomia: form.evolucaoAutonomia,
    objetivosPei: form.objetivosPei.map(({ objetivoPeiId, nivel, observacao }) => ({ objetivoPeiId, nivel, observacao })),
    presente: true,
  }
}

function formFromAttendance(record: Atendimento): FormState {
  return {
    ...newForm(),
    ...dateTimeParts(record.dataHora),
    humor: record.humor ?? '',
    participacao: record.participacao ?? 'NAO_AVALIADA',
    desenvolvimento: record.desenvolvimento ?? 'NAO_AVALIADO',
    humorOutro: record.humorOutro ?? '',
    atividadeRealizada: record.atividadeRealizada ?? '',
    recursosUtilizados: record.recursosUtilizados ?? '',
    habilidadesTrabalhadas: record.habilidadesTrabalhadas ?? '',
    observacoes: parseSelection(record.observacoes, observationGroups[0].options),
    estrategiasUtilizadas: parseSelection(record.estrategiasUtilizadas, observationGroups[1].options),
    proximosPassos: parseSelection(record.proximosPassos, observationGroups[2].options),
    evolucaoParticipacao: record.evolucaoParticipacao ?? 'NAO_AVALIADO',
    evolucaoComunicacao: record.evolucaoComunicacao ?? 'NAO_AVALIADO',
    evolucaoAtencao: record.evolucaoAtencao ?? 'NAO_AVALIADO',
    evolucaoAutonomia: record.evolucaoAutonomia ?? 'NAO_AVALIADO',
    objetivosPei: (record.objetivosPei ?? []).map(({ objetivoPeiId, nivel, observacao }) => ({ objetivoPeiId, nivel, observacao: observacao ?? '' })),
  }
}

function historyDescription(record: Atendimento) {
  return record.atividadeRealizada || record.habilidadesTrabalhadas || record.observacoes || 'Atendimento registrado'
}

function ProgressSelect({ value, onChange, label }: { value: NivelEvolucao; onChange: (value: NivelEvolucao) => void; label: string }) {
  return <label className="attendance-progress-field">
    <span>{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value as NivelEvolucao)}>
      {evolutionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>
}

export function AttendanceRecordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedStudentId = searchParams.get('alunoId')
  const attendanceToEditId = searchParams.get('editarId')
  const sessaoId = searchParams.get('sessaoId')
  const dataHoraSessao = searchParams.get('dataHora')
  const [student, setStudent] = useState<Student | null>(null)
  const [objectives, setObjectives] = useState<ObjetivoPei[]>([])
  const [history, setHistory] = useState<Atendimento[]>([])
  const [form, setForm] = useState<FormState>(newForm)
  const [activeTab, setActiveTab] = useState<Tab>('registro')
  const [tabDirection, setTabDirection] = useState<'forward' | 'backward'>('forward')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [studentClasses, setStudentClasses] = useState<SchoolClass[]>([])
  const [filterClassId, setFilterClassId] = useState('all')
  const [filterStatus, setFilterStatus] = useState<StudentStatusFilter>('all')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [markingAbsence, setMarkingAbsence] = useState(false)
  const [absenceRegistered, setAbsenceRegistered] = useState(false)
  const [sessionLinked, setSessionLinked] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const selectedGoals = useMemo(() => new Set(form.objetivosPei.map((goal) => goal.objetivoPeiId)), [form.objetivosPei])
  const selectedGoal = objectives.find((goal) => selectedGoals.has(goal.id)) ?? objectives[0]
  const canSave = Boolean(student && !loading && !saving && !absenceRegistered)

  useEffect(() => {
    void getSchoolSetup().then((setup) => setStudentClasses(setup.classes)).catch(() => setStudentClasses([]))
  }, [])

  useEffect(() => {
    const normalized = query.trim()
    const hasFilters = filterClassId !== 'all' || filterStatus !== 'all'
    if (normalized.length < 2 && !hasFilters) {
      setSearchResults([])
      setSearching(false)
      setSearchError('')
      return
    }

    let active = true
    const timer = window.setTimeout(() => {
      setSearching(true)
      setSearchError('')
      void getStudents(0, normalized, filterClassId, filterStatus, 10)
        .then((result) => {
          if (!active) return
          setSearchResults(result.content.map((item) => ({
            id: item.id,
            name: item.nome,
            detail: `${item.nomeTurma} • ${item.nomeEscola}`,
          })))
        })
        .catch(() => {
          if (!active) return
          setSearchResults([])
          setSearchError('Não foi possível consultar os alunos. Verifique a conexão com o servidor e tente novamente.')
        })
        .finally(() => { if (active) setSearching(false) })
    }, 250)
    return () => { active = false; window.clearTimeout(timer) }
  }, [filterClassId, filterStatus, query])

  useEffect(() => {
    let active = true
    if (!selectedStudentId) {
      setStudent(null)
      setObjectives([])
      setHistory([])
      setLoading(false)
      setSelectedAttendanceId(null)
      setForm(newForm())
      setError('')
      return () => { active = false }
    }

    setLoading(true)
    setError('')
    void Promise.allSettled([
      getStudent(selectedStudentId),
      getPeiObjectives(selectedStudentId),
      getAttendances(selectedStudentId, 50),
    ]).then(([studentResult, objectivesResult, historyResult]) => {
      if (!active) return
      if (studentResult.status === 'fulfilled') {
        setStudent(studentResult.value)
      } else {
        setStudent(null)
        setError(studentResult.reason instanceof ApiError ? studentResult.reason.message : 'Não foi possível carregar o aluno.')
      }
      if (objectivesResult.status === 'fulfilled') setObjectives(objectivesResult.value)
      else setError((current) => current || 'Não foi possível carregar os objetivos do PEI.')
      if (historyResult.status === 'fulfilled') {
        const records = historyResult.value.content
        setHistory(records)
        const requestedRecord = records.find((record) => record.id === attendanceToEditId)
        if (requestedRecord) {
          setSelectedAttendanceId(requestedRecord.id)
          setForm(formFromAttendance(requestedRecord))
          setActiveTab('registro')
          setNotice('Editando atendimento de ' + formatDate(requestedRecord.dataHora))
        }
      }
      else setError((current) => current || 'Não foi possível carregar o histórico de atendimentos.')
    }).finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [selectedStudentId, refreshKey])

  useEffect(() => {
    setStudent(null)
    setSelectedAttendanceId(null)
    setAbsenceRegistered(false)
    setSessionLinked(false)
    const initialForm = newForm()
    if (sessaoId && dataHoraSessao) {
      initialForm.data = dataHoraSessao.slice(0, 10)
      initialForm.horario = dataHoraSessao.slice(11, 16)
    }
    setForm(initialForm)
    setActiveTab('registro')
  }, [selectedStudentId, sessaoId, dataHoraSessao])

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const setGoalProgress = (goalId: string, progress: GoalProgress | null) => {
    setForm((current) => {
      const existing = current.objetivosPei.filter((item) => item.objetivoPeiId !== goalId)
      if (progress) existing.push({ objetivoPeiId: goalId, ...progress })
      return { ...current, objetivosPei: existing }
    })
  }

  const editAttendance = (record: Atendimento) => {
    setSelectedAttendanceId(record.id)
    setForm(formFromAttendance(record))
    setActiveTab('registro')
    setError('')
    setNotice('Editando atendimento de ' + formatDate(record.dataHora))
  }

  const startNewAttendance = () => {
    setSelectedAttendanceId(null)
    const initialForm = newForm()
    if (sessaoId && dataHoraSessao) {
      initialForm.data = dataHoraSessao.slice(0, 10)
      initialForm.horario = dataHoraSessao.slice(11, 16)
    }
    setForm(initialForm)
    setActiveTab('registro')
    setError('')
    setNotice('Novo atendimento')
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedStudentId) return
    if (!form.data || !form.horario) {
      setError('Informe a data e o horário do atendimento.')
      return
    }
    if (!form.humor) {
      setActiveTab('registro')
      setError('Selecione como o aluno chegou ao atendimento.')
      return
    }
    if (form.humor === 'OUTRO' && !form.humorOutro.trim()) {
      setActiveTab('registro')
      setError('Descreva o humor selecionado como Outro.')
      return
    }
    if (observationGroups.some(({ key }) => form[key].other && !form[key].text.trim())) {
      setActiveTab('observacoes')
      setError('Preencha o texto de cada opção Outro selecionada antes de salvar.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')
    try {
      const payload = toDraft(selectedStudentId, form)
      const saved = selectedAttendanceId
        ? await updateAttendance(selectedAttendanceId, payload)
        : await createAttendance(payload)
      setSelectedAttendanceId(saved.id)
      if (sessaoId && !sessionLinked) {
        try {
          await linkAttendanceToScheduledSession(sessaoId, saved.id)
          setSessionLinked(true)
        } catch (cause) {
          setError(cause instanceof ApiError ? `Atendimento salvo, mas a sessão não foi vinculada: ${cause.message}` : 'Atendimento salvo, mas a sessão não foi vinculada ao calendário.')
        }
      }
      setNotice('Atendimento salvo com sucesso.')
      setRefreshKey((value) => value + 1)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível salvar o atendimento.')
    } finally {
      setSaving(false)
    }
  }

  const registerAbsence = async () => {
    if (!sessaoId || markingAbsence || !student) return
    if (!window.confirm(`Registrar falta de ${student.nome} nesta sessão?`)) return
    setMarkingAbsence(true)
    setError('')
    try {
      await updateScheduledSessionStatus(sessaoId, 'FALTA')
      setAbsenceRegistered(true)
      setNotice('Falta registrada no histórico do aluno.')
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível registrar a falta.')
    } finally {
      setMarkingAbsence(false)
    }
  }

  const unavailable = (feature: string) => setNotice(`${feature} estará disponível em breve.`)
  const age = student ? ageFrom(student.dataNascimento) : null
  const currentLevelValues = history[0]

  const tabContent = (tab: Tab) => {
    if (tab === 'registro') return <div className="attendance-form-cards">
      <section className="attendance-column mood-column">
        <h2><HelpCircle aria-hidden="true" />1 — Como o aluno chegou?</h2>
        <h3>Humor do aluno no atendimento <em>*</em></h3>
        <div className="mood-options">
          {moods.map((mood) => <button type="button" key={mood.value} className={form.humor === mood.value ? 'selected' : ''} aria-pressed={form.humor === mood.value} onClick={() => updateForm('humor', mood.value)}>
            <b>{mood.emoji}</b><span>{mood.label}</span>
          </button>)}
        </div>
        {form.humor === 'OUTRO' && <label className="attendance-text-field">Descreva como o aluno chegou <em>*</em><textarea required value={form.humorOutro} onChange={(event) => updateForm('humorOutro', event.target.value)} placeholder="Descreva o humor observado" /></label>}
        <h3>Como foi a participação? <em>*</em></h3>
        <ChoiceList name="participacao" options={participationOptions} value={form.participacao as Participacao} onChange={(value) => updateForm('participacao', value)} />
      </section>
      <section className="attendance-column development-column">
        <h2><Sparkles aria-hidden="true" />Desenvolvimento <em>*</em></h2>
        <ChoiceList name="desenvolvimento" options={developmentOptions} value={form.desenvolvimento as Desenvolvimento} onChange={(value) => updateForm('desenvolvimento', value)} />
        <h3 className="skills-heading">Como foi o progresso observado?</h3>
        <div className="attendance-progress-grid">
          {evolutionFields.map((field) => <ProgressSelect key={field.key} label={field.label} value={form[field.key] as NivelEvolucao} onChange={(value) => updateForm(field.key, value)} />)}
        </div>
      </section>
    </div>

    if (tab === 'atividade') return <div className="attendance-form-cards">
      <section className="attendance-column">
        <h2><ClipboardList aria-hidden="true" />Atividade realizada</h2>
        <label className="attendance-text-field">O que o aluno realizou?<textarea value={form.atividadeRealizada} onChange={(event) => updateForm('atividadeRealizada', event.target.value)} placeholder="Descreva a atividade feita durante o atendimento" /></label>
      </section>
      <section className="attendance-column">
        <h2><Sparkles aria-hidden="true" />Recursos utilizados</h2>
        <label className="attendance-text-field">Materiais e apoios utilizados<textarea value={form.recursosUtilizados} onChange={(event) => updateForm('recursosUtilizados', event.target.value)} placeholder="Ex.: material concreto, tecnologia assistiva, jogos pedagógicos" /></label>
      </section>
    </div>

    if (tab === 'habilidades') return <div className="attendance-form-cards">
      <section className="attendance-column">
        <h2><Lightbulb aria-hidden="true" />Habilidades trabalhadas</h2>
        <label className="attendance-text-field">Quais habilidades foram trabalhadas?<textarea value={form.habilidadesTrabalhadas} onChange={(event) => updateForm('habilidadesTrabalhadas', event.target.value)} placeholder="Descreva as habilidades trabalhadas" /></label>
      </section>
      <section className="attendance-column pei-objectives-column">
        <h2><Target aria-hidden="true" />Objetivos do PEI</h2>
        {objectives.length === 0 && <p className="attendance-muted">Este aluno ainda não tem objetivos de PEI cadastrados.</p>}
        {objectives.map((goal) => {
          const progress = form.objetivosPei.find((item) => item.objetivoPeiId === goal.id)
          return <div className="attendance-goal-item" key={goal.id}>
            <label className="attendance-goal-check"><input type="checkbox" checked={Boolean(progress)} onChange={(event) => setGoalProgress(goal.id, event.target.checked ? { nivel: 'NAO_AVALIADO', observacao: '' } : null)} /><span>{goal.descricao}</span></label>
            {progress && <div className="attendance-goal-progress">
              <ProgressSelect label="Progresso observado" value={progress.nivel} onChange={(nivel) => setGoalProgress(goal.id, { ...progress, nivel })} />
              <label className="attendance-text-field">Observação sobre o objetivo<textarea value={progress.observacao} onChange={(event) => setGoalProgress(goal.id, { ...progress, observacao: event.target.value })} placeholder="Avanços ou dificuldades observados" /></label>
            </div>}
          </div>
        })}
      </section>
    </div>

    return <div className="attendance-form-cards">
      <section className="attendance-column observations-column">
        <h2><MessageSquareText aria-hidden="true" />Observações complementares</h2>
        {observationGroups.map((group) => <ObservationChoices key={group.key} title={group.title} options={group.options} value={form[group.key]} onChange={(value) => updateForm(group.key, value)} />)}
      </section>
    </div>
  }

  return <div className="app-shell attendance-shell">
    <Sidebar activePage="attendance" onUnavailable={unavailable} />
    <div className="workspace">
      <TopBar showSearch={false} query={query} results={searchResults} searching={searching} onQueryChange={setQuery} onUnavailable={unavailable} onResultSelect={(result) => navigate('/registro-atendimento?alunoId=' + encodeURIComponent(result.id))} />
      <main className="attendance-surface">
        <header className="attendance-heading">
          <div>
            <div className="attendance-heading-line"><h1 className="app-gradient-title">{student ? 'Registro do aluno' : 'Registro de atendimento'}</h1></div>
            <p>{student ? 'Consulte o histórico e registre um novo atendimento' : 'Busque um aluno na barra superior para começar'}</p>
          </div>
          {student && <Button type="button" variant="outline" className="attendance-new-button" onClick={startNewAttendance}><Plus aria-hidden="true" />Novo atendimento</Button>}
        </header>

        {error && <p className="attendance-message is-error" role="alert">{error}</p>}
        {searchError && <p className="attendance-message is-error" role="alert">{searchError}</p>}
        {notice && <p className="attendance-message" role="status">{notice}</p>}

        {loading && !student ? <div className="attendance-loading"><LoaderCircle className="animate-spin" />Carregando aluno…</div> : !student ? <section className="attendance-empty-selection">
          <UserRound aria-hidden="true" />
          <h2>Selecione um aluno</h2>
          <p>Busque pelo nome e use os filtros para localizar o aluno e consultar os atendimentos.</p>
          <div className="attendance-student-filters" role="group" aria-label="Filtros de alunos">
            <label className="attendance-student-name-filter"><span>Nome do aluno</span><div><Search aria-hidden="true" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pelo nome" /></div></label>
            <label><span>Turma</span><Select value={filterClassId} onValueChange={setFilterClassId}><SelectTrigger><SelectValue placeholder="Todas as turmas" /></SelectTrigger><SelectContent><SelectItem value="all">Todas as turmas</SelectItem>{studentClasses.map((item) => <SelectItem key={item.id} value={item.id}>{item.nome} · {item.ano}</SelectItem>)}</SelectContent></Select></label>
            <label><span>Situação</span><Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as StudentStatusFilter)}><SelectTrigger><SelectValue placeholder="Todas as situações" /></SelectTrigger><SelectContent><SelectItem value="all">Todas as situações</SelectItem><SelectItem value="active">Ativos</SelectItem><SelectItem value="inactive">Inativos</SelectItem></SelectContent></Select></label>
            {(filterClassId !== 'all' || filterStatus !== 'all') && <Button type="button" variant="outline" onClick={() => { setFilterClassId('all'); setFilterStatus('all') }}>Limpar filtros</Button>}
          </div>
          {searching && <p className="attendance-muted">Buscando alunos…</p>}
          {!searching && searchResults.length > 0 && <div className="attendance-student-filter-results">{searchResults.map((result) => <button type="button" key={result.id} onClick={() => navigate('/registro-atendimento?alunoId=' + encodeURIComponent(result.id))}><strong>{result.name}</strong><span>{result.detail}</span></button>)}</div>}
          {!searching && (filterClassId !== 'all' || filterStatus !== 'all') && searchResults.length === 0 && <p className="attendance-muted">Nenhum aluno encontrado com esses filtros.</p>}
        </section> : <>
          <div className="attendance-top-grid">
            <section className="student-summary-card" aria-label="Resumo do aluno">
              <AvatarBadge name={student.nome} tone="pink" size="lg" />
              <div className="student-summary-copy">
                <h2>{student.nome}</h2>
                <p><UserRound aria-hidden="true" />{age === null ? 'Idade não informada' : `${age} anos`}{student.diagnostico && <><i />{student.diagnostico}</>}</p>
                <p><BookOpenCheck aria-hidden="true" />{student.nomeEscola}</p>
                <p><UserRound aria-hidden="true" />Turma: {student.nomeTurma}</p>
              </div>
              <div className="student-summary-bottom">
                <div className="appointment-chips">
                  <span><CalendarDays aria-hidden="true" /><small>Data</small><b>{formatDate(form.data)}</b></span>
                  <span><Clock3 aria-hidden="true" /><small>Horário</small><b>{form.horario || '—'}</b></span>
                  <span><Sparkles aria-hidden="true" /><small>Objetivos PEI</small><b>{form.objetivosPei.length} selecionado(s)</b></span>
                </div>
              </div>
            </section>
            <section className="pei-card">
              <div className="pei-card-heading">
                <Target aria-hidden="true" />
                <h2>OBJETIVO DO PEI</h2>
              </div>
              <p>{selectedGoal?.descricao ?? 'Cadastre objetivos do PEI para este aluno. Eles poderão ser vinculados a cada atendimento.'}</p>
            </section>
          </div>

          <div className="attendance-body-grid">
            <section className="attendance-form-panel" aria-label="Registro de atendimento">
              <div className="attendance-tabs" role="tablist" aria-label="Seções do registro">
                {tabs.map((tab, index) => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} aria-controls={`attendance-panel-${tab.id}`} id={`attendance-tab-${tab.id}`} className={activeTab === tab.id ? 'active' : ''} onClick={(event) => {
                  setTabDirection(index >= tabs.findIndex((item) => item.id === activeTab) ? 'forward' : 'backward')
                  setActiveTab(tab.id)
                  event.currentTarget.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest', inline: 'nearest' })
                }}>{tab.id === 'registro' && <CalendarDays aria-hidden="true" />}{tab.label}</button>)}
              </div>
              <div className="attendance-intro">
                <span><UserRound aria-hidden="true" /></span>
                <div><h2>{tabs.find((tab) => tab.id === activeTab)?.label}</h2><p>Preencha os dados do atendimento. Campos com * são obrigatórios.</p></div>
              </div>
              <form noValidate onSubmit={(event) => void submit(event)}>
                <div className="attendance-panel-viewport" data-direction={tabDirection}>
                {tabs.map((tab) => <div key={tab.id} className="attendance-tab-panel" role="tabpanel" id={`attendance-panel-${tab.id}`} aria-labelledby={`attendance-tab-${tab.id}`} hidden={activeTab !== tab.id}>
                  {tabContent(tab.id)}
                </div>)}
                </div>
                <div className="attendance-footer">
                  <AttendanceDateTimeField key={`date-${selectedAttendanceId}-${refreshKey}`} type="date" value={form.data} onChange={(value) => updateForm('data', value)} />
                  <AttendanceDateTimeField key={`time-${selectedAttendanceId}-${refreshKey}`} type="time" value={form.horario} onChange={(value) => updateForm('horario', value)} />
                  {sessaoId && !selectedAttendanceId && <Button type="button" variant="outline" disabled={markingAbsence || absenceRegistered} onClick={() => void registerAbsence()}>{absenceRegistered ? 'Falta registrada' : markingAbsence ? 'Registrando falta…' : 'Registrar falta'}</Button>}
                  <Button type="submit" className="attendance-save" disabled={!canSave}>{saving ? 'Salvando…' : selectedAttendanceId ? 'Salvar alterações' : 'Salvar atendimento'}</Button>
                </div>
              </form>
            </section>

            <aside className="attendance-side-panel">
              <section className="history-card">
                <header><span><ClipboardList aria-hidden="true" /></span><h2>Histórico recente</h2><span className="history-count">{Math.min(history.length, 3)}</span></header>
                {history.length === 0 ? <p className="attendance-muted">Nenhum atendimento registrado para este aluno.</p> : <ol>{history.slice(0, 3).map((record) => <li key={record.id} className={selectedAttendanceId === record.id ? 'is-current' : ''}>
                  <i />
                  <div><time>{formatDate(record.dataHora)}</time><p>{historyDescription(record)}</p></div>
                  <button type="button" onClick={() => editAttendance(record)} aria-label={`Editar atendimento de ${formatDate(record.dataHora)}`}>{selectedAttendanceId === record.id ? 'Editando' : 'Editar'}</button>
                </li>)}</ol>}
              </section>
              <section className="evolution-card">
                <h2><ChartNoAxesColumnIncreasing aria-hidden="true" />Evolução recente</h2>
                {!currentLevelValues ? <p className="attendance-muted">Os níveis de evolução serão exibidos após os primeiros registros.</p> : <div className="evolution-trends">
                  {evolutionFields.map((field) => {
                    const values = history.slice(0, 6).slice().reverse().map((record) => record[field.key])
                    const current = history[0]?.[field.key] ?? null
                    return <article key={field.key}>
                      <div><strong>{field.label}</strong><b>{levelLabel(current)}</b></div>
                      <div className="evolution-dots" aria-label={`Histórico de ${field.label}`}>
                        {values.map((value, index) => <span key={`${field.key}-${index}`} className={value && value !== 'NAO_AVALIADO' ? `level-${value.toLowerCase()}` : ''} title={levelLabel(value)} />)}
                      </div>
                    </article>
                  })}
                </div>}
              </section>
            </aside>
          </div>
        </>}
      </main>
    </div>
    <BottomNavigation activePage="attendance" onUnavailable={unavailable} />
  </div>
}
