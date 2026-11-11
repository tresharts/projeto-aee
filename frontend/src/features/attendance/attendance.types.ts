export type Humor = 'CALMO' | 'AGITADO' | 'APATICO' | 'FELIZ' | 'TRISTE' | 'DISPERSO' | 'IRRITADO' | 'OUTRO'
export type Participacao = 'ATIVA' | 'PARCIAL' | 'MINIMA' | 'RESISTENCIA' | 'NAO_AVALIADA'
export type Desenvolvimento = 'AUTONOMO' | 'ORIENTACAO_VERBAL' | 'AJUDA_VISUAL' | 'NAO_CONCLUIDO' | 'NAO_AVALIADO'
export type NivelEvolucao = 'NAO_AVALIADO' | 'INICIAL' | 'EM_DESENVOLVIMENTO' | 'CONSOLIDADO'

export interface ObjetivoPei {
  id: string
  alunoId: string
  documentoPeiId: string | null
  descricao: string
  ativo: boolean
  dataCadastro: string
}

export interface AtendimentoObjetivo {
  objetivoPeiId: string
  descricaoObjetivo: string
  nivel: NivelEvolucao
  observacao: string | null
}

export interface Atendimento {
  id: string
  alunoId: string
  nomeAluno: string | null
  professorId: string
  dataHora: string
  humor: Humor | null
  foco: 'ALTO' | 'MEDIO' | 'BAIXO' | null
  participacao: Participacao | null
  desenvolvimento: Desenvolvimento | null
  humorOutro: string | null
  atividadeRealizada: string | null
  recursosUtilizados: string | null
  habilidadesTrabalhadas: string | null
  observacoes: string | null
  estrategiasUtilizadas: string | null
  proximosPassos: string | null
  evolucaoParticipacao: NivelEvolucao | null
  evolucaoComunicacao: NivelEvolucao | null
  evolucaoAtencao: NivelEvolucao | null
  evolucaoAutonomia: NivelEvolucao | null
  objetivosPei: AtendimentoObjetivo[]
  presente: boolean
  dataCadastro: string
}

export type AtendimentoDraft = Pick<Atendimento,
  | 'alunoId'
  | 'dataHora'
  | 'humor'
  | 'participacao'
  | 'desenvolvimento'
  | 'humorOutro'
  | 'atividadeRealizada'
  | 'recursosUtilizados'
  | 'habilidadesTrabalhadas'
  | 'observacoes'
  | 'estrategiasUtilizadas'
  | 'proximosPassos'
  | 'evolucaoParticipacao'
  | 'evolucaoComunicacao'
  | 'evolucaoAtencao'
  | 'evolucaoAutonomia'
  | 'presente'
> & { objetivosPei: AtendimentoObjetivoRequest[] }

export interface AtendimentoObjetivoRequest {
  objetivoPeiId: string
  nivel: NivelEvolucao
  observacao: string
}

export interface AttendancePage {
  content: Atendimento[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
  empty: boolean
}
