import { useCallback, useEffect, useState } from 'react'
import { ClipboardList, Plus, Trash2 } from 'lucide-react'
import { apiFetch } from '@/lib/api'
import { gerarLink } from '@/lib/external-form.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const PERGUNTAS_INICIAIS = [
  'Como foi a interação da criança esta semana?',
  'Apresentou alguma dificuldade específica?',
  'Há algo que a família precise saber?',
]

export function ExternalFormGenerate() {
  const [alunos, setAlunos] = useState<{ id: string; nome: string }[]>([])
  const [alunoSelecionado, setAlunoSelecionado] = useState<string | null>(null)
  const [perguntas, setPerguntas] = useState(PERGUNTAS_INICIAIS)
  const [gerando, setGerando] = useState(false)
  const [linkGerado, setLinkGerado] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const carregarAlunos = useCallback(async () => {
    try {
      const resposta = await apiFetch<{ content: { id: string; nome: string }[] }>(
        '/api/alunos?page=0&size=50&sort=nome,asc'
      )
      setAlunos(resposta.content || [])
    } catch {
      setErro('Erro ao carregar alunos')
    }
  }, [])

  useEffect(() => {
    carregarAlunos()
  }, [carregarAlunos])

  const atualizarPergunta = (index: number, texto: string) => {
    setPerguntas((atuais) => atuais.map((pergunta, i) => i === index ? texto : pergunta))
    setLinkGerado(null)
  }

  const handleGerarLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alunoSelecionado) return

    const perguntasValidas = perguntas.map((pergunta) => pergunta.trim()).filter(Boolean)
    if (perguntasValidas.length === 0) {
      setErro('Adicione pelo menos uma pergunta ao formulário.')
      return
    }

    setGerando(true)
    setErro(null)
    try {
      const resposta = await gerarLink(alunoSelecionado, perguntasValidas)
      const token = typeof resposta === 'string' ? resposta : (resposta as { token?: string }).token
      if (!token) throw new Error('Token não recebido')
      setLinkGerado(`${window.location.origin}/external-form/${token}`)
    } catch {
      setErro('Erro ao gerar link. Tente novamente.')
    } finally {
      setGerando(false)
    }
  }, [alunoSelecionado, perguntas])

  const handleCopiar = useCallback(async () => {
    if (!linkGerado) return
    try {
      await navigator.clipboard.writeText(linkGerado)
    } catch {
      setErro('Não foi possível copiar o link neste navegador.')
    }
  }, [linkGerado])

  return (
    <div className="min-h-screen bg-[#edf3ff] p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-3xl">
        <Card className="border-0 bg-white p-5 shadow-[0_18px_51px_rgba(68,91,131,0.09)] sm:rounded-[28px] sm:p-8">
          <header className="mb-7 flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eaf0ff] text-[#5363ae]">
              <ClipboardList aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h1 className="app-gradient-title text-2xl font-extrabold tracking-tight">Criar formulário</h1>
              <p className="mt-1 text-sm font-medium text-[#737da6]">Edite as perguntas e gere um link para a escola responder.</p>
            </div>
          </header>

          {erro && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{erro}</div>}

          <form onSubmit={handleGerarLink} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="external-form-student" className="text-sm font-semibold text-[#344875]">Aluno</Label>
              <Select value={alunoSelecionado || ''} onValueChange={(value) => { setAlunoSelecionado(value); setLinkGerado(null) }} disabled={gerando}>
                <SelectTrigger id="external-form-student" className="h-11 w-full rounded-xl border-[#d9e1f2] bg-white text-[#34477f]">
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map((aluno) => <SelectItem key={aluno.id} value={aluno.id}>{aluno.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <section className="rounded-2xl bg-[#f2f6ff] p-4 sm:p-5" aria-labelledby="external-form-questions-heading">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 id="external-form-questions-heading" className="text-base font-bold text-[#344875]">Perguntas do formulário</h2>
                  <p className="mt-1 text-xs font-medium text-[#737da6]">Edite os enunciados. Os campos de resposta serão exibidos para quem receber o link.</p>
                </div>
                <Button type="button" variant="outline" className="h-9 gap-2 rounded-full border-[#d9e1f2] bg-white text-[#4e5eb2]" onClick={() => { setPerguntas((atuais) => [...atuais, '']); setLinkGerado(null) }}>
                  <Plus aria-hidden="true" className="h-4 w-4" />Adicionar pergunta
                </Button>
              </div>

              <div className="space-y-3">
                {perguntas.map((pergunta, index) => (
                  <div key={index} className="flex items-start gap-2 rounded-xl border border-[#e1e8fa] bg-white p-3">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Label htmlFor={`external-form-question-${index}`} className="text-xs font-semibold text-[#536399]">Pergunta {index + 1}</Label>
                      <textarea
                        id={`external-form-question-${index}`}
                        value={pergunta}
                        onChange={(event) => atualizarPergunta(index, event.target.value)}
                        maxLength={500}
                        rows={2}
                        placeholder="Escreva a pergunta que a escola deverá responder"
                        className="w-full resize-y rounded-lg border border-[#d9e1f2] bg-[#fbfcff] px-3 py-2 text-sm font-medium text-[#34477f] outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out focus:border-[#a94bea] focus:bg-white focus:ring-2 focus:ring-[#b54ae8]/15"
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" aria-label={`Remover pergunta ${index + 1}`} disabled={perguntas.length === 1} onClick={() => { setPerguntas((atuais) => atuais.filter((_, i) => i !== index)); setLinkGerado(null) }} className="mt-5 h-9 w-9 shrink-0 rounded-lg text-[#8a96b0] hover:bg-red-50 hover:text-red-600">
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </section>

            <Button variant="brand" type="submit" disabled={gerando || !alunoSelecionado || perguntas.every((pergunta) => !pergunta.trim())} className="h-11 w-full rounded-full bg-gradient-to-r from-[#0752a7] to-[#bb58df] font-semibold text-white hover:brightness-105 disabled:pointer-events-none sm:w-auto sm:min-w-56">
              {gerando ? 'Gerando link…' : 'Gerar link seguro'}
            </Button>
          </form>

          {linkGerado && (
            <section className="mt-6 rounded-2xl border border-[#dce6ff] bg-[#edf4ff] p-4" aria-live="polite">
              <h2 className="text-sm font-bold text-[#344875]">Link do formulário pronto</h2>
              <p className="mt-1 text-xs text-[#737da6]">Compartilhe com o professor da escola regular. O link vale por 24 horas.</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input type="text" value={linkGerado} readOnly aria-label="Link gerado" className="min-w-0 flex-1 rounded-lg border border-[#d9e1f2] bg-white px-3 py-2 text-sm text-[#34477f] outline-none transition-[border-color,box-shadow] duration-200 ease-out focus:border-[#a94bea] focus:ring-2 focus:ring-[#b54ae8]/15" />
                <Button variant="brand" type="button" onClick={handleCopiar} className="rounded-full bg-gradient-to-r from-[#0752a7] to-[#bb58df] font-semibold text-white">Copiar link</Button>
              </div>
            </section>
          )}
        </Card>
      </div>
    </div>
  )
}
