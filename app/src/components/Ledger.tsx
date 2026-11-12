import type { View } from '../model/derive'
import { chaseOrder, statusWords } from '../model/derive'
import { daysBetween, fmtDay, relative } from '../model/time'
import { money } from '../model/money'
import { toneInfo } from '../model/messages'
import { ClientDot, StatusChip } from './bits'

type Props = { views: View[]; now: string; selectedId: string | null; onSelect(id: string): void }

function lastTouch(v: View, now: string): string {
  if (v.status === 'paid') {
    const late = daysBetween(v.inv.due, v.inv.paidOn!)
    return late > 0 ? `${late} days after due` : late === 0 ? 'On the due date' : `${-late} days early`
  }
  const r = v.inv.reminders[v.inv.reminders.length - 1]
  if (r) return `${toneInfo[r.tone].label} reminder ${relative(r.on, now)}`
  return v.status === 'late' ? 'Not reminded yet' : `Sent ${fmtDay(v.inv.issued)}`
}

export function Ledger({ views, now, selectedId, onSelect }: Props) {
  const late = chaseOrder(views.filter((v) => v.status === 'late'))
  const soon = views.filter((v) => v.status === 'soon').sort((a, b) => a.inv.due.localeCompare(b.inv.due))
  const upcoming = views.filter((v) => v.status === 'upcoming').sort((a, b) => a.inv.due.localeCompare(b.inv.due))
  const paid = views
    .filter((v) => v.status === 'paid' && daysBetween(v.inv.paidOn!, now) <= 30)
    .sort((a, b) => b.inv.paidOn!.localeCompare(a.inv.paidOn!))

  const groups = [
    { key: 'late', title: 'Late, most money waiting longest first', items: late, empty: 'Nothing is late.' },
    { key: 'soon', title: 'Due in the next 7 days', items: soon },
    { key: 'upcoming', title: 'Not due yet', items: upcoming },
    { key: 'paid', title: 'Paid in the last 30 days', items: paid },
  ]

  return (
    <section className="ledger" aria-labelledby="ledger-title">
      <div className="ledger__head">
        <h2 id="ledger-title">Invoices</h2>
        <p className="ledger__count">{views.filter((v) => v.status !== 'paid').length} open</p>
      </div>
      {groups.map((g) =>
        g.items.length === 0 && !g.empty ? null : (
          <div key={g.key} className={`ledger__group ledger__group--${g.key}`}>
            <h3 className="ledger__group-title">
              <span>{g.title}</span>
              {g.items.length > 0 && (
                <span className="num">
                  {g.items.length} · {money(g.items.reduce((s, v) => s + v.inv.amount, 0))}
                </span>
              )}
            </h3>
            {g.items.length === 0 ? (
              <p className="ledger__empty">{g.empty}</p>
            ) : (
              <ul>
                {g.items.map((v) => (
                  <li key={v.inv.id}>
                    <button
                      type="button"
                      className="row"
                      aria-pressed={selectedId === v.inv.id}
                      onClick={() => onSelect(v.inv.id)}
                      data-invoice={v.inv.number}
                    >
                      <ClientDot client={v.client} />
                      <span className="row__who">
                        <span className="row__client">{v.client.name}</span>
                        <span className="row__project">
                          <span className="num">{v.inv.number}</span> · {v.inv.project}
                        </span>
                      </span>
                      <span className="row__status">
                        <StatusChip status={v.status}>{statusWords(v)}</StatusChip>
                        <span className="row__touch">{lastTouch(v, now)}</span>
                      </span>
                      <span className="row__amount num">{money(v.inv.amount)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ),
      )}
    </section>
  )
}
