import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { audio } from '../../lib/audioManager'
import { hostedBirthdayVideo } from '../../data'

type Phase = 'enter' | 'play' | 'leave'
// Pendulum: the card hangs from a nail on two wires. It is released from the side and swings in with a decaying swing,
// plays, then swings out with growing swings until it lets go and drops away.
const ENTER = { rotate: [70, -44, 28, -17, 9, -4, 0], opacity: 1 }
const LEAVE = { rotate: [0, -16, 34, -58, 84], y: ['0vh', '0vh', '0vh', '3vh', '45vh'], opacity: [1, 1, 1, 1, 0] }
/** Cat video in its own scene: swings in on a wire → video plays → swings out → next scene. */
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
    timers.current.push(window.setTimeout(onDone, reduced ? 100 : 2500))
  }, [buzz, onDone, reduced])
  const entered = () => { if (phase === 'enter') { setPhase('play'); audio.pauseForVideo(); play() } }   // music pauses at its current timestamp
  return <div className={`cv-scene cv-${phase}`}>
    <div className="cv-clouds" aria-hidden="true"><i /><i /><i /><i /></div>
    <p className="eyebrow">A LITTLE SOMETHING SWINGING YOUR WAY</p>
    <div className="cv-hang" style={{ ['--c' as string]: palette[0] || '#ffd36e' } as React.CSSProperties}>
      <span className="cv-nail" />
      <motion.div className="cv-rig" style={{ transformOrigin: '50% -120px' }} initial={{ rotate: 70, opacity: 0 }}
        animate={phase === 'leave' ? LEAVE : ENTER}
        transition={phase === 'leave' ? { duration: reduced ? .05 : 2.6, times: [0, .2, .42, .72, 1], ease: 'easeInOut' } : { rotate: { duration: reduced ? .05 : 3.4, times: [0, .2, .38, .55, .72, .87, 1], ease: 'easeInOut' }, opacity: { duration: .4 } }}
        onAnimationComplete={entered}>
        <svg className="cv-wire" viewBox="0 0 100 120" preserveAspectRatio="none" aria-hidden="true"><line x1="50" y1="0" x2="8" y2="120" /><line x1="50" y1="0" x2="92" y2="120" /></svg>
        <div className="cv-card" aria-label="Portrait cat video">
          <video ref={video} src={hostedBirthdayVideo} playsInline preload="auto" onPlay={() => audio.pauseForVideo()} onEnded={finish} onError={finish} onPause={e => { if (!e.currentTarget.ended && phase === 'play' && !finished.current) setNeedsTap(true) }} />
          {needsTap && phase === 'play' && <button className="cv-tap" onClick={() => { play() }}><Play size={22} fill="currentColor" /> Tap to play</button>}
        </div>
      </motion.div>
    </div>
  </div>
}
