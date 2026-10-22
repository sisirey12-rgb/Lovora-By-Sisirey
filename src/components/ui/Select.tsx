import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

export interface Option<T extends string | number> { value: T; label: string; hint?: string }
type Props<T extends string | number> = { value: T; options: Option<T>[]; onChange: (v: T) => void; label?: string; className?: string }

/** Theme-matched listbox that replaces the browser's native <select>. Keyboard + touch friendly. */
export default function Select<T extends string | number>({ value, options, onChange, label, className = '' }: Props<T>) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const id = useId()
  const selectedIndex = Math.max(0, options.findIndex(o => o.value === value))
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])
  const openMenu = () => { setActive(selectedIndex); setOpen(true) }
  const choose = (i: number) => { onChange(options[i].value); setOpen(false) }
  const onKey = (e: React.KeyboardEvent) => {
    if (!open) { if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); openMenu() } return }
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(options.length - 1, a + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)) }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0) }
    else if (e.key === 'End') { e.preventDefault(); setActive(options.length - 1) }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(active) }
    else if (e.key === 'Tab') setOpen(false)
  }
  return <div className={`ui-select ${open ? 'is-open' : ''} ${className}`} ref={root}>
    {label && <span className="ui-field-label" id={`${id}-l`}>{label}</span>}
    <button type="button" className="ui-select-trigger" aria-haspopup="listbox" aria-expanded={open} aria-labelledby={label ? `${id}-l` : undefined} onClick={() => open ? setOpen(false) : openMenu()} onKeyDown={onKey}>
      <span>{options[selectedIndex]?.label}</span><ChevronDown size={16} />
    </button>
    {open && <ul className="ui-select-menu" role="listbox" aria-labelledby={label ? `${id}-l` : undefined}>
      {options.map((o, i) => <li key={String(o.value)} role="option" aria-selected={o.value === value} className={`${i === active ? 'active' : ''} ${o.value === value ? 'selected' : ''}`} onPointerEnter={() => setActive(i)} onClick={() => choose(i)}>
        <span>{o.label}{o.hint && <small>{o.hint}</small>}</span>{o.value === value && <Check size={14} />}
      </li>)}
    </ul>}
  </div>
}
