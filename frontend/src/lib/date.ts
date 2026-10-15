const fullDateFormatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDashboardDate(date: Date) {
  const formatted = fullDateFormatter.format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatTime(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : timeFormatter.format(date)
}

export function getDayPeriod(time: string): 'morning' | 'afternoon' {
  const hour = Number.parseInt(time.split(':')[0] ?? '0', 10)
  return hour < 12 ? 'morning' : 'afternoon'
}
