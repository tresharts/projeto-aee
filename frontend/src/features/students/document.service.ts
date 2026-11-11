import { apiFetch, apiFetchBlob } from '@/lib/api'

export type TipoDocumento = 'LAUDO' | 'PEI' | 'OUTRO'
export interface Documento {
  id: string
  alunoId: string
  nomeArquivo: string
  tipoConteudo: string
  tamanhoBytes: number
  tipoDocumento: TipoDocumento
  dataUpload: string
}
interface DocumentoPage { content: Documento[] }

export async function getStudentDocuments(studentId: string) {
  const params = new URLSearchParams({ alunoId: studentId, page: '0', size: '100', sort: 'dataUpload,desc' })
  return (await apiFetch<DocumentoPage>('/api/documentos?' + params)).content
}

export function uploadStudentDocument(studentId: string, file: File, type: TipoDocumento) {
  const form = new FormData()
  form.set('arquivo', file)
  form.set('alunoId', studentId)
  form.set('tipo', type)
  return apiFetch<Documento>('/api/documentos/upload', { method: 'POST', body: form })
}

export function downloadStudentDocument(id: string) {
  return apiFetchBlob('/api/documentos/' + encodeURIComponent(id) + '/download')
}

export function deleteStudentDocument(id: string) {
  return apiFetch<void>('/api/documentos/' + encodeURIComponent(id), { method: 'DELETE' })
}
