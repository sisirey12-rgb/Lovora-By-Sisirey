import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import { sfx } from '../../lib/sfx'
import type { Experience } from '../../types'

type P = { exp: Experience; colors: string[]; onDone: () => void; buzz: (p: number | number[]) => void }
const Next = ({ onClick, label = 'Continue' }: { onClick: () => void; label?: string }) => <button className="primary-btn occ-next" onClick={onClick}>{label} <ArrowRight size={16} /></button>
const ex = (e: Experience) => e.extras || {}

/* ---- drag a falling star to the glowing spot to send a wish ---- */
export function WishStar({ exp, onDone, buzz }: P) {
  const [off, setOff] = useState({ x: 0, y: 0 }), [sent, setSent] = useState(false), start = useRef<{ x: number; y: number } | null>(null)
  const star = useRef<HTMLButtonElement>(null), zone = useRef<HTMLDivElement>(null)
  const down = (e: React.PointerEvent) => { if (sent) return; sfx.unlock(); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); start.current = { x: e.clientX - off.x, y: e.clientY - off.y } }
  const move = (e: React.PointerEvent) => { if (start.current) setOff({ x: e.clientX - start.current.x, y: e.clientY - start.current.y }) }
  const up = () => {
    if (!start.current) return; start.current = null
    const a = star.current?.getBoundingClientRect(), b = zone.current?.getBoundingClientRect()
    if (a && b && Math.hypot(a.left + a.width / 2 - (b.left + b.width / 2), a.top + a.height / 2 - (b.top + b.height / 2)) < 80) { setSent(true); sfx.whoosh(); window.setTimeout(() => { sfx.chime(); sfx.boom('stars'); buzz([40, 30, 100]) }, 350) } else setOff({ x: 0, y: 0 })
  }
  return <div className="scene-content occ-scene star-scene">
    <p className="eyebrow">SEND IT TO THE SKY</p><h1>Wish upon a <em>star.</em></h1>
    <div className="star-sky" aria-hidden="true">{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ left: `${(i * 41) % 100}%`, top: `${(i * 23) % 100}%`, animationDelay: `${(i % 7) * .4}s` }} />)}<b /><b /><b /></div>
    <div ref={zone} className={`star-zone ${sent ? 'lit' : ''}`}><span>✦</span></div>
    {!sent && <button ref={star} className="star-drag" style={{ transform: `translate(${off.x}px,${off.y}px)` }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Drag the star up to the glowing spot">⭐</button>}
    {!sent ? <small className="muted">Drag the star up to the glowing spot</small> : <div className="occ-result"><small>Your wish was heard</small><strong>{ex(exp).starNote || 'May everything you hope for find its way to you.'}</strong></div>}
    {sent && <Next onClick={onDone} />}
  </div>
}

/* ---- calendar pages flip back to the day that matters ---- */
export function CalendarFlip({ exp, onDone, buzz }: P) {
  const x = ex(exp), d = x.calendarDate ? new Date(x.calendarDate + 'T00:00:00') : new Date()
  const [go, setGo] = useState(false), [done, setDone] = useState(false)
  const flip = () => { if (go) return; sfx.unlock(); setGo(true); let k = 0; const t = window.setInterval(() => { sfx.tick(); if (++k > 9) window.clearInterval(t) }, 140); window.setTimeout(() => { setDone(true); sfx.chime(); buzz([30, 30, 80]) }, 1700) }
  const m = d.toLocaleString(undefined, { month: 'long' }), y = d.getFullYear()
  return <div className="scene-content occ-scene">
    <p className="eyebrow">A DATE I KEEP</p><h1>Turn back <em>time.</em></h1>
    <div className={`cal ${go ? 'go' : ''} ${done ? 'done' : ''}`} onClick={flip}><div className="cal-rings"><i /><i /><i /><i /></div>
      {[0, 1, 2, 3, 4, 5, 6].map(k => <div key={k} className="cal-sheet" style={{ ['--k' as string]: k } as CSSProperties}><small>{y}</small><b>{(k * 7 + 3) % 28 + 1}</b></div>)}
      <div className="cal-final"><small>{m} {y}</small><b>{d.getDate()}</b><span className="cal-heart">♥</span></div></div>
    {done ? <div className="occ-result"><strong>{x.calendarLine || 'The day everything changed, in the best way.'}</strong></div> : <small className="muted">{go ? 'Flipping back…' : 'Tap the calendar'}</small>}
    {done && <Next onClick={onDone} />}
  </div>
}

/* ---- shake the snow globe ---- */
export function SnowGlobe({ exp, colors, onDone, buzz }: P) {
  const [shakes, setShakes] = useState(0), [storm, setStorm] = useState(false), last = useRef(0)
  const shake = () => { const t = Date.now(); if (t - last.current < 500) return; last.current = t; setShakes(s => s + 1); setStorm(true); sfx.sparkle(); sfx.whoosh(); buzz([20, 20, 20]); window.setTimeout(() => setStorm(false), 1800) }
  const enable = async () => {
    sfx.unlock()
    try { const D = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }; if (D.requestPermission) { const r = await D.requestPermission(); if (r !== 'granted') return } } catch { return }
    window.addEventListener('devicemotion', (e: DeviceMotionEvent) => { const a = e.accelerationIncludingGravity; if (a && Math.hypot(a.x || 0, a.y || 0, a.z || 0) > 24) shake() })
  }
  useEffect(() => { void enable() }, [])   // eslint-disable-line react-hooks/exhaustive-deps
  const done = shakes >= 3
  return <div className="scene-content occ-scene">
    <p className="eyebrow">A LITTLE WORLD</p><h1>Shake the <em>globe.</em></h1>
    <button className={`globe ${storm ? 'storm' : ''}`} onClick={shake} aria-label="Shake the snow globe"><span className="globe-glass">{Array.from({ length: 34 }, (_, i) => <i key={i} style={{ left: `${(i * 29) % 100}%`, animationDelay: `${-(i % 9) * .6}s`, animationDuration: `${storm ? 1.6 + (i % 4) * .4 : 7 + (i % 5)}s`, background: i % 6 === 0 ? colors[i % colors.length] : '#fff' }} />)}<em>{exp.relation === 'Partner' ? '💑' : '🏡'}</em></span><span className="globe-base" /></button>
    {done ? <div className="occ-result"><strong>{ex(exp).globeLine || 'Even in a storm of snow, I would find my way back to you.'}</strong></div> : <small className="muted">Shake your phone, or tap the globe ({shakes}/3)</small>}
    {done && <Next onClick={onDone} />}
  </div>
}

/* ---- a postcard that flips ---- */
export function Postcard({ exp, onDone, buzz }: P) {
  const [flip, setFlip] = useState(false), photo = exp.memories.find(m => m.kind === 'image')
  const x = ex(exp), today = new Date().toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
  return <div className="scene-content occ-scene">
    <p className="eyebrow">POST FOR {(exp.recipient || 'YOU').toUpperCase()}</p><h1>A <em>postcard</em> for you.</h1>
    <button className={`pc ${flip ? 'flip' : ''}`} onClick={() => { sfx.unlock(); sfx.lid(); buzz(20); setFlip(f => !f) }} aria-label="Flip the postcard">
      <span className="pc-front" style={photo ? { backgroundImage: `url(${photo.src})` } : undefined}><b>Greetings from {x.postcardFrom || 'my heart'}</b></span>
      <span className="pc-back"><span className="pc-stamp">♥</span><span className="pc-mark">{today}<br />LOVE POST</span><span className="pc-text">{x.postcard || 'Wish you were here, always. Thinking of you today and every day.'}</span><em>— {exp.sender || 'me'}</em></span>
    </button>
    <small className="muted">{flip ? 'Tap to flip back' : 'Tap to flip it over'}</small>
    <Next onClick={onDone} />
  </div>
}

/* ---- crack a fortune cookie ---- */
export function Fortune({ exp, onDone, buzz }: P) {
  const list = useMemo(() => { const l = (ex(exp).fortunes || []).map(s => s.trim()).filter(Boolean); return l.length ? l : ['A year of small joys is on its way to you.', 'Someone is thinking of you right now, and smiling.', 'The best chapter has not been written yet.'] }, [exp])
  const [n, setN] = useState(0), [open, setOpen] = useState(false), [seen, setSeen] = useState(0)
  const crack = () => { if (open) { setOpen(false); window.setTimeout(() => { setN(v => (v + 1) % list.length); }, 300); return }; sfx.unlock(); sfx.lid(); sfx.pop(2); buzz([20, 30, 60]); setOpen(true); setSeen(s => s + 1) }
  return <div className="scene-content occ-scene">
    <p className="eyebrow">YOUR FORTUNE</p><h1>Crack the <em>cookie.</em></h1>
    <button className={`cookie ${open ? 'open' : ''}`} onClick={crack} aria-label="Crack the fortune cookie"><span className="ck l" /><span className="ck r" /><span className="slip"><b>{list[n]}</b></span></button>
    <small className="muted">{open ? (list.length > 1 ? 'Tap for another cookie' : '') : 'Tap to crack it open'}</small>
    {seen > 0 && <Next onClick={onDone} />}
  </div>
}

/* ---- a line of a song, typed in time ---- */
export function LyricReveal({ exp, onDone }: P) {
  const x = ex(exp), text = (x.lyric || 'You are my favourite place to be.').slice(0, 220)
  const [n, setN] = useState(0)
  useEffect(() => { const t = window.setInterval(() => setN(v => { if (v >= text.length) { window.clearInterval(t); return v } if (v % 3 === 0) sfx.tick(); return v + 1 }), 70); return () => window.clearInterval(t) }, [text])
  const done = n >= text.length
  return <div className="scene-content occ-scene lyric-scene">
    <div className="eq" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 5) * .13}s`, animationDuration: `${.6 + (i % 4) * .15}s` }} />)}</div>
    <p className="eyebrow">THIS ONE IS US</p>
    <p className="lyric-text">“{text.slice(0, n)}{!done && <span className="type-caret">|</span>}”</p>
    {x.lyricBy && <p className={`lyric-by ${done ? 'on' : ''}`}>{x.lyricBy}</p>}
    {done && <Next onClick={onDone} />}
  </div>
}

/* ---- an invitation with RSVP ---- */
export function InviteCard({ exp, onDone, buzz }: P) {
  const x = ex(exp), [rsvp, setRsvp] = useState<'' | 'yes' | 'no'>('')
  const digits = (exp.replyWhatsApp || '').replace(/\D/g, '')
  const answer = (v: 'yes' | 'no') => { setRsvp(v); buzz([30, 30, 60]); if (v === 'yes') { sfx.fanfare(); sfx.boom('confetti') } else sfx.chime(); if (digits) window.open(`https://wa.me/${digits}?text=${encodeURIComponent(v === 'yes' ? `Yes, I will be there! 🎉 (${exp.recipient || ''})` : `I can't make it this time, but thank you! 💛 (${exp.recipient || ''})`)}`, '_blank', 'noopener') }
  return <div className="scene-content occ-scene">
    <p className="eyebrow">YOU ARE INVITED</p><h1>{x.eventTitle || `${exp.recipient || 'Your'} celebration`}</h1>
    <div className="inv"><div className="inv-row"><span>🗓️</span><div><small>When</small><b>{x.eventWhen || 'Soon, I will tell you!'}</b></div></div><div className="inv-row"><span>📍</span><div><small>Where</small><b>{x.eventWhere || 'A secret place'}</b></div></div>
      {x.eventMap && /^https?:\/\//i.test(x.eventMap) && <a className="secondary-btn" href={x.eventMap} target="_blank" rel="noreferrer">Open the map</a>}</div>
    {!rsvp ? <div className="occ-actions"><button className="primary-btn" onClick={() => answer('yes')}>I will be there 🎉</button><button className="secondary-btn" onClick={() => answer('no')}>Can't make it</button></div> : <div className="occ-result"><strong>{rsvp === 'yes' ? 'Yay! See you there.' : 'We will miss you. Thank you for telling us.'}</strong></div>}
    {rsvp && <Next onClick={onDone} />}
  </div>
}
