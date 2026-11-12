import type { Client, Data, Invoice, Tone } from './types'
import { addDays, daysBetween, fmtDay, plural, today as todayFn } from './time'

export type Status = 'late' | 'soon' | 'upcoming' | 'paid'

export type Habit = { days: number; samples: number } | null

/** How many days after the due date this client usually pays (median of paid invoices). */
export function habitOf(data: Data, clientId: string): Habit {
  const lates = data.invoices
    .filter((i) => i.clientId === clientId && i.paidOn)
    .map((i) => daysBetween(i.due, i.paidOn!))
    .sort((a, b) => a - b)
  if (lates.length === 0) return null
  const mid = Math.floor(lates.length / 2)
  const median = lates.length % 2 ? lates[mid] : Math.round((lates[mid - 1] + lates[mid]) / 2)
  return { days: median, samples: lates.length }
}

export type View = {
  inv: Invoice
  client: Client
  status: Status
  /** Positive when past due */
  daysLate: number
  habit: Habit
  /** Days past this client's usual lateness (only meaningful when late) */
  beyondUsual: number
  /** Most likely day the money lands; null when it is already later than the client ever pays */
  expected: string | null
  tone: Tone
  pattern: string
}

export function viewOf(data: Data, inv: Invoice, now = todayFn()): View {
  const client = data.clients.find((c) => c.id === inv.clientId)!
  const habit = habitOf(data, inv.clientId)
  const daysLate = daysBetween(inv.due, now)
  const usual = habit?.days ?? 0
  let status: Status
  if (inv.paidOn) status = 'paid'
  else if (daysLate > 0) status = 'late'
  else if (daysLate >= -7) status = 'soon'
  else status = 'upcoming'

  const beyondUsual = status === 'late' ? daysLate - Math.max(usual, 0) : 0
  let expected: string | null = null
  if (status !== 'paid') {
    const guess = addDays(inv.due, usual)
    expected = daysBetween(now, guess) >= 0 ? guess : null
  }

  const r = inv.reminders.length
  let tone: Tone = 'friendly'
  if (status === 'late') {
    if (daysLate >= 30 || r >= 2) tone = 'final'
    else if (daysLate >= 14 || r >= 1) tone = 'firm'
    // Never step back below the last tone actually sent
    const order: Tone[] = ['friendly', 'firm', 'final']
    const lastSent = inv.reminders[r - 1]?.tone
    if (lastSent && order.indexOf(lastSent) > order.indexOf(tone)) tone = lastSent
  }

  return { inv, client, status, daysLate, habit, beyondUsual, expected, tone, pattern: patternLine(status, daysLate, habit, expected) }
}

function habitWords(h: NonNullable<Habit>): string {
  if (h.days === 0) return 'pays on the due date'
  if (h.days < 0) return `pays ${plural(-h.days, 'day')} early`
  return `pays ${plural(h.days, 'day')} late`
}

function patternLine(status: Status, daysLate: number, habit: Habit, expected: string | null): string {
  if (status === 'paid') return ''
  if (!habit) return status === 'late' ? 'First late payment from this client. No history to compare yet.' : 'New client. No payment history yet.'
  const from = `from ${plural(habit.samples, 'paid invoice')}`
  const usual = `Usually ${habitWords(habit)} (${from})`
  if (status === 'late') {
    const beyond = daysLate - Math.max(habit.days, 0)
    if (beyond > 0) return `${plural(beyond, 'day')} later than usual. ${usual}.`
    return `About usual for this client. ${usual}.`
  }
  return expected ? `${usual}, so expect it around ${fmtDay(expected)}.` : `${usual}.`
}

export function views(data: Data, now = todayFn()): View[] {
  return data.invoices.map((i) => viewOf(data, i, now))
}

export type Summary = {
  owed: number
  owedCount: number
  late: number
  lateCount: number
  expected30: number
  /** Part of expected30 from clients with no paying habit yet (placed on their due date) */
  expected30New: number
  paid30: number
  paid30Count: number
  firstToChase: View | null
}

export function summarise(vs: View[], now = todayFn()): Summary {
  const open = vs.filter((v) => v.status !== 'paid')
  const late = open.filter((v) => v.status === 'late')
  // Only money a client's own habit says will land in the window; late money past its habit is not counted as likely
  const in30 = open.filter((v) => v.expected && daysBetween(now, v.expected) <= 30)
  const paid30 = vs.filter((v) => v.status === 'paid' && daysBetween(v.inv.paidOn!, now) <= 30)
  const firstToChase = chaseOrder(late)[0] ?? null
  const sum = (xs: View[]) => xs.reduce((s, v) => s + v.inv.amount, 0)
  return {
    owed: sum(open),
    owedCount: open.length,
    late: sum(late),
    lateCount: late.length,
    expected30: sum(in30.filter((v) => v.habit)),
    expected30New: sum(in30.filter((v) => !v.habit)),
    paid30: sum(paid30),
    paid30Count: paid30.length,
    firstToChase,
  }
}

/** The one chase order used everywhere: the most money waiting the longest first (amount x days late). */
export function chaseOrder(late: View[]): View[] {
  return [...late].sort((a, b) => b.inv.amount * b.daysLate - a.inv.amount * a.daysLate || b.daysLate - a.daysLate)
}

export function statusWords(v: View): string {
  switch (v.status) {
    case 'late':
      return `${plural(v.daysLate, 'day')} late`
    case 'soon':
      return v.daysLate === 0 ? 'Due today' : `Due in ${plural(-v.daysLate, 'day')}`
    case 'upcoming':
      return `Due ${fmtDay(v.inv.due)}`
    case 'paid':
      return `Paid ${fmtDay(v.inv.paidOn!)}`
  }
}
