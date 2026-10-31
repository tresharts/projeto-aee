import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { submeterRespostas, verificarToken } from '../../lib/external-form.service'
import { Button } from '../ui/button'
import { Card } from '../ui/card'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'

const PERGUNTAS = [
  'Como foi a interação da criança esta semana?',
  'Apresentou alguma dificuldade específica?',
  'Há algo que a família precise saber?',
]

export function ExternalForm() {
  const { token } = useParams<{ token: string }>()
  const [valido, setValido] = useState<boolean | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [respostas, setRespostas] = useState<string[]>(PERGUNTAS.map(() => ''))

  const handleVerificarToken = useCallback(async () => {
    if (!token) return
    try {
      await verificarToken(token)
      setValido(true)
    } catch {
      setValido(false)
      setErro('Link não encontrado ou expirado')
    }
  }, [token])

  useEffect(() => {
    handleVerificarToken()
  }, [handleVerificarToken])

  const handleEnviar = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !valido) return

    setEnviando(true)
    setErro(null)
    try {
      await submeterRespostas(token, respostas)
      setEnviado(true)
    } catch {
      setErro('Erro ao enviar respostas. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }, [token, valido, respostas])

  const handleRespostaChange = useCallback(
    (index: number, valor: string) => {
      const novas = [...respostas]
      novas[index] = valor
      setRespostas(novas)
    },
    [respostas]
  )

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-md mx-auto">
        <Card className="border-0 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-gray-900 mb-6">
            {valido === false ? 'Link Inválido' : 'Pesquisa da Escola Regular'}
          </h1>

          {valido === false && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {erro || 'Este link não foi encontrado ou já expirou.'}
            </div>
          )}

          {!enviado && valido !== false && (
            <form onSubmit={handleEnviar} className="space-y-4">
              {PERGUNTAS.map((pergunta, index) => (
                <div key={index} className="space-y-2">
                  <Label
                    htmlFor={`external-response-${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    {pergunta}
                  </Label>
                  <Textarea
                    id={`external-response-${index}`}
                    value={respostas[index] || ''}
                    onChange={(e) => handleRespostaChange(index, e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Sua resposta..."
                  />
                </div>
              ))}
              <Button
                variant="brand"
                type="submit"
                disabled={enviando}
                className="w-full disabled:pointer-events-none"
              >
                {enviando ? 'Enviando...' : 'Enviar respostas'}
              </Button>
            </form>
          )}

          {enviado && (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="green" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Obrigado!</h2>
              <p className="text-gray-600 mt-1">
                Suas respostas foram enviadas com sucesso.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
