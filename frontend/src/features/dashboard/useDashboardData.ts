import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../../lib/api'
import { mapApiPayloadToDashboard } from './dashboard.mappers'
import { dashboardDemoData } from './dashboard.mock'
import { getDashboardApiPayload } from './dashboard.service'
import type { DashboardData, DashboardDataMode } from './dashboard.types'

interface DashboardLoadState {
  status: 'loading' | 'ready' | 'error' | 'unauthorized'
  data: DashboardData | null
  message?: string
}

const configuredMode: DashboardDataMode =
  import.meta.env.VITE_DASHBOARD_DATA_MODE === 'api' ? 'api' : 'demo'

export function useDashboardData() {
  const [state, setState] = useState<DashboardLoadState>(() =>
    configuredMode === 'demo'
      ? { status: 'ready', data: dashboardDemoData }
      : { status: 'loading', data: null },
  )

  const load = useCallback(async () => {
    if (configuredMode === 'demo') {
      setState({ status: 'ready', data: dashboardDemoData })
      return
    }

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
    if (configuredMode === 'api') void load()
  }, [load])

  return { ...state, mode: configuredMode, retry: load }
}
