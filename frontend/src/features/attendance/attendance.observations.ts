export const observationGroups = [
  { key: 'observacoes', title: 'O que aconteceu na aula?', options: ['Demonstrou interesse', 'Precisou de mediação', 'Apresentou dificuldade', 'Interagiu com colegas', 'Realizou atividades com autonomia'] },
  { key: 'estrategiasUtilizadas', title: 'Estratégias utilizadas', options: ['Instruções em etapas', 'Demonstração prática', 'Apoio visual', 'Reforço positivo', 'Pausas planejadas', 'Adaptação da atividade'] },
  { key: 'proximosPassos', title: 'Próximos passos', options: ['Retomar a atividade', 'Reforçar a habilidade', 'Aumentar a complexidade', 'Adaptar recursos', 'Alinhar com professor', 'Alinhar com família'] },
] as const

export type ObservationSelection = { selected: string[]; other: boolean; text: string }
export const emptySelection = (): ObservationSelection => ({ selected: [], other: false, text: '' })

// Keep the API's text fields readable, including for existing consumers.
export function serializeSelection(value: ObservationSelection): string {
  return [...value.selected.map((item) => `• ${item}`), ...(value.other ? [`Outro: ${value.text.trim()}`] : [])].join('\n')
}

export function parseSelection(value: string | null, options: readonly string[]): ObservationSelection {
  if (!value) return emptySelection()
  const lines = value.split('\n')
  const selected: string[] = []
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    if (line.startsWith('Outro: ')) return { selected, other: true, text: [line.slice(7), ...lines.slice(index + 1)].join('\n') }
    if (!line.startsWith('• ') || !options.includes(line.slice(2))) {
      // Preserve older free-text records in full.
      return { selected: [], other: true, text: value }
    }
    selected.push(line.slice(2))
  }
  return { selected, other: false, text: '' }
}
