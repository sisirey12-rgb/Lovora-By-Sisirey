import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

/**
 * Full-screen "split screen" birthday reveal, played when the arrow hits the heart.
 * Rendered into <body> with inline styles so scene transforms / CSS files can never hide or move it.
 *
 * It is a small state machine, NOT one shared timeline, so a slow phone can never show the title before the screen is black:
 *   phase 0  two black halves slide in and meet; the bow scene is removed once they have closed (text is not even mounted yet)
 *   phase 1  the halves have really closed (onAnimationComplete): spotlight, title pulls from blur into focus, then the name
 *   phase 2  the halves split apart again, a vignette keeps the eye on the title
 *   phase 3  everything fades out, then onDone() moves the story on
 */
type Props = { kicker?: string; title: string; name: string; display?: string; script?: string; accent?: string; onCovered?: () => void; onDone: () => void }
const HOLD_MS = 2400, OPEN_MS = 1000, FADE_MS = 700

export default function BirthdayReveal({ kicker = 'MADE JUST FOR YOU', title, name, display, script, accent = '#ff8fc2', onCovered, onDone }: Props) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0)
  const go = (p: 1 | 2 | 3) => setPhase(cur => (cur < p ? p : cur))

  useEffect(() => {
    const ts: number[] = []
    if (phase === 0) ts.push(window.setTimeout(() => go(1), 1500))          // safety net if the close animation never reports back
    if (phase === 1) ts.push(window.setTimeout(() => go(2), HOLD_MS))
    if (phase === 2) ts.push(window.setTimeout(() => go(3), OPEN_MS))
    if (phase === 3) ts.push(window.setTimeout(onDone, FADE_MS))
    return () => ts.forEach(window.clearTimeout)
  }, [phase, onDone])
  useEffect(() => { if (phase >= 1) onCovered?.() }, [phase >= 1])   // screen is fully black: parent can remove the bow scene now
  useEffect(() => { const t = window.setTimeout(onDone, 9000); return () => window.clearTimeout(t) }, [onDone])   // never leave the player stuck

  const words = title.split(' ').filter(Boolean)
  const base = { position: 'fixed' as const, top: 0, bottom: 0 }
  const closed = phase < 2, out = phase === 3
  const panel = (side: 'left' | 'right') => (
    <motion.div key={side} aria-hidden="true"
      style={{ ...base, [side]: 0, width: '50.6%', background: 'linear-gradient(180deg,#050407,#0b0610 60%,#050407)', zIndex: 1, willChange: 'transform' }}
      initial={{ x: side === 'left' ? '-101%' : '101%' }}
      animate={{ x: closed ? '0%' : side === 'left' ? '-101%' : '101%' }}
      transition={closed ? { duration: .55, ease: 'easeOut' } : { duration: OPEN_MS / 1000, ease: [.76, 0, .24, 1] }}
      onAnimationComplete={side === 'left' ? () => go(1) : undefined} />
  )
  return createPortal(
    <div role="status" aria-live="polite" aria-label={`${title} ${name}`} style={{ position: 'fixed', inset: 0, zIndex: 3000, pointerEvents: 'none', overflow: 'hidden' }}>
      {panel('left')}{panel('right')}
      <motion.div aria-hidden="true" initial={{ opacity: 0, scale: .6 }} animate={{ opacity: phase >= 1 && !out ? 1 : 0, scale: phase >= 1 ? 1.05 : .6 }} transition={{ duration: .9 }}
        style={{ position: 'fixed', inset: 0, zIndex: 2, background: `radial-gradient(circle at 50% 50%, ${accent}55 0%, ${accent}1f 28%, transparent 58%)` }} />
      <motion.div aria-hidden="true" initial={{ opacity: 0 }} animate={{ opacity: phase === 2 ? 1 : 0 }} transition={{ duration: .6 }}
        style={{ position: 'fixed', inset: 0, zIndex: 2, background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(5,4,7,.88) 100%)' }} />
      {phase >= 1 && <div style={{ position: 'fixed', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 18px', textAlign: 'center', color: '#fff' }}>
        <motion.small initial={{ opacity: 0, y: 10 }} animate={{ opacity: out ? 0 : 1, y: 0 }} transition={{ duration: .6 }}
          style={{ fontFamily: display, fontSize: 'clamp(10px,3vw,14px)', letterSpacing: '.3em', color: '#f6c7df', textShadow: '0 0 18px #000' }}>{kicker}</motion.small>
        <div style={{ filter: `drop-shadow(0 0 26px ${accent}aa)` }}>
          <motion.div initial={{ opacity: 0, filter: 'blur(14px)', scale: 1.25 }} animate={{ opacity: out ? 0 : 1, filter: out ? 'blur(6px)' : 'blur(0px)', scale: out ? 1.1 : 1 }} transition={{ duration: out ? .6 : 1.1, delay: out ? 0 : .15, ease: 'easeOut' }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.02 }}>
            {words.map((w, i) => <strong key={i} style={{ fontFamily: display, fontWeight: 700, letterSpacing: '.06em', fontSize: `clamp(${words.length > 1 ? 40 : 34}px,${words.length > 1 ? 15 : 11}vw,${words.length > 1 ? 96 : 80}px)`, background: 'linear-gradient(90deg,#fff0f7,#f5a7d1,#ffe8ad)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' }}>{w}</strong>)}
          </motion.div>
        </div>
        <motion.em initial={{ opacity: 0, y: 18 }} animate={{ opacity: out ? 0 : 1, y: out ? -6 : 0 }} transition={{ duration: .7, delay: out ? 0 : .9 }}
          style={{ fontFamily: script || display, fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(28px,9vw,60px)', color: '#fff1f7', textShadow: `0 0 28px ${accent}99`, maxWidth: '92vw', overflowWrap: 'anywhere' }}>{name}</motion.em>
      </div>}
    </div>,
    document.body,
  )
}
