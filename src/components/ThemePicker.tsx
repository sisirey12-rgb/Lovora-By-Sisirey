import { useEffect, useRef, useState } from 'react'
import { Palette, Check, X } from 'lucide-react'

export const SKINS = [
  { id: 'classic', name: 'Mango Cream', light: true, sw: ['#fff8ee', '#ff5a3c', '#ffb703'] },
  { id: 'midnight', name: 'Midnight Blue', light: false, sw: ['#0a1224', '#6fb7ff', '#a9a4ff'] },
  { id: 'sunset', name: 'Sunset Ember', light: false, sw: ['#240f12', '#ff9a62', '#ff5e8a'] },
  { id: 'forest', name: 'Forest Mint', light: false, sw: ['#0c1a16', '#7be0b0', '#e8e08a'] },
  { id: 'mocha', name: 'Mocha Gold', light: false, sw: ['#1c1411', '#e3b27a', '#f3d9a8'] },
  { id: 'sakura', name: 'Sakura Day', light: true, sw: ['#fff3f8', '#e0679a', '#a97cf0'] },
  { id: 'cream', name: 'Cream Latte', light: true, sw: ['#fbf4ea', '#c9805a', '#e0a64f'] },
  { id: 'peach', name: 'Peach Blush', light: true, sw: ['#fff1ea', '#ff8a6b', '#ffc36b'] },
  { id: 'cotton', name: 'Cotton Candy', light: true, sw: ['#fff0f8', '#ff7eb6', '#7fc4ff'] },
  { id: 'lilac', name: 'Lilac Milk', light: true, sw: ['#f6f0ff', '#9b7bea', '#ff9ccc'] },
  { id: 'matcha', name: 'Matcha Cream', light: true, sw: ['#f2f7ea', '#6fae6f', '#e8c86a'] },
  { id: 'boba', name: 'Berry Boba', light: false, sw: ['#2a1020', '#ff7aa8', '#ffcf8a'] },
  { id: 'honey', name: 'Honey Butter', light: false, sw: ['#2a2010', '#ffc247', '#ff9a6b'] },
] as const
export const applySkin = (id: string) => { const skin = SKINS.find(s => s.id === id) || SKINS[0]; document.documentElement.dataset.skin = skin.id; document.documentElement.dataset.theme = skin.light ? 'light' : 'dark'; try { localStorage.setItem('lovora-skin', skin.id); localStorage.setItem('lovora-theme', skin.light ? 'light' : 'dark') } catch { /* private mode */ } }
export const savedSkin = () => { try { return localStorage.getItem('lovora-skin') || 'classic' } catch { return 'classic' } }

/** Lets visitors pick a look for the whole site. A small popover of colour dots; light skins also switch the page to light mode. */
export default function ThemePicker({ setDark, inline }: { setDark: (d: boolean) => void; inline?: boolean }) {
  const [open, setOpen] = useState(false), [skin, setSkin] = useState(savedSkin), box = useRef<HTMLDivElement>(null)
  useEffect(() => { applySkin(skin); const selected = SKINS.find(s => s.id === skin) || SKINS[0]; setDark(!selected.light) }, [skin, setDark])
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }, esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', away); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc) }
  }, [open])
  const pick = (id: string) => { const s = SKINS.find(x => x.id === id)!; setSkin(id); setDark(!s.light) }
  const current = SKINS.find(x => x.id === skin) || SKINS[0]
  const group = (title: string, light: boolean) => <div className="tp-group"><span>{title}</span><div className="tp-options" role="radiogroup" aria-label={`${title} looks`}>{SKINS.filter(s => s.light === light).map(s => <button key={s.id} type="button" role="radio" aria-checked={skin === s.id} aria-label={s.name} title={s.name} className={skin === s.id ? 'tp-option on' : 'tp-option'} onClick={() => pick(s.id)}><span className="tp-preview" aria-hidden="true"><i style={{background:s.sw[0]}}/><i style={{background:s.sw[1]}}/><i style={{background:s.sw[2]}}/></span><span className="tp-option-name">{s.name}</span>{skin === s.id && <Check size={15} strokeWidth={3} />}</button>)}</div></div>
  const body = <>{group('Dark', false)}{group('Light', true)}<p className="tp-name"><i style={{ background: current.sw[1] }} />Current look: <strong>{current.name}</strong></p></>
  if (inline) return <div className="tp-inline">{body}</div>
  return <div className="tp" ref={box}>
    <button className="icon-btn skin-btn" onClick={() => setOpen(v => !v)} aria-label="Choose a site theme" aria-expanded={open} title="Site theme"><Palette size={17} /></button>
    {open && <div className="tp-pop" role="dialog" aria-label="Site theme"><div className="tp-head"><strong>Colours</strong><button type="button" className="tp-x" onClick={() => setOpen(false)} aria-label="Close"><X size={14} /></button></div>{body}</div>}
  </div>
}
