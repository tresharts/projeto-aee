import { describe, expect, it } from 'vitest'
import { mapApiPayloadToDashboard } from './dashboard.mappers'
import type { DashboardApiPayload } from './dashboard.types'

const pageDefaults = {
  totalPages: 1,
  number: 0,
  size: 6,
  first: true,
  last: true,
  empty: false,
}

describe('mapApiPayloadToDashboard', () => {
  it('usa os totais reais e não transforma atendimentos passados em agenda', () => {
    const payload = {
      students: { ...pageDefaults, content: [], totalElements: 31 },
      attendances: { ...pageDefaults, content: [], totalElements: 78 },
    } satisfies DashboardApiPayload

    const dashboard = mapApiPayloadToDashboard(payload)

    expect(dashboard.metrics[0].value).toBe('78')
    expect(dashboard.metrics[1].value).toBe('31')
    expect(dashboard.appointments).toEqual([])
    expect(dashboard.agendaState).toBe('pending')
    expect(dashboard.indicator.available).toBe(false)
  })
})
