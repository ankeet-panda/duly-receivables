const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 })

/** ₹1,20,000 (Indian grouping). Negative values take a true minus before the sign. */
export function money(n: number): string {
  const s = `₹${inr.format(Math.abs(Math.round(n)))}`
  return n < 0 ? `−${s}` : s
}

/** Short form for tight places: ₹1.2 L, ₹64 K. Full value always sits in the accessible name. */
export function moneyShort(n: number): string {
  if (n >= 1_00_000) {
    const l = n / 1_00_000
    return `₹${l >= 10 ? Math.round(l) : Number(l.toFixed(2)).toString()} L`
  }
  if (n >= 1000) return `₹${Math.round(n / 1000)} K`
  return money(n)
}
