import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { openerCopy, openerFor, openerLine, type OpenerKind } from '../../lib/worlds'
import type { Occasion, Relation } from '../../types'

const TAPS = 3
type Props = { relation?: Relation; occasion: Occasion; onHit: () => void; buzz: (p: number | number[]) => void; onGesture?: () => void }

/** The opening for everybody who is not a partner: three taps on one emblem that changes with every tap (no bow, no heart). */
export default function RelationOpener({ relation, occasion, onHit, buzz, onGesture }: Props) {
  const kind = openerFor(relation)
  const copy = openerCopy[(kind === 'bow' ? 'popper' : kind) as Exclude<OpenerKind, 'bow'>]
  const [taps, setTaps] = useState(0)
  const [puffs, setPuffs] = useState<{ id: number; x: number; e: string }[]>([])
  const timers = useRef<number[]>([])
  const idRef = useRef(0)
  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])
  const done = taps >= TAPS
  const tap = () => {
    if (done) return
    onGesture?.()
    const n = taps + 1
    setTaps(n)
    buzz(n >= TAPS ? [30, 40, 90] : 14)
    const burst = Array.from({ length: 5 }, (_, i) => ({ id: ++idRef.current, x: (i - 2) * 26 + ((idRef.current * 7) % 14), e: copy.stages[(n + i) % copy.stages.length] }))
    setPuffs(p => [...p, ...burst])
    timers.current.push(window.setTimeout(() => setPuffs(p => p.filter(x => !burst.some(b => b.id === x.id))), 1100))
    if (n >= TAPS) timers.current.push(window.setTimeout(onHit, 750))
  }
  const stage = copy.stages[Math.min(taps, copy.stages.length - 1)]
  const grow = 1 + taps * .18
  return <div className={`ro ro-${kind}`}>
    <p className="ro-line">{openerLine(occasion)}</p>
    <button type="button" className="ro-stage" onClick={tap} aria-label={copy.hint} disabled={done}>
      {kind === 'fistbump'
        ? <span className="ro-fists" aria-hidden="true">
            <motion.span animate={{ x: done ? 8 : 60 - taps * 22, rotate: done ? 0 : -12 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}>🤜</motion.span>
            <motion.span animate={{ x: done ? -8 : -60 + taps * 22, rotate: done ? 0 : 12 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}>🤛</motion.span>
          </span>
        : <AnimatePresence mode="wait"><motion.span key={stage} className="ro-emblem" aria-hidden="true" initial={{ scale: .4, opacity: 0, rotate: -14 }} animate={{ scale: grow, opacity: 1, rotate: 0 }} exit={{ scale: 1.3, opacity: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 13 }}>{stage}</motion.span></AnimatePresence>}
      {kind === 'butterfly' && taps > 0 && <span className="ro-flock" aria-hidden="true">{Array.from({ length: taps * 4 }, (_, i) => <b key={i} style={{ ['--i' as string]: i, ['--dx' as string]: `${((i * 53) % 220) - 110}px`, ['--dy' as string]: `${-80 - ((i * 37) % 170)}px`, ['--hue' as string]: `${(i * 47) % 360}` } as CSSProperties}><i /><i /></b>)}</span>}
      <span className="ro-puffs" aria-hidden="true">{puffs.map(p => <i key={p.id} style={{ left: `calc(50% + ${p.x}px)` }}>{p.e}</i>)}</span>
    </button>
    <div className="ro-dots" aria-hidden="true">{Array.from({ length: TAPS }, (_, i) => <i key={i} className={i < taps ? 'on' : ''} />)}</div>
    <p className="ro-hint" role="status">{done ? copy.done : copy.hint}</p>
  </div>
}
