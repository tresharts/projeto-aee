import { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { AlertCircle, Check, GraduationCap, LoaderCircle, Pencil, Plus, RotateCcw, Search, UserRoundCheck, UserRoundX, UsersRound, X } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar, type SearchResult } from '@/components/layout/TopBar'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { AvatarBadge } from '@/components/people/AvatarBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ApiError } from '@/lib/api'
import { createSchoolClass, createStudent, getSchoolSetup, getStudents, setSchoolClassActive, setStudentActive, updateSchoolClass, updateStudent, type StudentStatusFilter } from './student.service'
import type { School, SchoolClass, Student, StudentDraft } from './student.types'

const emptyDraft = (): StudentDraft => ({
  nome: '',
  dataNascimento: '',
  turmaId: '',
  diagnostico: '',
  email: '',
  telefone: '',
  informacoesFamilia: '',
  contatosEmergencia: '',
  fotoUrl: '',
})

const dateLabel = (date: string) => {
  if (!date) return '—'
  const [year, month, day] = date.slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [activeSection, setActiveSection] = useState<'students' | 'classes'>('students')
  const [classSearch, setClassSearch] = useState('')
  const [selectedClassYear, setSelectedClassYear] = useState('all')
  const [selectedClassStatus, setSelectedClassStatus] = useState<StudentStatusFilter>('all')
  const [school, setSchool] = useState<School | null>(null)
  const [totalStudents, setTotalStudents] = useState(0)
  const [filteredStudentCount, setFilteredStudentCount] = useState(0)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [query, setQuery] = useState('')
  const [selectedClassId, setSelectedClassId] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState<StudentStatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingStatus, setChangingStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [referenceError, setReferenceError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [studentDialogOpen, setStudentDialogOpen] = useState(false)
  const [classDialogOpen, setClassDialogOpen] = useState(false)
  const [classStatusConfirmation, setClassStatusConfirmation] = useState<SchoolClass | null>(null)
  const [classStatusError, setClassStatusError] = useState<string | null>(null)
  const [changingClassStatus, setChangingClassStatus] = useState<string | null>(null)
  const [statusConfirmationStudent, setStatusConfirmationStudent] = useState<Student | null>(null)
  const [statusChangeError, setStatusChangeError] = useState<string | null>(null)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null)
  const [draft, setDraft] = useState<StudentDraft>(emptyDraft)
  const [className, setClassName] = useState('')
  const [classYear, setClassYear] = useState(String(new Date().getFullYear()))

  useEffect(() => {
    let active = true
    setReferencesLoading(true)
    void getSchoolSetup()
      .then((setup) => {
        if (!active) return
        setClasses(setup.classes)
        setSchool(setup.school)
        setReferenceError(null)
      })
      .catch((cause) => {
        if (!active) return
        setReferenceError(cause instanceof ApiError ? cause.message : 'Não foi possível carregar as turmas da escola.')
      })
      .finally(() => { if (active) setReferencesLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    void getStudents(0, '', 'all', 'all', 1)
      .then((result) => { if (active) setTotalStudents(result.totalElements) })
      .catch(() => { if (active) setTotalStudents(0) })
    return () => { active = false }
  }, [refreshKey])

  useEffect(() => {
    let active = true
    const timer = window.setTimeout(() => {
      setLoading(true)
      setError(null)
      void getStudents(page, query, selectedClassId, selectedStatus)
        .then((result) => {
          if (!active) return
          setStudents(result.content)
          setFilteredStudentCount(result.totalElements)
          setTotalPages(result.totalPages)
        })
        .catch((cause) => {
          if (!active) return
          setError(cause instanceof ApiError ? cause.message : 'Não foi possível carregar os alunos.')
        })
        .finally(() => { if (active) setLoading(false) })
    }, query.trim() ? 250 : 0)
    return () => { active = false; window.clearTimeout(timer) }
  }, [page, query, refreshKey, selectedClassId, selectedStatus])

  const searchResults = useMemo<SearchResult[]>(() => students.slice(0, 6).map((student) => ({
    id: student.id,
    name: student.nome,
    detail: `${student.nomeTurma} • ${student.nomeEscola}`,
  })), [students])

  const classYears = useMemo(() => [...new Set(classes.map((item) => item.ano))].sort((a, b) => b - a), [classes])
  const visibleClasses = useMemo(() => classes.filter((item) => {
    const matchesName = item.nome.toLocaleLowerCase('pt-BR').includes(classSearch.trim().toLocaleLowerCase('pt-BR'))
    const matchesYear = selectedClassYear === 'all' || String(item.ano) === selectedClassYear
    const matchesStatus = selectedClassStatus === 'all' || item.ativo === (selectedClassStatus === 'active')
    return matchesName && matchesYear && matchesStatus
  }), [classes, classSearch, selectedClassYear, selectedClassStatus])
  const assignableClasses = classes.filter((item) => item.ativo || item.id === draft.turmaId)

  const openNewStudent = () => {
    setEditingStudent(null)
    setDraft(emptyDraft())
    setStudentDialogOpen(true)
  }

  const openStudent = (student: Student) => {
    setEditingStudent(student)
    setDraft({
      nome: student.nome,
      dataNascimento: student.dataNascimento?.slice(0, 10) ?? '',
      turmaId: student.turmaId,
      diagnostico: student.diagnostico ?? '',
      email: student.email ?? '',
      telefone: student.telefone ?? '',
      informacoesFamilia: student.informacoesFamilia ?? '',
      contatosEmergencia: student.contatosEmergencia ?? '',
      fotoUrl: student.fotoUrl ?? '',
    })
    setStudentDialogOpen(true)
  }

  const openNewClass = () => {
    setEditingClass(null)
    setClassName('')
    setClassYear(String(new Date().getFullYear()))
    setError(null)
    setClassDialogOpen(true)
  }

  const openEditClass = (item: SchoolClass) => {
    setEditingClass(item)
    setClassName(item.nome)
    setClassYear(String(item.ano))
    setError(null)
    setClassDialogOpen(true)
  }

  const refresh = () => setRefreshKey((value) => value + 1)

  const submitStudent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const cleanDraft = {
        ...draft,
        nome: draft.nome.trim(),
        diagnostico: draft.diagnostico.trim(),
        email: draft.email.trim(),
        telefone: draft.telefone.trim(),
        informacoesFamilia: draft.informacoesFamilia.trim(),
        contatosEmergencia: draft.contatosEmergencia.trim(),
        fotoUrl: draft.fotoUrl.trim(),
      }
      if (editingStudent) {
        await updateStudent(editingStudent.id, cleanDraft)
        setNotice('Dados do aluno atualizados.')
      } else {
        await createStudent(cleanDraft)
        setNotice('Aluno cadastrado com sucesso.')
        setPage(0)
      }
      setStudentDialogOpen(false)
      refresh()
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível salvar os dados do aluno.')
    } finally {
      setSaving(false)
    }
  }

  const submitClass = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!school) return
    setSaving(true)
    setError(null)
    try {
      const payload = { nome: className.trim(), ano: Number(classYear), escolaId: school.id }
      const savedClass = editingClass
        ? await updateSchoolClass(editingClass.id, payload)
        : await createSchoolClass(payload)
      setClasses((current) => {
        const next = editingClass
          ? current.map((item) => item.id === savedClass.id ? savedClass : item)
          : [...current, savedClass]
        return next.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      })
      if (!editingClass) setDraft((current) => ({ ...current, turmaId: savedClass.id }))
      setClassName('')
      setClassDialogOpen(false)
      setNotice(editingClass ? `Turma ${savedClass.nome} atualizada.` : `Turma ${savedClass.nome} cadastrada.`)
      setEditingClass(null)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível salvar a turma.')
    } finally {
      setSaving(false)
    }
  }

  const confirmClassStatusChange = async () => {
    if (!classStatusConfirmation) return
    const turma = classStatusConfirmation
    setChangingClassStatus(turma.id)
    setClassStatusError(null)
    try {
      await setSchoolClassActive(turma.id, !turma.ativo)
      setClasses((current) => current.map((item) => item.id === turma.id ? { ...item, ativo: !turma.ativo } : item))
      if (!turma.ativo && selectedClassId === turma.id) setSelectedClassId('all')
      setNotice(turma.ativo ? `Turma ${turma.nome} desativada.` : `Turma ${turma.nome} reativada.`)
      setClassStatusConfirmation(null)
    } catch (cause) {
      setClassStatusError(cause instanceof ApiError ? cause.message : 'Não foi possível atualizar a situação da turma.')
    } finally {
      setChangingClassStatus(null)
    }
  }

  const changeActive = (student: Student) => {
    setStatusChangeError(null)
    setStatusConfirmationStudent(student)
  }

  const confirmStatusChange = async () => {
    const student = statusConfirmationStudent
    if (!student) return
    const nextState = !student.ativo
    const action = nextState ? 'reativar' : 'desativar'
    setChangingStatus(student.id)
    setStatusChangeError(null)
    try {
      await setStudentActive(student.id, nextState)
      setNotice(nextState ? `${student.nome} foi reativado.` : `${student.nome} foi desativado.`)
      setStatusConfirmationStudent(null)
      refresh()
    } catch (cause) {
      setStatusChangeError(cause instanceof ApiError ? cause.message : `Não foi possível ${action} este cadastro.`)
    } finally {
      setChangingStatus(null)
    }
  }

  const showUnavailable = (feature: string) => setNotice(`${feature} estará disponível em breve.`)
  const hasActiveFilters = Boolean(query.trim()) || selectedClassId !== 'all' || selectedStatus !== 'all'

  const clearFilters = () => {
    setQuery('')
    setSelectedClassId('all')
    setSelectedStatus('all')
    setPage(0)
  }

  return (
    <div className="app-shell">
      <Sidebar onUnavailable={showUnavailable} activePage="students" />
      <div className="workspace">
        <TopBar
          query={query}
          results={searchResults}
          searching={loading && query.length >= 2}
          onQueryChange={(value) => { setQuery(value); setPage(0) }}
          onUnavailable={showUnavailable}
          onResultSelect={(result) => {
            const student = students.find((item) => item.id === result.id)
            if (student) openStudent(student)
          }}
        />
        <main className="dashboard-surface students-surface">
          <div className="welcome-row students-welcome-row">
            <div className="welcome-copy">
              <h1 className="app-gradient-title">{activeSection === 'students' ? 'Meus Alunos' : 'Turmas da Escola'}</h1>
              <p>{activeSection === 'students' ? 'Acompanhe os cadastros da sua escola' : 'Gerencie as turmas da sua escola'}{school ? ` · ${school.nome}` : ''}</p>
            </div>
            <div className="students-header-actions">
              <Button variant="outline" onClick={openNewClass} disabled={!school || referencesLoading} className="students-secondary-action gap-2"><GraduationCap aria-hidden="true" />Nova turma</Button>
              <Button onClick={openNewStudent} disabled={!classes.some((item) => item.ativo) || referencesLoading} className="register-button students-new-student-button gap-2"><Plus aria-hidden="true" />Novo aluno</Button>
            </div>
          </div>

          {(error || referenceError) && <div role="alert" className="students-feedback students-feedback--error"><AlertCircle aria-hidden="true" />{error ?? referenceError}</div>}
          {notice && <div role="status" className="students-feedback students-feedback--success"><Check aria-hidden="true" />{notice}<button className="ml-auto rounded p-1" onClick={() => setNotice(null)} aria-label="Fechar aviso"><X className="h-4 w-4" /></button></div>}

          <div className="metrics-grid students-metrics">
            <button type="button" className={`metric-card student-metric-card ${activeSection === 'students' ? 'is-selected' : ''}`} aria-pressed={activeSection === 'students'} aria-controls="students-content" onClick={() => setActiveSection('students')}>
              <span className="metric-heading"><span className="metric-icon metric-blue"><UsersRound aria-hidden="true" /></span><span className="student-metric-title">Alunos cadastrados</span></span>
              <span className="metric-value">{totalStudents}</span>
            </button>
            <button type="button" className={`metric-card student-metric-card ${activeSection === 'classes' ? 'is-selected' : ''}`} aria-pressed={activeSection === 'classes'} aria-controls="classes-content" onClick={() => setActiveSection('classes')}>
              <span className="metric-heading"><span className="metric-icon metric-purple"><GraduationCap aria-hidden="true" /></span><span className="student-metric-title">Turmas cadastradas</span></span>
              <span className="metric-value">{referencesLoading ? '…' : classes.filter((item) => item.ativo).length}</span>
            </button>
          </div>

          <div key={activeSection} className="students-section-transition">
          {activeSection === 'students' ? (
            !classes.some((item) => item.ativo) && !referencesLoading ? (
            <section id="students-content" className="agenda-panel students-empty-panel">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#bfd9ff] text-[#566499]"><GraduationCap className="h-7 w-7" /></div>
              <h2>Cadastre uma turma primeiro</h2>
              <p>Cada aluno precisa estar associado a uma turma da escola.</p>
              <Button onClick={openNewClass} disabled={!school} className="register-button students-content-button mt-5 gap-2"><Plus aria-hidden="true" />Cadastrar primeira turma</Button>
            </section>
            ) : (
            <section id="students-content" className="agenda-panel students-list-panel">
              <div className="panel-heading agenda-heading-row students-list-heading">
                <h2><span className="round-heading-icon"><UsersRound aria-hidden="true" /></span>Lista de alunos</h2>
                <span className="students-total">{filteredStudentCount} cadastro{filteredStudentCount === 1 ? '' : 's'}</span>
              </div>
              <div className="students-filters" role="group" aria-label="Filtros da lista de alunos">
                <div className="students-filter-field students-filter-search">
                  <Label htmlFor="students-filter-name">Nome do aluno</Label>
                  <div className="students-filter-search-control"><Search aria-hidden="true" /><Input id="students-filter-name" value={query} onChange={(event) => { setQuery(event.target.value); setPage(0) }} placeholder="Buscar pelo nome" /></div>
                </div>
                <div className="students-filter-field">
                  <Label htmlFor="students-filter-class">Turma</Label>
                  <Select value={selectedClassId} onValueChange={(value) => { setSelectedClassId(value); setPage(0) }}>
                    <SelectTrigger id="students-filter-class" className="students-filter-select"><SelectValue placeholder="Todas as turmas" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Todas as turmas</SelectItem>{classes.map((item) => <SelectItem key={item.id} value={item.id}>{item.nome} · {item.ano}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="students-filter-field">
                  <Label htmlFor="students-filter-status">Situação</Label>
                  <Select value={selectedStatus} onValueChange={(value) => { setSelectedStatus(value as StudentStatusFilter); setPage(0) }}>
                    <SelectTrigger id="students-filter-status" className="students-filter-select"><SelectValue placeholder="Todas as situações" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Todas as situações</SelectItem><SelectItem value="active">Ativos</SelectItem><SelectItem value="inactive">Inativos</SelectItem></SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="outline" className="students-filter-clear" onClick={clearFilters} disabled={!hasActiveFilters}><RotateCcw aria-hidden="true" />Limpar</Button>
              </div>
              {loading ? <div className="students-loading"><LoaderCircle className="h-5 w-5 animate-spin" />Carregando alunos…</div> : students.length === 0 ? <div className="students-empty-list"><h3>{hasActiveFilters ? 'Nenhum aluno encontrado' : 'Ainda não há alunos cadastrados'}</h3><p>{hasActiveFilters ? 'Ajuste os filtros ou faça uma nova busca.' : 'Cadastre o primeiro aluno para começar a organizar os atendimentos.'}</p>{!hasActiveFilters && <Button onClick={openNewStudent} className="register-button mt-5 gap-2"><Plus aria-hidden="true" />Cadastrar aluno</Button>}</div> : (
                <div className="overflow-x-auto">
                  <table className="students-table">
                    <thead><tr><th>Aluno</th><th>Turma</th><th>Nascimento</th><th>Contato</th><th>Situação</th><th className="text-right">Ações</th></tr></thead>
                    <tbody>{students.map((student) => <tr key={student.id}>
                      <td><div className="flex items-center gap-3"><AvatarBadge name={student.nome} tone="blue" size="md" /><div><p className="student-row-name">{student.nome}</p><p className="student-row-school">{student.nomeEscola}</p></div></div></td>
                      <td>{student.nomeTurma}</td>
                      <td>{dateLabel(student.dataNascimento)}</td>
                      <td>{student.telefone || student.email || '—'}</td>
                      <td><span className={`student-status ${student.ativo ? 'is-active' : 'is-inactive'}`}>{student.ativo ? 'Ativo' : 'Inativo'}</span></td>
                      <td><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" title={`Editar ${student.nome}`} aria-label={`Editar ${student.nome}`} onClick={() => openStudent(student)} className="text-[#59689d] hover:bg-white/70"><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" title={student.ativo ? 'Desativar cadastro' : 'Reativar cadastro'} aria-label={student.ativo ? `Desativar ${student.nome}` : `Reativar ${student.nome}`} disabled={changingStatus === student.id} onClick={() => void changeActive(student)} className="text-[#59689d] hover:bg-white/70">{student.ativo ? <UserRoundX className="h-4 w-4" /> : <UserRoundCheck className="h-4 w-4" />}</Button></div></td>
                    </tr>)}</tbody>
                  </table>
                </div>
              )}
              {totalPages > 1 && <div className="flex items-center justify-between border-t border-[#edf0f6] px-5 py-3"><p className="students-pagination-label text-[#8490a7]">Página {page + 1} de {totalPages}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((value) => Math.max(0, value - 1))}>Anterior</Button><Button variant="outline" size="sm" disabled={page + 1 >= totalPages || loading} onClick={() => setPage((value) => value + 1)}>Próxima</Button></div></div>}
            </section>
            )
          ) : (
            <section id="classes-content" className="agenda-panel students-list-panel">
              <div className="panel-heading agenda-heading-row students-list-heading">
                <h2><span className="round-heading-icon"><GraduationCap aria-hidden="true" /></span>Lista de turmas</h2>
                <span className="students-total">{visibleClasses.length} turma{visibleClasses.length === 1 ? '' : 's'}</span>
              </div>
              <div className="students-filters students-class-filters" role="group" aria-label="Filtros da lista de turmas">
                <div className="students-filter-field students-filter-search">
                  <Label htmlFor="classes-filter-name">Nome da turma</Label>
                  <div className="students-filter-search-control"><Search aria-hidden="true" /><Input id="classes-filter-name" value={classSearch} onChange={(event) => setClassSearch(event.target.value)} placeholder="Buscar pelo nome" /></div>
                </div>
                <div className="students-filter-field">
                  <Label htmlFor="classes-filter-year">Ano letivo</Label>
                  <Select value={selectedClassYear} onValueChange={setSelectedClassYear}>
                    <SelectTrigger id="classes-filter-year" className="students-filter-select"><SelectValue placeholder="Todos os anos" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Todos os anos</SelectItem>{classYears.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="students-filter-field">
                  <Label htmlFor="classes-filter-status">Situação</Label>
                  <Select value={selectedClassStatus} onValueChange={(value) => setSelectedClassStatus(value as StudentStatusFilter)}>
                    <SelectTrigger id="classes-filter-status" className="students-filter-select"><SelectValue placeholder="Todas as situações" /></SelectTrigger>
                    <SelectContent><SelectItem value="all">Todas as situações</SelectItem><SelectItem value="active">Ativas</SelectItem><SelectItem value="inactive">Inativas</SelectItem></SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="outline" className="students-filter-clear" onClick={() => { setClassSearch(''); setSelectedClassYear('all'); setSelectedClassStatus('all') }} disabled={!classSearch.trim() && selectedClassYear === 'all' && selectedClassStatus === 'all'}><RotateCcw aria-hidden="true" />Limpar</Button>
              </div>
              {referencesLoading ? <div className="students-loading"><LoaderCircle className="h-5 w-5 animate-spin" />Carregando turmas…</div> : classes.length === 0 ? (
                <div className="students-empty-list"><h3>Nenhuma turma cadastrada</h3><p>Crie a primeira turma para começar a organizar os alunos.</p><Button type="button" onClick={openNewClass} className="register-button students-content-button mt-5 gap-2"><Plus aria-hidden="true" />Cadastrar primeira turma</Button></div>
              ) : visibleClasses.length === 0 ? (
                <div className="students-empty-list"><h3>Nenhuma turma encontrada</h3><p>Ajuste os filtros e tente novamente.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="students-table">
                    <thead><tr><th>Turma</th><th>Ano letivo</th><th>Escola</th><th>Situação</th><th className="text-right">Ações</th></tr></thead>
                    <tbody>{visibleClasses.map((item) => <tr key={item.id}>
                      <td><p className="student-row-name">{item.nome}</p></td>
                      <td>{item.ano}</td>
                      <td>{item.nomeEscola}</td>
                      <td><span className={`student-status ${item.ativo ? 'is-active' : 'is-inactive'}`}>{item.ativo ? 'Ativa' : 'Inativa'}</span></td>
                      <td><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" title={`Editar ${item.nome}`} aria-label={`Editar ${item.nome}`} onClick={() => openEditClass(item)} className="text-[#59689d] hover:bg-white/70"><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="icon" title={`${item.ativo ? 'Desativar' : 'Reativar'} ${item.nome}`} aria-label={`${item.ativo ? 'Desativar' : 'Reativar'} ${item.nome}`} onClick={() => { setClassStatusError(null); setClassStatusConfirmation(item) }} className="text-[#59689d] hover:bg-white/70">{item.ativo ? <UserRoundX className="h-4 w-4" /> : <UserRoundCheck className="h-4 w-4" />}</Button></div></td>
                    </tr>)}</tbody>
                  </table>
                </div>
              )}
            </section>
          )}
          </div>
        </main>
      </div>
      <BottomNavigation onUnavailable={showUnavailable} activePage="students" />
      <Dialog.Root open={studentDialogOpen} onOpenChange={setStudentDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="app-modal-overlay fixed inset-0 z-50 bg-[#202b4a]/35 backdrop-blur-[2px]" />
          <Dialog.Content className="app-modal app-modal--wide fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[min(94vw,760px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl outline-none sm:p-7">
            <div className="app-modal-header mb-5 flex items-start justify-between gap-4"><div><Dialog.Title className="app-modal-title text-xl font-bold text-[#344875]">{editingStudent ? 'Editar aluno' : 'Novo aluno'}</Dialog.Title><Dialog.Description className="app-modal-description mt-1 text-sm text-[#7b87a2]">Informações do aluno vinculadas à sua escola.</Dialog.Description></div><Dialog.Close asChild><button className="app-modal-close rounded-lg p-2 text-[#7884a2] hover:bg-[#f1f3f9]" aria-label="Fechar formulário"><X className="h-5 w-5" /></button></Dialog.Close></div>
            {error && <div role="alert" className="app-modal-error mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <form onSubmit={(event) => void submitStudent(event)} className="app-modal-form space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="student-name">Nome completo *</Label><Input id="student-name" required maxLength={100} autoFocus value={draft.nome} onChange={(event) => setDraft({ ...draft, nome: event.target.value })} placeholder="Nome do aluno" /></div>
                <div className="space-y-1.5"><Label htmlFor="student-birth">Data de nascimento *</Label><Input id="student-birth" type="date" required max={new Date().toISOString().slice(0, 10)} value={draft.dataNascimento} onChange={(event) => setDraft({ ...draft, dataNascimento: event.target.value })} /></div>
                <div className="space-y-1.5"><Label htmlFor="student-class">Turma *</Label><Select value={draft.turmaId} onValueChange={(value) => setDraft({ ...draft, turmaId: value })}><SelectTrigger id="student-class"><SelectValue placeholder="Selecione uma turma" /></SelectTrigger><SelectContent>{assignableClasses.map((item) => <SelectItem key={item.id} value={item.id}>{item.nome} · {item.ano}{!item.ativo ? ' · inativa' : ''}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label htmlFor="student-email">E-mail da família</Label><Input id="student-email" type="email" maxLength={254} autoComplete="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="familia@exemplo.com" /></div>
                <div className="space-y-1.5"><Label htmlFor="student-phone">Telefone de contato</Label><Input id="student-phone" type="tel" maxLength={30} autoComplete="tel" value={draft.telefone} onChange={(event) => setDraft({ ...draft, telefone: event.target.value })} placeholder="(00) 00000-0000" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="student-diagnosis">Diagnóstico ou observação relevante</Label><Textarea id="student-diagnosis" rows={2} maxLength={5000} value={draft.diagnostico} onChange={(event) => setDraft({ ...draft, diagnostico: event.target.value })} placeholder="Informação pedagógica relevante" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="student-family">Informações da família</Label><Textarea id="student-family" rows={2} maxLength={5000} value={draft.informacoesFamilia} onChange={(event) => setDraft({ ...draft, informacoesFamilia: event.target.value })} placeholder="Contexto familiar importante para o atendimento" /></div>
                <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="student-emergency">Contatos de emergência</Label><Textarea id="student-emergency" rows={2} maxLength={3000} value={draft.contatosEmergencia} onChange={(event) => setDraft({ ...draft, contatosEmergencia: event.target.value })} placeholder="Nome e telefone para contato" /></div>
              </div>
              <div className="app-modal-footer flex flex-col-reverse gap-2 border-t border-[#edf0f6] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="ghost" onClick={openNewClass} className="app-modal-button app-modal-button--quiet justify-start gap-2 text-[#606d9d]"><Plus className="h-4 w-4" />Cadastrar uma turma</Button>
                <div className="app-modal-footer-actions flex justify-end gap-2"><Dialog.Close asChild><Button type="button" variant="outline" className="app-modal-button app-modal-button--secondary">Cancelar</Button></Dialog.Close><Button type="submit" disabled={saving || !assignableClasses.length} className="app-modal-button app-modal-button--primary">{saving ? 'Salvando…' : editingStudent ? 'Salvar alterações' : 'Cadastrar aluno'}</Button></div>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="app-modal-overlay fixed inset-0 z-[60] bg-[#202b4a]/35 backdrop-blur-[2px]" />
          <Dialog.Content className="app-modal app-modal--compact fixed left-1/2 top-1/2 z-[60] w-[min(94vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl outline-none">
            <div className="app-modal-header mb-5 flex items-start justify-between gap-4"><div><Dialog.Title className="app-modal-title text-xl font-bold text-[#344875]">{editingClass ? 'Editar turma' : 'Nova turma'}</Dialog.Title><Dialog.Description className="app-modal-description mt-1 text-sm text-[#7b87a2]">{editingClass ? `Atualize os dados de ${editingClass.nome}.` : `A turma será criada para ${school?.nome ?? 'sua escola'}.`}</Dialog.Description></div><Dialog.Close asChild><button className="app-modal-close rounded-lg p-2 text-[#7884a2] hover:bg-[#f1f3f9]" aria-label="Fechar formulário de turma"><X className="h-5 w-5" /></button></Dialog.Close></div>
            {error && <div role="alert" className="app-modal-error mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <form onSubmit={(event) => void submitClass(event)} className="app-modal-form space-y-4">
              <div className="space-y-1.5"><Label htmlFor="class-name">Nome da turma *</Label><Input id="class-name" required maxLength={100} value={className} onChange={(event) => setClassName(event.target.value)} placeholder="Ex.: 3º ano A" /></div>
              <div className="space-y-1.5"><Label htmlFor="class-year">Ano letivo *</Label><Input id="class-year" type="number" required min={2000} max={2100} value={classYear} onChange={(event) => setClassYear(event.target.value)} /></div>
              <div className="app-modal-footer-actions flex justify-end gap-2 border-t border-[#edf0f6] pt-4"><Dialog.Close asChild><Button type="button" variant="outline" className="app-modal-button app-modal-button--secondary">Cancelar</Button></Dialog.Close><Button type="submit" disabled={saving || !school} className="app-modal-button app-modal-button--primary">{saving ? 'Salvando…' : editingClass ? 'Salvar alterações' : 'Criar turma'}</Button></div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        open={Boolean(statusConfirmationStudent)}
        onOpenChange={(open) => {
          if (!open && !changingStatus) {
            setStatusConfirmationStudent(null)
            setStatusChangeError(null)
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="app-modal-overlay fixed inset-0 z-[70] bg-[#202b4a]/35 backdrop-blur-[2px]" />
          <Dialog.Content className="app-modal app-modal--compact fixed left-1/2 top-1/2 z-[70] w-[min(94vw,460px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl outline-none">
            {statusConfirmationStudent && (
              <>
                <div className="app-modal-header mb-5 flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="app-modal-title text-xl font-bold text-[#344875]">
                      {statusConfirmationStudent.ativo ? 'Desativar aluno?' : 'Reativar aluno?'}
                    </Dialog.Title>
                    <Dialog.Description className="app-modal-description mt-1 text-sm text-[#7b87a2]">
                      {statusConfirmationStudent.ativo
                        ? `O cadastro de ${statusConfirmationStudent.nome} ficará inativo. Você poderá reativá-lo depois.`
                        : `O cadastro de ${statusConfirmationStudent.nome} voltará a ficar ativo.`}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button className="app-modal-close rounded-lg p-2 text-[#7884a2] hover:bg-[#f1f3f9]" aria-label="Fechar confirmação">
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>
                {statusChangeError && <div role="alert" className="app-modal-error mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{statusChangeError}</div>}
                <div className="app-modal-footer-actions flex justify-end gap-2 border-t border-[#edf0f6] pt-4">
                  <Dialog.Close asChild>
                    <Button type="button" variant="outline" className="app-modal-button app-modal-button--secondary" disabled={Boolean(changingStatus)}>Cancelar</Button>
                  </Dialog.Close>
                  <Button
                    type="button"
                    className={`app-modal-button ${statusConfirmationStudent.ativo ? 'app-modal-button--danger' : 'app-modal-button--primary'}`}
                    disabled={Boolean(changingStatus)}
                    onClick={() => void confirmStatusChange()}
                  >
                    {changingStatus === statusConfirmationStudent.id ? 'Atualizando…' : statusConfirmationStudent.ativo ? 'Desativar aluno' : 'Reativar aluno'}
                  </Button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root
        open={Boolean(classStatusConfirmation)}
        onOpenChange={(open) => {
          if (!open && !changingClassStatus) {
            setClassStatusConfirmation(null)
            setClassStatusError(null)
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="app-modal-overlay fixed inset-0 z-[80] bg-[#202b4a]/35 backdrop-blur-[2px]" />
          <Dialog.Content className="app-modal app-modal--compact fixed left-1/2 top-1/2 z-[80] w-[min(94vw,460px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl outline-none">
            {classStatusConfirmation && (
              <>
                <div className="app-modal-header mb-5 flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="app-modal-title text-xl font-bold text-[#344875]">{classStatusConfirmation.ativo ? 'Desativar turma?' : 'Reativar turma?'}</Dialog.Title>
                    <Dialog.Description className="app-modal-description mt-1 text-sm text-[#7b87a2]">
                      {classStatusConfirmation.ativo
                        ? `${classStatusConfirmation.nome} deixará de aparecer para novos cadastros. Os alunos vinculados e seus históricos serão mantidos.`
                        : `${classStatusConfirmation.nome} voltará a ficar disponível para novos cadastros.`}
                    </Dialog.Description>
                  </div>
                  <Dialog.Close asChild>
                    <button className="app-modal-close rounded-lg p-2 text-[#7884a2] hover:bg-[#f1f3f9]" aria-label="Fechar confirmação de situação da turma">
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>
                {classStatusError && <div role="alert" className="app-modal-error mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{classStatusError}</div>}
                <div className="app-modal-footer-actions flex justify-end gap-2 border-t border-[#edf0f6] pt-4">
                  <Dialog.Close asChild>
                    <Button type="button" variant="outline" className="app-modal-button app-modal-button--secondary" disabled={Boolean(changingClassStatus)}>Cancelar</Button>
                  </Dialog.Close>
                  <Button type="button" className={`app-modal-button ${classStatusConfirmation.ativo ? 'app-modal-button--danger' : 'app-modal-button--primary'}`} disabled={Boolean(changingClassStatus)} onClick={() => void confirmClassStatusChange()}>
                    {changingClassStatus ? 'Atualizando…' : classStatusConfirmation.ativo ? 'Desativar turma' : 'Reativar turma'}
                  </Button>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
