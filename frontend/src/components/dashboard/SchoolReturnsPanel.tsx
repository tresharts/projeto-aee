import { Clock3, MessageSquareText } from 'lucide-react'
import type {
  IntegrationState,
  SchoolReturn,
} from '../../features/dashboard/dashboard.types'
import { AvatarBadge } from './AvatarBadge'
import { IntegrationPlaceholder } from './IntegrationPlaceholder'

interface SchoolReturnsPanelProps {
  returns: SchoolReturn[]
  state: IntegrationState
  onUnavailable: (feature: string) => void
}

export function SchoolReturnsPanel({
  returns,
  state,
  onUnavailable,
}: SchoolReturnsPanelProps) {
  return (
    <section className="school-returns-panel" aria-labelledby="returns-heading">
      <div className="school-heading-row">
        <h2 id="returns-heading">
          <span>
            <MessageSquareText aria-hidden="true" />
          </span>
          Retornos da Escola regular
        </h2>
        <button type="button" onClick={() => onUnavailable('Os retornos completos')}>
          ver todos <span aria-hidden="true">›</span>
        </button>
      </div>
      {state === 'pending' ? (
        <IntegrationPlaceholder compact />
      ) : returns.length === 0 ? (
        <div className="integration-placeholder compact">
          <Clock3 aria-hidden="true" />
          <strong>Sem retornos de escolas</strong>
          <span>Não há retornos para exibir no momento.</span>
        </div>
      ) : (
        <div className="school-return-list">
          {returns.map((item) => (
            <article className="school-return-row" key={item.id}>
              <AvatarBadge
                name={item.teacherName}
                tone={item.avatarTone}
                size="sm"
              />
              <div>
                <p className="return-author">
                  <strong>{item.teacherName}</strong>
                  {item.schoolName && <small>{item.schoolName}</small>}
                </p>
                <p className="return-message">{item.message}</p>
                <span className="return-hashtag">{item.hashtag}</span>
              </div>
              <span className="online-dot" aria-label="Novo retorno" />
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
