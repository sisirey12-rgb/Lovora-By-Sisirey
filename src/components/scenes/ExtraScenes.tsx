import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'

/** Live "together for" counter: years, months, days and a ticking clock. */
export function CounterScene({ since, onDone }: { since: string; onDone: () => void }) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => { const t = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(t) }, [])
  const start = new Date(`${since}T00:00:00`)
  if (Number.isNaN(start.getTime()) || start > now) return <div className="scene-content"><p className="muted">Pick a start date to see your counter.</p><button className="primary-btn" onClick={onDone}>Continue <ArrowRight size={17} /></button></div>
  let y = now.getFullYear() - start.getFullYear(), m = now.getMonth() - start.getMonth(), d = now.getDate() - start.getDate()
  if (d < 0) { m -= 1; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate() }
  if (m < 0) { y -= 1; m += 12 }
  const rest = Math.floor((now.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  const cells: [number, string][] = [[y, 'years'], [m, 'months'], [d, 'days']]
  return <div className="scene-content counter-scene"><p className="eyebrow">TOGETHER SINCE {start.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}</p>
    <h1>Every moment, <em>counted.</em></h1>
    <div className="counter-grid" role="timer" aria-label={`${y} years, ${m} months and ${d} days`}>{cells.map(([n, l]) => <div key={l}><b>{n}</b><span>{l}</span></div>)}</div>
    <p className="counter-clock">{pad(Math.floor(rest / 3600))}:{pad(Math.floor(rest / 60) % 60)}:{pad(rest % 60)}</p>
    <button className="primary-btn" onClick={onDone}>Continue <ArrowRight size={17} /></button></div>
}

/** One card at a time: reasons, lessons or memories the creator wrote. Tap to reveal the next. */
export function MomentsScene({ title, items, onDone, buzz }: { title: string; items: string[]; onDone: () => void; buzz: (p: number | number[]) => void }) {
  const list = items.map(x => x.trim()).filter(Boolean)
  const [shown, setShown] = useState(1)
  const all = shown >= list.length
  return <div className="scene-content moments-scene"><p className="eyebrow">JUST FOR YOU</p><h1>{title}</h1>
    <ol className="moments-list">{list.slice(0, shown).map((t, i) => <li key={i} style={{ animationDelay: '0s' }}><span>{i + 1}</span>{t}</li>)}</ol>
    {all ? <button className="primary-btn" onClick={onDone}>Continue <ArrowRight size={17} /></button> : <button className="secondary-btn" onClick={() => { buzz(12); setShown(n => n + 1) }}>Show another ♡ ({shown}/{list.length})</button>}</div>
}
