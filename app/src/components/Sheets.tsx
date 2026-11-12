import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AlertCircle, X, Undo2 } from 'lucide-react'
import { useStore } from '../model/store'
import { addDays, fmtDay, today } from '../model/time'

/** Native modal dialog: focus trap, Escape, inert page and focus return come from the platform. */
export function Sheet({ open, onClose, title, children, className = '' }: { open: boolean; onClose(): void; title: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog
      ref={ref}
      className={`sheet ${className}`}
      aria-label={title}
      onClose={onClose}
      onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
    >
      <div className="sheet__inner">
        <div className="sheet__head">
          <p className="sheet__title">{title}</p>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}

const TERMS = [7, 15, 30, 45]

export function NewInvoiceForm({ onDone }: { onDone(id: string | null): void }) {
  const { data, addInvoice, nextNumber } = useStore()
  const [client, setClient] = useState('')
  const [contact, setContact] = useState('')
  const [email, setEmail] = useState('')
  const [tried, setTried] = useState(false)
  const [project, setProject] = useState('')
  const [amount, setAmount] = useState('')
  const [issued, setIssued] = useState(today())
  const [terms, setTerms] = useState(30)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const first = useRef<HTMLInputElement>(null)

  const known = data.clients.find((c) => c.name.toLowerCase() === client.trim().toLowerCase())
  useEffect(() => {
    if (known && !email) setEmail(known.email)
  }, [known?.id])

  const due = issued ? addDays(issued, terms) : ''
  const n = Number(amount.replace(/[,\s₹]/g, ''))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!client.trim()) errs.client = 'Enter who the invoice is for.'
    if (!project.trim()) errs.project = 'Name the work, so the reminder can mention it.'
    if (!amount.trim()) errs.amount = 'Enter the invoice amount.'
    else if (!/^[\d,\s₹.]+$/.test(amount.trim()) || !Number.isFinite(n) || n <= 0) errs.amount = 'Enter the amount as a number, for example 45000.'
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter an email like name@example.com.'
    if (!issued) errs.issued = 'Choose the date you sent it.'
    setErrors(errs)
    setTried(true)
    if (Object.keys(errs).length) {
      const firstBad = ['client', 'email', 'project', 'amount', 'issued'].find((k) => errs[k])
      document.getElementById(`ni-${firstBad}`)?.focus()
      return
    }
    onDone(addInvoice({ clientName: client, contact, email, project, amount: Math.round(n), issued, due }))
  }

  const err = (k: string) => (errors[k] ? <span className="field-error" id={`ni-${k}-err`}><AlertCircle size={14} aria-hidden="true" />{errors[k]}</span> : null)
  // An error clears the moment its field is edited
  const edit = (k: string, set: (v: string) => void) => (e: { target: { value: string } }) => {
    set(e.target.value)
    if (errors[k]) setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== k)))
  }
  const open = Object.values(errors)
  const leave = (k: string, bad: string | false) => () => setErrors((prev) => {
    const rest = Object.fromEntries(Object.entries(prev).filter(([key]) => key !== k))
    return bad ? { ...rest, [k]: bad } : rest
  })
  const aria = (k: string) => ({ 'aria-invalid': errors[k] ? true : undefined, 'aria-describedby': errors[k] ? `ni-${k}-err` : undefined })

  return (
    <form className="form" onSubmit={submit} noValidate>
      {tried && open.length > 0 && (
        <div className="form__summary" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span>{open.length === 1 ? 'One thing to fix before adding it.' : `${open.length} things to fix before adding it.`}</span>
        </div>
      )}
      <p className="form__number">This will be <span className="num">{nextNumber}</span></p>
      <label className="field">
        <span>Client</span>
        <input ref={first} id="ni-client" className="input" list="ni-clients" autoComplete="off" value={client} onChange={edit('client', setClient)} {...aria('client')} />
        <datalist id="ni-clients">
          {data.clients.map((c) => <option key={c.id} value={c.name} />)}
        </datalist>
        {err('client')}
      </label>
      <label className="field">
        <span>Contact name <span className="field-optional">optional</span></span>
        <input id="ni-contact" className="input" autoComplete="off" value={contact} onChange={(e) => setContact(e.target.value)} />
        <span className="field-hint">Reminders greet them by first name.</span>
      </label>
      <label className="field">
        <span>Billing email <span className="field-optional">optional</span></span>
        <input id="ni-email" className="input" type="email" autoComplete="off" value={email} onChange={edit('email', setEmail)} onBlur={leave('email', email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && 'Enter an email like name@example.com.')} {...aria('email')} />
        {err('email') ?? <span className="field-hint">Used for "Open in email" on reminders.</span>}
      </label>
      <label className="field">
        <span>Work</span>
        <input id="ni-project" className="input" value={project} onChange={edit('project', setProject)} {...aria('project')} />
        {err('project')}
      </label>
      <div className="form__row">
        <label className="field">
          <span>Amount</span>
          <span className="input-affix">
            <span aria-hidden="true">₹</span>
            <input id="ni-amount" className="input num" inputMode="numeric" value={amount} onChange={edit('amount', setAmount)} onBlur={leave('amount', amount.trim() !== '' && (!/^[\d,\s₹.]+$/.test(amount.trim()) || !(n > 0)) && 'Enter the amount as a number, for example 45,000.')} {...aria('amount')} />
          </span>
          {err('amount')}
        </label>
        <label className="field">
          <span>Sent on</span>
          <input id="ni-issued" className="input num" type="date" value={issued} onChange={edit('issued', setIssued)} {...aria('issued')} />
          {err('issued')}
        </label>
      </div>
      <fieldset className="field form__terms">
        <legend>Payment terms</legend>
        <div className="seg" role="radiogroup" aria-label="Payment terms">
          {TERMS.map((t) => (
            <button key={t} type="button" role="radio" aria-checked={terms === t} onClick={() => setTerms(t)}>
              {t} days
            </button>
          ))}
        </div>
        {due && <span className="field-hint">Due <span className="num">{fmtDay(due)}</span></span>}
      </fieldset>
      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={() => onDone(null)}>Cancel</button>
        <button type="submit" className="btn btn--primary">Add invoice</button>
      </div>
    </form>
  )
}

export function UndoToast() {
  const { undo, applyUndo, dismissUndo } = useStore()
  const [hold, setHold] = useState(false)
  const [undone, setUndone] = useState<string | null>(null)
  useEffect(() => {
    if (!undone) return
    const t = window.setTimeout(() => setUndone(null), 2500)
    return () => window.clearTimeout(t)
  }, [undone])
  // While a toast shows, the page gains room at the bottom so the toast never hides the last content
  useEffect(() => {
    document.documentElement.style.setProperty('--toast-space', undo || undone ? '88px' : '0px')
  }, [undo, undone])
  useEffect(() => {
    if (!undo || hold) return
    const t = window.setTimeout(dismissUndo, 6000)
    return () => window.clearTimeout(t)
  }, [undo, hold, dismissUndo])
  return (
    <div className="toast-region" aria-live="polite">
      {undo && (
        <div
          key={undo.id}
          className="toast"
          onMouseEnter={() => setHold(true)}
          onMouseLeave={() => setHold(false)}
          onFocus={() => setHold(true)}
          onBlur={() => setHold(false)}
        >
          <span>{undone && <span className="toast__undone">Undid “{undone}”. </span>}{undo.message}</span>
          <button type="button" className="toast__undo" onClick={() => { setUndone(undo.message); applyUndo() }}>
            <Undo2 size={15} aria-hidden="true" /> Undo
          </button>
          <button type="button" className="icon-btn toast__close" aria-label="Dismiss" onClick={dismissUndo}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}
      {!undo && undone && <div className="toast" key="undone"><span>Undid “{undone}”.</span></div>}
    </div>
  )
}
