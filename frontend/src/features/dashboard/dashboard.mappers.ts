import type {
  Appointment,
  DashboardAlert,
  DashboardApiPayload,
  DashboardData,
  SchoolReturn,
} from './dashboard.types'

const AVATAR_TONES: Appointment['avatarTone'][] = [
  'blue', 'yellow', 'orange', 'pink', 'green',
]

function getAvatarTone(index: number): Appointment['avatarTone'] {
  return AVATAR_TONES[index % AVATAR_TONES.length]
}

export function mapApiPayloadToDashboard(
  payload: DashboardApiPayload,
): DashboardData {
  const { agendaDoDia, alertas, feedRetornos } = payload.dashboardResponse

  const appointments: Appointment[] = agendaDoDia.map((atendimento, index) => ({
    id: atendimento.alunoId,
    time: atendimento.dataHora.slice(11, 16),
    studentName: atendimento.nomeAluno,
    schoolName: atendimento.nomeEscola,
    tags: [],
    avatarTone: getAvatarTone(index),
    status: atendimento.presente ? 'Realizado' : 'Aguardando',
  }))

  const alerts: DashboardAlert[] = alertas.map((alerta) => ({
    id: alerta.id,
    studentName: alerta.mensagem.split(' ')[0],
    message: alerta.mensagem,
    tone: alerta.severidade === 'VERMELHO' ? 'lilac' : 'green',
  }))

  const schoolReturns: SchoolReturn[] = feedRetornos.map((retorno, index) => ({
    id: retorno.id,
    teacherName: retorno.nomeProfessorEscola,
    schoolName: retorno.escola,
    message: retorno.mensagem,
    hashtag: '#retornoEscola',
    avatarTone: getAvatarTone(index),
  }))

  const hasAppointments = appointments.length > 0
  const hasAlerts = alerts.length > 0
  const hasReturns = schoolReturns.length > 0

  return {
    mode: 'api',
    teacherName: 'Professora',
    sourceSummary: `Modo API — ${agendaDoDia.length} atendimento(s) hoje, ${alertas.length} alerta(s) e ${feedRetornos.length} retorno(s) de escola`,
    metrics: [
      {
        id: 'appointments',
        title: 'Atendimentos registrados',
        value: String(agendaDoDia.length),
        description: 'atendimentos realizados hoje',
        progress: hasAppointments ? 100 : 0,
        tone: 'blue',
        available: true,
      },
      {
        id: 'attendance-alert',
        title: 'Alunos cadastrados',
        value: String(agendaDoDia.length),
        description: 'alunos atendidos hoje',
        progress: 0,
        tone: 'red',
        available: true,
      },
      {
        id: 'pei',
        title: 'PEIs (Laudos a vencer)',
        value: '—',
        description: 'integração pendente',
        progress: 0,
        tone: 'yellow',
        available: false,
      },
      {
        id: 'school-returns',
        title: 'Retornos das escolas',
        value: String(feedRetornos.length),
        description: 'novos retornos nas últimas 24h',
        progress: hasReturns ? 100 : 0,
        tone: 'purple',
        available: true,
      },
    ],
    appointments,
    alerts,
    schoolReturns,
    indicator: {
      weeklyFrequency: [],
      available: false,
    },
    agendaState: hasAppointments ? 'available' : 'empty',
    alertsState: hasAlerts ? 'available' : 'empty',
    schoolReturnsState: hasReturns ? 'available' : 'empty',
    indicatorState: 'pending',
  }
}
