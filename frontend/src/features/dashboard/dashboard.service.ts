import { apiFetch } from '@/lib/api'
import type {
  ApiStudent,
  DashboardApiPayload,
  DashboardResponse,
  SpringPage,
} from './dashboard.types'

export async function getDashboardApiPayload(): Promise<DashboardApiPayload> {
  const [students, attendances, returns] = await Promise.all([
    apiFetch<SpringPage<ApiStudent>>('/api/alunos?page=0&size=100&sort=nome,asc'),
    apiFetch<DashboardApiPayload['attendances']>('/api/atendimentos?page=0&size=500&sort=dataHora,desc'),
    apiFetch<Array<{ id: string; alunoId: string; nomeAluno: string; nomeProfessorEscola: string; mensagem: string; dataEnvio: string }>>('/api/external-form/responses/recent'),
  ])
  const objectiveLists = await Promise.all(students.content.map((student) =>
    apiFetch<Array<{ id: string }>>(`/api/alunos/${student.id}/objetivos-pei`),
  ))
  const response: DashboardResponse = {
    agendaDoDia: [],
    alertas: [],
    feedRetornos: returns.map((item) => ({ ...item, escola: 'Escola regular' })),
    objetivosPeiAtivos: objectiveLists.reduce((sum, list) => sum + list.length, 0),
  }
  return {
    students,
    attendances,
    dashboardResponse: response,
  }
}

export async function searchStudentsByName(name: string) {
  const params = new URLSearchParams({
    nome: name,
    page: '0',
    size: '6',
    sort: 'nome,asc',
  })

  return apiFetch<SpringPage<ApiStudent>>(`/api/alunos?${params.toString()}`)
}
