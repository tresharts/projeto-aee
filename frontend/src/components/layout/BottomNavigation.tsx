import { CalendarDays, House, Menu, UsersRound } from 'lucide-react'
import { Button } from '../ui/button'

interface BottomNavigationProps {
  onUnavailable: (feature: string) => void
}

const items = [
  { label: 'Início', icon: House, active: true },
  { label: 'Alunos', icon: UsersRound },
  { label: 'Agenda', icon: CalendarDays },
  { label: 'Menu', icon: Menu },
]

export function BottomNavigation({ onUnavailable }: BottomNavigationProps) {
  return (
    <nav className="bottom-navigation" aria-label="Navegação mobile">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <Button
            variant="ghost"
            size="default"
            className={item.active ? 'selected' : ''}
            type="button"
            key={item.label}
            aria-current={item.active ? 'page' : undefined}
            aria-label={item.active ? item.label : `${item.label} — em breve`}
            onClick={() => !item.active && onUnavailable(item.label)}
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
