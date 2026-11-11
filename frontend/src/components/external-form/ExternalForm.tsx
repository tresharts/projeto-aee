import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { submeterRespostas, verificarToken } from '@/lib/external-form.service'
import { ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type FormStatus = 'carregando' | 'disponivel' | 'respondido' | 'expirado' | 'invalido'
type FormularioPublico = { perguntas: string[]; status: 'DISPONIVEL' | 'RESPONDIDO' | 'EXPIRADO' }

export function ExternalForm() {
  const { token } = useParams<{ token: string }>()
  const [status, setStatus] = useState<FormStatus>('carregando')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [perguntas, setPerguntas] = useState<string[]>([])
  const [respostas, setRespostas] = useState<string[]>([])

  useEffect(() => {
    if (!token) { setStatus('invalido'); return }
    let ativo = true
    void verificarToken<FormularioPublico>(token)
      .then((dados) => {
        if (!ativo) return
        if (dados.status === 'RESPONDIDO') setStatus('respondido')
        else if (dados.status === 'EXPIRADO') setStatus('expirado')
        else if (Array.isArray(dados.perguntas) && dados.perguntas.length > 0) {
          setPerguntas(dados.perguntas)
          setRespostas(dados.perguntas.map(() => ''))
          setStatus('disponivel')
        } else setStatus('invalido')
      })
      .catch(() => { if (ativo) setStatus('invalido') })
    return () => { ativo = false }
  }, [token])

  const handleEnviar = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!token || status !== 'disponivel') return
    setEnviando(true)
    setErro(null)
    try {
      await submeterRespostas(token, respostas)
      setEnviado(true)
    } catch (cause) {
      if (cause instanceof ApiError && cause.message.includes('já foi respondido')) setStatus('respondido')
      else if (cause instanceof ApiError && cause.message.includes('24 horas')) setStatus('expirado')
      else setErro('Erro ao enviar respostas. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  const mensagem = status === 'respondido'
    ? 'Este formulário já foi respondido.'
    : status === 'expirado'
      ? 'O prazo de 24 horas para responder este formulário terminou.'
      : status === 'invalido' ? 'Este link não foi encontrado.' : null

  return <div className="min-h-screen bg-[#edf3ff] p-4 sm:p-6 md:p-8">
    <div className="mx-auto max-w-xl">
      <Card className="border-0 bg-white p-6 shadow-[0_18px_51px_rgba(68,91,131,0.09)] sm:rounded-[28px] sm:p-8">
        <h1 className="app-gradient-title mb-2 text-2xl font-extrabold tracking-tight">Formulário da escola regular</h1>
        {status === 'disponivel' && !enviado && <p className="mb-6 text-sm font-medium text-[#737da6]">Preencha as respostas em até 24 horas após a criação do link.</p>}
        {status === 'carregando' && <p className="py-6 text-sm text-[#737da6]" role="status">Carregando formulário…</p>}
        {mensagem && <div className="mt-5 rounded-xl bg-[#edf4ff] p-4 text-sm font-medium text-[#344875]" role="status">{mensagem}</div>}
        {erro && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700" role="alert">{erro}</div>}

        {status === 'disponivel' && !enviado && <form onSubmit={handleEnviar} className="space-y-5">
          {perguntas.map((pergunta, index) => <div key={index} className="space-y-2">
            <Label htmlFor={`external-response-${index}`} className="block text-sm font-semibold text-[#344875]">{pergunta}</Label>
            <Textarea id={`external-response-${index}`} value={respostas[index] || ''}
              onChange={(event) => setRespostas((atuais) => atuais.map((resposta, i) => i === index ? event.target.value : resposta))}
              rows={3} maxLength={5000} placeholder="Sua resposta..."
              className="w-full rounded-xl border-[#d9e1f2] bg-[#fbfcff] p-3 text-sm text-[#34477f] transition-[border-color,box-shadow,background-color] duration-200 ease-out focus-visible:border-[#a94bea] focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#b54ae8]/15 focus-visible:ring-offset-0" />
          </div>)}
          <Button variant="brand" type="submit" disabled={enviando} className="w-full rounded-full bg-gradient-to-r from-[#0752a7] to-[#bb58df] font-semibold text-white disabled:pointer-events-none">
            {enviando ? 'Enviando...' : 'Enviar respostas'}
          </Button>
        </form>}

        {enviado && <div className="py-6 text-center" role="status">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">✓</div>
          <h2 className="text-lg font-semibold text-[#344875]">Obrigado!</h2>
          <p className="mt-1 text-sm text-[#737da6]">Suas respostas foram enviadas com sucesso.</p>
        </div>}
      </Card>
    </div>
  </div>
}
