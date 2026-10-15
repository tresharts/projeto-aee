import { MotivationBloom } from '../illustrations/DecorativeBlooms'

export function MotivationCard() {
  return (
    <aside className="motivation-card" aria-label="Mensagem de motivação">
      <h2>
        Cada conquista
        <br />
        também é nossa
      </h2>
      <p>Juntos por uma educação mais inclusiva e acessível</p>
      <MotivationBloom />
    </aside>
  )
}
