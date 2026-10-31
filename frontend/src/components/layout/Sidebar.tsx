import {
  CalendarDays,
  ClipboardList,
  Link2,
  Settings,
  UsersRound,
} from 'lucide-react'
import type { SVGProps } from 'react'
import { SidebarBloom } from '@/components/illustrations/DecorativeBlooms'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  onUnavailable: (feature: string) => void
}

const navigation = [
  { label: 'Dashboard', icon: HomeIcon, active: true },
  { label: 'Meus Alunos', icon: UsersRound },
  { label: 'Linha do tempo', icon: ClipboardList },
  { label: 'Registro de Atendimento', icon: CalendarDays, multiline: true },
  { label: 'Link mágico', icon: Link2 },
  { label: 'Configurações', icon: Settings },
]

export function Sidebar({ onUnavailable }: SidebarProps) {
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
          return (
            <Button
              variant="ghost"
              size="default"
              className={`justify-start ${item.active ? 'active' : ''} ${item.multiline ? 'multiline' : ''}`}
              key={item.label}
              type="button"
              aria-current={item.active ? 'page' : undefined}
              aria-label={item.active ? item.label : `${item.label} — em breve`}
              title={item.active ? item.label : `${item.label} — em breve`}
              onClick={() => !item.active && onUnavailable(item.label)}
            >
              <span className="sidebar-icon">
                <Icon aria-hidden="true" />
              </span>
              <span className="sidebar-label">{item.label}</span>
              {!item.active && <span className="sr-only">Em breve</span>}
            </Button>
          )
        })}
      </nav>
      <div className="sidebar-art" aria-hidden="true">
        <SidebarBloom />
      </div>
    </aside>
  )
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 2.8 2.5 10.9h2.8v10.3h5.1v-6.6h3.2v6.6h5.1V10.9h2.8L12 2.8Z" />
    </svg>
  )
}
