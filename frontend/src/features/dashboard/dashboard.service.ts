import { apiFetch } from '../../lib/api'
import type {
  ApiAttendance,
  ApiStudent,
  DashboardApiPayload,
  SpringPage,
} from './dashboard.types'

export async function getDashboardApiPayload(): Promise<DashboardApiPayload> {
  const [students, attendances] = await Promise.all([
    apiFetch<SpringPage<ApiStudent>>('/api/alunos?page=0&size=6&sort=nome,asc'),
    apiFetch<SpringPage<ApiAttendance>>(
      '/api/atendimentos?page=0&size=6&sort=dataHora,desc',
    ),
  ])

  return { students, attendances }
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
