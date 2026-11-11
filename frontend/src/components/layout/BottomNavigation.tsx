import { CalendarRange, ClipboardList, House, Link2, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface BottomNavigationProps {
  onUnavailable: (feature: string) => void
  activePage?: 'dashboard' | 'students' | 'attendance' | 'calendar' | 'external-form'
}

const items: { label: string; icon: typeof House; key: string; route?: string }[] = [
  { label: 'Início', icon: House, key: 'dashboard', route: '/dashboard' },
  { label: 'Alunos', icon: UsersRound, key: 'students', route: '/alunos' },
  { label: 'Agenda', icon: CalendarRange, key: 'calendar', route: '/calendario' },
  { label: 'Registro', icon: ClipboardList, key: 'attendance', route: '/registro-atendimento' },
  { label: 'Formulário', icon: Link2, key: 'external-form', route: '/external-form/gerar' },
]

export function BottomNavigation({ onUnavailable, activePage = 'dashboard' }: BottomNavigationProps) {
  const navigate = useNavigate()
  return (
    <nav className="bottom-navigation" aria-label="Navegação mobile">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = item.key === activePage
        return (
          <Button
            variant="ghost"
            size="default"
            className={isActive ? 'selected' : ''}
            type="button"
            key={item.label}
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.route ? item.label : `${item.label} — em breve`}
            onClick={() => item.route ? navigate(item.route) : onUnavailable(item.label)}
          >
            <span className="bottom-nav-icon">
              <Icon aria-hidden="true" />
            </span>
            {item.label}
          </Button>
        )
      })}
    </nav>
  )
}
