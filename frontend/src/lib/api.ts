const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

let accessToken: string | null = null
let refreshRequest: Promise<string | null> | null = null

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
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

async function refreshAccessToken() {
  if (!refreshRequest) {
    refreshRequest = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) return null
        const payload = (await response.json()) as { accessToken?: string }
        accessToken = payload.accessToken ?? null
        return accessToken
      })
      .catch(() => null)
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
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

  if (response.status === 401 || response.status === 403) {
    const renewedToken = await refreshAccessToken()
    if (renewedToken) response = await execute(renewedToken)
  }

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status)
  }

  return (await response.json()) as T
}
