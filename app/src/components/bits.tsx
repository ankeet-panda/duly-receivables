import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { AlertCircle, CheckCircle2, Clock, Monitor, Moon, Sun } from 'lucide-react'
import type { Client } from '../model/types'
import type { Status } from '../model/derive'
import { useTheme, type ThemeChoice } from '../theme'

export function ClientDot({ client, small }: { client: Client; small?: boolean }) {
  const letter = client.name.replace(/^the\s+/i, '').charAt(0).toUpperCase()
  return (
    <span className={`client-dot${small ? ' client-dot--sm' : ''}`} style={{ '--h': client.hue } as CSSProperties} aria-hidden="true">
      {letter}
    </span>
  )
}

export function StatusGlyph({ status }: { status: Status }) {
  const p = { 'aria-hidden': true, strokeWidth: 2.25 } as const
  if (status === 'late') return <AlertCircle {...p} />
  if (status === 'soon') return <Clock {...p} />
  if (status === 'paid') return <CheckCircle2 {...p} />
  return null
}

export function StatusChip({ status, children }: { status: Status; children: string }) {
  return (
    <span className={`chip chip--${status}`}>
      <StatusGlyph status={status} />
      {children}
    </span>
  )
}

/** Rolls only the characters that changed, in fixed tabular slots. The real value is in the text for screen readers. */
export function Roll({ value, className }: { value: string; className?: string }) {
  const prev = useRef(value)
  const [pair, setPair] = useState({ now: value, before: value, gen: 0 })
  useEffect(() => {
    if (prev.current !== value) {
      setPair((p) => ({ now: value, before: prev.current, gen: p.gen + 1 }))
      prev.current = value
    }
  }, [value])
  const { now, before, gen } = pair
  const shift = now.length - before.length
  return (
    <span className={`roll ${className ?? ''}`}>
      <span className="sr-only">{value}</span>
      <span aria-hidden="true" className="roll__glyphs">
        {now.split('').map((ch, i) => {
          // Right-aligned comparison: the units digit lines up with the old units digit
          const k = i - shift
          const changed = gen > 0 && (k < 0 || before[k] !== ch)
          return (
            <span key={`${i}-${changed ? gen : 0}-${ch}`} className={changed && /\d/.test(ch) ? 'roll__ch is-new' : 'roll__ch'}>
              {ch}
            </span>
          )
        })}
      </span>
    </span>
  )
}

export function ThemeSwitch() {
  const { choice, setChoice } = useTheme()
  const opts: { v: ThemeChoice; label: string; Icon: typeof Sun }[] = [
    { v: 'system', label: 'Match system', Icon: Monitor },
    { v: 'light', label: 'Light', Icon: Sun },
    { v: 'dark', label: 'Dark', Icon: Moon },
  ]
  return (
    <div className="seg seg--icons" role="radiogroup" aria-label="Theme">
      {opts.map(({ v, label, Icon }) => (
        <button key={v} type="button" role="radio" aria-checked={choice === v} aria-label={label} title={label} onClick={() => setChoice(v)}>
          <Icon size={15} aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}

/** Width of an element, for layouts that recompose rather than squeeze. */
export function useWidth<T extends HTMLElement>(): [React.RefObject<T>, number] {
  const ref = useRef<T>(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setW(el.getBoundingClientRect().width)
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w]
}

export function useMedia(q: string) {
  const [m, setM] = useState(() => matchMedia(q).matches)
  useEffect(() => {
    const mq = matchMedia(q)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}
