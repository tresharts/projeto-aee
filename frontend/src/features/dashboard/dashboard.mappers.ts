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
  const attendances = payload.attendances.content
  const attended = attendances.filter((record) => record.presente).length
  const attendanceRate = attendances.length ? Math.round(attended / attendances.length * 100) : 0
  const lastRecordsByStudent = new Map<string, typeof attendances>()
  for (const record of attendances) {
    const records = lastRecordsByStudent.get(record.alunoId) ?? []
    if (records.length < 3) records.push(record)
    lastRecordsByStudent.set(record.alunoId, records)
  }
  const atRiskStudents = [...lastRecordsByStudent.values()]
    .filter((records) => records.length === 3 && records.every((record) => !record.presente)).length
  const today = new Date()
  const weeklyFrequency = Array.from({ length: 5 }, (_, index) => {
    const end = new Date(today)
    end.setHours(23, 59, 59, 999)
    end.setDate(end.getDate() - (4 - index) * 7)
    const start = new Date(end)
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
    const week = attendances.filter((record) => {
      const date = new Date(record.dataHora)
      return date >= start && date <= end
    })
    return week.length ? Math.round(week.filter((record) => record.presente).length / week.length * 100) : 0
  })

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
    dateSent: retorno.dataEnvio,
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
    metrics: [
      {
        id: 'appointments',
        title: 'Atendimentos registrados',
        value: String(payload.attendances.totalElements),
        description: 'registros da escola',
        progress: payload.attendances.totalElements ? 100 : 0,
        tone: 'blue',
        available: true,
      },
      {
        id: 'attendance-alert',
        title: 'Alunos cadastrados',
        value: String(payload.students.totalElements),
        description: 'alunos da escola',
        progress: payload.students.totalElements ? 100 : 0,
        tone: 'red',
        available: true,
      },
      {
        id: 'pei',
        title: 'Objetivos do PEI',
        value: String(payload.dashboardResponse.objetivosPeiAtivos ?? 0),
        description: 'objetivos ativos',
        progress: payload.dashboardResponse.objetivosPeiAtivos ? 100 : 0,
        tone: 'yellow',
        available: true,
      },
      {
        id: 'school-returns',
        title: 'Retornos das escolas',
        value: String(feedRetornos.length),
        description: 'respostas recebidas',
        progress: hasReturns ? 100 : 0,
        tone: 'purple',
        available: true,
      },
    ],
    appointments,
    alerts,
    schoolReturns,
    indicator: {
      attendanceRate,
      activeStudents: payload.students.content.filter((student) => student.ativo).length,
      atRiskStudents,
      weeklyFrequency,
      available: attendances.length > 0,
    },
    agendaState: hasAppointments ? 'available' : 'empty',
    alertsState: hasAlerts ? 'available' : 'empty',
    schoolReturnsState: hasReturns ? 'available' : 'empty',
    indicatorState: attendances.length ? 'available' : 'empty',
  }
}
