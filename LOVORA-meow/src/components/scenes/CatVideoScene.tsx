import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, SkipForward } from 'lucide-react'
import { audio } from '../../lib/audioManager'
import { hostedBirthdayVideo } from '../../data'

type Phase = 'enter' | 'play' | 'leave'
const BALLOONS = [
  { x: '-4%', c: 0, d: 0 }, { x: '18%', c: 3, d: .12 }, { x: '40%', c: 1, d: .05 }, { x: '62%', c: 4, d: .18 }, { x: '84%', c: 2, d: .1 }, { x: '100%', c: 5, d: .22 },
]
/** Cat video in its own scene: card + balloons animate in → video plays → balloons lift the card away → next scene. */
export default function CatVideoScene({ palette, onDone, buzz }: { palette: string[]; onDone: () => void; buzz: (p: number | number[]) => void }) {
  const [phase, setPhase] = useState<Phase>('enter')
  const [needsTap, setNeedsTap] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const finished = useRef(false)
  const timers = useRef<number[]>([])
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const play = useCallback(() => {
    const v = video.current; if (!v) return
    v.play().then(() => setNeedsTap(false)).catch(() => setNeedsTap(true))
  }, [])
  useEffect(() => () => { timers.current.forEach(window.clearTimeout); audio.resumeAfterVideo() }, [])
  const finish = useCallback(() => {
    if (finished.current) return
    finished.current = true
    audio.resumeAfterVideo()            // continue the soundtrack from the saved timestamp
    buzz([20, 30, 20]); setPhase('leave')
    timers.current.push(window.setTimeout(onDone, reduced ? 100 : 2100))
  }, [buzz, onDone, reduced])
  const entered = () => { if (phase === 'enter') { setPhase('play'); audio.pauseForVideo(); play() } }   // music pauses at its current timestamp
  return <div className={`cv-scene cv-${phase}`}>
    <div className="cv-sparkles" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ ['--i' as string]: i } as React.CSSProperties} />)}</div>
    <p className="eyebrow">A LITTLE SOMETHING FLOATING YOUR WAY</p>
    <motion.div className="cv-rig" initial={{ y: '55vh', rotate: -7, opacity: 0, scale: .7 }} animate={phase === 'leave' ? { y: [0, 22, '-130vh'], rotate: [0, 0, 5], opacity: [1, 1, 1], scale: [1, .96, 1.04] } : { y: 0, rotate: 0, opacity: 1, scale: 1 }}
      transition={phase === 'leave' ? { duration: reduced ? .05 : 2.4, times: [0, .14, 1], ease: 'easeInOut' } : { type: 'spring', stiffness: 52, damping: 10, mass: 1.2 }} onAnimationComplete={entered}>
      <div className="cv-balloons" aria-hidden="true">
        {BALLOONS.map((b, i) => <span key={i} className="cv-balloon" style={{ left: b.x, ['--c' as string]: palette[b.c % palette.length], ['--d' as string]: `${b.d}s` } as React.CSSProperties}><svg viewBox="0 0 40 56"><path d="M20 50 C14 42 1 33 3 18 C5 6 17 4 20 14 C23 4 35 6 37 18 C39 33 26 42 20 50Z" fill="var(--c)" /><path d="M9 14 Q12 8 17 11" stroke="#fff" strokeOpacity=".7" strokeWidth="2.4" fill="none" strokeLinecap="round" /><path d="M20 50 L16 55 L24 55Z" fill="var(--c)" /></svg><i className="cv-string" /></span>)}
      </div>
      <div className="cv-card" aria-label="Portrait cat video">
        <video ref={video} src={hostedBirthdayVideo} playsInline preload="auto" onPlay={() => audio.pauseForVideo()} onEnded={finish} onError={finish} onPause={e => { if (!e.currentTarget.ended && phase === 'play' && !finished.current) setNeedsTap(true) }} />
        {needsTap && phase === 'play' && <button className="cv-tap" onClick={() => { play() }}><Play size={22} fill="currentColor" /> Tap to play</button>}
      </div>
    </motion.div>
    {phase === 'play' && <button className="text-btn cv-skip" onClick={() => { video.current?.pause(); finish() }}>Skip <SkipForward size={14} /></button>}
  </div>
}
