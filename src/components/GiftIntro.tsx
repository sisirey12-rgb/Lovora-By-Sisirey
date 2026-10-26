import { useState, type CSSProperties } from 'react'
import { Cat } from 'lucide-react'
import { sfx } from '../lib/sfx'
import { Shape, type FloatKind } from './Floaties'

/** First thing the recipient sees: a glowing gift that floats, shakes with a drum roll, then the lid flies off in a burst of light and confetti. Tap the cat 5 times for a secret. */
export default function GiftIntro({ recipient, colors, secret, onOpen }: { recipient: string; colors: string[]; secret?: string; onOpen: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'shake' | 'open'>('idle')
  const [catTaps, setCatTaps] = useState(0)
  const [secretOpen, setSecretOpen] = useState(false)
  const tap = () => {
    if (phase !== 'idle' || secretOpen) return
    sfx.unlock(); sfx.drumroll(); setPhase('shake'); navigator.vibrate?.([30, 40, 30, 40, 90])
    window.setTimeout(() => { sfx.lid(); sfx.whoosh(); window.setTimeout(() => { sfx.chime(); sfx.boom('confetti') }, 160); setPhase('open'); navigator.vibrate?.([60, 30, 120]) }, 900)
    window.setTimeout(onOpen, 2600)
  }
  const petCat = (e: React.MouseEvent) => {
    e.stopPropagation(); if (phase !== 'idle') return
    const n = catTaps + 1; setCatTaps(n); sfx.sparkle(); navigator.vibrate?.(n >= 5 ? [40, 40, 90] : 12)
    if (n >= 5) { sfx.fanfare(); setSecretOpen(true); setCatTaps(0) }
  }
  const c = (i: number) => colors[i % colors.length] || '#ff8fc2'
  return <div className={`gift-intro gx gx-${phase}`} role="button" tabIndex={0} onClick={tap} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') tap() }} aria-label="Tap to open your gift">
    <div className="gx-rays" aria-hidden="true" />
    <div className="gx-stars" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 70}%`, animationDelay: `${(i % 7) * .35}s` }} />)}</div>
    <p className="eyebrow gx-eyebrow">A LITTLE GIFT FOR</p>
    <h1 className="gx-name">{recipient || 'you'}</h1>
    <div className="gx-stage">
      <div className="gx-glow" aria-hidden="true" />
      <div className="gx-box">
        <div className="gx-burst" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ ['--a' as string]: `${i * 30}deg` } as CSSProperties} />)}</div>
        <div className="gx-lid" aria-hidden="true"><i className="gx-lid-ribbon" /><span className="gx-bow"><b /><b /><u /></span></div>
        <div className="gx-body" aria-hidden="true"><i className="gx-ribbon-v" /><i className="gx-shine" /></div>
        <div className="gx-pop" aria-hidden="true">{(['heart', 'balloon', 'star', 'flower', 'sparkle'] as FloatKind[]).map((k, i) => <span key={i} style={{ ['--i' as string]: i } as CSSProperties}><Shape kind={k} color={c(i)} size={36} /></span>)}</div>
      </div>
      <div className="gx-shadow" aria-hidden="true" />
    </div>
    <p className="gift-hint">{phase === 'idle' ? (catTaps > 1 ? `Keep going... ${5 - catTaps} more` : 'Tap the box to open') : phase === 'shake' ? 'Wait for it...' : 'Surprise!'}</p>
    <button type="button" className={`gx-cat ${catTaps ? 'poked' : ''}`} onClick={petCat} aria-label="The cat. Tap it five times for a secret."><Cat size={26} /></button>
    {secretOpen && <div className="gift-secret" onClick={e => { e.stopPropagation(); setSecretOpen(false) }}><div><span>💌</span><p>{secret || 'You found the secret! You are my favourite person.'}</p><small>tap to close</small></div></div>}
    {phase === 'open' && <div className="gift-confetti" aria-hidden="true">{Array.from({ length: 70 }, (_, i) => <i key={i} style={{ ['--dx' as string]: `${((i * 53) % 120) - 60}vw`, ['--dy' as string]: `${-15 - ((i * 29) % 70)}vh`, ['--r' as string]: `${(i * 97) % 900}deg`, background: c(i), width: 6 + (i % 4) * 3, height: 10 + (i % 3) * 5, animationDelay: `${(i % 8) * .03}s` } as CSSProperties} />)}</div>}
  </div>
}
