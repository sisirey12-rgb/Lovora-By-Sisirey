import { useState, type CSSProperties } from 'react'
import { Cat } from 'lucide-react'

/** First thing the recipient sees: tap the gift, it shakes, the lid flies off and confetti bursts. Tap the cat 5 times for a secret. */
export default function GiftIntro({ recipient, colors, secret, onOpen }: { recipient: string; colors: string[]; secret?: string; onOpen: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'shake' | 'open'>('idle')
  const [catTaps, setCatTaps] = useState(0)
  const [secretOpen, setSecretOpen] = useState(false)
  const tap = () => {
    if (phase !== 'idle' || secretOpen) return
    setPhase('shake'); navigator.vibrate?.([30, 40, 30, 40, 90])
    window.setTimeout(() => setPhase('open'), 750); window.setTimeout(onOpen, 2000)
  }
  const petCat = (e: React.MouseEvent) => {
    e.stopPropagation(); if (phase !== 'idle') return
    const n = catTaps + 1; setCatTaps(n); navigator.vibrate?.(n >= 5 ? [40, 40, 90] : 12)
    if (n >= 5) { setSecretOpen(true); setCatTaps(0) }
  }
  return <div className={`gift-intro gi-${phase}`} role="button" tabIndex={0} onClick={tap} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') tap() }} aria-label="Tap to open your gift">
    <p className="eyebrow">A LITTLE GIFT FOR</p>
    <h1>{recipient || 'you'}</h1>
    <div className="gift-box">
      <button type="button" className={`gift-cat ${catTaps ? 'poked' : ''}`} onClick={petCat} aria-label="The cat. Tap it five times for a secret."><Cat size={38} /></button>
      <div className="gift-lid" aria-hidden="true"><i className="gift-bow" /></div>
      <div className="gift-body" aria-hidden="true"><i className="gift-ribbon" /></div>
    </div>
    <p className="gift-hint">{phase === 'idle' ? (catTaps > 1 ? `Keep going… ${5 - catTaps} more 🐾` : 'Tap the box ✨') : 'Here it comes…'}</p>
    {secretOpen && <div className="gift-secret" onClick={e => { e.stopPropagation(); setSecretOpen(false) }}><div><span>🐱💛</span><p>{secret || 'You found the secret! You are my favourite person.'}</p><small>tap to close</small></div></div>}
    {phase === 'open' && <div className="gift-confetti" aria-hidden="true">{Array.from({ length: 44 }, (_, i) => <i key={i} style={{ ['--dx' as string]: `${((i * 53) % 100) - 50}vw`, ['--dy' as string]: `${-20 - ((i * 29) % 55)}vh`, ['--r' as string]: `${(i * 97) % 720}deg`, background: colors[i % colors.length] || '#ff8fc2' } as CSSProperties} />)}</div>}
  </div>
}
