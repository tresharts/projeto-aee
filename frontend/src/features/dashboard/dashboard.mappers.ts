import type { DashboardApiPayload, DashboardData } from './dashboard.types'

export function mapApiPayloadToDashboard(
  payload: DashboardApiPayload,
): DashboardData {
  const studentTotal = payload.students.totalElements
  const attendanceTotal = payload.attendances.totalElements

  return {
    mode: 'api',
    teacherName: 'Professora',
    sourceSummary: `Modo API — ${studentTotal} aluno${studentTotal === 1 ? '' : 's'} e ${attendanceTotal} atendimento${attendanceTotal === 1 ? '' : 's'} registrados`,
    metrics: [
      {
        id: 'appointments',
        title: 'Atendimentos registrados',
        value: String(attendanceTotal),
        description: 'total informado pela API',
        progress: 0,
        tone: 'blue',
        available: true,
      },
      {
        id: 'attendance-alert',
        title: 'Alunos cadastrados',
        value: String(studentTotal),
        description: 'total informado pela API',
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
        value: '—',
        description: 'integração pendente',
        progress: 0,
        tone: 'purple',
        available: false,
      },
    ],
    appointments: [],
    alerts: [],
    schoolReturns: [],
    indicator: {
      weeklyFrequency: [],
      available: false,
    },
    agendaState: 'pending',
    alertsState: 'pending',
    schoolReturnsState: 'pending',
    indicatorState: 'pending',
  }
}
