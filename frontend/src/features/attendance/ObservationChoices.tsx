import type { ObservationSelection } from './attendance.observations'

export function ObservationChoices({ title, options, value, onChange }: {
  title: string
  options: readonly string[]
  value: ObservationSelection
  onChange: (value: ObservationSelection) => void
}) {
  return <fieldset className="attendance-observation-choices">
    <legend>{title} <small>(opcional)</small></legend>
    <div className="attendance-observation-options">
      {options.map((option) => <label key={option}>
        <input type="checkbox" checked={value.selected.includes(option)} onChange={(event) => onChange({ ...value, selected: event.target.checked ? options.filter((item) => item === option || value.selected.includes(item)) : value.selected.filter((item) => item !== option) })} />
        <span>{option}</span>
      </label>)}
      <label><input type="checkbox" checked={value.other} onChange={(event) => onChange({ ...value, other: event.target.checked })} /><span>Outro</span></label>
    </div>
    {value.other && <label className="attendance-text-field">Descreva a opção “Outro”
      <textarea required value={value.text} onChange={(event) => onChange({ ...value, text: event.target.value })} placeholder="Escreva os detalhes" />
    </label>}
  </fieldset>
}
