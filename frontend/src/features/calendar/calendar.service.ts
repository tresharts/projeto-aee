import { apiFetch } from '@/lib/api'

export type ScheduledSessionStatus = 'AGENDADA' | 'REALIZADA' | 'FALTA' | 'CANCELADA'

export interface ScheduledSession {
  id: string
  alunoId: string
  nomeAluno: string
  nomeTurma: string
  nomeEscola: string
  dataHora: string
  status: ScheduledSessionStatus
  observacao: string | null
  atendimentoId: string | null
}

export interface ScheduledSessionDraft {
  alunoId: string
  dataHora: string
  observacao: string
}

export interface ConsecutiveAbsenceAlert {
  alunoId: string
  nomeAluno: string
  quantidade: number
}

export function getScheduledSessions(start: string, end: string) {
  const params = new URLSearchParams({ inicio: start, fim: end })
  return apiFetch<ScheduledSession[]>(`/api/sessoes?${params.toString()}`)
}

export function createScheduledSession(draft: ScheduledSessionDraft) {
  return apiFetch<ScheduledSession>('/api/sessoes', {
    method: 'POST',
    body: JSON.stringify(draft),
  })
}

export function updateScheduledSession(id: string, draft: ScheduledSessionDraft) {
  return apiFetch<ScheduledSession>(`/api/sessoes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(draft),
  })
}

export function updateScheduledSessionStatus(id: string, status: ScheduledSessionStatus) {
  return apiFetch<ScheduledSession>(`/api/sessoes/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export function getConsecutiveAbsenceAlerts() {
  return apiFetch<ConsecutiveAbsenceAlert[]>('/api/sessoes/alertas/faltas-consecutivas')
}
