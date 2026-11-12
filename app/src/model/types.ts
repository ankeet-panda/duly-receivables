export type Tone = 'friendly' | 'firm' | 'final'

export type Client = {
  id: string
  name: string
  contact: string
  email: string
  hue: number
}

export type Reminder = { on: string; tone: Tone }

export type Invoice = {
  id: string
  number: string
  clientId: string
  project: string
  amount: number
  issued: string // yyyy-mm-dd
  due: string
  paidOn?: string
  reminders: Reminder[]
}

export type Data = {
  version: 1
  owner: { name: string; business: string }
  clients: Client[]
  invoices: Invoice[]
}
