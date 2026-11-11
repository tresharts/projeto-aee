import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api'
import { register } from '@/lib/auth.service'

export function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [schoolCode, setSchoolCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    if (password !== confirmation) {
      setError('As senhas não conferem.')
      return
    }
    setSubmitting(true)
    try {
      await register(name.trim(), email.trim(), schoolCode.trim().toUpperCase(), password)
      setSubmitted(true)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível enviar o cadastro.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell compact>
      <div className="mb-4">
        <h1 className="app-gradient-title text-2xl font-bold">CRIAR CONTA</h1>
        <p className="mt-1 text-sm text-[#64738d]">Solicite acesso ao AEE Conecta</p>
      </div>
      {submitted ? (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
          <h2 className="font-semibold">Cadastro enviado</h2>
          <p className="mt-2 text-sm">A coordenação da escola precisa aprovar seu acesso. Você poderá entrar depois da aprovação.</p>
          <Link to="/login" className="mt-5 inline-block font-semibold underline">Voltar para entrar</Link>
        </div>
      ) : (
        <>
          {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="register-name" className="text-sm font-semibold text-[#426294]">Nome completo</Label>
              <div className="relative"><UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#aab7cb]" /><Input id="register-name" required maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome" className="h-10 rounded-lg border-0 bg-[#eaf1fd] pl-11" /></div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="register-email" className="text-sm font-semibold text-[#426294]">E-mail institucional</Label>
              <div className="relative"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#aab7cb]" /><Input id="register-email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@escola.edu.br" className="h-10 rounded-lg border-0 bg-[#eaf1fd] pl-11" /></div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="register-school-code" className="text-sm font-semibold text-[#426294]">Código da escola</Label>
              <Input id="register-school-code" required minLength={10} maxLength={10} autoComplete="off" value={schoolCode} onChange={(event) => setSchoolCode(event.target.value.toUpperCase())} placeholder="Solicite o código à coordenação" className="h-10 rounded-lg border-0 bg-[#eaf1fd] uppercase tracking-widest" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="register-password" className="text-sm font-semibold text-[#426294]">Senha</Label>
              <div className="relative"><LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#aab7cb]" /><Input id="register-password" type={showPassword ? 'text' : 'password'} required minLength={8} maxLength={72} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" className="h-10 rounded-lg border-0 bg-[#eaf1fd] pl-11 pr-12" /><button type="button" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#8796ad]">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="register-confirm" className="text-sm font-semibold text-[#426294]">Confirme a senha</Label>
              <Input id="register-confirm" type={showPassword ? 'text' : 'password'} required autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Digite a senha novamente" className="h-10 rounded-lg border-0 bg-[#eaf1fd]" />
            </div>
            <p className="text-[11px] leading-relaxed text-[#6b7890]">Sua conta ficará pendente até a aprovação da coordenação da escola.</p>
            <Button type="submit" disabled={submitting} className="h-10 w-full rounded-full bg-gradient-to-r from-[#4b66eb] via-[#9d55d5] to-[#ec4db7] text-sm font-semibold text-white hover:brightness-105">{submitting ? 'Enviando…' : 'Solicitar acesso'}</Button>
          </form>
          <p className="mt-3 text-center text-sm text-[#475574]">Já possui conta? <Link to="/login" className="font-semibold underline">Entrar</Link></p>
        </>
      )}
    </AuthShell>
  )
}
