import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'

/**
 * Full-screen "split screen" birthday reveal, played when the arrow hits the heart.
 *
 * Why a portal: the old reveal was position:fixed INSIDE the scene. The scene (and .scene-content) carry transforms /
 * overflow:hidden, which turn "fixed" into "relative to that box". Once the bow was removed that box was empty, so the
 * reveal collapsed to nothing and the player showed a blank purple screen. Here it is rendered straight into <body>,
 * all styling is inline (no CSS file can override it) and every step is driven by framer-motion keyframes.
 *
 * Timeline (D seconds):
 *   0.0 - 0.6  two black halves slide in from the sides and meet in the middle (pink seam lights up)
 *   0.9 - 2.4  spotlight focuses on the centre: "MADE JUST FOR YOU", then HAPPY BIRTHDAY pulls from blur into sharp focus, then the name
 *   3.0 - 4.0  the halves split apart again; a vignette keeps the eye on the title while the scene appears behind it
 *   4.4 - 5.0  everything fades out, then onDone() moves the story on
 */
export const REVEAL_SECONDS = 5

type Props = { kicker?: string; title: string; name: string; display?: string; script?: string; accent?: string; onDone: () => void }

export default function BirthdayReveal({ kicker = 'MADE JUST FOR YOU', title, name, display, script, accent = '#ff8fc2', onDone }: Props) {
  useEffect(() => { const t = window.setTimeout(onDone, REVEAL_SECONDS * 1000); return () => window.clearTimeout(t) }, [onDone])
  const D = REVEAL_SECONDS
  const words = title.split(' ').filter(Boolean)
  const base = { position: 'fixed' as const, top: 0, bottom: 0 }
  const panel = (side: 'left' | 'right') => (
    <motion.div key={side} aria-hidden="true"
      style={{ ...base, [side]: 0, width: '50.6%', background: 'linear-gradient(180deg,#050407,#0b0610 60%,#050407)', zIndex: 1, willChange: 'transform' }}
      initial={{ x: side === 'left' ? '-101%' : '101%' }}
      animate={{ x: [side === 'left' ? '-101%' : '101%', '0%', '0%', side === 'left' ? '-101%' : '101%'] }}
      transition={{ duration: D, times: [0, .11, .6, .8], ease: ['easeOut', 'linear', [.76, 0, .24, 1]] }} />
  )
  const fade = (times: number[], opacity: number[], extra: Record<string, unknown[]> = {}) => ({
    initial: { opacity: 0 }, animate: { opacity, ...extra }, transition: { duration: D, times, ease: 'easeInOut' as const },
  })
  return createPortal(
    <div role="status" aria-live="polite" aria-label={`${title} ${name}`} style={{ position: 'fixed', inset: 0, zIndex: 3000, pointerEvents: 'none', overflow: 'hidden' }}>
      {panel('left')}{panel('right')}
      {/* pink seam where the two halves meet */}
      <motion.div aria-hidden="true" style={{ ...base, left: 'calc(50% - 1px)', width: 2, zIndex: 2, background: `linear-gradient(180deg,transparent,${accent},#fff,${accent},transparent)`, boxShadow: `0 0 24px 4px ${accent}` }}
        {...fade([0, .1, .14, .58, .64, 1], [0, 0, 1, 1, 0, 0])} />
      {/* spotlight that focuses the eye on the centre */}
      <motion.div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 2, background: `radial-gradient(circle at 50% 50%, ${accent}55 0%, ${accent}1f 28%, transparent 58%)` }}
        {...fade([0, .12, .3, .6, .82], [0, 0, 1, 1, 0], { scale: [.6, .6, 1, 1.12, 1.3] })} />
      {/* vignette: after the halves open the dark edges stay a moment so only the title is in focus */}
      <motion.div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 2, background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(5,4,7,.88) 100%)' }}
        {...fade([0, .5, .6, .72, .9, 1], [0, 0, 0, 1, 1, 0])} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 18px', textAlign: 'center', color: '#fff' }}>
        <motion.small style={{ fontFamily: display, fontSize: 'clamp(10px,3vw,14px)', letterSpacing: '.3em', color: '#f6c7df', textShadow: '0 0 18px #000' }}
          {...fade([0, .17, .26, .88, 1], [0, 0, 1, 1, 0], { y: [10, 10, 0, 0, 0] })}>{kicker}</motion.small>
        <div style={{ filter: `drop-shadow(0 0 26px ${accent}aa)` }}>
          <motion.div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.02 }}
            {...fade([0, .2, .4, .88, 1], [0, 0, 1, 1, 0], { filter: ['blur(22px)', 'blur(22px)', 'blur(0px)', 'blur(0px)', 'blur(8px)'], scale: [1.35, 1.35, 1, 1.05, 1.12] })}>
            {words.map((w, i) => <strong key={i} style={{ fontFamily: display, fontWeight: 700, letterSpacing: '.06em', fontSize: `clamp(${words.length > 1 ? 40 : 34}px,${words.length > 1 ? 15 : 11}vw,${words.length > 1 ? 96 : 80}px)`, background: 'linear-gradient(90deg,#fff0f7,#f5a7d1,#ffe8ad)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent' }}>{w}</strong>)}
          </motion.div>
        </div>
        <motion.em style={{ fontFamily: script || display, fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(28px,9vw,60px)', color: '#fff1f7', textShadow: `0 0 28px ${accent}99`, maxWidth: '92vw', overflowWrap: 'anywhere' }}
          {...fade([0, .34, .5, .88, 1], [0, 0, 1, 1, 0], { y: [18, 18, 0, 0, -6] })}>{name}</motion.em>
      </div>
    </div>,
    document.body,
  )
}
