import { Bell, LogOut, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { AvatarBadge } from '@/components/people/AvatarBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface SearchResult {
  id: string
  name: string
  detail: string
}

interface TopBarProps {
  query: string
  results: SearchResult[]
  searching: boolean
  onQueryChange: (query: string) => void
  onUnavailable: (feature: string) => void
  onResultSelect?: (result: SearchResult) => void
}

export function TopBar({
  query,
  results,
  searching,
  onQueryChange,
  onUnavailable,
  onResultSelect,
}: TopBarProps) {
  const showResults = query.trim().length >= 2
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <div className="mobile-brand">
        <img src="/aee-conecta-logo.png" alt="AEE Conecta" />
      </div>
      <div className="dashboard-search">
        <Search aria-hidden="true" />
        <label className="sr-only" htmlFor="dashboard-search-input">
          Buscar aluno, RA, escola ou qualquer informação
        </label>
        <Input
          id="dashboard-search-input"
          type="search"
          className="dashboard-search-input"
          value={query}
          placeholder="Buscar aluno, RA, escola ou qualquer informação"
          autoComplete="off"
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {showResults && (
          <div className="search-results" role="listbox" aria-label="Resultados da busca">
            {searching ? (
              <p>Buscando…</p>
            ) : results.length > 0 ? (
              results.map((result) => (
                <Button
                  variant="ghost"
                  className="search-result-option"
                  type="button"
                  role="option"
                  aria-selected="false"
                  key={result.id}
                  onClick={() => onResultSelect ? onResultSelect(result) : onUnavailable('O perfil do aluno')}
                >
                  <strong>{result.name}</strong>
                  <span>{result.detail}</span>
                </Button>
              ))
            ) : (
              <p>Nenhum aluno encontrado.</p>
            )}
          </div>
        )}
      </div>
      <div className="topbar-actions">
        <Button
          variant="ghost"
          size="icon"
          className="notification-button"
          type="button"
          aria-label="Notificações — em breve"
          onClick={() => onUnavailable('As notificações')}
        >
          <Bell aria-hidden="true" />
          <span />
        </Button>
        <Button
          variant="ghost"
          size="default"
          className="profile-button"
          type="button"
          aria-label="Sair da conta"
          onClick={() => void handleSignOut()}
        >
          <AvatarBadge name={user?.name ?? 'Professora'} tone="yellow" size="lg" />
          <span className="profile-copy">
            <strong>{user?.name ?? 'Professora'}</strong>
            <small>Sair da conta</small>
          </span>
          <LogOut className="profile-chevron" aria-hidden="true" />
        </Button>
      </div>
    </header>
  )
}
