import { useEffect, useId, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

const pad = (n: number) => String(n).padStart(2, '0')
export const toISODate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const parse = (s?: string) => (s ? new Date(`${s}T12:00:00`) : undefined)
const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x }
type Props = { value?: string; onChange: (v: string) => void; min?: Date; max?: Date; label?: string; placeholder?: string; compact?: boolean; footnote?: string; clearable?: boolean }

/** Custom calendar replacing <input type="date">. Month arrows plus a year picker for far-away dates. */
export default function DatePicker({ value, onChange, min, max, label, placeholder = 'Choose a date', compact, footnote, clearable }: Props) {
  const [open, setOpen] = useState(false)
  const [yearView, setYearView] = useState(false)
  const selected = parse(value)
  const [month, setMonth] = useState(() => { const d = selected || min || new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const root = useRef<HTMLDivElement>(null)
  const id = useId()
  const lo = min ? startOfDay(min) : undefined
  const hi = max ? startOfDay(max) : undefined
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', away); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc) }
  }, [open])
  const dim = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const cells = Array.from({ length: Math.ceil((month.getDay() + dim) / 7) * 7 }, (_, i) => { const day = i - month.getDay() + 1; return day < 1 || day > dim ? null : new Date(month.getFullYear(), month.getMonth(), day) })
  const outside = (d: Date) => Boolean((lo && d < lo) || (hi && d > hi))
  const monthDisabled = (delta: number) => { const t = new Date(month.getFullYear(), month.getMonth() + delta, 1); return Boolean((lo && new Date(t.getFullYear(), t.getMonth() + 1, 0) < lo) || (hi && t > hi)) }
  const minY = (lo || new Date(1950, 0, 1)).getFullYear(), maxY = (hi || new Date(new Date().getFullYear() + 5, 0, 1)).getFullYear()
  const years = Array.from({ length: maxY - minY + 1 }, (_, i) => maxY - i)
  const todayStr = toISODate(new Date())
  const text = selected ? selected.toLocaleDateString(undefined, compact ? { month: 'short', day: 'numeric', year: 'numeric' } : { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' }) : placeholder
  return <div className={`ui-date ${compact ? 'compact' : ''}`} ref={root}>
    {label && <label className="ui-field-label" htmlFor={id}>{label}</label>}
    <button id={id} type="button" className={`ui-date-trigger ${open ? 'is-open' : ''} ${selected ? '' : 'empty'}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => { if (!open) { const d = selected || min || new Date(); setMonth(new Date(d.getFullYear(), d.getMonth(), 1)); setYearView(false) } setOpen(v => !v) }}>
      <CalendarDays size={16} /><span>{text}</span><ChevronRight size={15} />
    </button>
    {open && <><div className="ui-date-backdrop" onClick={() => setOpen(false)} /><div className="ui-date-pop" role="dialog" aria-label={label || 'Choose date'}>
      <div className="ui-date-head">
        <button type="button" aria-label="Previous month" disabled={yearView || monthDisabled(-1)} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={16} /></button>
        <button type="button" className="ui-date-title" onClick={() => setYearView(v => !v)} aria-label="Choose year">{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</button>
        <button type="button" aria-label="Next month" disabled={yearView || monthDisabled(1)} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={16} /></button>
      </div>
      {yearView ? <div className="ui-date-years">{years.map(y => <button type="button" key={y} className={y === month.getFullYear() ? 'selected' : ''} onClick={() => { setMonth(new Date(y, month.getMonth(), 1)); setYearView(false) }}>{y}</button>)}</div> : <>
        <div className="ui-date-grid weekdays">{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}</div>
        <div className="ui-date-grid">{cells.map((d, i) => d ? <button type="button" key={i} disabled={outside(d)} className={`${value === toISODate(d) ? 'selected' : ''} ${toISODate(d) === todayStr ? 'today' : ''}`} onClick={() => { onChange(toISODate(d)); setOpen(false) }}>{d.getDate()}</button> : <span key={i} />)}</div>
      </>}
      {(footnote || clearable) && <div className="ui-date-foot">{footnote && <span>{footnote}</span>}{clearable && value && <button type="button" onClick={() => { onChange(''); setOpen(false) }}>Clear</button>}</div>}
    </div></>}
  </div>
}
