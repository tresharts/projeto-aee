import { useState } from 'react'
import { CalendarDays, Clock3 } from 'lucide-react'

function displayValue(value: string, type: 'date' | 'time') {
  return type === 'date' && value ? value.split('-').reverse().join('/') : value
}

function parseDateTimeInput(text: string, type: 'date' | 'time') {
  if (type === 'time') return /^([01]\d|2[0-3]):[0-5]\d$/.test(text) ? text : ''
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text)
  if (!match) return ''
  const [, day, month, year] = match
  const iso = `${year}-${month}-${day}`
  const date = new Date(`${iso}T12:00:00`)
  return Number(year) > 0 && !Number.isNaN(date.getTime()) && date.getDate() === Number(day) && date.getMonth() + 1 === Number(month) ? iso : ''
}

export function AttendanceDateTimeField({ type, value, onChange }: {
  type: 'date' | 'time'
  value: string
  onChange: (value: string) => void
}) {
  const [draft, setDraft] = useState({ source: value, text: displayValue(value, type) })
  const text = draft.source === value ? draft.text : displayValue(value, type)
  const title = type === 'date' ? 'Data da aula' : 'Horário'
  const Icon = type === 'date' ? CalendarDays : Clock3
  return <label>{title}<span>
    <input
      type="text"
      inputMode="numeric"
      required
      aria-label={`${title} (${type === 'date' ? 'DD/MM/AAAA' : 'HH:mm'})`}
      aria-invalid={Boolean(text && !parseDateTimeInput(text, type))}
      placeholder={type === 'date' ? 'DD/MM/AAAA' : 'HH:mm'}
      maxLength={type === 'date' ? 10 : 5}
      value={text}
      onChange={(event) => {
        const digits = event.target.value.replace(/\D/g, '').slice(0, type === 'date' ? 8 : 4)
        const formatted = type === 'date'
          ? digits.replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2')
          : digits.replace(/^(\d{2})(\d)/, '$1:$2')
        const next = parseDateTimeInput(formatted, type)
        setDraft({ source: next, text: formatted })
        onChange(next)
      }}
    />
    <span className="attendance-native-picker">
      <Icon aria-hidden="true" />
      <input type={type} aria-label={`Selecionar ${title.toLowerCase()}`} title={`Selecionar ${title.toLowerCase()}`} value={value} onChange={(event) => {
        const next = event.target.value
        setDraft({ source: next, text: displayValue(next, type) })
        onChange(next)
      }} />
    </span>
  </span></label>
}
