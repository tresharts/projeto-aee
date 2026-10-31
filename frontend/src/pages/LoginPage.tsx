import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthShell } from '@/components/auth/AuthShell'
import { useAuth } from '@/auth/useAuth'
import { ApiError } from '@/lib/api'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { signIn, user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate(user.role === 'ADMIN' ? '/admin/usuarios' : '/dashboard', { replace: true })
  }, [loading, navigate, user])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const sessionUser = await signIn(email.trim(), password)
      navigate(sessionUser.role === 'ADMIN' ? '/admin/usuarios' : '/dashboard', { replace: true })
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível entrar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-wide text-[#426294] sm:text-[2rem]">BEM-VINDA(O)</h1>
        <p className="mt-3 text-sm font-medium tracking-wide text-[#64738d] sm:text-base">SUA ROTINA DE INCLUSÃO COMEÇA AQUI</p>
      </div>
      {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="space-y-2.5">
          <Label htmlFor="login-email" className="text-xl font-semibold text-[#426294]">E-mail institucional</Label>
          <div className="relative">
            <Mail aria-hidden="true" className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#aab7cb]" />
            <Input id="login-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="digite seu e-mail" className="h-16 rounded-xl border-0 bg-[#eaf1fd] pl-16 text-base placeholder:text-[#8290a3] focus-visible:ring-[#6776d9]" />
          </div>
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="login-password" className="text-xl font-semibold text-[#426294]">Senha</Label>
          <div className="relative">
            <LockKeyhole aria-hidden="true" className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-[#aab7cb]" />
            <Input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="digite sua senha" className="h-16 rounded-xl border-0 bg-[#eaf1fd] pl-16 pr-14 text-base placeholder:text-[#8290a3] focus-visible:ring-[#6776d9]" />
            <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-2 text-[#9aa8bd] hover:text-[#4b5d88] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6776d9]">
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-sm text-[#68758b]">Precisa de ajuda? Fale com a coordenação da sua escola.</p>
        </div>
        <div className="pt-2">
          <Button type="submit" disabled={submitting || loading} className="h-12 w-full rounded-full bg-gradient-to-r from-[#4b66eb] via-[#9d55d5] to-[#ec4db7] text-base font-semibold text-white shadow-sm hover:brightness-105">
            {submitting ? 'Entrando…' : 'Entrar'}
          </Button>
          <p className="mt-3 text-center text-sm text-[#475574]">
            <span className="font-semibold underline underline-offset-2">Não possui conta?</span>{' '}
            <Link to="/cadastro" className="font-medium text-[#6a5c9b] hover:underline">Cadastre-se</Link>
          </p>
        </div>
      </form>
    </AuthShell>
  )
}
