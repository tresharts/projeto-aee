import { apiFetch } from '@/lib/api'
import type { School, SchoolClass, SpringPage, Student, StudentDraft } from './student.types'

export type StudentStatusFilter = 'all' | 'active' | 'inactive'

export function getStudents(
  page: number,
  name: string,
  classId = 'all',
  status: StudentStatusFilter = 'all',
  size = 12,
) {
  const params = new URLSearchParams({ page: String(page), size: String(size), sort: 'nome,asc' })
  if (name.trim()) params.set('nome', name.trim())
  if (classId !== 'all') params.set('turmaId', classId)
  if (status !== 'all') params.set('ativo', String(status === 'active'))
  return apiFetch<SpringPage<Student>>(`/api/alunos?${params.toString()}`)
}

export async function getSchoolSetup() {
  const [classesPage, schoolPage] = await Promise.all([
    apiFetch<SpringPage<SchoolClass>>('/api/turmas?page=0&size=100&sort=nome,asc'),
    apiFetch<SpringPage<School>>('/api/escolas?page=0&size=1&sort=nome,asc'),
  ])
  return { classes: classesPage.content, school: schoolPage.content[0] ?? null }
}

export function createStudent(draft: StudentDraft) {
  return apiFetch<Student>('/api/alunos', { method: 'POST', body: JSON.stringify(draft) })
}

export function updateStudent(id: string, draft: StudentDraft) {
  return apiFetch<Student>(`/api/alunos/${id}`, { method: 'PUT', body: JSON.stringify(draft) })
}

export function setStudentActive(id: string, active: boolean) {
  return apiFetch<void>(active ? `/api/alunos/${id}/ativar` : `/api/alunos/${id}`, {
    method: active ? 'PATCH' : 'DELETE',
  })
}

export function createSchoolClass(payload: { nome: string; ano: number; escolaId: string }) {
  return apiFetch<SchoolClass>('/api/turmas', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateSchoolClass(id: string, payload: { nome: string; ano: number; escolaId: string }) {
  return apiFetch<SchoolClass>(`/api/turmas/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function setSchoolClassActive(id: string, active: boolean) {
  return apiFetch<void>(active ? `/api/turmas/${id}/ativar` : `/api/turmas/${id}/desativar`, { method: 'PATCH' })
}
