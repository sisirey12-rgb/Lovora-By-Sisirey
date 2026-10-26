import { useEffect, useState } from 'react'
import { Palette, Check, X } from 'lucide-react'

export const SKINS = [
  { id: 'classic', name: 'Plum Night', light: false, sw: ['#160e20', '#f7a7ca', '#ffd36e'] },
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
export const applySkin = (id: string) => { document.documentElement.dataset.skin = id; try { localStorage.setItem('lovora-skin', id) } catch { /* private mode */ } }
export const savedSkin = () => { try { return localStorage.getItem('lovora-skin') || 'classic' } catch { return 'classic' } }

/** Lets visitors pick a look for the whole site. Light skins also switch the page to light mode. */
export default function ThemePicker({ setDark, inline }: { setDark: (d: boolean) => void; inline?: boolean }) {
  const [open, setOpen] = useState(false), [skin, setSkin] = useState(savedSkin)
  useEffect(() => { applySkin(skin) }, [skin])
  const pick = (id: string) => { const s = SKINS.find(x => x.id === id)!; setSkin(id); setDark(!s.light) }
  const list = <div className="skin-grid">{SKINS.map(s => <button key={s.id} className={`skin-card ${skin === s.id ? 'on' : ''}`} onClick={() => pick(s.id)} aria-pressed={skin === s.id}>
    <span className="skin-sw" style={{ background: `linear-gradient(135deg,${s.sw[0]} 0 45%,${s.sw[1]} 45% 75%,${s.sw[2]} 75%)` }} /><strong>{s.name}</strong>{skin === s.id && <Check size={14} />}</button>)}</div>
  if (inline) return list
  return <>
    <button className="icon-btn skin-btn" onClick={() => setOpen(true)} aria-label="Choose a site theme" title="Site theme"><Palette size={17} /></button>
    {open && <div className="skin-backdrop" onClick={() => setOpen(false)}><div className="skin-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-label="Site theme"><button className="icon-btn quick-x" onClick={() => setOpen(false)} aria-label="Close"><X size={16} /></button><p className="eyebrow">MAKE IT YOURS</p><h3>Pick a look</h3>{list}</div></div>}
  </>
}
