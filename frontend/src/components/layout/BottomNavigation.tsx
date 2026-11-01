import { CalendarDays, House, Menu, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface BottomNavigationProps {
  onUnavailable: (feature: string) => void
  activePage?: 'dashboard' | 'students'
}

const items: { label: string; icon: typeof House; key: string; route?: string }[] = [
  { label: 'Início', icon: House, key: 'dashboard', route: '/dashboard' },
  { label: 'Alunos', icon: UsersRound, key: 'students', route: '/alunos' },
  { label: 'Agenda', icon: CalendarDays, key: 'agenda' },
  { label: 'Menu', icon: Menu, key: 'menu' },
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
