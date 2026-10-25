import { useEffect, useRef, useState } from 'react'
import { Check, Sparkles } from 'lucide-react'

const STEPS = ['Names and occasion saved', 'Words saved', 'Look saved', 'Moments saved', 'Private draft saved']
/** The "saving your draft" animation. Calls onDone when it has finished, so the preview can open right after it. */
export default function SavingOverlay({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState(0)
  const done = useRef(onDone); done.current = onDone   // a fresh callback on every render must not restart the timers
  useEffect(() => {
    const t = window.setTimeout(() => setStage(s => s + 1), stage >= STEPS.length ? 1100 : 260)
    if (stage > STEPS.length) { window.clearTimeout(t); done.current() }
    return () => window.clearTimeout(t)
  }, [stage])
  const ready = stage >= STEPS.length
  return <div className="creation-overlay" role="status" aria-live="polite"><div className="creation-card"><div className="creation-icon"><Sparkles size={26} /></div><p className="eyebrow">LOVORA STUDIO</p><h2>{ready ? 'Your little world is ready.' : 'Saving your surprise…'}</h2>
    <div className="creation-checklist">{STEPS.map((label, i) => <div key={label} className={stage > i ? 'complete' : stage === i ? 'active' : ''}><span>{stage > i ? <Check size={14} /> : stage === i ? <span className="creation-spinner" /> : <span className="creation-empty" />}</span><span>{label}</span>{stage > i && <small>DONE</small>}</div>)}</div>
    <div className="creation-progress"><span style={{ width: `${Math.min(100, stage / STEPS.length * 100)}%` }} /></div>
    {ready && <p className="creation-ready">✓ Draft saved on this device</p>}</div></div>
}
