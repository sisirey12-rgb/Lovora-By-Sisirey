import { useEffect, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const STEPS = [
  { id: 'link', label: 'Open the link', text: 'They get one link on WhatsApp, Instagram or anywhere.' },
  { id: 'gift', label: 'Tap the gift', text: 'The gift opens and the surprise begins.' },
  { id: 'balloons', label: 'Pop balloons', text: 'Every balloon hides a sweet note from you.' },
  { id: 'cake', label: 'Make a wish', text: 'A cake that builds itself, ready for a wish.' },
  { id: 'letter', label: 'Read the letter', text: 'Your words, written out one letter at a time.' },
  { id: 'finale', label: 'Grand finale', text: 'Confetti, flowers and one last big feeling.' },
] as const
const BALLOONS = ['#ff8fc2', '#b79bff', '#ffd36e', '#7fd6ff', '#ff9d7a']

/** A phone that plays the whole story on a loop: opening the link, then every scene of the surprise. */
export default function PhoneDemo() {
  const [step, setStep] = useState(0)
  const [auto, setAuto] = useState(true)
  useEffect(() => {
    if (!auto) return
    const t = window.setTimeout(() => setStep(s => (s + 1) % STEPS.length), 3400)
    return () => window.clearTimeout(t)
  }, [step, auto])
  const cur = STEPS[step]
  return <div className="pd">
    <div className="pd-glow" aria-hidden="true" />
    <div className="pd-phone" role="img" aria-label={`Demo of a Lovora surprise: ${cur.label}`}>
      <div className="pd-screen">
        <AnimatePresence mode="wait">
          <motion.div key={cur.id} className={`pd-scene pd-${cur.id}`} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.03 }} transition={{ duration: .35 }}>
            {cur.id === 'link' && <>
              <div className="pd-chat-head"><i /><b>Sisirey</b><small>online</small></div>
              <div className="pd-bubble"><div className="pd-card"><img src="/logo.png" alt="" width="34" height="34" /><div><strong>A surprise is waiting for you ✨</strong><small>lovorameow.app</small></div></div><span>lovorameow.app/s/9f3k</span><em>10:24</em></div>
              <div className="pd-finger" aria-hidden="true">👆</div>
            </>}
            {cur.id === 'gift' && <>
              <small className="pd-eyebrow">A LITTLE GIFT FOR</small><h4>Aarav</h4>
              <div className="pd-gift" aria-hidden="true"><i className="pd-lid" /><i className="pd-box" /></div>
              <div className="pd-confetti" aria-hidden="true">{Array.from({ length: 14 }, (_, i) => <b key={i} style={{ ['--x' as string]: `${(i * 37) % 100}%`, ['--d' as string]: `${(i % 5) * .15}s`, background: BALLOONS[i % 5] } as CSSProperties} />)}</div>
              <small className="pd-hint">Tap the box ✨</small>
            </>}
            {cur.id === 'balloons' && <>
              <small className="pd-eyebrow">LITTLE WISHES</small><h4>Pop a balloon</h4>
              <div className="pd-balloons" aria-hidden="true">{BALLOONS.map((c, i) => <span key={c} className={i === 2 ? 'pop' : ''} style={{ background: c, animationDelay: `${i * .2}s` } as CSSProperties} />)}</div>
              <div className="pd-note"><small>WISH 03</small><p>You make every room feel warmer.</p></div>
            </>}
            {cur.id === 'cake' && <>
              <small className="pd-eyebrow">MAKE A WISH</small>
              <div className="pd-cake" aria-hidden="true"><i className="flame" /><i className="candle" /><i className="top" /><i className="mid" /><i className="base" /></div>
              <h4>A wish, just for you</h4>
            </>}
            {cur.id === 'letter' && <>
              <div className="pd-envelope" aria-hidden="true"><i className="flap" /><i className="paper" /></div>
              <div className="pd-letter"><small>Dear Aarav,</small><p>Happy birthday! Today is all about you, so let the cake be big and the day be bigger.</p><em>Your sibling, always</em></div>
            </>}
            {cur.id === 'finale' && <>
              <div className="pd-confetti on" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <b key={i} style={{ ['--x' as string]: `${(i * 29) % 100}%`, ['--d' as string]: `${(i % 6) * .12}s`, background: BALLOONS[i % 5] } as CSSProperties} />)}</div>
              <h3>HAPPY<br />BIRTHDAY</h3><h5>Aarav</h5>
              <div className="pd-bouquet" aria-hidden="true">💐</div>
            </>}
          </motion.div>
        </AnimatePresence>
        <div className="pd-bar" aria-hidden="true" />
      </div>
    </div>
    <div className="pd-steps" role="tablist" aria-label="How a surprise plays">{STEPS.map((s, i) => <button key={s.id} type="button" role="tab" aria-selected={i === step} className={i === step ? 'on' : i < step ? 'seen' : ''} onClick={() => { setStep(i); setAuto(false) }}><span>{i + 1}</span><small>{s.label}</small></button>)}</div>
    <p className="pd-caption" aria-live="polite"><strong>{step + 1}. {cur.label}.</strong> {cur.text}</p>
  </div>
}
