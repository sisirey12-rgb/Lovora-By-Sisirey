import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'

const STEPS: Record<string, string[]> = {
  Birthday: ['Inflating the balloons', 'Baking the cake', 'Lighting the candles', 'Wrapping the gift', 'Adding the sparkle'],
  Anniversary: ['Hanging the stars', 'Counting your days', 'Sealing the vows', 'Tying the ribbon', 'Adding the sparkle'],
  'Love letter': ['Folding the letter', 'Melting the wax', 'Lighting the lanterns', 'Tying the ribbon', 'Adding the sparkle'],
  'Special surprise': ['Hiding the mystery boxes', 'Printing the scratch card', 'Catching the shooting stars', 'Wrapping the gift', 'Adding the sparkle'],
}
const EMOJI = ['🎈', '🍰', '🕯️', '🎁', '✨']
const STEP_MS = 640

/** The "creating your surprise" animation shown before a PREVIEW opens. (Saving a draft has its own, different animation.) */
export default function CreatingOverlay({ occasion, relation, name, onDone }: { occasion: string; relation?: string; name?: string; onDone: () => void }) {
  const steps = STEPS[occasion] || STEPS['Special surprise']
  const [n, setN] = useState(0)
  const done = useRef(onDone); done.current = onDone   // a fresh callback each render must not restart the timers
  useEffect(() => {
    if (n > steps.length) { done.current(); return }
    const t = window.setTimeout(() => setN(v => v + 1), n === steps.length ? 900 : STEP_MS)
    return () => window.clearTimeout(t)
  }, [n, steps.length])
  const ready = n >= steps.length
  const pct = Math.min(100, Math.round(n / steps.length * 100))
  const who = (name || '').trim()
  return <div className="cr-ov" role="status" aria-live="polite">
    <div className="cr-glow" aria-hidden="true" />
    <div className="cr-stage" aria-hidden="true">
      <div className={`cr-gift ${ready ? 'open' : ''}`}><i className="cr-lid"><b /></i><i className="cr-box"><b /></i>{ready && <span className="cr-burst">{Array.from({ length: 14 }, (_, k) => <u key={k} style={{ ['--a' as string]: `${k * 25.7}deg`, ['--d' as string]: `${(k % 4) * .05}s` } as React.CSSProperties} />)}</span>}</div>
      <div className="cr-orbit">{EMOJI.map((e, k) => <span key={k} className={n > k ? 'on' : ''} style={{ ['--k' as string]: k } as React.CSSProperties}>{e}</span>)}</div>
    </div>
    <p className="cr-eyebrow">LOVORA STUDIO{relation ? ` · ${relation.toUpperCase()}` : ''}</p>
    <h2 className="cr-title">{ready ? 'It is ready ✨' : who ? <>Creating {who}’s surprise…</> : 'Creating your surprise…'}</h2>
    <p className="cr-now">{ready ? 'Press play and enjoy the show' : steps[Math.min(n, steps.length - 1)]}</p>
    <div className="cr-bar"><span style={{ width: `${pct}%` }} /></div>
    <ul className="cr-list">{steps.map((s, i) => <li key={s} className={n > i ? 'done' : n === i ? 'now' : ''}><span>{n > i ? <Check size={12} /> : i + 1}</span>{s}</li>)}</ul>
  </div>
}
