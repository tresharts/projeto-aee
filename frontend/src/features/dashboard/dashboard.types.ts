export type DashboardDataMode = 'demo' | 'api'
export type DayPeriod = 'all' | 'morning' | 'afternoon'
export type IntegrationState = 'available' | 'pending' | 'empty'

export interface MetricItem {
  id: 'appointments' | 'attendance-alert' | 'pei' | 'school-returns'
  title: string
  value: string
  suffix?: string
  description: string
  progress: number
  tone: 'blue' | 'red' | 'yellow' | 'purple'
  available: boolean
}

export interface Appointment {
  id: string
  time: string
  studentName: string
  schoolName: string
  tags: string[]
  avatarTone: 'blue' | 'yellow' | 'orange' | 'pink' | 'green'
  status: 'Em andamento' | 'Aguardando' | 'Realizado'
}

export interface DashboardAlert {
  id: string
  studentName: string
  message: string
  tone: 'green' | 'lilac'
}

export interface SchoolReturn {
  id: string
  teacherName: string
  schoolName?: string
  message: string
  hashtag: string
  avatarTone: Appointment['avatarTone']
}

export interface PedagogicalIndicator {
  attendanceRate?: number
  municipalTarget?: number
  justifiedAbsenceRate?: number
  justifiedAbsenceLabel?: string
  activeStudents?: number
  atRiskStudents?: number
  weeklyFrequency: number[]
  available: boolean
}

export interface DashboardData {
  mode: DashboardDataMode
  teacherName: string
  metrics: MetricItem[]
  appointments: Appointment[]
  alerts: DashboardAlert[]
  schoolReturns: SchoolReturn[]
  indicator: PedagogicalIndicator
  agendaState: IntegrationState
  alertsState: IntegrationState
  schoolReturnsState: IntegrationState
  indicatorState: IntegrationState
  sourceSummary: string
}

export interface ApiStudent {
  id: string
  nome: string
  dataNascimento: string
  diagnostico: string | null
  fotoUrl: string | null
  informacoesFamilia: string | null
  contatosEmergencia: string | null
  email: string | null
  telefone: string | null
  ativo: boolean
  dataCadastro: string
  turmaId: string
  nomeTurma: string
  nomeEscola: string
}

export interface ApiAttendance {
  id: string
  alunoId: string
  nomeAluno: string
  professorId: string | null
  dataHora: string
  humor: string | null
  foco: string | null
  observacoes: string | null
  presente: boolean
  dataCadastro: string
}

export interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface DashboardApiPayload {
  students: SpringPage<ApiStudent>
  attendances: SpringPage<ApiAttendance>
}
