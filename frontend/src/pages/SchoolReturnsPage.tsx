import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, ClipboardList, ExternalLink, MessageSquareText, Plus, Search } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { AvatarBadge } from '@/components/people/AvatarBadge'
import { Button } from '@/components/ui/button'
import { ApiError, apiFetch } from '@/lib/api'

type Return = {
  id: string
  alunoId: string
  nomeAluno: string
  perguntas: string[]
  respostas: string[]
  dataResposta: string
}

export function SchoolReturnsPage() {
  const navigate = useNavigate()
  const [returns, setReturns] = useState<Return[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    void apiFetch<Return[]>('/api/external-form/responses/all').then((items) => {
      if (active) setReturns(items)
    }).catch((cause) => {
      if (active) setError(cause instanceof ApiError ? cause.message : 'Não foi possível carregar os retornos.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const filtered = useMemo(() => returns.filter((item) =>
    item.nomeAluno.toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR')),
  ), [returns, query])
  const unavailable = (feature: string) => setNotice(`${feature} estará disponível em breve.`)

  return <div className="app-shell">
    <Sidebar activePage="external-form" onUnavailable={unavailable} />
    <div className="workspace">
      <TopBar showSearch={false} query="" results={[]} searching={false} onQueryChange={() => undefined} onUnavailable={unavailable} />
      <main className="dashboard-surface min-h-[calc(100vh-110px)] px-5 pb-16 pt-7 sm:px-9">
        <Button type="button" variant="ghost" className="mb-5 gap-2 rounded-full text-[#5367a8] transition-colors hover:bg-[#eef3ff]" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-4 w-4" aria-hidden="true" />Dashboard</Button>
        <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f0ff] text-[#5367b2]"><MessageSquareText className="h-6 w-6" aria-hidden="true" /></span><div><h1 className="app-gradient-title m-0 text-[27px] font-extrabold leading-tight">Retornos da escola regular</h1><p className="mt-1 text-sm text-[#737da6]">Observações recebidas pelos formulários de cada aluno.</p></div></div>
          <Button type="button" variant="brand" className="gap-2 rounded-full px-5" onClick={() => navigate('/external-form/gerar')}><Plus className="h-4 w-4" aria-hidden="true" />Novo formulário</Button>
        </header>
        {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700" role="alert">{error}</div>}
        {notice && <div className="mb-5 rounded-2xl border border-[#dbe4fa] bg-[#f0f5ff] px-5 py-4 text-sm text-[#4d5d9b]" role="status">{notice}</div>}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#edf4ff] px-5 py-4"><div className="flex items-center gap-2 text-sm font-bold text-[#43569b]"><ClipboardList className="h-5 w-5" aria-hidden="true" />{returns.length} {returns.length === 1 ? 'retorno recebido' : 'retornos recebidos'}</div><label className="relative block w-full max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8997bd]" aria-hidden="true" /><span className="sr-only">Buscar pelo nome do aluno</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar aluno" className="h-10 w-full rounded-xl border border-[#d7e1f5] bg-white pl-10 pr-3 text-sm text-[#34477f] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#8c84d8] focus:ring-4 focus:ring-[#aea9eb]/20" /></label></div>
        {loading ? <p className="py-12 text-center text-sm text-[#737da6]">Carregando respostas…</p> : filtered.length === 0 ? <div className="rounded-[27px] border border-[#e4eaf7] bg-[#f6f9ff] p-10 text-center"><MessageSquareText className="mx-auto mb-3 h-8 w-8 text-[#8698c6]" aria-hidden="true" /><h2 className="text-lg font-bold text-[#34477f]">Nenhum retorno encontrado</h2><p className="mt-1 text-sm text-[#737da6]">As respostas enviadas pela escola aparecem aqui.</p></div> : <div className="space-y-5">{filtered.map((item) => <article key={item.id} className="rounded-[27px] border border-[#e4eaf7] bg-white p-5 shadow-[0_9px_25px_rgba(65,84,137,0.08)] transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(65,84,137,0.12)] sm:p-7">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f8] pb-5"><div className="flex items-center gap-3"><AvatarBadge name={item.nomeAluno} tone="blue" size="sm" /><div><h2 className="m-0 text-lg font-bold text-[#34477f]">{item.nomeAluno}</h2><p className="mt-1 flex items-center gap-1.5 text-xs text-[#7b88ad]"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />{new Date(item.dataResposta).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p></div></div><Button type="button" variant="outline" className="gap-2 rounded-full" onClick={() => navigate('/alunos/' + encodeURIComponent(item.alunoId))}>Ver aluno<ExternalLink className="h-4 w-4" aria-hidden="true" /></Button></header>
          <div className="grid gap-4 md:grid-cols-2">{item.perguntas.map((question, index) => <div key={index} className="rounded-2xl bg-[#f2f6ff] p-4"><h3 className="mb-2 text-sm font-bold text-[#4b5c9d]">{question}</h3><p className="whitespace-pre-wrap text-sm leading-relaxed text-[#34477f]">{item.respostas[index] || 'Sem resposta.'}</p></div>)}</div>
        </article>)}</div>}
      </main>
      <BottomNavigation activePage="external-form" onUnavailable={unavailable} />
    </div>
  </div>
}
