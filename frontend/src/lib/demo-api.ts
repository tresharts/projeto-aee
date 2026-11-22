import type { Student, StudentDraft, SchoolClass, SpringPage } from '@/features/students/student.types'
import type { Atendimento, AtendimentoDraft, ObjetivoPei } from '@/features/attendance/attendance.types'
import type { ScheduledSession, ScheduledSessionDraft, ScheduledSessionStatus } from '@/features/calendar/calendar.service'
import type { Documento } from '@/features/students/document.service'
import type { SessionPayload } from './api'

const DATA_KEY = 'aee-demo-data-v1'
const SESSION_KEY = 'aee-demo-session-v1'
const SCHOOL = { id: 'escola-demo', nome: 'Escola Demonstração AEE', codigoCadastro: 'AEEDEMO026' }
const TEACHER = { id: 'professora-demo', name: 'Professora Camila', email: 'professora.demo@aee.local', role: 'PROFESSOR' as const, approved: true }
const ADMIN = { id: 'coordenacao-demo', name: 'Coordenação AEE', email: 'coordenacao.demo@aee.local', role: 'ADMIN' as const, approved: true }
type DemoUser = typeof TEACHER | typeof ADMIN | { id: string; name: string; email: string; role: 'PROFESSOR'; approved: boolean }
type DemoDocument = Documento & { dataUrl?: string }
type DemoForm = { token: string; alunoId: string; perguntas: string[]; respostas: string[] | null; dataResposta: string | null }
interface DemoState {
  users: DemoUser[]
  classes: SchoolClass[]
  students: Student[]
  attendances: Atendimento[]
  objectives: ObjetivoPei[]
  sessions: ScheduledSession[]
  documents: DemoDocument[]
  forms: DemoForm[]
}

function dateTime(dayOffset: number, hour: number) {
  const date = new Date()
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hour, 0, 0, 0)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00`
}

function seed(): DemoState {
  const classes: SchoolClass[] = [
    { id: 'turma-1', nome: '1º ano A', ano: new Date().getFullYear(), escolaId: SCHOOL.id, nomeEscola: SCHOOL.nome, ativo: true },
    { id: 'turma-2', nome: '2º ano B', ano: new Date().getFullYear(), escolaId: SCHOOL.id, nomeEscola: SCHOOL.nome, ativo: true },
  ]
  const names = ['Ana Luiza Martins', 'João Pedro Silva', 'Maria Clara Santos', 'Lucas Oliveira']
  const births = ['2018-05-12', '2018-09-24', '2017-03-08', '2017-11-17']
  const students: Student[] = names.map((nome, index) => ({
    id: `aluno-${index + 1}`, nome, dataNascimento: births[index], diagnostico: null,
    fotoUrl: null, informacoesFamilia: null, contatosEmergencia: null, email: null,
    telefone: null, ativo: true, dataCadastro: dateTime(-30, 9),
    turmaId: classes[index < 2 ? 0 : 1].id,
    nomeTurma: classes[index < 2 ? 0 : 1].nome, nomeEscola: SCHOOL.nome,
  }))
  const objectives: ObjetivoPei[] = [
    { id: 'objetivo-1', alunoId: students[0].id, documentoPeiId: null, descricao: 'Ampliar a comunicação durante atividades em grupo', ativo: true, dataCadastro: dateTime(-20, 9) },
    { id: 'objetivo-2', alunoId: students[1].id, documentoPeiId: null, descricao: 'Fortalecer a autonomia na rotina escolar', ativo: true, dataCadastro: dateTime(-20, 9) },
  ]
  const attendances: Atendimento[] = students.map((student, index) => ({
    id: `atendimento-${index + 1}`, alunoId: student.id, nomeAluno: student.nome,
    professorId: TEACHER.id, dataHora: dateTime(-index - 1, 9 + index), humor: 'FELIZ',
    foco: 'ALTO', participacao: 'ATIVA', desenvolvimento: 'AUTONOMO', humorOutro: null,
    atividadeRealizada: 'Atividade de leitura e expressão', recursosUtilizados: 'Livros e cartões ilustrados',
    habilidadesTrabalhadas: 'Comunicação e atenção', observacoes: 'Participou das atividades propostas.',
    estrategiasUtilizadas: null, proximosPassos: null, evolucaoParticipacao: 'EM_DESENVOLVIMENTO',
    evolucaoComunicacao: 'EM_DESENVOLVIMENTO', evolucaoAtencao: 'INICIAL', evolucaoAutonomia: 'INICIAL',
    objetivosPei: [], presente: index !== 1, dataCadastro: dateTime(-index - 1, 10),
  }))
  const sessions: ScheduledSession[] = students.filter((_, index) => index !== 1).map((student, index) => ({
    id: `sessao-${index + 1}`, alunoId: student.id, nomeAluno: student.nome,
    nomeTurma: student.nomeTurma, nomeEscola: SCHOOL.nome, dataHora: dateTime(index % 3, 8 + index),
    status: 'AGENDADA', observacao: null, atendimentoId: null,
  }))
  for (let index = 1; index <= 3; index++) {
    sessions.push({ id: `falta-${index}`, alunoId: students[1].id, nomeAluno: students[1].nome,
      nomeTurma: students[1].nomeTurma, nomeEscola: SCHOOL.nome, dataHora: dateTime(-index, 10),
      status: 'FALTA', observacao: null, atendimentoId: null })
  }
  const forms: DemoForm[] = [{ token: 'formulario-exemplo', alunoId: students[0].id,
    perguntas: ['Como foi a interação da criança esta semana?'],
    respostas: ['Participou das atividades em grupo e procurou os colegas.'],
    dataResposta: dateTime(-1, 14) }]
  return { users: [TEACHER, ADMIN], classes, students, objectives, attendances, sessions, documents: [], forms }
}

function read(): DemoState {
  try {
    const stored = localStorage.getItem(DATA_KEY)
    if (stored) return JSON.parse(stored) as DemoState
  } catch { /* restore demonstration below */ }
  const state = seed()
  save(state)
  return state
}

function save(state: DemoState) { localStorage.setItem(DATA_KEY, JSON.stringify(state)) }
export function resetDemo() { localStorage.removeItem(DATA_KEY); sessionStorage.removeItem(SESSION_KEY) }
export function getDemoSession(): SessionPayload | null {
  const id = sessionStorage.getItem(SESSION_KEY)
  const user = read().users.find((item) => item.id === id && item.approved)
  return user ? { accessToken: 'demo', name: user.name, email: user.email, role: user.role } : null
}
export function demoLogin(email: string, password: string): SessionPayload {
  const user = read().users.find((item) => item.email === email.trim().toLowerCase())
  if (!user || !password.trim() || ((user.id === TEACHER.id || user.id === ADMIN.id) && password !== 'demo')) throw new Error('Nesta demonstração, escolha uma das contas de acesso rápido.')
  if (!user.approved) throw new Error('Aguarde a aprovação da coordenação.')
  sessionStorage.setItem(SESSION_KEY, user.id)
  return { accessToken: 'demo', name: user.name, email: user.email, role: user.role }
}
export function demoRegister(name: string, email: string, code: string) {
  const state = read()
  if (code !== SCHOOL.codigoCadastro) throw new Error('Código da escola inválido para esta demonstração.')
  if (state.users.some((user) => user.email === email.trim().toLowerCase())) throw new Error('Este e-mail já possui cadastro.')
  state.users.push({ id: crypto.randomUUID(), name: name.trim(), email: email.trim().toLowerCase(), role: 'PROFESSOR', approved: false })
  save(state)
  return { message: 'Cadastro recebido. Aguarde a aprovação da coordenação.' }
}
export function demoLogout() { sessionStorage.removeItem(SESSION_KEY) }

function page<T>(items: T[], params: URLSearchParams): SpringPage<T> {
  const number = Math.max(0, Number(params.get('page') ?? 0))
  const size = Math.max(1, Number(params.get('size') ?? 10))
  const totalPages = Math.ceil(items.length / size)
  const content = items.slice(number * size, (number + 1) * size)
  return { content, totalElements: items.length, totalPages, number, size, first: number === 0, last: number >= totalPages - 1, empty: content.length === 0 }
}

function required<T>(item: T | undefined, label: string): T {
  if (!item) throw new Error(`${label} não encontrado.`)
  return item
}

function studentFor(state: DemoState, id: string) { return required(state.students.find((item) => item.id === id), 'Aluno') }
function sessionFor(state: DemoState, id: string) { return required(state.sessions.find((item) => item.id === id), 'Sessão') }
function body<T>(init: RequestInit): T { return JSON.parse(String(init.body ?? '{}')) as T }
function now() { return new Date().toISOString().slice(0, 19) }
function id() { return crypto.randomUUID() }

export async function demoRequest(path: string, init: RequestInit = {}): Promise<unknown> {
  const url = new URL(path, window.location.origin)
  const route = url.pathname
  const params = url.searchParams
  const method = (init.method ?? 'GET').toUpperCase()
  const state = read()

  if (/^\/api\/external-form\/[^/]+(?:\/submit)?$/.test(route) && !getDemoSession()) {
    // The public form is available without a demo session in the same browser.
  } else if (!getDemoSession()) throw new Error('Entre em uma conta de demonstração.')

  if (route === '/api/escolas' && method === 'GET') return page([SCHOOL], params)
  if (route === '/api/admin/escola/codigo-cadastro' && method === 'GET') return SCHOOL
  if (route === '/api/admin/usuarios/pendentes' && method === 'GET') return state.users.filter((item) => !item.approved)
  const approval = route.match(/^\/api\/admin\/usuarios\/([^/]+)\/aprovar$/)
  if (approval && method === 'POST') { required(state.users.find((item) => item.id === approval[1]), 'Usuário').approved = true; save(state); return undefined }
  if (route === '/api/configuracoes/conta') {
    const user = required(state.users.find((item) => item.id === sessionStorage.getItem(SESSION_KEY)), 'Usuário')
    if (method === 'PUT') { user.name = body<{ nome: string }>(init).nome; save(state) }
    return { nome: user.name, email: user.email, perfil: user.role }
  }

  if (route === '/api/turmas') {
    if (method === 'POST') {
      const draft = body<{ nome: string; ano: number }>(init)
      const item: SchoolClass = { id: id(), nome: draft.nome, ano: draft.ano, escolaId: SCHOOL.id, nomeEscola: SCHOOL.nome, ativo: true }
      state.classes.push(item); save(state); return item
    }
    let items = state.classes.filter((item) => (!params.has('ativo') || item.ativo === (params.get('ativo') === 'true')) && (!params.get('nome') || item.nome.toLowerCase().includes(params.get('nome')!.toLowerCase())))
    items = items.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    return page(items, params)
  }
  const classMatch = route.match(/^\/api\/turmas\/([^/]+)(?:\/(ativar|desativar))?$/)
  if (classMatch) {
    const item = required(state.classes.find((value) => value.id === classMatch[1]), 'Turma')
    if (classMatch[2]) { item.ativo = classMatch[2] === 'ativar'; save(state); return undefined }
    if (method === 'PUT') { Object.assign(item, body<{ nome: string; ano: number }>(init)); state.students.filter((student) => student.turmaId === item.id).forEach((student) => { student.nomeTurma = item.nome }); save(state) }
    return item
  }

  if (route === '/api/alunos') {
    if (method === 'POST') {
      const draft = body<StudentDraft>(init)
      const turma = required(state.classes.find((item) => item.id === draft.turmaId), 'Turma')
      const item: Student = { ...draft, id: id(), ativo: true, dataCadastro: now(), nomeTurma: turma.nome, nomeEscola: SCHOOL.nome }
      state.students.push(item); save(state); return item
    }
    const items = state.students.filter((item) =>
      (!params.get('nome') || item.nome.toLowerCase().includes(params.get('nome')!.toLowerCase())) &&
      (!params.get('turmaId') || item.turmaId === params.get('turmaId')) &&
      (!params.has('ativo') || item.ativo === (params.get('ativo') === 'true')),
    ).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
    return page(items, params)
  }
  const objectiveMatch = route.match(/^\/api\/alunos\/([^/]+)\/objetivos-pei$/)
  if (objectiveMatch) {
    studentFor(state, objectiveMatch[1])
    if (method === 'POST') {
      const item: ObjetivoPei = { id: id(), alunoId: objectiveMatch[1], documentoPeiId: null, descricao: body<{ descricao: string }>(init).descricao, ativo: true, dataCadastro: now() }
      state.objectives.unshift(item); save(state); return item
    }
    return state.objectives.filter((item) => item.alunoId === objectiveMatch[1] && item.ativo)
  }
  const studentMatch = route.match(/^\/api\/alunos\/([^/]+)(?:\/(ativar))?$/)
  if (studentMatch) {
    const item = studentFor(state, studentMatch[1])
    if (studentMatch[2] || method === 'DELETE') { item.ativo = method !== 'DELETE'; save(state); return undefined }
    if (method === 'PUT') {
      const draft = body<StudentDraft>(init)
      Object.assign(item, draft)
      item.nomeTurma = required(state.classes.find((value) => value.id === draft.turmaId), 'Turma').nome
      save(state)
    }
    return item
  }

  if (route === '/api/atendimentos') {
    if (method === 'POST') {
      const draft = body<AtendimentoDraft>(init)
      const item: Atendimento = { ...draft, id: id(), nomeAluno: studentFor(state, draft.alunoId).nome, professorId: TEACHER.id, foco: null, dataCadastro: now(), objetivosPei: draft.objetivosPei.map((value) => ({ ...value, descricaoObjetivo: state.objectives.find((goal) => goal.id === value.objetivoPeiId)?.descricao ?? '' })) }
      state.attendances.unshift(item); save(state); return item
    }
    const items = state.attendances.filter((item) => (!params.get('alunoId') || item.alunoId === params.get('alunoId')) && (!params.get('inicio') || item.dataHora >= params.get('inicio')!) && (!params.get('fim') || item.dataHora <= params.get('fim')!)).sort((a, b) => b.dataHora.localeCompare(a.dataHora))
    return page(items, params)
  }
  const attendanceMatch = route.match(/^\/api\/atendimentos\/([^/]+)$/)
  if (attendanceMatch) {
    const item = required(state.attendances.find((value) => value.id === attendanceMatch[1]), 'Atendimento')
    if (method === 'PUT') {
      const draft = body<AtendimentoDraft>(init)
      Object.assign(item, draft, { nomeAluno: studentFor(state, draft.alunoId).nome, objetivosPei: draft.objetivosPei.map((value) => ({ ...value, descricaoObjetivo: state.objectives.find((goal) => goal.id === value.objetivoPeiId)?.descricao ?? '' })) })
      save(state)
    }
    return item
  }

  if (route === '/api/sessoes/alertas/faltas-consecutivas') {
    return state.students.flatMap((student) => {
      const last = state.sessions.filter((item) => item.alunoId === student.id && item.status !== 'CANCELADA').sort((a, b) => b.dataHora.localeCompare(a.dataHora)).slice(0, 3)
      return last.length === 3 && last.every((item) => item.status === 'FALTA') ? [{ alunoId: student.id, nomeAluno: student.nome, quantidade: 3 }] : []
    })
  }
  if (route === '/api/sessoes') {
    if (method === 'POST') {
      const draft = body<ScheduledSessionDraft>(init)
      const student = studentFor(state, draft.alunoId)
      const item: ScheduledSession = { ...draft, id: id(), nomeAluno: student.nome, nomeTurma: student.nomeTurma, nomeEscola: SCHOOL.nome, status: 'AGENDADA', atendimentoId: null }
      state.sessions.push(item); save(state); return item
    }
    return state.sessions.filter((item) => (!params.get('inicio') || item.dataHora.slice(0, 10) >= params.get('inicio')!) && (!params.get('fim') || item.dataHora.slice(0, 10) <= params.get('fim')!)).sort((a, b) => a.dataHora.localeCompare(b.dataHora))
  }
  const sessionMatch = route.match(/^\/api\/sessoes\/([^/]+)(?:\/(status|atendimento)(?:\/([^/]+))?)?$/)
  if (sessionMatch) {
    const item = sessionFor(state, sessionMatch[1])
    if (sessionMatch[2] === 'status') item.status = body<{ status: ScheduledSessionStatus }>(init).status
    else if (sessionMatch[2] === 'atendimento') { item.atendimentoId = sessionMatch[3]; item.status = 'REALIZADA' }
    else if (method === 'PUT') Object.assign(item, body<ScheduledSessionDraft>(init))
    save(state); return item
  }

  if (route === '/api/external-form/generate' && method === 'POST') {
    const draft = body<{ alunoId: string; perguntas: string[] }>(init)
    studentFor(state, draft.alunoId)
    const form: DemoForm = { token: id(), alunoId: draft.alunoId, perguntas: draft.perguntas, respostas: null, dataResposta: null }
    state.forms.push(form); save(state); return { token: form.token }
  }
  if (route === '/api/external-form/responses/recent' || route === '/api/external-form/responses/all') {
    const answered = state.forms.filter((item) => item.respostas).sort((a, b) => (b.dataResposta ?? '').localeCompare(a.dataResposta ?? ''))
    if (route.endsWith('/all')) return answered.map((item) => ({ id: item.token, alunoId: item.alunoId, nomeAluno: studentFor(state, item.alunoId).nome, perguntas: item.perguntas, respostas: item.respostas, dataResposta: item.dataResposta }))
    return answered.slice(0, 5).map((item) => ({ id: item.token, alunoId: item.alunoId, nomeAluno: studentFor(state, item.alunoId).nome, nomeProfessorEscola: 'Professor da escola regular', mensagem: item.respostas?.[0] ?? '', dataEnvio: item.dataResposta }))
  }
  const formMatch = route.match(/^\/api\/external-form\/([^/]+)(?:\/(submit))?$/)
  if (formMatch) {
    const form = required(state.forms.find((item) => item.token === formMatch[1]), 'Formulário')
    if (formMatch[2]) { form.respostas = body<{ respostas: string[] }>(init).respostas; form.dataResposta = now(); save(state); return undefined }
    return { nomeAluno: studentFor(state, form.alunoId).nome, perguntas: form.respostas ? [] : form.perguntas, status: form.respostas ? 'RESPONDIDO' : 'DISPONIVEL' }
  }

  if (route === '/api/documentos') return page(state.documents.filter((item) => !params.get('alunoId') || item.alunoId === params.get('alunoId')).sort((a, b) => b.dataUpload.localeCompare(a.dataUpload)), params)
  if (route === '/api/documentos/upload' && method === 'POST') {
    const form = init.body as FormData
    const file = form.get('arquivo') as File
    if (file.size > 500_000) throw new Error('Na demonstração, use arquivos de até 500 KB.')
    const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file) })
    const item: DemoDocument = { id: id(), alunoId: String(form.get('alunoId')), nomeArquivo: file.name, tipoConteudo: file.type || 'application/octet-stream', tamanhoBytes: file.size, tipoDocumento: String(form.get('tipo')) as Documento['tipoDocumento'], dataUpload: now(), dataUrl }
    state.documents.push(item); save(state); return item
  }
  const documentMatch = route.match(/^\/api\/documentos\/([^/]+)$/)
  if (documentMatch && method === 'DELETE') { state.documents = state.documents.filter((item) => item.id !== documentMatch[1]); save(state); return undefined }
  throw new Error(`Ação indisponível na demonstração: ${method} ${route}`)
}

export async function demoBlob(path: string): Promise<Blob> {
  const state = read()
  const documentMatch = path.match(/^\/api\/documentos\/([^/]+)\/download$/)
  if (documentMatch) {
    const item = required(state.documents.find((value) => value.id === documentMatch[1]), 'Documento')
    const response = await fetch(item.dataUrl ?? '')
    return response.blob()
  }
  if (path.startsWith('/api/relatorios/alunos/')) {
    const student = studentFor(state, path.split('/').pop() ?? '')
    const records = state.attendances.filter((item) => item.alunoId === student.id)
    const lines = [`Relatorio de demonstracao - ${student.nome}`, `Escola: ${SCHOOL.nome}`, `Atendimentos: ${records.length}`, ...records.map((item) => `${item.dataHora.slice(0, 10)} - ${item.atividadeRealizada ?? 'Atendimento'}`)]
    return makeDemoPdf(lines)
  }
  throw new Error('Arquivo não encontrado na demonstração.')
}

function makeDemoPdf(lines: string[]): Blob {
  const escape = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '?').replace(/[\\()]/g, '\\$&')
  const content = ['BT', '/F1 12 Tf', '50 790 Td', ...lines.flatMap((line, index) => index === 0 ? [`(${escape(line)}) Tj`] : ['0 -20 Td', `(${escape(line)}) Tj`]), 'ET'].join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n` })
  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n` })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}
