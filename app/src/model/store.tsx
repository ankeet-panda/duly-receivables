import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { Data, Invoice, Tone } from './types'
import { seed } from './seed'
import { isPinned, today } from './time'

const KEY = 'duly.data.v1'

function load(): Data {
  if (!isPinned) {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const d = JSON.parse(raw) as Data
        if (d && d.version === 1 && Array.isArray(d.invoices) && Array.isArray(d.clients)) return d
      }
    } catch { /* storage blocked or corrupt: start from the sample */ }
  }
  return seed(today())
}

export type Undo = { id: number; message: string; restore: Data }

export type NewInvoice = { clientName: string; contact: string; email: string; project: string; amount: number; issued: string; due: string }

type Store = {
  data: Data
  undo: Undo | null
  markPaid(id: string, on: string): void
  markUnpaid(id: string): void
  logReminder(id: string, tone: Tone): void
  addInvoice(n: NewInvoice): string
  deleteInvoice(id: string): void
  applyUndo(): void
  dismissUndo(): void
  resetSample(): void
  nextNumber: string
}

const Ctx = createContext<Store | null>(null)
export const useStore = () => {
  const s = useContext(Ctx)
  if (!s) throw new Error('StoreProvider missing')
  return s
}

export function StoreProvider({ children, initial }: { children: ReactNode; initial?: Data }) {
  const [data, setData] = useState<Data>(() => initial ?? load())
  // Undo is a stack: each quick action can be undone in turn, newest first.
  const [stack, setStack] = useState<Undo[]>([])
  const dataRef = useRef(data)
  const stackRef = useRef<Undo[]>([])
  const seq = useRef(0)
  const undo = stack[stack.length - 1] ?? null

  useEffect(() => {
    if (isPinned || initial) return
    try { localStorage.setItem(KEY, JSON.stringify(data)) } catch { /* storage full or blocked */ }
  }, [data, initial])

  const setStackBoth = (next: Undo[]) => {
    stackRef.current = next
    setStack(next)
  }

  const change = (message: string, fn: (d: Data) => Data) => {
    const prev = dataRef.current
    const next = fn(prev)
    dataRef.current = next
    setData(next)
    setStackBoth([...stackRef.current.slice(-19), { id: ++seq.current, message, restore: prev }])
  }
  const find = (id: string) => dataRef.current.invoices.find((i) => i.id === id)

  const editInvoice = (d: Data, id: string, fn: (i: Invoice) => Invoice): Data => ({
    ...d,
    invoices: d.invoices.map((i) => (i.id === id ? fn(i) : i)),
  })

  const nextNumber = useMemo(() => {
    const max = Math.max(0, ...data.invoices.map((i) => Number(i.number.replace(/\D/g, '')) || 0))
    return `INV-${String(max + 1).padStart(4, '0')}`
  }, [data.invoices])

  const store: Store = {
    data,
    undo,
    nextNumber,
    markPaid: (id, on) => {
      const inv = find(id)
      change(`${inv?.number ?? 'Invoice'} marked paid`, (d) => editInvoice(d, id, (i) => ({ ...i, paidOn: on })))
    },
    markUnpaid: (id) => {
      const inv = find(id)
      change(`${inv?.number ?? 'Invoice'} marked unpaid`, (d) => editInvoice(d, id, (i) => ({ ...i, paidOn: undefined })))
    },
    logReminder: (id, tone) => {
      const inv = find(id)
      change(`Reminder logged for ${inv?.number ?? 'invoice'}`, (d) =>
        editInvoice(d, id, (i) => ({ ...i, reminders: [...i.reminders, { on: today(), tone }] })),
      )
    },
    addInvoice: (n) => {
      const number = nextNumber
      const id = `inv-${number.replace(/\D/g, '')}-${Date.now().toString(36)}`
      change(`${number} added`, (d) => {
        let client = d.clients.find((c) => c.name.toLowerCase() === n.clientName.trim().toLowerCase())
        let clients = d.clients
        if (!client) {
          const hues = [195, 215, 250, 275, 290, 305, 320, 335, 230] // never a status hue
          client = {
            id: `c-${Date.now().toString(36)}`,
            name: n.clientName.trim(),
            contact: n.contact.trim() || n.clientName.trim(),
            email: n.email.trim(),
            hue: hues[d.clients.length % hues.length],
          }
          clients = [...clients, client]
        } else if (n.email.trim() && n.email.trim() !== client.email) {
          const updated = { ...client, email: n.email.trim() }
          clients = clients.map((c) => (c.id === updated.id ? updated : c))
          client = updated
        }
        const inv: Invoice = { id, number, clientId: client.id, project: n.project.trim(), amount: n.amount, issued: n.issued, due: n.due, reminders: [] }
        return { ...d, clients, invoices: [...d.invoices, inv] }
      })
      return id
    },
    deleteInvoice: (id) => {
      const inv = find(id)
      change(`${inv?.number ?? 'Invoice'} deleted`, (d) => ({ ...d, invoices: d.invoices.filter((i) => i.id !== id) }))
    },
    applyUndo: () => {
      const top = stackRef.current[stackRef.current.length - 1]
      if (!top) return
      dataRef.current = top.restore
      setData(top.restore)
      setStackBoth(stackRef.current.slice(0, -1))
    },
    dismissUndo: () => setStackBoth([]),
    resetSample: () => change('Sample data restored', () => seed(today())),
  }

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}
