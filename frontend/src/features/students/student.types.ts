export interface Student {
  id: string
  nome: string
  dataNascimento: string
  diagnostico: string | null
  fotoUrl: string | null
  informacoesFamilia: string | null
  contatosEmergencia: string | null
  email: string | null
  telefone: string | null
  ativo: boolean
  dataCadastro: string
  turmaId: string
  nomeTurma: string
  nomeEscola: string
}

export interface StudentDraft {
  nome: string
  dataNascimento: string
  turmaId: string
  diagnostico: string
  email: string
  telefone: string
  informacoesFamilia: string
  contatosEmergencia: string
  fotoUrl: string
}

export interface SchoolClass {
  id: string
  nome: string
  ano: number
  escolaId: string
  nomeEscola: string
  ativo: boolean
}

export interface School {
  id: string
  nome: string
}

export interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}
