import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { gerarLink } from '../lib/external-form.service'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'

const PERGUNTAS_FIXAS = [
  'Como foi a interação da criança esta semana?',
  'Apresentou alguma dificuldade específica?',
  'Há algo que a família precise saber?',
]

export function ExternalFormGenerate() {
  const [alunos, setAlunos] = useState<{ id: string; nome: string }[]>([])
  const [alunoSelecionado, setAlunoSelecionado] = useState<string | null>(null)
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

  const handleGerarLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alunoSelecionado) return

    setGerando(true)
    setErro(null)
    try {
      const resposta = await gerarLink(alunoSelecionado, PERGUNTAS_FIXAS)
      const token = typeof resposta === 'string' ? resposta : (resposta as { token?: string }).token
      const baseUrl = window.location.origin
      setLinkGerado(`${baseUrl}/external-form/${token}`)
    } catch {
      setErro('Erro ao gerar link. Tente novamente.')
    } finally {
      setGerando(false)
    }
  }, [alunoSelecionado])

  const handleCopiar = useCallback(() => {
    if (!linkGerado) return
    navigator.clipboard.writeText(linkGerado)
  }, [linkGerado])

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-md mx-auto">
        <Card className="border-0 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900 mb-6">
            Gerar Link Seguro
          </h1>

          {erro && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {erro}
            </div>
          )}

          <form onSubmit={handleGerarLink} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="external-form-student"
                className="block text-sm font-medium text-gray-700"
              >
                Selecionar aluno
              </Label>
              <Select
                value={alunoSelecionado || ''}
                onValueChange={setAlunoSelecionado}
                disabled={gerando}
              >
                <SelectTrigger
                  id="external-form-student"
                  className="w-full border-gray-300"
                >
                  <SelectValue placeholder="Escolha um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="block text-sm font-medium text-gray-700">
                Perguntas (fixas)
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                {PERGUNTAS_FIXAS.map((p, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant="brand"
              type="submit"
              disabled={gerando || !alunoSelecionado}
              className="w-full disabled:pointer-events-none"
            >
              {gerando ? 'Gerando...' : 'Gerar link seguro'}
            </Button>
          </form>

          {linkGerado && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Link gerado com sucesso
              </h3>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={linkGerado}
                  readOnly
                  className="flex-1 border border-gray-300 rounded-md p-2 text-sm bg-white"
                />
                <Button
                  variant="brand"
                  type="button"
                  onClick={handleCopiar}
                  className="text-xs"
                >
                  Copiar
                </Button>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                Envie este link pelo WhatsApp do professor da escola regular
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
