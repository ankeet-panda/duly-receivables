import type { Client, Data, Invoice } from './types'
import { addDays } from './time'

// Sample workspace for a first visit. Every date is built relative to today so the
// screen always has a believable mix of late, due-soon, upcoming and paid invoices.
// Names are invented; emails use example.com.

const clients: Client[] = [
  { id: 'halden', name: 'Halden Foods', contact: 'Rohan Mehta', email: 'rohan@halden.example.com', hue: 290 },
  { id: 'copperleaf', name: 'Copperleaf Travel', contact: 'Isha Kapoor', email: 'isha@copperleaf.example.com', hue: 195 },
  { id: 'saltpan', name: 'Saltpan Ceramics', contact: 'Dev Iyer', email: 'dev@saltpan.example.com', hue: 200 },
  { id: 'kestrel', name: 'Kestrel Bikes', contact: 'Nikhil Rao', email: 'nikhil@kestrel.example.com', hue: 250 },
  { id: 'lumen', name: 'Lumen & Lark', contact: 'Tara Sen', email: 'tara@lumenlark.example.com', hue: 320 },
  { id: 'marigold', name: 'Marigold Clinics', contact: 'Farah Ali', email: 'farah@marigold.example.com', hue: 320 },
  { id: 'orchard', name: 'Orchard Row Studio', contact: 'Kabir Shah', email: 'kabir@orchardrow.example.com', hue: 230 },
]

type Row = [number: string, client: string, project: string, amount: number, issued: number, due: number, paid?: number, reminders?: [number, 'friendly' | 'firm' | 'final'][]]

const rows: Row[] = [
  // Paid history: this is what each client's paying habit is learned from
  ['0371', 'halden', 'Packaging refresh, phase 1', 85_000, -150, -120, -105],
  ['0378', 'copperleaf', 'Itinerary page redesign', 48_000, -140, -110, -107],
  ['0380', 'kestrel', 'Design system audit', 1_40_000, -130, -100, -95],
  ['0384', 'saltpan', 'Shopfront refresh', 24_000, -120, -105, -105],
  ['0386', 'marigold', 'Patient portal UI, sprint 1', 90_000, -115, -85, -77],
  ['0389', 'halden', 'Packaging refresh, phase 1b', 1_10_000, -110, -80, -58, [[-70, 'friendly']]],
  ['0391', 'orchard', 'Studio site copy and layout', 18_000, -105, -75, -77],
  ['0394', 'copperleaf', 'Search results prototype', 52_000, -100, -70, -65],
  ['0397', 'saltpan', 'Lookbook layout', 26_000, -90, -75, -76],
  ['0399', 'kestrel', 'App onboarding research', 1_60_000, -88, -58, -52],
  ['0402', 'halden', 'Shelf-talker set', 95_000, -80, -50, -33, [[-40, 'friendly']]],
  ['0404', 'marigold', 'Patient portal UI, sprint 2', 96_000, -74, -44, -34],
  ['0406', 'orchard', 'Pitch deck, round one', 20_000, -70, -40, -41],
  ['0408', 'copperleaf', 'Checkout usability review', 60_000, -62, -32, -28],
  ['0410', 'saltpan', 'Product photography direction', 30_000, -58, -43, -42],
  ['0412', 'halden', 'Packaging refresh, phase 2', 1_20_000, -50, -20, undefined, [[-14, 'friendly']]],
  ['0415', 'kestrel', 'App onboarding, wireframes', 1_50_000, -46, -16, -9],
  ['0417', 'marigold', 'Patient portal UI, sprint 3', 96_000, -44, -14, -5],
  ['0418', 'orchard', 'Pitch deck, round two', 22_000, -40, -10, -12],
  // Open
  ['0419', 'copperleaf', 'Booking flow audit', 64_000, -38, -8],
  ['0420', 'saltpan', 'Spring catalogue layout', 28_500, -32, -2],
  ['0423', 'kestrel', 'App onboarding, visual design', 1_85_000, -25, 5],
  ['0425', 'lumen', 'Brand guidelines', 42_000, -12, 3],
  ['0427', 'marigold', 'Patient portal UI, sprint 4', 96_000, -6, 24],
  ['0428', 'orchard', 'Investor update template', 35_000, -2, 28],
]

export function seed(today: string): Data {
  const at = (n: number) => addDays(today, n)
  const invoices: Invoice[] = rows.map(([number, clientId, project, amount, issued, due, paid, rem]) => ({
    id: `inv-${number}`,
    number: `INV-${number}`,
    clientId,
    project,
    amount,
    issued: at(issued),
    due: at(due),
    paidOn: paid === undefined ? undefined : at(paid),
    reminders: (rem ?? []).map(([d, tone]) => ({ on: at(d), tone })),
  }))
  return {
    version: 1,
    owner: { name: 'Aanya Rao', business: 'Aanya Rao Design' },
    clients,
    invoices,
  }
}
