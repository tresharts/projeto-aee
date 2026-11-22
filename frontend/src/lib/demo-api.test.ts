import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { demoLogin, demoRegister, demoRequest, demoBlob, resetDemo } from './demo-api'
import type { SpringPage, Student } from '@/features/students/student.types'

function storage() {
  const entries = new Map<string, string>()
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value) },
    removeItem: (key: string) => { entries.delete(key) },
  }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', storage())
  vi.stubGlobal('sessionStorage', storage())
  vi.stubGlobal('window', { location: { origin: 'http://localhost:5173' } })
  vi.stubGlobal('crypto', { randomUUID: () => `demo-${Math.random()}` })
})
afterEach(() => { resetDemo(); vi.unstubAllGlobals() })

describe('fluxos da demonstração', () => {
  it('propaga um aluno novo para as listagens e registros', async () => {
    demoLogin('professora.demo@aee.local', 'demo')
    const student = await demoRequest('/api/alunos', {
      method: 'POST', body: JSON.stringify({ nome: 'Aluno de teste', turmaId: 'turma-1', dataNascimento: '2019-01-01', diagnostico: '', email: '', telefone: '', informacoesFamilia: '', contatosEmergencia: '', fotoUrl: '' }),
    }) as Student
    const list = await demoRequest('/api/alunos?page=0&size=100') as SpringPage<Student>
    expect(list.content.some((item) => item.id === student.id)).toBe(true)
    await demoRequest('/api/atendimentos', { method: 'POST', body: JSON.stringify({ alunoId: student.id, dataHora: '2026-11-22T10:00:00', humor: 'FELIZ', participacao: 'ATIVA', desenvolvimento: 'AUTONOMO', objetivosPei: [], presente: true }) })
    const records = await demoRequest(`/api/atendimentos?alunoId=${student.id}&page=0&size=10`) as { totalElements: number }
    expect(records.totalElements).toBe(1)
  })

  it('permite solicitar e aprovar uma conta demo', async () => {
    demoRegister('Nova Professora', 'nova@escola.edu.br', 'AEEDEMO026')
    demoLogin('coordenacao.demo@aee.local', 'demo')
    const pending = await demoRequest('/api/admin/usuarios/pendentes') as { id: string }[]
    expect(pending).toHaveLength(1)
    await demoRequest(`/api/admin/usuarios/${pending[0].id}/aprovar`, { method: 'POST' })
    expect((await demoRequest('/api/admin/usuarios/pendentes') as unknown[])).toHaveLength(0)
    expect(demoLogin('nova@escola.edu.br', 'qualquer-senha').role).toBe('PROFESSOR')
  })

  it('gera um PDF de demonstração válido para um aluno', async () => {
    demoLogin('professora.demo@aee.local', 'demo')
    const pdf = await demoBlob('/api/relatorios/alunos/aluno-1')
    expect(pdf.type).toBe('application/pdf')
    expect((await pdf.text()).startsWith('%PDF-1.4')).toBe(true)
  })
})
