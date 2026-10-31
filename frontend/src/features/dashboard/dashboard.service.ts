import { apiFetch } from '@/lib/api'
import type {
  ApiStudent,
  DashboardApiPayload,
  DashboardResponse,
  SpringPage,
} from './dashboard.types'

export async function getDashboardApiPayload(): Promise<DashboardApiPayload> {
  const response = await apiFetch<DashboardResponse>('/api/dashboard')

  return {
    students: {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 0,
      first: true,
      last: true,
      empty: true,
    },
    attendances: {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 0,
      first: true,
      last: true,
      empty: true,
    },
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
