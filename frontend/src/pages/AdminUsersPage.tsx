import { useCallback, useEffect, useState } from 'react'
import { Check, LogOut, RefreshCw, UsersRound } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'
import { apiFetch, ApiError } from '@/lib/api'

type PendingUser = { id: string; name: string; email: string }
type SchoolInfo = { id: string; nome: string; codigoCadastro: string }

export function AdminUsersPage() {
  const { user, signOut } = useAuth()
  const [users, setUsers] = useState<PendingUser[]>([])
  const [school, setSchool] = useState<SchoolInfo | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [pending, schoolInfo] = await Promise.all([
        apiFetch<PendingUser[]>('/api/admin/usuarios/pendentes'),
        apiFetch<SchoolInfo>('/api/admin/escola/codigo-cadastro'),
      ])
      setUsers(pending)
      setSchool(schoolInfo)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível carregar os cadastros.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadUsers() }, [loadUsers])

  const approve = async (candidate: PendingUser) => {
    setApproving(candidate.id)
    setError(null)
    setNotice(null)
    try {
      await apiFetch<void>(`/api/admin/usuarios/${candidate.id}/aprovar`, { method: 'POST' })
      setUsers((current) => current.filter((item) => item.id !== candidate.id))
      setNotice(`Acesso de ${candidate.name} aprovado.`)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível aprovar este cadastro.')
    } finally {
      setApproving(null)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.assign('/login')
  }

  return (
    <main className="min-h-screen bg-[#f4f6fc]">
      <header className="border-b border-[#e5e9f2] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3"><img src="/aee-conecta-logo.png" alt="AEE Conecta" className="h-10 w-16 object-contain" /><div><p className="font-semibold text-[#384777]">Coordenação AEE</p><p className="text-xs text-slate-500">{user?.name}</p></div></div>
          <Button variant="outline" onClick={handleSignOut} className="gap-2"><LogOut className="h-4 w-4" />Sair</Button>
        </div>
      </header>
      <section className="mx-auto max-w-5xl px-5 py-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div><div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#7858b7]"><UsersRound className="h-4 w-4" />Gestão de acesso</div><h1 className="text-3xl font-bold text-[#34446f]">Cadastros para aprovação</h1><p className="mt-2 text-sm text-slate-600">Revise as solicitações antes de liberar o acesso ao sistema.</p></div>
          <Button variant="outline" onClick={() => void loadUsers()} disabled={loading} className="gap-2"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Atualizar</Button>
        </div>
        {school && <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#ded9f3] bg-[#f4f1fc] p-5"><div><p className="text-sm font-medium text-[#6f56a6]">Código de cadastro · {school.nome}</p><p className="mt-1 font-mono text-2xl font-bold tracking-[0.22em] text-[#384777]">{school.codigoCadastro}</p><p className="mt-1 text-xs text-slate-600">Compartilhe este código somente com as professoras desta escola.</p></div><Button variant="outline" onClick={() => { void navigator.clipboard.writeText(school.codigoCadastro).then(() => setCopied(true)) }}>{copied ? 'Copiado' : 'Copiar código'}</Button></div>}
        {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        {notice && <div role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}
        <div className="overflow-hidden rounded-2xl border border-[#e5e9f2] bg-white shadow-sm">
          {loading ? <p className="p-8 text-center text-sm text-slate-500">Carregando cadastros…</p> : users.length === 0 ? <div className="p-12 text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0edfb] text-[#765abe]"><Check className="h-6 w-6" /></div><h2 className="font-semibold text-[#34446f]">Tudo em dia</h2><p className="mt-1 text-sm text-slate-500">Não há cadastros aguardando aprovação.</p></div> : <ul className="divide-y divide-[#edf0f6]">{users.map((candidate) => <li key={candidate.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-[#34446f]">{candidate.name}</p><p className="mt-1 text-sm text-slate-600">{candidate.email}</p></div><Button onClick={() => void approve(candidate)} disabled={approving !== null} className="gap-2 bg-[#655dcc] text-white hover:bg-[#5149b2]">{approving === candidate.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Aprovar acesso</Button></li>)}</ul>}
        </div>
      </section>
    </main>
  )
}
