import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, Copy, History, RotateCcw, Send, Trash2 } from 'lucide-react'
import type { Tone } from '../model/types'
import type { View } from '../model/derive'
import { statusWords } from '../model/derive'
import { daysBetween, fmtDay, fmtLong, relative } from '../model/time'
import { money } from '../model/money'
import { draft, mailto, toneInfo } from '../model/messages'
import { ClientDot, StatusChip } from './bits'

type Props = {
  view: View
  owner: string
  now: string
  justPaid: boolean
  onMarkPaid(): void
  onMarkUnpaid(): void
  onLog(tone: Tone): void
  onDelete(): void
}

/** Lets a long email break only after @, never mid-word or before its domain ending. */
function breakable(email: string) {
  return email.split(/(?<=@)/).flatMap((part, i) => (i ? [<wbr key={i} />, part] : [part]))
}

export function Stamp({ on, fresh }: { on: string; fresh: boolean }) {
  return (
    <div className={`stamp${fresh ? ' is-fresh' : ''}`} role="img" aria-label={`Paid on ${fmtLong(on)}`}>
      <span className="stamp__word">Paid</span>
      <span className="stamp__date num">{fmtDay(on)}</span>
    </div>
  )
}

export function Slip({ view, owner, now, justPaid, onMarkPaid, onMarkUnpaid, onLog, onDelete }: Props) {
  const { inv, client } = view
  const paid = view.status === 'paid'
  const terms = daysBetween(inv.issued, inv.due)

  return (
    <div className="slip-wrap">
      <article className={`slip${justPaid ? ' is-pressed' : ''}`} aria-labelledby="slip-title">
        <div className="slip__body">
          <div className="slip__top">
            <ClientDot client={client} />
            <div className="slip__who">
              <h2 id="slip-title" className="slip__client">{client.name}</h2>
              <p className="slip__contact">{client.contact !== client.name && <span>{client.contact}</span>}{client.email && <span className="slip__email">{breakable(client.email)}</span>}</p>
            </div>
            {!paid && <StatusChip status={view.status}>{statusWords(view)}</StatusChip>}
          </div>

          <div className="slip__amount-row">
            <p className="slip__amount num">{money(inv.amount)}</p>
            {paid && <Stamp on={inv.paidOn!} fresh={justPaid} />}
          </div>
          <p className="slip__project">
            <span className="num">{inv.number}</span> · {inv.project}
          </p>

          <dl className="slip__meta">
            <div><dt>Issued</dt><dd className="num">{fmtDay(inv.issued)}</dd></div>
            <div><dt>Due</dt><dd className="num">{fmtDay(inv.due)}</dd></div>
            <div><dt>Terms</dt><dd className="num">{terms} days</dd></div>
          </dl>

          {view.pattern && (
            <p className={`slip__pattern${view.status === 'late' && view.beyondUsual > 0 ? ' is-unusual' : ''}`}>
              <History size={16} aria-hidden="true" />
              <span>{view.pattern}</span>
            </p>
          )}
        </div>

        <div className="slip__tear" aria-hidden="true" />

        <div className="slip__stub">
          {paid ? (
            <>
              <p className="slip__stub-line">
                Paid on {fmtLong(inv.paidOn!)}
                {daysBetween(inv.due, inv.paidOn!) > 0 ? `, ${daysBetween(inv.due, inv.paidOn!)} days after it was due.` : '.'}
              </p>
              <button type="button" className="btn btn--ghost btn--sm" onClick={onMarkUnpaid}>
                <RotateCcw size={15} aria-hidden="true" /> Mark unpaid
              </button>
            </>
          ) : (
            <>
              <p className="slip__stub-line">Money arrived?</p>
              <button type="button" className="btn btn--secondary" onClick={onMarkPaid} data-action="mark-paid">
                <Check size={16} aria-hidden="true" /> Mark paid
              </button>
            </>
          )}
        </div>
      </article>

      {!paid && <Composer key={inv.id} view={view} owner={owner} now={now} onLog={onLog} />}

      {inv.reminders.length > 0 && (
        <section className="history" aria-labelledby="history-title">
          <h3 id="history-title">Reminders sent</h3>
          <ol>
            {[...inv.reminders].reverse().map((r, i) => (
              <li key={i}>
                <span className={`history__tone history__tone--${r.tone}`}>{toneInfo[r.tone].label}</span>
                <span className="num">{fmtDay(r.on)}</span>
                <span className="history__rel">{relative(r.on, now)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="slip-foot">
        <button type="button" className="btn btn--danger btn--sm" onClick={onDelete}>
          <Trash2 size={15} aria-hidden="true" /> Delete invoice
        </button>
      </div>
    </div>
  )
}

function Composer({ view, owner, now, onLog }: { view: View; owner: string; now: string; onLog(t: Tone): void }) {
  const [tone, setTone] = useState<Tone>(view.tone)
  const base = draft(view, tone, owner, now)
  const [subject, setSubject] = useState(base.subject)
  const [body, setBody] = useState(base.body)
  const [copied, setCopied] = useState(false)
  const [logged, setLogged] = useState(false)
  const timer = useRef(0)

  // When Duly's suggestion changes (a reminder was logged), the picker moves to it, so the two never disagree
  useEffect(() => {
    setTone(view.tone)
  }, [view.tone])

  // A new tone redrafts; edits to the current draft are kept until then
  useEffect(() => {
    const d = draft(view, tone, owner, now)
    setSubject(d.subject)
    setBody(d.body)
  }, [tone, view.inv.reminders.length])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 2200)
    } catch {
      setCopied(false)
    }
  }

  const log = () => {
    onLog(tone)
    setLogged(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setLogged(false), 2200)
  }

  const suggested = view.tone
  return (
    <section className="composer" aria-labelledby="composer-title">
      <div className="composer__head">
        <h3 id="composer-title">{view.status === 'late' ? 'Chase this invoice' : 'Send a heads-up'}</h3>
        <div className="seg" role="radiogroup" aria-label="Tone">
          {(['friendly', 'firm', 'final'] as Tone[]).map((t) => (
            <button key={t} type="button" role="radio" aria-checked={tone === t} onClick={() => setTone(t)} data-tone={t}>
              {toneInfo[t].label}
            </button>
          ))}
        </div>
      </div>
      <p className="composer__hint">
        {toneInfo[tone].hint}.{' '}
        {tone === suggested ? (
          <span className="composer__suggested">Suggested for this invoice.</span>
        ) : (
          <span>Duly suggests {toneInfo[suggested].label.toLowerCase()} here.</span>
        )}
      </p>
      <label className="field">
        <span>Subject</span>
        <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </label>
      <label className="field">
        <span>Message to {view.client.contact}</span>
        <textarea className="input composer__body" rows={9} value={body} onChange={(e) => setBody(e.target.value)} />
      </label>
      <div className="composer__actions">
        <button type="button" className="btn btn--primary" onClick={copy} data-action="copy">
          <span className="swap" data-on={copied}>
            <span className="swap__a"><Copy size={16} aria-hidden="true" /> Copy message</span>
            <span className="swap__b" aria-hidden={!copied}><Check size={16} aria-hidden="true" /> Copied</span>
          </span>
        </button>
        <a className="btn btn--secondary" href={mailto(view.client.email, subject, body)}>
          Open in email <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      <div className="composer__log">
        <p>Sent it? Logging it lets Duly suggest the next tone.</p>
        <button type="button" className="btn btn--secondary btn--sm" onClick={log} data-action="log">
          <span className="swap" data-on={logged}>
            <span className="swap__a"><Send size={14} aria-hidden="true" /> Log as sent</span>
            <span className="swap__b" aria-hidden={!logged}><Check size={15} aria-hidden="true" /> Logged</span>
          </span>
        </button>
      </div>
      <p className="sr-only" aria-live="polite">{copied ? 'Message copied' : logged ? 'Reminder logged' : ''}</p>
    </section>
  )
}
