import { apiFetch } from '../lib/api'

export async function submeterRespostas(token: string, respostas: string[]) {
  return apiFetch(`/api/external-form/${token}/submit`, {
    method: 'POST',
    body: JSON.stringify({ respostas }),
  })
}

export async function verificarToken(token: string) {
  return apiFetch(`/api/external-form/${token}`, {
    method: 'GET',
  })
}

export async function gerarLink(alunoId: string, perguntas: string[]) {
  return apiFetch('/api/external-form/generate', {
    method: 'POST',
    body: JSON.stringify({ alunoId, perguntas }),
  })
}
