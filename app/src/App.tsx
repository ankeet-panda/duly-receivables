import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Plus } from 'lucide-react'
import { useStore } from './model/store'
import { summarise, views as allViews } from './model/derive'
import { fmtFull, isPinned, plural, relative, today } from './model/time'
import { toneInfo } from './model/messages'
import { money } from './model/money'
import { Runway } from './components/Runway'
import { Ledger } from './components/Ledger'
import { Slip } from './components/Slip'
import { NewInvoiceForm, Sheet, UndoToast } from './components/Sheets'
import { ThemeSwitch, useMedia } from './components/bits'

export function App() {
  const store = useStore()
  const { data } = store
  const now = today()
  const vs = useMemo(() => allViews(data, now), [data, now])
  const summary = useMemo(() => summarise(vs, now), [vs, now])
  const wide = useMedia('(min-width: 1100px)')

  const [selectedId, setSelectedId] = useState<string | null>(() => summary.firstToChase?.inv.id ?? vs.find((v) => v.status !== 'paid')?.inv.id ?? null)
  const [sheetOpen, setSheetOpen] = useState(false) // narrow screens: the slip opens as a sheet
  const [creating, setCreating] = useState(false)
  const [justPaid, setJustPaid] = useState<string | null>(null)

  const selected = vs.find((v) => v.inv.id === selectedId) ?? null
  useEffect(() => {
    if (selectedId && !selected) setSelectedId(null)
  }, [selectedId, selected])

  const select = (id: string) => {
    setSelectedId(id)
    setJustPaid(null)
    if (!wide) setSheetOpen(true)
  }

  const markPaid = () => {
    if (!selected) return
    store.markPaid(selected.inv.id, now)
    setJustPaid(selected.inv.id)
  }

  const first = summary.firstToChase
  const verdict = summary.lateCount > 0 ? (
    <p className="verdict verdict--late">
      <AlertCircle size={20} aria-hidden="true" />
      <span>
        <strong className="num">{money(summary.late)}</strong> is late across {plural(summary.lateCount, 'invoice')}.
        {first && (
          <>
            {' '}Start with{' '}
            <button type="button" className="verdict__link" onClick={() => select(first.inv.id)}>{first.client.name}</button>: <span className="num">{money(first.inv.amount)}</span>, {plural(first.daysLate, 'day')} late
            {first.inv.reminders.length > 0
              ? `, and your ${toneInfo[first.inv.reminders[first.inv.reminders.length - 1].tone].label.toLowerCase()} reminder ${relative(first.inv.reminders[first.inv.reminders.length - 1].on, now)} has had no reply.`
              : ', not reminded yet.'}
          </>
        )}
      </span>
    </p>
  ) : (
    <p className="verdict verdict--clear">
      <CheckCircle2 size={20} aria-hidden="true" />
      <span>Nothing is late. {summary.owedCount > 0 ? <><strong className="num">{money(summary.owed)}</strong> is on its way.</> : 'Every invoice is paid.'}</span>
    </p>
  )

  const slip = selected && (
    <Slip
      key={selected.inv.id}
      view={selected}
      owner={data.owner.name}
      now={now}
      justPaid={justPaid === selected.inv.id}
      onMarkPaid={markPaid}
      onMarkUnpaid={() => { store.markUnpaid(selected.inv.id); setJustPaid(null) }}
      onLog={(t) => store.logReminder(selected.inv.id, t)}
      onDelete={() => { store.deleteInvoice(selected.inv.id); setSheetOpen(false) }}
    />
  )

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__inner">
          <a className="wordmark" href="#/" aria-label="Duly, product page">Duly</a>
          <div className="topbar__end">
            {isPinned && <span className="topbar__pinned">Preview date, changes are not saved</span>}
            <ThemeSwitch />
            <button type="button" className="btn btn--secondary" onClick={() => setCreating(true)} data-action="new-invoice">
              <Plus size={16} aria-hidden="true" /> <span>New<span className="btn__more"> invoice</span></span>
            </button>
          </div>
        </div>
      </header>

      <main className="page">
        <div className="page__head">
          <div className="page__title">
            <h1>Money in</h1>
            <p className="page__date">{fmtFull(now)}</p>
          </div>
          {verdict}
        </div>

        <Runway views={vs} summary={summary} now={now} selectedId={selectedId} onSelect={select} />

        <div className="split">
          <Ledger views={vs} now={now} selectedId={selectedId} onSelect={select} />
          {wide && (
            <aside className="split__aside" aria-label="Selected invoice">
              {slip ?? <p className="slip-empty">Choose an invoice to see its details and draft a reminder.</p>}
            </aside>
          )}
        </div>

        <footer className="app-foot">
          <p>{isPinned ? 'Preview: nothing you change here is saved.' : 'Saved in this browser only.'} Duly records payments; it never moves money.</p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={store.resetSample}>Restore sample data</button>
        </footer>
      </main>

      {!wide && (
        <Sheet open={sheetOpen && !!selected} onClose={() => setSheetOpen(false)} title={selected ? `Invoice ${selected.inv.number}` : 'Invoice'} className="sheet--slip">
          {slip}
        </Sheet>
      )}

      <Sheet open={creating} onClose={() => setCreating(false)} title="New invoice">
        {creating && (
          <NewInvoiceForm
            onDone={(id) => {
              setCreating(false)
              if (id) select(id)
            }}
          />
        )}
      </Sheet>

      <UndoToast />
    </div>
  )
}
