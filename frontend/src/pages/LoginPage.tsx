import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro(null)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      })
      if (!response.ok) throw new Error('Credenciais inválidas')
      const data = await response.json()
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken)
        navigate('/dashboard', { replace: true })
      }
    } catch {
      setErro('Credenciais inválidas')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md border-0 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900 mb-6">Entrar no AEE</h1>
        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {erro}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="login-email"
              className="block text-sm font-medium text-gray-700"
            >
              E-mail
            </Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="login-password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </Label>
            <Input
              id="login-password"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            variant="brand"
            type="submit"
            className="w-full"
          >
            Entrar
          </Button>
        </form>
      </Card>
    </div>
  )
}
