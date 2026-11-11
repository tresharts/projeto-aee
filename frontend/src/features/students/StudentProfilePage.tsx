import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowDownToLine, ArrowLeft, CalendarDays, ClipboardList, FileText, Lightbulb, Mail, Pencil, Phone, Plus, Save, Trash2, UserRound, UserRoundCheck, UserRoundX, X } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar, type SearchResult } from '@/components/layout/TopBar'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { AvatarBadge } from '@/components/people/AvatarBadge'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/lib/api'
import { getSchoolSetup, getStudent, getStudents, setStudentActive, updateStudent } from './student.service'
import type { SchoolClass, Student, StudentDraft } from './student.types'
import { createPeiObjective, getAttendances, getPeiObjectives } from '@/features/attendance/attendance.service'
import type { Atendimento, ObjetivoPei } from '@/features/attendance/attendance.types'
import { deleteStudentDocument, downloadStudentDocument, getStudentDocuments, uploadStudentDocument, type Documento, type TipoDocumento } from './document.service'

const dateLabel = (date: string) => date ? new Date(date.slice(0, 10) + 'T12:00:00').toLocaleDateString('pt-BR') : '—'

export function StudentProfilePage() {
  const { studentId = '' } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [history, setHistory] = useState<Atendimento[]>([])
  const [objectives, setObjectives] = useState<ObjetivoPei[]>([])
  const [objectiveDraft, setObjectiveDraft] = useState('')
  const [savingObjective, setSavingObjective] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<Atendimento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [changingStatus, setChangingStatus] = useState(false)
  const [editingInfo, setEditingInfo] = useState(false)
  const [savingInfo, setSavingInfo] = useState(false)
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [draft, setDraft] = useState<StudentDraft | null>(null)
  const [documents, setDocuments] = useState<Documento[]>([])
  const [documentType, setDocumentType] = useState<TipoDocumento>('LAUDO')
  const [uploading, setUploading] = useState(false)
  const [documentBusy, setDocumentBusy] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    let active = true
    setLoading(true)
    void Promise.all([getStudent(studentId), getAttendances(studentId, 50), getStudentDocuments(studentId), getPeiObjectives(studentId)]).then(([s, page, docs, peiObjectives]) => {
      if (!active) return
      setStudent(s); setHistory(page.content); setDocuments(docs); setObjectives(peiObjectives); setError('')
    }).catch((cause) => {
      if (active) setError(cause instanceof ApiError ? cause.message : 'Não foi possível carregar as informações do aluno.')
    }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [studentId])
  useEffect(() => { void getSchoolSetup().then((setup) => setClasses(setup.classes)).catch(() => setClasses([])) }, [])
  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) { setSearchResults([]); return }
    let active = true
    const timer = window.setTimeout(() => {
      void getStudents(0, term, 'all', 'all', 6).then((page) => {
        if (active) setSearchResults(page.content.map((item) => ({ id: item.id, name: item.nome, detail: item.nomeTurma + ' • ' + item.nomeEscola })))
      }).catch(() => { if (active) setSearchResults([]) })
    }, 250)
    return () => { active = false; window.clearTimeout(timer) }
  }, [query])
  const unavailable = (feature: string) => setError(feature + ' estará disponível em breve.')
  const startEditingInfo = () => {
    if (!student) return
    setDraft({ nome: student.nome, dataNascimento: student.dataNascimento.slice(0, 10), turmaId: student.turmaId, diagnostico: student.diagnostico ?? '', email: student.email ?? '', telefone: student.telefone ?? '', informacoesFamilia: student.informacoesFamilia ?? '', contatosEmergencia: student.contatosEmergencia ?? '', fotoUrl: student.fotoUrl ?? '' })
    setEditingInfo(true)
  }
  const saveInfo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!student || !draft || savingInfo) return
    setSavingInfo(true); setError('')
    try {
      const updated = await updateStudent(student.id, { ...draft, nome: draft.nome.trim(), diagnostico: draft.diagnostico.trim(), email: draft.email.trim(), telefone: draft.telefone.trim(), informacoesFamilia: draft.informacoesFamilia.trim(), contatosEmergencia: draft.contatosEmergencia.trim(), fotoUrl: draft.fotoUrl.trim() })
      setStudent(updated); setEditingInfo(false); setDraft(null)
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Não foi possível salvar as informações do aluno.') }
    finally { setSavingInfo(false) }
  }
  const addObjective = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const description = objectiveDraft.trim()
    if (!description || savingObjective) return
    setSavingObjective(true); setError('')
    try {
      const created = await createPeiObjective(studentId, description)
      setObjectives((current) => [created, ...current]); setObjectiveDraft('')
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Não foi possível cadastrar o objetivo do PEI.') }
    finally { setSavingObjective(false) }
  }
  const toggleStudentStatus = async () => {
    if (!student || changingStatus) return
    const activating = !student.ativo
    const action = activating ? 'reativar' : 'desativar'
    if (!window.confirm(activating ? 'Reativar o cadastro deste aluno?' : 'Desativar o cadastro deste aluno?')) return
    setChangingStatus(true)
    setError('')
    try {
      await setStudentActive(student.id, activating)
      setStudent((current) => current ? { ...current, ativo: activating } : current)
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível ' + action + ' este cadastro.')
    } finally {
      setChangingStatus(false)
    }
  }
  const uploadDocument = async (file?: File) => {
    if (!file || !student) return
    if (file.size > 10 * 1024 * 1024) { setError('O arquivo deve ter no máximo 10 MB.'); return }
    setUploading(true); setError('')
    try {
      const saved = await uploadStudentDocument(student.id, file, documentType)
      setDocuments((current) => [saved, ...current])
      if (fileInput.current) fileInput.current.value = ''
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : 'Não foi possível enviar o documento.')
    } finally { setUploading(false) }
  }
  const downloadDocument = async (document: Documento) => {
    setDocumentBusy(document.id); setError('')
    try {
      const blob = await downloadStudentDocument(document.id)
      const url = URL.createObjectURL(blob); const link = window.document.createElement('a')
      link.href = url; link.download = document.nomeArquivo; link.click(); URL.revokeObjectURL(url)
    } catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Não foi possível baixar o documento.') }
    finally { setDocumentBusy(null) }
  }
  const removeDocument = async (document: Documento) => {
    if (!window.confirm('Remover ' + document.nomeArquivo + '?')) return
    setDocumentBusy(document.id); setError('')
    try { await deleteStudentDocument(document.id); setDocuments((current) => current.filter((item) => item.id !== document.id)) }
    catch (cause) { setError(cause instanceof ApiError ? cause.message : 'Não foi possível remover o documento.') }
    finally { setDocumentBusy(null) }
  }
  const age = (() => {
    if (!student?.dataNascimento) return null
    const birth = new Date(student.dataNascimento.slice(0, 10) + 'T12:00:00'); const now = new Date()
    let years = now.getFullYear() - birth.getFullYear()
    if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) years--
    return years >= 0 ? years : null
  })()
  return <div className="app-shell">
    <Sidebar activePage="students" onUnavailable={unavailable} />
    <div className="workspace">
      <TopBar query={query} results={searchResults} searching={false} onQueryChange={setQuery} onUnavailable={unavailable} onResultSelect={(result) => navigate('/alunos/' + encodeURIComponent(result.id))} />
      <main className="dashboard-surface student-profile-surface">
        <button className="student-profile-back" type="button" onClick={() => navigate('/alunos')}><ArrowLeft aria-hidden="true" />Meus Alunos</button>
        {error && <div className="students-feedback students-feedback--error" role="alert">{error}</div>}
        {loading ? <p className="attendance-muted">Carregando informações do aluno…</p> : student && <>
          <header className="student-profile-header">
            <AvatarBadge name={student.nome} tone="blue" size="lg" />
            <div className="student-profile-title"><h1 className="app-gradient-title">{student.nome}</h1><p>{student.nomeEscola} · {student.nomeTurma}</p></div>
            <span className={'student-status ' + (student.ativo ? 'is-active' : 'is-inactive')}>{student.ativo ? 'Ativo' : 'Inativo'}</span>
            <Button variant="outline" disabled={changingStatus} onClick={() => void toggleStudentStatus()}>{student.ativo ? <><UserRoundX aria-hidden="true" />Desativar aluno</> : <><UserRoundCheck aria-hidden="true" />Reativar aluno</>}</Button>
            <Button className="register-button student-profile-action" onClick={() => navigate('/registro-atendimento?alunoId=' + encodeURIComponent(student.id))}><Plus aria-hidden="true" />Novo atendimento</Button>
          </header>
          <section className="student-profile-grid">
            <article className="student-profile-card student-profile-details">
              <header className="student-profile-section-heading"><h2><UserRound aria-hidden="true" />Informações do aluno</h2>{editingInfo ? <div><Button type="button" variant="outline" disabled={savingInfo} onClick={() => { setEditingInfo(false); setDraft(null) }}><X aria-hidden="true" />Cancelar</Button><Button type="submit" form="student-profile-edit-form" disabled={savingInfo}><Save aria-hidden="true" />{savingInfo ? 'Salvando…' : 'Salvar'}</Button></div> : <Button type="button" variant="outline" onClick={startEditingInfo}><Pencil aria-hidden="true" />Editar informações</Button>}</header>
              {editingInfo && draft ? <form id="student-profile-edit-form" className="student-profile-edit-form" onSubmit={(event) => void saveInfo(event)}>
                <label>Nome<input required maxLength={100} value={draft.nome} onChange={(event) => setDraft({ ...draft, nome: event.target.value })} /></label>
                <label>Data de nascimento<input type="date" required value={draft.dataNascimento} onChange={(event) => setDraft({ ...draft, dataNascimento: event.target.value })} /></label>
                <label>Turma<select required value={draft.turmaId} onChange={(event) => setDraft({ ...draft, turmaId: event.target.value })}>{classes.map((item) => <option key={item.id} value={item.id}>{item.nome}</option>)}</select></label>
                <label>Telefone<input value={draft.telefone} onChange={(event) => setDraft({ ...draft, telefone: event.target.value })} /></label>
                <label>E-mail<input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
                <label className="student-profile-edit-wide">Diagnóstico<textarea value={draft.diagnostico} onChange={(event) => setDraft({ ...draft, diagnostico: event.target.value })} /></label>
                <label className="student-profile-edit-wide">Informações da família<textarea value={draft.informacoesFamilia} onChange={(event) => setDraft({ ...draft, informacoesFamilia: event.target.value })} /></label>
                <label className="student-profile-edit-wide">Contatos de emergência<textarea value={draft.contatosEmergencia} onChange={(event) => setDraft({ ...draft, contatosEmergencia: event.target.value })} /></label>
              </form> : <dl>
                <div><dt>Idade</dt><dd>{age === null ? '—' : age + ' anos'}</dd></div>
                <div><dt>Data de nascimento</dt><dd><CalendarDays aria-hidden="true" />{dateLabel(student.dataNascimento)}</dd></div>
                <div><dt>Turma</dt><dd>{student.nomeTurma}</dd></div>
                <div><dt>Telefone</dt><dd><Phone aria-hidden="true" />{student.telefone || '—'}</dd></div>
                <div><dt>E-mail</dt><dd><Mail aria-hidden="true" />{student.email || '—'}</dd></div>
                <div className="student-profile-wide"><dt>Informações da família</dt><dd>{student.informacoesFamilia || 'Nenhuma informação cadastrada.'}</dd></div>
                <div className="student-profile-wide"><dt>Diagnóstico</dt><dd>{student.diagnostico || 'Nenhum diagnóstico informado.'}</dd></div>
                <div className="student-profile-wide"><dt>Contatos de emergência</dt><dd>{student.contatosEmergencia || 'Nenhum contato cadastrado.'}</dd></div>
              </dl>}
            </article>
            <article className="student-profile-card student-profile-documents">
              <h2><FileText aria-hidden="true" />Documentos <span className="student-document-count">{documents.length}</span></h2>
              <p>Laudos e documentos escolares do aluno.</p>
              <div className="student-document-upload">
                <label htmlFor="student-document-type">Tipo do documento</label>
                <select id="student-document-type" value={documentType} onChange={(event) => setDocumentType(event.target.value as TipoDocumento)}><option value="LAUDO">Laudo</option><option value="PEI">PEI</option><option value="OUTRO">Outro</option></select>
                <input ref={fileInput} type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*" onChange={(event) => void uploadDocument(event.target.files?.[0])} />
                <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInput.current?.click()}>{uploading ? 'Enviando…' : 'Adicionar documento'}</Button>
                <small>PDF ou imagem, até 10 MB</small>
              </div>
              {documents.length === 0 ? <p className="attendance-muted">Nenhum documento anexado.</p> : <ul className="student-document-list">{documents.map((doc) => <li key={doc.id}>
                <FileText aria-hidden="true" /><div><strong>{doc.nomeArquivo}</strong><small>{doc.tipoDocumento} · {dateLabel(doc.dataUpload)}</small></div>
                <button type="button" title="Baixar documento" aria-label={'Baixar ' + doc.nomeArquivo} disabled={documentBusy === doc.id} onClick={() => void downloadDocument(doc)}><ArrowDownToLine aria-hidden="true" /></button>
                <button type="button" title="Remover documento" aria-label={'Remover ' + doc.nomeArquivo} disabled={documentBusy === doc.id} onClick={() => void removeDocument(doc)}><Trash2 aria-hidden="true" /></button>
              </li>)}</ul>}
            </article>
          </section>
          <section className="student-profile-card student-profile-pei">
            <header><div><h2><Lightbulb aria-hidden="true" />Objetivos do PEI</h2><p>Cadastre aqui os objetivos que poderão ser acompanhados nos atendimentos.</p></div><span>{objectives.length}</span></header>
            <form className="student-profile-objective-form" onSubmit={(event) => void addObjective(event)}><label htmlFor="student-pei-objective">Novo objetivo</label><textarea id="student-pei-objective" maxLength={2000} value={objectiveDraft} onChange={(event) => setObjectiveDraft(event.target.value)} placeholder="Descreva um objetivo do plano educacional individualizado" /><Button type="submit" disabled={savingObjective || !objectiveDraft.trim()}>{savingObjective ? 'Salvando…' : 'Adicionar objetivo'}</Button></form>
            {objectives.length === 0 ? <p className="attendance-muted">Nenhum objetivo do PEI cadastrado para este aluno.</p> : <ul className="student-profile-objective-list">{objectives.map((objective) => <li key={objective.id}><strong>{objective.descricao}</strong><small>{objective.ativo ? 'Ativo' : 'Inativo'} · cadastrado em {dateLabel(objective.dataCadastro)}</small></li>)}</ul>}
          </section>
          <section className="student-profile-card student-profile-timeline">
            <header><div><h2><ClipboardList aria-hidden="true" />Linha do tempo</h2><p>Histórico de atendimentos deste aluno</p></div><span>{history.length}</span></header>
            {history.length === 0 ? <p className="attendance-muted">Nenhum atendimento registrado ainda.</p> : <ol>{history.map((record) => <li key={record.id} className="student-timeline-entry">
              <span className="student-timeline-dot" />
              <time>{new Date(record.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</time>
              <div className="student-timeline-actions"><button type="button" className="student-timeline-summary" onClick={() => setSelectedAttendance(record)}><strong>{record.presente ? 'Atendimento realizado' : 'Falta registrada'}</strong><p>{record.atividadeRealizada || record.habilidadesTrabalhadas || record.observacoes || 'Registro de atendimento'}</p>{record.humor && <small>Humor: {record.humor === 'OUTRO' ? record.humorOutro || 'Outro' : record.humor.toLocaleLowerCase('pt-BR')}</small>}<small className="student-timeline-open-hint">Clique para ver o registro completo</small></button><button className="student-timeline-edit" type="button" title="Editar atendimento" aria-label="Editar atendimento" onClick={() => navigate('/registro-atendimento?alunoId=' + encodeURIComponent(studentId) + '&editarId=' + encodeURIComponent(record.id))}><Pencil aria-hidden="true" /></button></div>
            </li>)}</ol>}
          </section>
          <Dialog.Root open={Boolean(selectedAttendance)} onOpenChange={(open) => { if (!open) setSelectedAttendance(null) }}>
            <Dialog.Portal>
              <Dialog.Overlay className="student-attendance-dialog-overlay" />
              <Dialog.Content className="student-attendance-dialog">
                {selectedAttendance && <>
                  <div className="student-attendance-dialog-heading"><div><span>PRONTUÁRIO DO ALUNO</span><Dialog.Title>Registro do atendimento</Dialog.Title><Dialog.Description>{new Date(selectedAttendance.dataHora).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</Dialog.Description></div><span className={'student-attendance-presence ' + (selectedAttendance.presente ? 'is-present' : 'is-absent')}>{selectedAttendance.presente ? 'Presente' : 'Falta'}</span></div>
                  <div className="student-attendance-dialog-content">
                    <section className="student-attendance-summary"><h3>Resumo</h3><div className="student-attendance-chips">
                      <span><small>Humor</small><b>{selectedAttendance.humor ? selectedAttendance.humor === 'OUTRO' ? selectedAttendance.humorOutro || 'Outro' : selectedAttendance.humor.toLocaleLowerCase('pt-BR') : 'Não informado'}</b></span>
                      <span><small>Participação</small><b>{selectedAttendance.participacao?.replaceAll('_', ' ').toLocaleLowerCase('pt-BR') || 'Não avaliada'}</b></span>
                      <span><small>Desenvolvimento</small><b>{selectedAttendance.desenvolvimento?.replaceAll('_', ' ').toLocaleLowerCase('pt-BR') || 'Não avaliado'}</b></span>
                    </div></section>
                    <section className="student-attendance-summary"><h3>Evolução observada</h3><div className="student-attendance-chips">
                      {([['Participação', selectedAttendance.evolucaoParticipacao], ['Comunicação', selectedAttendance.evolucaoComunicacao], ['Atenção', selectedAttendance.evolucaoAtencao], ['Autonomia', selectedAttendance.evolucaoAutonomia]] as const).map(([label, value]) => <span key={label}><small>{label}</small><b>{value?.replaceAll('_', ' ').toLocaleLowerCase('pt-BR') || 'Não avaliado'}</b></span>)}
                    </div></section>
                    {([['Atividade realizada', selectedAttendance.atividadeRealizada], ['Recursos utilizados', selectedAttendance.recursosUtilizados], ['Habilidades trabalhadas', selectedAttendance.habilidadesTrabalhadas], ['Observações', selectedAttendance.observacoes], ['Estratégias utilizadas', selectedAttendance.estrategiasUtilizadas], ['Próximos passos', selectedAttendance.proximosPassos]] as const).filter(([, value]) => Boolean(value?.trim())).map(([label, value]) => <section className="student-attendance-text-section" key={label}><h3>{label}</h3><p>{value}</p></section>)}
                    <section className="student-attendance-summary"><h3>Objetivos do PEI</h3>{selectedAttendance.objetivosPei.length ? selectedAttendance.objetivosPei.map((goal) => <article className="student-attendance-goal" key={goal.objetivoPeiId}><b>{goal.descricaoObjetivo}</b><span>{goal.nivel.replaceAll('_', ' ').toLocaleLowerCase('pt-BR')}</span>{goal.observacao && <p>{goal.observacao}</p>}</article>) : <p className="student-attendance-empty">Nenhum objetivo vinculado a este atendimento.</p>}</section>
                  </div>
                  <Dialog.Close className="student-attendance-dialog-close">Fechar</Dialog.Close>
                </>}
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </>}
      </main>
      <BottomNavigation activePage="students" onUnavailable={unavailable} />
    </div>
  </div>
}
