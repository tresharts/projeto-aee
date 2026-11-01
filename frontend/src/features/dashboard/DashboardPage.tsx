import { CalendarDays, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AgendaPanel } from './components/AgendaPanel'
import { AlertsPanel } from './components/AlertsPanel'
import { DashboardState } from './components/DashboardState'
import { MetricCards } from './components/MetricCards'
import { MotivationCard } from './components/MotivationCard'
import { PedagogicalPanel } from './components/PedagogicalPanel'
import { SchoolReturnsPanel } from './components/SchoolReturnsPanel'
import { BottomNavigation } from '@/components/layout/BottomNavigation'
import { Sidebar } from '@/components/layout/Sidebar'
import {
  TopBar,
  type SearchResult,
} from '@/components/layout/TopBar'
import { formatDashboardDate } from '@/lib/date'
import { dashboardDemoData } from './dashboard.mock'
import { searchStudentsByName } from './dashboard.service'
import type { ApiStudent } from './dashboard.types'
import { useDashboardData } from './useDashboardData'

export function DashboardPage() {
  const { status, data, mode, message, retry } = useDashboardData()
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [notice, setNotice] = useState('')
  const formattedDate = useMemo(() => formatDashboardDate(new Date()), [])

  useEffect(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
    if (normalizedQuery.length < 2) {
      setSearchResults([])
      setSearching(false)
      return
    }

    if (mode === 'demo') {
      const results = dashboardDemoData.appointments
        .filter((appointment) =>
          `${appointment.studentName} ${appointment.schoolName}`
            .toLocaleLowerCase('pt-BR')
            .includes(normalizedQuery),
        )
        .map((appointment) => ({
          id: appointment.id,
          name: appointment.studentName,
          detail: appointment.schoolName,
        }))
      setSearchResults(results)
      return
    }

    let active = true
    setSearching(true)
    const timer = window.setTimeout(() => {
      void searchStudentsByName(query.trim())
        .then((page) => {
          if (!active) return
          setSearchResults(
            page.content.map((student: ApiStudent) => ({
              id: student.id,
              name: student.nome,
              detail: `${student.nomeEscola} • ${student.nomeTurma}`,
            })),
          )
        })
        .catch(() => {
          if (active) setSearchResults([])
        })
        .finally(() => {
          if (active) setSearching(false)
        })
    }, 280)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [mode, query])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 3600)
    return () => window.clearTimeout(timer)
  }, [notice])

  const showUnavailable = (feature: string) => {
    setNotice(`${feature} estará disponível em breve.`)
  }

  return (
    <div className="app-shell">
      <Sidebar onUnavailable={showUnavailable} activePage="dashboard" />
      <div className="workspace">
        <TopBar
          query={query}
          results={searchResults}
          searching={searching}
          onQueryChange={setQuery}
          onUnavailable={showUnavailable}
        />
        <main className="dashboard-surface">
          {status !== 'ready' || !data ? (
            <DashboardState
              status={status === 'ready' ? 'error' : status}
              message={message}
              onRetry={() => void retry()}
            />
          ) : (
            <>
              <div className="welcome-row">
                <div className="welcome-copy">
                  <h1 className="app-gradient-title">Olá, Professora {data.teacherName}!</h1>
                  <p>É um prazer ter você aqui no AEE Conecta</p>
                </div>
                <div className="welcome-actions">
                  <p className="current-date">
                    <CalendarDays aria-hidden="true" />
                    <time dateTime={new Date().toISOString().slice(0, 10)}>
                      {formattedDate}
                    </time>
                  </p>
                  <Button
                    variant="ghost"
                    className="register-button"
                    type="button"
                    onClick={() => showUnavailable('O registro de atendimento avulso')}
                  >
                    <Plus aria-hidden="true" />
                    registrar atendimento avulso
                  </Button>
                </div>
              </div>

              <div className="dashboard-grid">
                <div className="widgets-column">
                  <MetricCards metrics={data.metrics} />
                  <div className="widgets-top">
                    <AlertsPanel alerts={data.alerts} state={data.alertsState} />
                    <SchoolReturnsPanel
                      returns={data.schoolReturns}
                      state={data.schoolReturnsState}
                      onUnavailable={showUnavailable}
                    />
                  </div>
                  <div className="widgets-bottom">
                    <MotivationCard />
                  </div>
                </div>
                <div className="agenda-column">
                  <AgendaPanel
                    appointments={data.appointments}
                    state={data.agendaState}
                    onUnavailable={showUnavailable}
                  />
                  <PedagogicalPanel
                    indicator={data.indicator}
                    state={data.indicatorState}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <BottomNavigation onUnavailable={showUnavailable} activePage="dashboard" />
      {notice && (
        <div className="availability-toast" role="status">
          {notice}
        </div>
      )}
    </div>
  )
}
