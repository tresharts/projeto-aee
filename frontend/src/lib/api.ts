const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export type SessionUser = { name: string; email: string; role: 'ADMIN' | 'PROFESSOR' }
export type SessionPayload = { accessToken: string; name: string; email: string; role: SessionUser['role'] }

let accessToken: string | null = null
let refreshRequest: Promise<SessionPayload | null> | null = null

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

export function setApiAccessToken(token: string | null) {
  accessToken = token
}

async function parseError(response: Response) {
  try {
    const body = (await response.json()) as { mensagem?: string; message?: string }
    return body.mensagem ?? body.message ?? `Erro HTTP ${response.status}`
  } catch {
    return `Erro HTTP ${response.status}`
  }
}

export async function refreshSession() {
  if (!refreshRequest) {
    refreshRequest = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) return null
        const payload = (await response.json()) as SessionPayload
        if (!payload.accessToken || !payload.email || !payload.role) return null
        accessToken = payload.accessToken
        return payload
      })
      .catch(() => null)
      .finally(() => {
        refreshRequest = null
      })
  }
  return refreshRequest
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const execute = (token: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...init.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

  let response = await execute(accessToken)
  if (response.status === 401) {
    const renewed = await refreshSession()
    if (renewed) response = await execute(renewed.accessToken)
    else window.dispatchEvent(new Event('aee:session-expired'))
  }

  if (!response.ok) throw new ApiError(await parseError(response), response.status)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
