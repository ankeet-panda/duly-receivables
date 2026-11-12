import { useMemo, type CSSProperties } from 'react'
import { chaseOrder, type Summary, type View } from '../model/derive'
import { addDays, daysBetween, fmtDay, plural } from '../model/time'
import { money } from '../model/money'
import { Roll, useWidth } from './bits'

const HORIZON = 42
const LANE_H = 54
const NAME_LINE_H = 16 // one extra line of client name

type Props = {
  views: View[]
  summary: Summary
  now: string
  selectedId: string | null
  onSelect(id: string): void
}

function Marker({ v, selected, onSelect, style, className = '', showWhen = true }: { v: View; selected: boolean; onSelect(id: string): void; style?: CSSProperties; className?: string; showWhen?: boolean }) {
  const when = v.status === 'late' ? `${plural(v.daysLate, 'day')} late` : v.expected ? `likely ${fmtDay(v.expected)}` : `due ${fmtDay(v.inv.due)}`
  return (
    <button
      type="button"
      className={`rw-chip rw-chip--${v.status} ${className}`}
      style={style}
      aria-pressed={selected}
      onClick={() => onSelect(v.inv.id)}
      data-invoice={v.inv.number}
    >
      <span className="rw-chip__name">{v.client.name}</span>
      <span className="rw-chip__amt num">{money(v.inv.amount)}</span>
      {!showWhen && <span className="sr-only">{when}</span>}
      {showWhen && <span className="rw-chip__when num">{v.status === 'late' ? `${plural(v.daysLate, 'day')} late` : v.expected ? `Likely ${fmtDay(v.expected)}` : `Due ${fmtDay(v.inv.due)}`}</span>}
    </button>
  )
}

export function Runway({ views, summary, now, selectedId, onSelect }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>()
  const open = views.filter((v) => v.status !== 'paid')
  const late = chaseOrder(open.filter((v) => v.status === 'late'))
  const coming = open.filter((v) => v.status !== 'late').sort((a, b) => (a.expected ?? a.inv.due).localeCompare(b.expected ?? b.inv.due))
  const compact = width > 0 && width < 880
  const horizonEnd = addDays(now, 30)

  return (
    <section className="runway" aria-labelledby="runway-title">
      <div className="runway__head">
        <div className="runway__owed">
          <h2 id="runway-title" className="runway__label">Owed to you</h2>
          <p className="runway__figure num"><Roll value={money(summary.owed)} /></p>
          <p className="runway__sub">
            {plural(summary.owedCount, 'open invoice')}
            {summary.lateCount > 0 && (
              <>
                {' · '}
                <span className="runway__late-word num">{money(summary.late)} late</span>
              </>
            )}
          </p>
        </div>
        <dl className="runway__facts">
          <div>
            <dt>Likely in by {fmtDay(horizonEnd)}</dt>
            <dd className="num"><Roll value={money(summary.expected30)} /></dd>
            {summary.expected30New > 0 && <dd className="runway__facts-note num">plus {money(summary.expected30New)} from new clients due by then</dd>}
          </div>
          <div>
            <dt>Paid in the last 30 days</dt>
            <dd className="num runway__paid">
              <Roll value={money(summary.paid30)} />
              {summary.paid30Count > 0 && <span key={summary.paid30} className="mini-stamp" aria-hidden="true">Paid</span>}
            </dd>
          </div>
        </dl>
      </div>

      <div ref={ref} className="runway__body">
        {width === 0 ? null : compact ? (
          <CompactRunway late={late} coming={coming} now={now} selectedId={selectedId} onSelect={onSelect} />
        ) : (
          <WideRunway late={late} coming={coming} now={now} width={width} selectedId={selectedId} onSelect={onSelect} />
        )}
      </div>
      <div className="runway__foot">
        <p className="runway__note">Placed on the day each client usually pays, learned from their paid invoices.</p>
        {!compact && width > 0 && (
          <p className="rw-legend" aria-hidden="true">
            <span className="rw-legend__due" /> due date
            <span className="rw-legend__exp" /> likely to land
            <span className="rw-legend__soon" /> due in 7 days
            <span className="rw-legend__new" /> new client, no habit yet
          </p>
        )}
      </div>
    </section>
  )
}

type Part = { late: View[]; coming: View[]; now: string; selectedId: string | null; onSelect(id: string): void }

function WideRunway({ late, coming, now, width, selectedId, onSelect }: Part & { width: number }) {
  const bayW = Math.min(300, Math.max(220, width * 0.24))
  const trackW = width - bayW - 32
  // Chips shrink with the track, so they never crowd at 1100 px; names wrap instead of being cut
  const chipW = Math.round(Math.max(128, Math.min(164, trackW / 5)))
  const charsPerLine = (chipW - 24) / 6.4
  const nameLines = Math.max(1, ...coming.map((v) => Math.ceil(v.client.name.length / charsPerLine)))
  const laneH = LANE_H + (nameLines - 1) * NAME_LINE_H
  const x = (d: number) => Math.max(0, Math.min(HORIZON, d)) / HORIZON * trackW

  const placed = useMemo(() => {
    const lanes: number[] = []
    return coming.map((v) => {
      const dExp = v.expected ? daysBetween(now, v.expected) : 0
      const dDue = daysBetween(now, v.inv.due)
      const px = x(dExp)
      const left = Math.min(px, trackW - chipW)
      let lane = lanes.findIndex((right) => right + 10 <= left)
      if (lane === -1) lane = lanes.length
      lanes[lane] = left + chipW
      return { v, px, dueX: x(dDue), left, lane, beyond: dExp > HORIZON }
    })
  }, [coming, now, trackW, chipW])

  const lanes = Math.max(2, ...placed.map((p) => p.lane + 1))
  const ticks = [0, 7, 14, 21, 28, 35, 42]
  const weekSums = ticks.slice(0, -1).map((t) =>
    coming.filter((v) => {
      const d = v.expected ? daysBetween(now, v.expected) : 0
      return d >= t && d < t + 7
    }).reduce((s, v) => s + v.inv.amount, 0),
  )

  return (
    <div className="rw-wide" style={{ '--bay': `${bayW}px`, '--lanes': lanes, '--lane-h': `${laneH}px`, '--chip-w': `${chipW}px` } as CSSProperties}>
      <div className={`rw-bay${late.length === 0 ? ' is-empty' : ''}`}>
        <p className="rw-bay__title">
          <span>Late, chase in this order</span>
          <span className="num">{late.length}</span>
        </p>
        {late.length === 0 ? (
          <p className="rw-bay__empty">Nothing late.</p>
        ) : (
          <ul className="rw-bay__list">
            {late.map((v) => (
              <li key={v.inv.id}><Marker v={v} selected={selectedId === v.inv.id} onSelect={onSelect} className="rw-chip--bay" /></li>
            ))}
          </ul>
        )}
      </div>

      <div className="rw-track" style={{ width: trackW }}>
        <div className="rw-lanes">
          {placed.map(({ v, px, dueX, left, lane }) => {
            // The due-to-land range shows only for the chosen invoice, so ranges never cross; amber marks the due point itself
            const on = selectedId === v.inv.id
            const apart = Math.abs(dueX - px) > 4
            const soonAt = v.status === 'soon' ? (apart ? 'due' : 'dot') : null
            return (
            <div key={v.inv.id} className="rw-item" style={{ '--x': `${px}px`, '--due-x': `${dueX}px`, '--left': `${left}px`, '--lane': lane } as CSSProperties}>
              <span className="rw-stem" aria-hidden="true" />
              {(on || soonAt === 'due') && dueX < px - 4 && <span className="rw-gap" aria-hidden="true" />}
              {apart && (on || soonAt === 'due') && <span className={`rw-due${soonAt === 'due' ? ' rw-due--soon' : ''}`} aria-hidden="true" />}
              <span className={`rw-dot${soonAt === 'dot' ? ' rw-dot--soon' : ''}${v.habit ? '' : ' rw-dot--nohabit'}`} aria-hidden="true" />
              <Marker v={v} showWhen={false} selected={selectedId === v.inv.id} onSelect={onSelect} style={{ transform: `translate(${left}px, ${-(lane * laneH)}px)` }} />
            </div>
            )
          })}
        </div>
        <div className="rw-axis" aria-hidden="true">
          <span className="rw-today" style={{ left: 0 }}>Today</span>
          {ticks.map((t) => (
            <span key={t} className="rw-tick" style={{ left: x(t) }}>
              {t > 0 && <span className={`rw-tick__label${t === HORIZON ? ' is-end' : ''}`}>{fmtDay(addDays(now, t))}</span>}
            </span>
          ))}
        </div>
        <ul className="rw-weeks" aria-label="Likely to land each week">
          {weekSums.map((s, i) => (
            <li key={i} style={{ left: x(ticks[i]), width: x(7) }} className={s ? '' : 'is-zero'}>
              <span className="sr-only">Week of {fmtDay(addDays(now, ticks[i]))}: </span>
              <span className="num">{s ? money(s) : '—'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function CompactRunway({ late, coming, now, selectedId, onSelect }: Part) {
  const groups: { title: string; items: View[] }[] = [
    { title: 'Late', items: late },
    { title: 'Next 7 days', items: [] },
    { title: '8 to 30 days', items: [] },
    { title: 'Later', items: [] },
  ]
  for (const v of coming) {
    const d = v.expected ? daysBetween(now, v.expected) : 0
    groups[d <= 7 ? 1 : d <= 30 ? 2 : 3].items.push(v)
  }
  return (
    <div className="rw-compact">
      {groups.filter((g) => g.items.length).map((g) => (
        <div key={g.title} className="rw-compact__group">
          <p className="rw-compact__title">
            <span>{g.title}</span>
            <span className="num">{money(g.items.reduce((s, v) => s + v.inv.amount, 0))}</span>
          </p>
          <ul className="rw-compact__list">
            {g.items.map((v) => (
              <li key={v.inv.id}><Marker v={v} selected={selectedId === v.inv.id} onSelect={onSelect} /></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
