import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { audio } from '../../lib/audioManager'
import { hostedBirthdayVideo } from '../../data'
import FullScreenFX from '../FullScreenFX'

// party effects around the video frame: balloons tied to both sides, twinkling stars on the corners, confetti when it starts, hearts rising across the screen
const BALLOONS = [{ l: 1, x: -44, y: 8, s: 1.05, d: 0 }, { l: 1, x: -30, y: 36, s: .8, d: .25 }, { l: 1, x: -48, y: 62, s: .92, d: .5 }, { l: 0, x: -44, y: 14, s: .95, d: .15 }, { l: 0, x: -30, y: 42, s: 1.05, d: .4 }, { l: 0, x: -48, y: 68, s: .82, d: .65 }]
const STARS = [{ t: '-14px', l: '-14px' }, { t: '-14px', r: '-14px' }, { b: '-14px', l: '-14px' }, { b: '-14px', r: '-14px' }, { t: '46%', l: '-22px' }, { t: '46%', r: '-22px' }]
const CONFETTI = Array.from({ length: 26 }, (_, i) => ({ dx: Math.cos(i * 2.399) * (90 + (i % 5) * 38), dy: Math.sin(i * 2.399) * (110 + (i % 4) * 42) - 40, r: `${(i * 83) % 540}deg`, c: i }))

/** Videos play up to 15 seconds; anything longer is cut off so scenes stay snappy. */
const MAX_VIDEO_MS = 15000
type Phase = 'enter' | 'play' | 'leave'
// Pendulum: the card hangs from a nail on two wires. It is released from the side and swings in with a decaying swing,
// plays, then swings out with growing swings until it lets go and drops away.
const ENTER = { rotate: [70, -44, 28, -17, 9, -4, 0], opacity: 1 }
const LEAVE = { rotate: [0, -16, 34, -58, 84], y: ['0vh', '0vh', '0vh', '3vh', '45vh'], opacity: [1, 1, 1, 1, 0] }
/** Cat video in its own scene: swings in on a wire → video plays → swings out → next scene. */
export default function CatVideoScene({ palette, onDone, buzz, src, custom }: { palette: string[]; onDone: () => void; buzz: (p: number | number[]) => void; src?: string; custom?: boolean }) {
  const [phase, setPhase] = useState<Phase>('enter')
  const [needsTap, setNeedsTap] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const finished = useRef(false)
  const cap = useRef(0)
  const timers = useRef<number[]>([])
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const play = useCallback(() => {
    const v = video.current; if (!v) return
    v.play().then(() => setNeedsTap(false)).catch(() => setNeedsTap(true))
  }, [])
  useEffect(() => () => { window.clearTimeout(cap.current); timers.current.forEach(window.clearTimeout); audio.resumeAfterVideo() }, [])
  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    audio.resumeAfterVideo()            // continue the soundtrack from the saved timestamp
    buzz([20, 30, 20]); setPhase('leave')
    timers.current.push(window.setTimeout(onDone, reduced ? 100 : 2500))
  }, [buzz, onDone, reduced])
  const entered = () => { if (phase === 'enter') { setPhase('play'); audio.pauseForVideo(); play() } }   // music pauses at its current timestamp
  const colors = palette.length ? palette : ['#ff8fc2', '#ffd36e', '#a68bff']
  return <div className={`cv-scene cv-${phase}`}>
    <FullScreenFX><div style={{ position: 'absolute', inset: 0 }}>{Array.from({ length: 10 }, (_, i) => <i key={i} className="cvx-heart" style={{ left: `${6 + i * 9.5}%`, color: colors[i % colors.length], ['--d' as string]: `${i * .7}s`, fontStyle: 'normal' } as React.CSSProperties}>♥</i>)}</div></FullScreenFX>
    <div className="cv-clouds" aria-hidden="true"><i /><i /><i /><i /></div>
    <p className="eyebrow">A LITTLE SOMETHING SWINGING YOUR WAY</p>
    <div className="cv-hang" style={{ ['--c' as string]: palette[0] || '#ffd36e' } as React.CSSProperties}>
      <span className="cv-nail" />
      <motion.div className="cv-rig" style={{ transformOrigin: '50% -120px' }} initial={{ rotate: 70, opacity: 0 }}
        animate={phase === 'leave' ? LEAVE : ENTER}
        transition={phase === 'leave' ? { duration: reduced ? .05 : 2.6, times: [0, .2, .42, .72, 1], ease: 'easeInOut' } : { rotate: { duration: reduced ? .05 : 3.4, times: [0, .2, .38, .55, .72, .87, 1], ease: 'easeInOut' }, opacity: { duration: .4 } }}
        onAnimationComplete={entered}>
        <svg className="cv-wire" viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true"><line x1="50" y1="0" x2="8" y2="120" /><line x1="50" y1="0" x2="92" y2="120" /></svg>
        {BALLOONS.map((b, i) => <span key={i} className="cvx-b" aria-hidden="true" style={{ [b.l ? 'left' : 'right']: b.x, top: `${b.y}%`, ['--s' as string]: b.s, ['--d' as string]: `${b.d}s`, ['--c' as string]: colors[i % colors.length] } as React.CSSProperties} />)}
        {STARS.map((st, i) => <span key={i} className="cvx-star" aria-hidden="true" style={{ top: st.t, bottom: st.b, left: st.l, right: st.r, ['--d' as string]: `${i * .35}s` } as React.CSSProperties}>✦</span>)}
        {phase !== 'enter' && <div className="cvx-burst" aria-hidden="true">{CONFETTI.map((c, i) => <i key={i} style={{ ['--dx' as string]: `${c.dx}px`, ['--dy' as string]: `${c.dy}px`, ['--r' as string]: c.r, ['--c' as string]: colors[c.c % colors.length] } as React.CSSProperties} />)}</div>}
        <div className={`cv-card ${custom ? 'cv-custom' : ''}`} aria-label="Video surprise">
          <video ref={video} src={src || hostedBirthdayVideo} playsInline preload="auto" onPlay={() => { audio.pauseForVideo(); window.clearTimeout(cap.current); cap.current = window.setTimeout(() => finish(), MAX_VIDEO_MS) }} onEnded={finish} onError={finish} onPause={e => { if (!e.currentTarget.ended && phase === 'play' && !finished.current) setNeedsTap(true) }} />
          {needsTap && phase === 'play' && <button className="cv-tap" onClick={() => { play() }}><Play size={22} fill="currentColor" /> Tap to play</button>}
        </div>
      </motion.div>
    </div>
  </div>
}
