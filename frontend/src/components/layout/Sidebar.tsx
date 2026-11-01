import {
  CalendarDays,
  ClipboardList,
  Link2,
  Settings,
  House,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { SidebarBloom } from '@/components/illustrations/DecorativeBlooms'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  onUnavailable: (feature: string) => void
  activePage?: 'dashboard' | 'students'
}

const navigation = [
  { key: 'dashboard', label: 'Dashboard', icon: House, route: '/dashboard' },
  { key: 'students', label: 'Meus Alunos', icon: UsersRound, route: '/alunos' },
  { key: 'timeline', label: 'Linha do tempo', icon: ClipboardList },
  { key: 'attendance', label: 'Registro de Atendimento', icon: CalendarDays, multiline: true },
  { key: 'external-form', label: 'Link mágico', icon: Link2 },
  { key: 'settings', label: 'Configurações', icon: Settings },
]

export function Sidebar({ onUnavailable, activePage = 'dashboard' }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Navegação principal">
      <img
        className="sidebar-logo"
        src="/aee-conecta-logo.png"
        alt="AEE Conecta — Inclusão que conecta"
      />
      <nav className="sidebar-nav">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = item.key === activePage
          const className = `justify-start ${isActive ? 'active' : ''} ${item.multiline ? 'multiline' : ''}`
          const contents = <>
            <span className="sidebar-icon"><Icon aria-hidden="true" /></span>
            <span className="sidebar-label">{item.label}</span>
            {!item.route && <span className="sr-only">Em breve</span>}
          </>
          return (
            item.route ? (
              <Button asChild variant="ghost" size="default" className={className} key={item.key}>
                <Link
                  to={item.route}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                  title={item.label}
                >
                  {contents}
                </Link>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="default"
                className={className}
                key={item.key}
                type="button"
                aria-label={`${item.label} — em breve`}
                title={`${item.label} — em breve`}
                onClick={() => onUnavailable(item.label)}
              >
                {contents}
              </Button>
            )
          )
        })}
      </nav>
      <div className="sidebar-art" aria-hidden="true">
        <SidebarBloom />
      </div>
    </aside>
  )
}
