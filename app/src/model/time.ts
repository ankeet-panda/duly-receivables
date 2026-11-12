// Dates are plain yyyy-mm-dd strings in local time. `?today=2026-11-06` pins "today"
// for screenshots and the demo; in that mode nothing is saved.

const pad = (n: number) => String(n).padStart(2, '0')

export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function parse(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const pinned = (() => {
  const v = new URLSearchParams(location.search).get('today')
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null
})()

export const isPinned = pinned !== null

export function today(): string {
  return pinned ?? iso(new Date())
}

export function addDays(s: string, n: number): string {
  const d = parse(s)
  d.setDate(d.getDate() + n)
  return iso(d)
}

export function daysBetween(from: string, to: string): number {
  return Math.round((parse(to).getTime() - parse(from).getTime()) / 86_400_000)
}

const dayMonth = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' })
const full = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
const long = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

export const fmtDay = (s: string) => dayMonth.format(parse(s))
export const fmtFull = (s: string) => full.format(parse(s))
export const fmtLong = (s: string) => long.format(parse(s))

/** "today", "yesterday", "3 days ago", "in 5 days" */
export function relative(s: string, from = today()): string {
  const n = daysBetween(from, s)
  if (n === 0) return 'today'
  if (n === -1) return 'yesterday'
  if (n === 1) return 'tomorrow'
  return n < 0 ? `${-n} days ago` : `in ${n} days`
}

export const plural = (n: number, one: string, many = one + 's') => `${n} ${n === 1 ? one : many}`
