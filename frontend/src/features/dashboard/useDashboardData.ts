import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '@/lib/api'
import { mapApiPayloadToDashboard } from './dashboard.mappers'
import { getDashboardApiPayload } from './dashboard.service'
import type { DashboardData } from './dashboard.types'

interface DashboardLoadState {
  status: 'loading' | 'ready' | 'error' | 'unauthorized'
  data: DashboardData | null
  message?: string
}

export function useDashboardData() {
  const [state, setState] = useState<DashboardLoadState>({ status: 'loading', data: null })

  const load = useCallback(async () => {
    setState({ status: 'loading', data: null })
    try {
      const payload = await getDashboardApiPayload()
      setState({ status: 'ready', data: mapApiPayloadToDashboard(payload) })
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        setState({
          status: 'unauthorized',
          data: null,
          message: 'Sua sessão não está autenticada ou expirou.',
        })
        return
      }

      setState({
        status: 'error',
        data: null,
        message:
          error instanceof Error
            ? error.message
            : 'Não foi possível acessar o backend.',
      })
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { ...state, mode: 'api' as const, retry: load }
}
