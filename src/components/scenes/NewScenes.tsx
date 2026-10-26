import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import { sfx } from '../../lib/sfx'
import type { Experience } from '../../types'

type Buzz = (p: number | number[]) => void
type P = { exp: Experience; colors: string[]; onDone: () => void; buzz: Buzz }
const Next = ({ onClick, label = 'Continue' }: { onClick: () => void; label?: string }) => <button className="primary-btn occ-next" onClick={onClick}>{label} <ArrowRight size={16} /></button>
const pick = (a: string[] | undefined, fallback: string[], n: number) => { const l = (a || []).map(x => x.trim()).filter(Boolean); return (l.length ? l : fallback).slice(0, n) }
const firstSentence = (t: string, max = 150) => { const s = (t || '').trim().split(/(?<=[.!?])\s/)[0] || ''; return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s }

/* ---- ROSE PETALS: touch the rose, petals rain down and a line is written in them ---- */
export function PetalFall({ exp, colors, onDone, buzz }: P) {
  const [on, setOn] = useState(false)
  const line = exp.extras?.starNote?.trim() || firstSentence(exp.message) || 'Every petal is a little thank you.'
  const petals = useMemo(() => Array.from({ length: 34 }, (_, i) => ({ x: (i * 29 + 7) % 100, d: (i % 11) * .16, s: 14 + (i * 7) % 16, c: colors[i % colors.length] || '#ff8fc2', sway: (i % 2 ? 1 : -1) * (20 + (i * 5) % 40) })), [colors])
  const go = () => { if (on) return; sfx.unlock(); setOn(true); buzz([25, 30, 25, 30, 70]); sfx.chime() }
  return <div className="scene-content occ-scene ns-petal">
    <p className="eyebrow">A SMALL BLOOM</p><h1>Touch the <em>rose.</em></h1>
    <div className={`ns-rosewrap ${on ? 'on' : ''}`}>
      <button type="button" className="ns-rose" onClick={go} aria-label="Touch the rose to make petals fall">
        <svg viewBox="0 0 120 150" aria-hidden="true"><path d="M60 80 C58 110 62 130 60 148" stroke="#3f8f5a" strokeWidth="5" fill="none" strokeLinecap="round" /><path d="M60 118 C44 108 34 112 28 120 C40 124 52 124 60 118Z" fill="#4faa6c" /><circle cx="60" cy="52" r="34" fill={colors[0] || '#e8588f'} /><path d="M60 24 C84 30 92 56 70 72 C58 80 42 70 44 54 C46 42 60 40 66 50" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="3" strokeLinecap="round" /><path d="M36 50 C40 74 74 82 88 52" fill="none" stroke="rgba(0,0,0,.18)" strokeWidth="3" strokeLinecap="round" /></svg>
        {!on && <span className="ns-pulse" aria-hidden="true" />}
      </button>
      {on && <div className="ns-petals" aria-hidden="true">{petals.map((p, i) => <i key={i} style={{ left: `${p.x}%`, width: p.s, height: p.s * 1.25, background: p.c, animationDelay: `${p.d}s`, ['--sw' as string]: `${p.sway}px` } as CSSProperties} />)}</div>}
    </div>
    {!on ? <small className="muted">Touch the rose</small> : <div className="occ-result ns-line"><small>Written in petals</small><strong>{line}</strong></div>}
    {on && <Next onClick={onDone} />}
  </div>
}

/* ---- SHOOTING STARS: catch the streaks, each one carries a wish ---- */
export function ShootingStars({ exp, colors, onDone, buzz }: P) {
  const wishes = useMemo(() => pick(exp.moments?.length ? exp.moments : exp.balloonWishes, ['You light up every room.', 'You deserve every good thing.', 'You are loved, always.'], 3), [exp.moments, exp.balloonWishes])
  const [caught, setCaught] = useState<number[]>([]), [shown, setShown] = useState('')
  const catchStar = (i: number) => { if (caught.includes(i)) return; sfx.unlock(); setCaught(c => [...c, i]); setShown(wishes[i % wishes.length]); buzz([20, 25, 20]); sfx.chime() }
  const done = caught.length >= wishes.length
  const tracks = [{ top: 14, delay: 0, dur: 3.6 }, { top: 34, delay: 1.2, dur: 4.2 }, { top: 56, delay: .6, dur: 3.9 }]
  return <div className="scene-content occ-scene ns-stars">
    <p className="eyebrow">CATCH THEM BEFORE THEY FADE</p><h1>Shooting <em>stars.</em></h1>
    <div className="ns-sky" aria-label="Night sky with shooting stars">
      {Array.from({ length: 26 }, (_, i) => <b key={i} style={{ left: `${(i * 37) % 100}%`, top: `${(i * 19) % 100}%`, animationDelay: `${(i % 6) * .5}s` }} />)}
      {tracks.slice(0, wishes.length).map((t, i) => !caught.includes(i) && <button key={i} type="button" className="ns-shoot" onClick={() => catchStar(i)} aria-label={`Catch shooting star ${i + 1}`} style={{ top: `${t.top}%`, animationDelay: `${t.delay}s`, animationDuration: `${t.dur}s`, ['--c' as string]: colors[i % colors.length] || '#ffd36e' } as CSSProperties}><span /></button>)}
    </div>
    <p className="muted ns-count">{caught.length} / {wishes.length} caught</p>
    {shown && <div className="occ-result ns-line" key={shown}><small>A wish for you</small><strong>{shown}</strong></div>}
    {done && <Next onClick={onDone} />}
    {!done && caught.length === 0 && <small className="muted">Tap a star as it flies past</small>}
  </div>
}

/* ---- PASS THE PARCEL: unwrap the layers, each one hides a note ---- */
export function Parcel({ exp, colors, onDone, buzz }: P) {
  const notes = useMemo(() => pick(exp.balloonWishes, ['Layer one: you are my favourite.', 'Layer two: keep going, there is more.', 'Last layer: this is all for you.'], 3), [exp.balloonWishes])
  const [layer, setLayer] = useState(0), [flash, setFlash] = useState(false)
  const total = notes.length
  const peel = () => { if (layer >= total) return; sfx.unlock(); setFlash(true); window.setTimeout(() => setFlash(false), 450); setLayer(l => l + 1); buzz([18, 22, 18]); layer + 1 >= total ? (sfx.chime(), sfx.boom('confetti')) : sfx.pop(layer) }
  const wrap = [colors[0] || '#ff8fc2', colors[1] || '#ffd36e', colors[2] || '#7fd6ff']
  return <div className="scene-content occ-scene ns-parcel">
    <p className="eyebrow">PASS THE PARCEL</p><h1>Unwrap the <em>layers.</em></h1>
    <div className="ns-pwrap">
      {layer < total ? <button type="button" key={layer} className={`ns-pkg ${flash ? 'tear' : ''}`} onClick={peel} aria-label="Tear off a layer of wrapping paper" style={{ ['--w' as string]: wrap[layer % wrap.length], ['--s' as string]: 1 - layer * .12 } as CSSProperties}><i className="ns-ribbon" /><i className="ns-ribbon h" /><b /></button>
        : <div className="ns-open" aria-hidden="true">🎁</div>}
      {flash && <span className="ns-scraps" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <u key={i} style={{ ['--a' as string]: `${i * 30}deg`, background: wrap[layer % wrap.length] } as CSSProperties} />)}</span>}
    </div>
    <p className="muted">{layer < total ? `Layer ${layer + 1} of ${total}: tap to tear` : 'All unwrapped!'}</p>
    <div className="ns-notes">{notes.slice(0, layer).map((n, i) => <p key={i} className={i === layer - 1 ? 'latest' : ''}><span>{i + 1}</span>{n}</p>)}</div>
    {layer >= total && <Next onClick={onDone} />}
  </div>
}

/* ---- MESSAGE IN A BOTTLE: it drifts in on the waves, pull the cork ---- */
export function Bottle({ exp, onDone, buzz }: P) {
  const [corked, setCorked] = useState(true)
  const text = useRef(firstSentence(exp.message, 220) || 'I wanted you to find this. You mean a lot to me.').current
  const pull = () => { if (!corked) return; sfx.unlock(); setCorked(false); buzz([30, 40, 80]); sfx.lid(); window.setTimeout(() => sfx.chime(), 500) }
  return <div className="scene-content occ-scene ns-bottle">
    <p className="eyebrow">WASHED UP JUST FOR YOU</p><h1>A message in a <em>bottle.</em></h1>
    <div className={`ns-sea ${corked ? '' : 'open'}`} aria-hidden={false}>
      <span className="ns-sun" aria-hidden="true" />
      <button type="button" className="ns-bottle-btn" onClick={pull} aria-label={corked ? 'Pull the cork' : 'The bottle is open'}>
        <svg viewBox="0 0 80 150" aria-hidden="true"><rect x="30" y="2" width="20" height="16" rx="3" fill="#c98f5a" className={corked ? '' : 'ns-cork'} /><path d="M32 18h16v22c0 6 16 12 16 34v54c0 10-8 18-18 18H34c-10 0-18-8-18-18V74c0-22 16-28 16-34Z" fill="rgba(180,230,240,.55)" stroke="rgba(255,255,255,.7)" strokeWidth="2.5" /><rect x="30" y="68" width="20" height="62" rx="4" fill="#fff3d6" className="ns-scroll-in" /></svg>
      </button>
      <svg className="ns-waves" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true"><path className="w1" d="M0 30 Q50 6 100 30 T200 30 T300 30 T400 30 V80 H0Z" /><path className="w2" d="M0 44 Q50 22 100 44 T200 44 T300 44 T400 44 V80 H0Z" /></svg>
    </div>
    {corked ? <small className="muted">Tap the bottle to pull the cork</small> : <div className="ns-scroll"><small>The note inside</small><p>{text}</p><em>{exp.closing || 'Yours'} {exp.sender}</em></div>}
    {!corked && <Next onClick={onDone} />}
  </div>
}
