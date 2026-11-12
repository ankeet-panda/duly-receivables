import type { Tone } from './types'
import type { View } from './derive'
import { addDays, fmtDay, parse, plural, today as todayFn } from './time'
import { money } from './money'

/** Next weekday on or after the date (deadlines never land on a weekend). */
function weekday(s: string): string {
  let d = s
  while ([0, 6].includes(parse(d).getDay())) d = addDays(d, 1)
  return d
}

export const toneInfo: Record<Tone, { label: string; hint: string }> = {
  friendly: { label: 'Friendly', hint: 'Assumes it slipped through' },
  firm: { label: 'Firm', hint: 'Asks for a payment date' },
  final: { label: 'Final', hint: 'Sets a deadline and a consequence' },
}

export function draft(v: View, tone: Tone, owner: string, now = todayFn()): { subject: string; body: string } {
  const { inv, client } = v
  // A company with no named contact gets a polite general greeting, never "Hi Tidewater,"
  const first = client.contact && client.contact !== client.name ? client.contact.split(' ')[0] : 'there'
  const amount = money(inv.amount)
  const due = fmtDay(inv.due)
  const me = owner.split(' ')[0]
  const last = inv.reminders[inv.reminders.length - 1]
  const late = v.status === 'late'

  if (tone === 'friendly') {
    if (!late) {
      return {
        subject: `Invoice ${inv.number} due ${due}`,
        body: `Hi ${first},\n\nA quick heads-up that invoice ${inv.number} for ${inv.project} (${amount}) is due on ${due}. If you need anything from me to process it, a PO number or a different format, just say.\n\nThanks,\n${me}`,
      }
    }
    return {
      subject: `Invoice ${inv.number} for ${inv.project}`,
      body: `Hi ${first},\n\nHope the week's going well. A quick note that invoice ${inv.number} for ${inv.project} (${amount}) was due on ${due}. It may simply have slipped through, and I'm happy to resend it.\n\nCould you let me know when it's scheduled for payment?\n\nThanks,\n${me}`,
    }
  }

  if (tone === 'firm') {
    const by = fmtDay(weekday(addDays(now, 3)))
    const lateBit = late ? `It was due on ${due} and is now ${plural(v.daysLate, 'day')} overdue` : `It's due on ${due}`
    const earlier = last ? `, and I last wrote about it on ${fmtDay(last.on)}` : ''
    return {
      subject: late ? `Overdue: invoice ${inv.number} (${amount})` : `Invoice ${inv.number} (${amount}) due ${due}`,
      body: `Hi ${first},\n\nFollowing up on invoice ${inv.number} for ${inv.project} (${amount}). ${lateBit}${earlier}.\n\nPlease could you confirm a payment date by ${by}? If something is holding it up, tell me and I'll sort it today.\n\nThanks,\n${me}`,
    }
  }

  const by = fmtDay(weekday(addDays(now, 7)))
  const sent = inv.reminders.length
  const heard = sent > 1 ? `my last ${sent} reminders haven't had a reply` : last ? `my reminder on ${fmtDay(last.on)} hasn't had a reply` : "it is still unpaid"
  return {
    subject: late ? `Final reminder: invoice ${inv.number}, ${plural(v.daysLate, 'day')} overdue` : `Invoice ${inv.number}: payment needed by ${by}`,
    body: `Hi ${first},\n\nInvoice ${inv.number} for ${inv.project} (${amount}) ${late ? `is now ${plural(v.daysLate, 'day')} past its due date of ${due}` : `is due on ${due}`}, and ${heard}.\n\nI need payment by ${by}. If it hasn't arrived by then, I'll pause further work on the account until it's settled.\n\nI'd much rather resolve this quickly, so please reply or call if there's a problem I can help with.\n\nRegards,\n${me}`,
  }
}

export function mailto(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
