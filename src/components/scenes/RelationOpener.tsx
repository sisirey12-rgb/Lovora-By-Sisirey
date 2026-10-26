import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { openerCopy, openerFor, openerLine, type OpenerKind } from '../../lib/worlds'
import { Shape, type FloatKind } from '../Floaties'
import { sfx } from '../../lib/sfx'
import type { Occasion, Relation } from '../../types'

const TAPS = 3
type Props = { relation?: Relation; occasion: Occasion; onHit: () => void; buzz: (p: number | number[]) => void; onGesture?: () => void; colors?: string[] }
const STAMP: Record<string, string> = { fistbump: 'BOOM', butterfly: 'FLY', bloom: 'BLOOM', trophy: 'CHAMPION', popper: 'POP' }
const BURST: Record<string, FloatKind[]> = { fistbump: ['bolt', 'star', 'sparkle'], butterfly: ['butterfly', 'sparkle', 'flower'], bloom: ['flower', 'leaf', 'sparkle'], trophy: ['star', 'sparkle', 'confetti'], popper: ['confetti', 'balloon', 'star'] }
const FALLBACK = ['#ff8fc2', '#ffd36e', '#7fd6ff', '#b79bff']
const R = 46, CIRC = 2 * Math.PI * R

/** The opening for everybody who is not a partner. Three taps charge a glowing ring; each tap changes the emblem, sends a shockwave and a burst of shapes in the theme colours, and the last one explodes into the story. */
export default function RelationOpener({ relation, occasion, onHit, buzz, onGesture, colors }: Props) {
  const kind = openerFor(relation)
  const copy = openerCopy[(kind === 'bow' ? 'popper' : kind) as Exclude<OpenerKind, 'bow'>]
  const pal = colors?.length ? colors : FALLBACK
  const [taps, setTaps] = useState(0), [flash, setFlash] = useState(false)
  const [bursts, setBursts] = useState<{ id: number; items: { k: FloatKind; c: string; dx: number; dy: number; r: number; s: number }[] }[]>([])
  const [waves, setWaves] = useState<number[]>([])
  const timers = useRef<number[]>([]), idRef = useRef(0)
  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])
  const done = taps >= TAPS, last = taps === TAPS - 1
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }
  const tap = () => {
    if (done) return
    onGesture?.(); sfx.unlock()
    const n = taps + 1, id = ++idRef.current, big = n >= TAPS
    setTaps(n); buzz(big ? [30, 40, 90] : 16)
    if (big) { sfx.fanfare(); sfx.boom('confetti'); setFlash(true); later(() => setFlash(false), 520) } else { sfx.sparkle(); sfx.pop() }
    const count = big ? 26 : 12, kinds = BURST[kind] || BURST.popper
    const items = Array.from({ length: count }, (_, i) => { const a = (i / count) * Math.PI * 2 + id, d = (big ? 150 : 95) + ((i * 37) % 60); return { k: kinds[i % kinds.length], c: pal[i % pal.length], dx: Math.cos(a) * d, dy: Math.sin(a) * d - 20, r: (i * 53) % 360, s: 16 + (i % 3) * 6 } })
    setBursts(b => [...b, { id, items }]); setWaves(w => [...w, id])
    later(() => setBursts(b => b.filter(x => x.id !== id)), 1300); later(() => setWaves(w => w.filter(x => x !== id)), 900)
    if (big) later(onHit, 950)
  }
  const stage = copy.stages[Math.min(taps, copy.stages.length - 1)]
  const grow = 1 + taps * .16
  const style = { ['--ro-a' as string]: pal[0], ['--ro-b' as string]: pal[1 % pal.length], ['--ro-p' as string]: taps / TAPS } as CSSProperties
  return <div className={`ro ro2 ro-${kind} ${flash ? 'ro-flash' : ''}`} style={style}>
    <p className="ro-line">{openerLine(occasion)}</p>
    <button type="button" className={`ro-stage ro2-stage t${taps}`} onClick={tap} onContextMenu={e => e.preventDefault()} aria-label={copy.hint} disabled={done}>
      <span className="ro2-aura" aria-hidden="true" />
      <svg className="ro2-ring" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r={R} className="bg" /><circle cx="50" cy="50" r={R} className="fg" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - taps / TAPS)} transform="rotate(-90 50 50)" /></svg>
      <span className="ro2-orbit" aria-hidden="true" style={{ ['--spd' as string]: `${Math.max(2.2, 9 - taps * 3)}s` } as CSSProperties}>{[0, 1, 2, 3, 4].map(i => <i key={i} style={{ ['--i' as string]: i } as CSSProperties}><Shape kind={(BURST[kind] || BURST.popper)[i % 3]} color={pal[i % pal.length]} size={14} /></i>)}</span>
      {!done && <span className="ro2-ping" aria-hidden="true" />}
      {waves.map(w => <span key={w} className="ro2-wave" aria-hidden="true" />)}
      {kind === 'fistbump'
        ? <span className="ro-fists" aria-hidden="true">
            <motion.span animate={{ x: done ? 10 : 62 - taps * 24, rotate: done ? 0 : -14 + taps * 4, scale: done ? 1.15 : 1 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }}>🤜</motion.span>
            <motion.span animate={{ x: done ? -10 : -62 + taps * 24, rotate: done ? 0 : 14 - taps * 4, scale: done ? 1.15 : 1 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }}>🤛</motion.span>
          </span>
        : <AnimatePresence mode="wait"><motion.span key={stage} className="ro-emblem" aria-hidden="true" initial={{ scale: .3, opacity: 0, rotate: -18, y: 20 }} animate={{ scale: grow, opacity: 1, rotate: 0, y: 0 }} exit={{ scale: 1.5, opacity: 0, rotate: 12 }} transition={{ type: 'spring', stiffness: 230, damping: 11 }}>{stage}</motion.span></AnimatePresence>}
      {kind === 'butterfly' && taps > 0 && <span className="ro-flock" aria-hidden="true">{Array.from({ length: taps * 4 }, (_, i) => <b key={i} style={{ ['--i' as string]: i, ['--dx' as string]: `${((i * 53) % 220) - 110}px`, ['--dy' as string]: `${-80 - ((i * 37) % 170)}px`, ['--hue' as string]: `${(i * 47) % 360}` } as CSSProperties}><i /><i /></b>)}</span>}
      {bursts.map(b => <span key={b.id} className="ro2-burst" aria-hidden="true">{b.items.map((it, i) => <i key={i} style={{ ['--dx' as string]: `${it.dx}px`, ['--dy' as string]: `${it.dy}px`, ['--r' as string]: `${it.r}deg` } as CSSProperties}><Shape kind={it.k} color={it.c} size={it.s} /></i>)}</span>)}
    </button>
    {done && <motion.div className="ro2-stamp" initial={{ scale: 2.4, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: -4 }} transition={{ type: 'spring', stiffness: 240, damping: 14 }} aria-hidden="true">{STAMP[kind] || 'POP'}</motion.div>}
    <div className="ro-dots" aria-hidden="true">{Array.from({ length: TAPS }, (_, i) => <i key={i} className={i < taps ? 'on' : ''} />)}</div>
    <p className="ro-hint" role="status">{done ? copy.done : last ? 'One more. Make it count.' : taps === 1 ? 'Again. It is working.' : copy.hint}</p>
  </div>
}
