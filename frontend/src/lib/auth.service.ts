import { ApiError, setApiAccessToken, type SessionPayload } from './api'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  if (!response.ok) {
    let message = 'Não foi possível concluir a solicitação.'
    try {
      const error = (await response.json()) as { mensagem?: string }
      message = error.mensagem ?? message
    } catch { /* use the generic message */ }
    throw new ApiError(message, response.status)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export async function login(email: string, password: string) {
  const session = await request<SessionPayload>('/auth/login', { email, password })
  if (!session.accessToken) throw new ApiError('Resposta de autenticação inválida.', 500)
  setApiAccessToken(session.accessToken)
  return { name: session.name, email: session.email, role: session.role }
}

export async function register(name: string, email: string, codigoEscola: string, password: string) {
  return request<{ message: string }>('/auth/register', { name, email, codigoEscola, password })
}

export async function logout() {
  try {
    await request<void>('/auth/logout')
  } finally {
    setApiAccessToken(null)
  }
}
