import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Check, ClipboardCopy, LogOut, Save, Settings2, ShieldCheck, UserRound, UsersRound } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { AvatarBadge } from '@/components/people/AvatarBadge'
import { Button } from '@/components/ui/button'
import { ApiError, apiFetch } from '@/lib/api'

type Account = { nome: string; email: string; perfil: 'ADMIN' | 'PROFESSOR' }
type School = { id: string; nome: string }
type SchoolCode = { codigoCadastro: string }
type Page<T> = { content: T[] }

export function SettingsPage() {
  const navigate = useNavigate()
  const { user, signOut, updateProfileName } = useAuth()
  const [account, setAccount] = useState<Account | null>(null)
  const [school, setSchool] = useState<School | null>(null)
  const [schoolCode, setSchoolCode] = useState('')
  const [nameDraft, setNameDraft] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const [profile, schools, code] = await Promise.all([
          apiFetch<Account>('/api/configuracoes/conta'),
          apiFetch<Page<School>>('/api/escolas?page=0&size=1'),
          user?.role === 'ADMIN'
            ? apiFetch<SchoolCode>('/api/admin/escola/codigo-cadastro')
            : Promise.resolve(null),
        ])
        if (!active) return
        setAccount(profile)
        setNameDraft(profile.nome)
        setSchool(schools.content[0] ?? null)
        setSchoolCode(code?.codigoCadastro ?? '')
      } catch (cause) {
        if (active) setError(cause instanceof ApiError ? cause.message : 'Não foi possível carregar as configurações.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [user?.role])

  const saveName = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nome = nameDraft.trim()
    if (!nome || saving) return
    setSaving(true); setError(''); setNotice('')
    try {
      const updated = await apiFetch<Account>('/api/configuracoes/conta', {
        method: 'PUT', body: JSON.stringify({ nome }),
      })
      setAccount(updated)
      updateProfileName(updated.nome)
      setEditing(false)
      setNotice('Nome atualizado com sucesso.')
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível atualizar o nome.')
    } finally { setSaving(false) }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(schoolCode)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch { setError('Não foi possível copiar o código neste navegador.') }
  }

  const leave = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const unavailable = (feature: string) => setNotice(`${feature} estará disponível em breve.`)

  return <div className="app-shell">
    <Sidebar activePage="settings" onUnavailable={unavailable} />
    <div className="workspace">
      <TopBar showSearch={false} query="" results={[]} searching={false} onQueryChange={() => undefined} onUnavailable={unavailable} />
      <main className="dashboard-surface min-h-[calc(100vh-110px)] px-5 pb-16 pt-7 sm:px-9">
        <header className="mb-8 flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e9f0ff] text-[#5367b2]"><Settings2 className="h-6 w-6" aria-hidden="true" /></span>
          <div><h1 className="app-gradient-title m-0 text-[27px] font-extrabold leading-tight">Configurações</h1><p className="mt-1 text-sm text-[#737da6]">Gerencie sua conta e consulte os dados da sua escola.</p></div>
        </header>

        {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700" role="alert">{error}</div>}
        {notice && <div className="mb-5 rounded-2xl border border-[#bfdfd1] bg-[#edfaf3] px-5 py-4 text-sm font-medium text-[#287352]" role="status">{notice}</div>}
        {loading ? <p className="py-10 text-sm text-[#737da6]">Carregando configurações…</p> : account && <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[27px] border border-[#e4eaf7] bg-white p-6 shadow-[0_9px_25px_rgba(65,84,137,0.08)] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(65,84,137,0.12)] sm:p-7">
            <div className="mb-6 flex items-center gap-4 border-b border-[#edf0f8] pb-6">
              <AvatarBadge name={account.nome} tone="blue" size="lg" />
              <div className="min-w-0"><h2 className="m-0 text-xl font-bold text-[#30458d]">Minha conta</h2><p className="mt-1 text-sm text-[#737da6]">{account.perfil === 'ADMIN' ? 'Coordenação da escola' : 'Professora do AEE'}</p></div>
            </div>
            <form onSubmit={(event) => void saveName(event)} className="space-y-5">
              <label className="block"><span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#4d5d9b]"><UserRound className="h-4 w-4" aria-hidden="true" />Nome completo</span><input value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} readOnly={!editing} maxLength={100} required className={'h-12 w-full rounded-xl border px-4 text-sm font-medium text-[#34477f] outline-none transition-[border-color,box-shadow,background-color] duration-200 ' + (editing ? 'border-[#a8b9e7] bg-white focus:border-[#806bd3] focus:ring-4 focus:ring-[#b9abef]/20' : 'border-[#e1e8f6] bg-[#f4f7fd]')} /></label>
              <label className="block"><span className="mb-2 block text-sm font-semibold text-[#4d5d9b]">E-mail de acesso</span><input value={account.email} readOnly className="h-12 w-full rounded-xl border border-[#e1e8f6] bg-[#f4f7fd] px-4 text-sm font-medium text-[#6a78a5]" /></label>
              <div className="flex flex-wrap gap-3 pt-1">{editing ? <><Button type="submit" variant="brand" disabled={saving || !nameDraft.trim()} className="gap-2 rounded-full px-6"><Save className="h-4 w-4" aria-hidden="true" />{saving ? 'Salvando…' : 'Salvar nome'}</Button><Button type="button" variant="outline" className="rounded-full px-6" onClick={() => { setNameDraft(account.nome); setEditing(false) }}>Cancelar</Button></> : <Button type="button" variant="outline" className="rounded-full px-6" onClick={() => setEditing(true)}>Editar nome</Button>}</div>
            </form>
          </section>

          <div className="space-y-5">
            <section className="rounded-[27px] border border-[#e4eaf7] bg-[#f1f6ff] p-6 transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(65,84,137,0.1)] sm:p-7">
              <div className="mb-4 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#dce8ff] text-[#566bb6]"><Building2 className="h-5 w-5" aria-hidden="true" /></span><h2 className="m-0 text-lg font-bold text-[#30458d]">Minha escola</h2></div>
              <p className="text-sm text-[#737da6]">Escola vinculada à sua conta</p><p className="mt-1 text-lg font-bold text-[#34477f]">{school?.nome ?? 'Nenhuma escola vinculada'}</p>
            </section>

            {account.perfil === 'ADMIN' && schoolCode && <section className="rounded-[27px] border border-[#e7def8] bg-[#f7f2ff] p-6 sm:p-7">
              <div className="mb-3 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eaddff] text-[#7657b8]"><UsersRound className="h-5 w-5" aria-hidden="true" /></span><h2 className="m-0 text-lg font-bold text-[#30458d]">Acesso da equipe</h2></div>
              <p className="text-sm text-[#737da6]">Código para solicitar cadastro nesta escola</p><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><strong className="font-mono text-xl tracking-[0.18em] text-[#4c5c9c]">{schoolCode}</strong><Button type="button" variant="outline" className="gap-2 rounded-full" onClick={() => void copyCode()}>{copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}{copied ? 'Copiado' : 'Copiar'}</Button></div>
              <Button type="button" variant="link" className="mt-4 p-0 text-[#6555b4]" onClick={() => navigate('/admin/usuarios')}>Ver solicitações de acesso →</Button>
            </section>}

            <section className="rounded-[27px] border border-[#e4eaf7] bg-white p-6 shadow-[0_9px_25px_rgba(65,84,137,0.08)] sm:p-7"><div className="mb-3 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9f0ff] text-[#566bb6]"><ShieldCheck className="h-5 w-5" aria-hidden="true" /></span><h2 className="m-0 text-lg font-bold text-[#30458d]">Sessão</h2></div><p className="mb-4 text-sm text-[#737da6]">Encerre o acesso ao terminar de usar este dispositivo.</p><Button type="button" variant="outline" className="gap-2 rounded-full px-5" onClick={() => void leave()}><LogOut className="h-4 w-4" aria-hidden="true" />Sair da conta</Button></section>
          </div>
        </div>}
      </main>
      <BottomNavigation activePage="settings" onUnavailable={unavailable} />
    </div>
  </div>
}
