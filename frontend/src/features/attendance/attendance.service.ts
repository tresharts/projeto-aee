import { apiFetch } from '@/lib/api'
import type { AttendancePage, Atendimento, AtendimentoDraft, ObjetivoPei } from './attendance.types'

export function getAttendances(alunoId: string, size = 12) {
  const params = new URLSearchParams({ alunoId, page: '0', size: String(size), sort: 'dataHora,desc' })
  return apiFetch<AttendancePage>(`/api/atendimentos?${params.toString()}`)
}

export function getAttendance(id: string) {
  return apiFetch<Atendimento>(`/api/atendimentos/${id}`)
}

export function getPeiObjectives(alunoId: string) {
  return apiFetch<ObjetivoPei[]>(`/api/alunos/${alunoId}/objetivos-pei`)
}

export function createPeiObjective(alunoId: string, descricao: string) {
  return apiFetch<ObjetivoPei>(`/api/alunos/${alunoId}/objetivos-pei`, {
    method: 'POST',
    body: JSON.stringify({ descricao }),
  })
}

export function createAttendance(draft: AtendimentoDraft) {
  return apiFetch<Atendimento>('/api/atendimentos', {
    method: 'POST',
    body: JSON.stringify(draft),
  })
}

export function updateAttendance(id: string, draft: AtendimentoDraft) {
  return apiFetch<Atendimento>(`/api/atendimentos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(draft),
  })
}
