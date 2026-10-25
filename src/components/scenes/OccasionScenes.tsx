import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import { sfx } from '../../lib/sfx'
import type { Experience } from '../../types'

type Buzz = (p: number | number[]) => void
type P = { exp: Experience; colors: string[]; onDone: () => void; buzz: Buzz }
const Next = ({ onClick, label = 'Continue' }: { onClick: () => void; label?: string }) => <button className="primary-btn occ-next" onClick={onClick}>{label} <ArrowRight size={16} /></button>
const lines = (a: string[] | undefined, fallback: string[], n: number) => { const l = (a || []).map(x => x.trim()).filter(Boolean); return (l.length ? l : fallback).slice(0, n) }
const polar = (r: number, deg: number): [number, number] => [Math.cos((deg - 90) * Math.PI / 180) * r, Math.sin((deg - 90) * Math.PI / 180) * r]

/* ---------------- BIRTHDAY / SPECIAL: spin the wheel of wishes ---------------- */
export function SpinWheel({ exp, colors, onDone, buzz }: P) {
  const items = useMemo(() => lines(exp.balloonWishes, ['Big hug', 'Free cake', 'Make a wish', 'Dance party', 'Best day ever', 'A surprise gift'], 8), [exp.balloonWishes])
  const n = items.length, seg = 360 / n
  const [rot, setRot] = useState(0), [spinning, setSpinning] = useState(false), [win, setWin] = useState<number | null>(null)
  const spin = () => {
    if (spinning) return; sfx.unlock(); setSpinning(true); setWin(null); buzz(20)
    const target = Math.floor(Math.random() * n), final = rot + 360 * 5 + (360 - (target * seg + seg / 2)) - (rot % 360)
    setRot(final)
    let k = 0; const t = window.setInterval(() => { sfx.tick(); if (++k > 34) window.clearInterval(t) }, 120)
    window.setTimeout(() => { setSpinning(false); setWin(target); sfx.wish(); sfx.boom('confetti'); buzz([40, 30, 80]) }, 4300)
  }
  const label = (s: string) => (s.length > 13 ? s.slice(0, 12) + '…' : s)
  return <div className="scene-content occ-scene">
    <p className="eyebrow">SPIN FOR YOUR LUCK</p><h1>The wheel of <em>wishes.</em></h1>
    <div className="wheel-wrap"><div className="wheel-pin" aria-hidden="true" />
      <svg className="wheel" viewBox="-110 -110 220 220" style={{ transform: `rotate(${rot}deg)`, transition: spinning ? 'transform 4.2s cubic-bezier(.12,.7,.1,1)' : 'none' }} role="img" aria-label="Wheel of wishes">
        {items.map((it, i) => { const [x1, y1] = polar(104, i * seg), [x2, y2] = polar(104, (i + 1) * seg), [tx, ty] = polar(66, i * seg + seg / 2)
          return <g key={i}><path d={`M0 0L${x1} ${y1}A104 104 0 0 1 ${x2} ${y2}Z`} fill={colors[i % colors.length] || '#ff8fc2'} stroke="rgba(255,255,255,.55)" strokeWidth="1.5" />
            <text x={tx} y={ty} fill="#2a1038" fontSize="9" fontWeight="800" textAnchor="middle" transform={`rotate(${i * seg + seg / 2} ${tx} ${ty})`}>{label(it)}</text></g> })}
        <circle r="14" fill="#fff" stroke="#ffd36e" strokeWidth="4" />
      </svg></div>
    {win !== null && <div className="occ-result" key={win}><small>Your wish</small><strong>{items[win]}</strong></div>}
    {win === null ? <button className="primary-btn occ-next" onClick={spin} disabled={spinning}>{spinning ? 'Spinning…' : 'Spin the wheel'}</button> : <div className="occ-actions"><button className="secondary-btn" onClick={spin}>Spin again</button><Next onClick={onDone} /></div>}
  </div>
}

/* ---------------- ANNIVERSARY: connect the stars into a heart ---------------- */
export function StarSky({ exp, onDone, buzz }: P) {
  const pts = useMemo(() => Array.from({ length: 11 }, (_, i) => { const t = (i / 11) * Math.PI * 2 + Math.PI; return [16 * Math.pow(Math.sin(t), 3) * 5.2, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 5.2 + 6] as [number, number] }), [])
  const [on, setOn] = useState(0)
  const done = on >= pts.length
  const days = exp.togetherSince ? Math.max(0, Math.floor((Date.now() - new Date(exp.togetherSince).getTime()) / 86400000)) : null
  const tap = (i: number) => { if (i !== on) { buzz(8); return } setOn(on + 1); sfx.pop(i); buzz(14); if (i === pts.length - 1) window.setTimeout(() => { sfx.chime(); sfx.boom('stars') }, 250) }
  return <div className="scene-content occ-scene">
    <p className="eyebrow">WRITTEN IN THE STARS</p><h1>Connect <em>our stars.</em></h1>
    <p className="scene-copy">{done ? 'Out of all the skies, this one is ours.' : 'Tap the glowing star to draw our constellation.'}</p>
    <svg className="starsky" viewBox="-100 -90 200 180" role="img" aria-label="Heart constellation">
      {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={((i * 53) % 200) - 100} cy={((i * 37) % 180) - 90} r={.5 + (i % 3) * .3} fill="#fff" opacity={.35} className="twk" style={{ animationDelay: `${(i % 9) * .3}s` }} />)}
      {pts.slice(0, Math.max(0, Math.min(on, pts.length))).map((p, i) => i > 0 && <line key={i} x1={pts[i - 1][0]} y1={pts[i - 1][1]} x2={p[0]} y2={p[1]} stroke="#ffd36e" strokeWidth="1.2" className="sline" />)}
      {done && <line x1={pts[pts.length - 1][0]} y1={pts[pts.length - 1][1]} x2={pts[0][0]} y2={pts[0][1]} stroke="#ffd36e" strokeWidth="1.2" className="sline" />}
      {done && <path d={`M${pts.map(p => p.join(' ')).join('L')}Z`} fill="rgba(255,143,194,.22)" className="sfill" />}
      {pts.map((p, i) => <g key={i} onClick={() => tap(i)} style={{ cursor: 'pointer' }} role="button" aria-label={`Star ${i + 1}`}><circle cx={p[0]} cy={p[1]} r="11" fill="transparent" /><circle cx={p[0]} cy={p[1]} r={i < on ? 3.4 : 2.4} fill={i < on ? '#ffd36e' : '#fff'} className={i === on ? 'star-next' : ''} /></g>)}
    </svg>
    {done && <div className="occ-result"><small>{exp.sender || 'Me'} ✦ {exp.recipient || 'You'}</small><strong>{days !== null ? `${days.toLocaleString()} days of us` : 'Forever, starting now'}</strong></div>}
    {done ? <Next onClick={onDone} /> : <small className="muted">{on} / {pts.length} stars</small>}
  </div>
}

/* ---------------- ANNIVERSARY: typed vows ---------------- */
export function Vows({ exp, colors, onDone }: P) {
  const vows = useMemo(() => lines((exp.vows || '').split('\n'), ['I promise to choose you, every single day.', 'I promise to laugh with you, even when it is silly.', 'I promise to hold your hand through every season.', 'I promise to keep falling for you.'], 6), [exp.vows])
  const [line, setLine] = useState(0), [chars, setChars] = useState(0)
  const done = line >= vows.length
  useEffect(() => {
    if (done) return
    const full = vows[line].length
    const t = window.setTimeout(() => { if (chars < full) { setChars(chars + 1); if (chars % 3 === 0) sfx.tick() } else { setLine(line + 1); setChars(0); if (line + 1 >= vows.length) sfx.chime() } }, chars < full ? 42 : 900)
    return () => window.clearTimeout(t)
  }, [line, chars, done, vows])
  return <div className="scene-content occ-scene vows-scene">
    <div className="vow-petals" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ left: `${(i * 8.3) % 100}%`, animationDelay: `${-i * .8}s`, background: colors[i % colors.length] || '#ff8fc2' } as CSSProperties} />)}</div>
    <p className="eyebrow">WITH ALL MY HEART</p><h1>My <em>vows</em> to you.</h1>
    <div className="vow-card">{vows.map((v, i) => <p key={i} className={i < line ? 'vow done' : i === line ? 'vow typing' : 'vow'}>{i < line ? v : i === line ? v.slice(0, chars) : ''}</p>)}</div>
    {done ? <Next onClick={onDone} label="I do" /> : <button className="text-btn" onClick={() => { setLine(vows.length) }}>Skip</button>}
  </div>
}

/* ---------------- LOVE LETTER: sky lanterns ---------------- */
export function Lanterns({ exp, colors, onDone, buzz }: P) {
  const items = useMemo(() => lines(exp.moments, ['You are my favourite hello.', 'Every day with you is a gift.', 'I would find you in any lifetime.', 'You make my world softer.', 'Home is you.'], 5), [exp.moments])
  const [lit, setLit] = useState<number[]>([]), [msg, setMsg] = useState('')
  const release = (i: number) => { if (lit.includes(i)) return; setLit([...lit, i]); setMsg(items[i]); sfx.whoosh(); sfx.sparkle(); buzz(18) }
  const all = lit.length >= items.length
  return <div className="scene-content occ-scene lantern-scene">
    <p className="eyebrow">SEND IT TO THE SKY</p><h1>Light a <em>lantern.</em></h1>
    <div className="lantern-sky">{items.map((_, i) => <button key={i} className={`lantern ${lit.includes(i) ? 'up' : ''}`} onClick={() => release(i)} aria-label={`Lantern ${i + 1}`} style={{ left: `${8 + (i * 84) / Math.max(1, items.length - 1) - (items.length === 1 ? 40 : 0)}%`, ['--c' as string]: colors[i % colors.length] || '#ffb36b', ['--d' as string]: `${i * .4}s` } as CSSProperties}><i /></button>)}</div>
    <div className="occ-result lantern-msg" aria-live="polite">{msg ? <strong key={msg}>{msg}</strong> : <small>Tap a lantern to read what it carries.</small>}</div>
    {all ? <Next onClick={onDone} /> : <small className="muted">{lit.length} / {items.length} lit</small>}
  </div>
}

/* ---------------- LOVE LETTER: hold to break the wax seal ---------------- */
export function WaxSeal({ exp, onDone, buzz }: P) {
  const [p, setP] = useState(0), [broken, setBroken] = useState(false)
  const timer = useRef<number>(0), t0 = useRef(0)
  const stop = () => { cancelAnimationFrame(timer.current); if (!broken) setP(0) }
  const start = () => {
    if (broken) return; sfx.unlock(); t0.current = performance.now(); buzz(12)
    const tick = (t: number) => { const v = Math.min(1, (t - t0.current) / 1500); setP(v); if (v >= 1) { setBroken(true); sfx.release(); sfx.lid(); sfx.chime(); buzz([40, 30, 90]); window.setTimeout(onDone, 1700) } else timer.current = requestAnimationFrame(tick) }
    timer.current = requestAnimationFrame(tick)
  }
  useEffect(() => () => cancelAnimationFrame(timer.current), [])
  return <div className="scene-content occ-scene">
    <p className="eyebrow">SEALED WITH LOVE</p><h1>A letter for <em>{exp.recipient || 'you'}.</em></h1>
    <div className={`seal-env ${broken ? 'open' : ''}`}>
      <div className="seal-back" /><div className="seal-letter"><span>For {exp.recipient || 'you'}</span></div><div className="seal-flap" />
      <button className={`seal-wax ${broken ? 'broke' : ''}`} onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} aria-label="Press and hold to break the seal" style={{ ['--p' as string]: p } as CSSProperties}>
        <svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="27" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="3" /><circle cx="30" cy="30" r="27" fill="none" stroke="#ffd36e" strokeWidth="3" strokeLinecap="round" strokeDasharray={170} strokeDashoffset={170 - 170 * p} transform="rotate(-90 30 30)" /></svg><b>♥</b></button>
    </div>
    <p className="scene-copy">{broken ? 'It is open…' : 'Press and hold the seal'}</p>
  </div>
}

/* ---------------- SPECIAL SURPRISE: pick a mystery box ---------------- */
export function MysteryBoxes({ exp, colors, onDone, buzz }: P) {
  const msgs = useMemo(() => { const m = lines(exp.mystery, ['You deserve every good thing.', 'Someone is very proud of you.', 'Today, you are the main character.'], 3); while (m.length < 3) m.push('You are loved.'); return m }, [exp.mystery])
  const [open, setOpen] = useState<number[]>([]), [shake, setShake] = useState(-1)
  const pick = (i: number) => {
    if (open.includes(i) || shake >= 0) return; sfx.unlock(); sfx.drumroll(); buzz([20, 30, 20]); setShake(i)
    window.setTimeout(() => { sfx.lid(); sfx.chime(); setOpen(o => [...o, i]); setShake(-1); buzz([40, 30, 80]) }, 800)
  }
  const last = open[open.length - 1]
  return <div className="scene-content occ-scene">
    <p className="eyebrow">CHOOSE ONE</p><h1>Which box <em>is yours?</em></h1>
    <div className="mystery-row">{msgs.map((_, i) => <button key={i} className={`mbox ${shake === i ? 'shaking' : ''} ${open.includes(i) ? 'opened' : ''}`} onClick={() => pick(i)} style={{ ['--c' as string]: colors[i % colors.length] || '#ff8fc2', ['--r' as string]: `${(i - 1) * 5}deg` } as CSSProperties} aria-label={`Mystery box ${i + 1}`}><span className="mlid"><i /></span><span className="mbody"><i /></span><em>{open.includes(i) ? ['💖', '🎁', '✨'][i % 3] : '?'}</em></button>)}</div>
    <div className="occ-result" aria-live="polite">{last !== undefined ? <strong key={last}>{msgs[last]}</strong> : <small>Tap a box. Each one hides a different message.</small>}</div>
    {open.length ? <Next onClick={onDone} /> : null}
  </div>
}

/* ---------------- SPECIAL SURPRISE: scratch card ---------------- */
export function ScratchCard({ exp, onDone, buzz }: P) {
  const cv = useRef<HTMLCanvasElement>(null), [done, setDone] = useState(false), last = useRef<[number, number] | null>(null)
  useEffect(() => {
    const c = cv.current, g = c?.getContext('2d'); if (!c || !g) return
    const w = c.clientWidth, h = c.clientHeight, d = Math.min(2, window.devicePixelRatio || 1); c.width = w * d; c.height = h * d; g.scale(d, d)
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#d9c27a'); gr.addColorStop(.5, '#f7e8a8'); gr.addColorStop(1, '#b8963a'); g.fillStyle = gr; g.fillRect(0, 0, w, h)
    g.fillStyle = 'rgba(80,50,10,.45)'; g.font = '700 15px DM Sans, sans-serif'; g.textAlign = 'center'; g.fillText('SCRATCH HERE ✨', w / 2, h / 2 + 5)
    for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .35})`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2) }
  }, [])
  const scratch = (e: React.PointerEvent) => {
    if (e.buttons === 0 && e.pointerType === 'mouse') return
    const c = cv.current, g = c?.getContext('2d'); if (!c || !g || done) return
    const r = c.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top
    g.globalCompositeOperation = 'destination-out'; g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); const l = last.current; g.moveTo(l ? l[0] : x, l ? l[1] : y); g.lineTo(x, y); g.stroke(); last.current = [x, y]
    if (Math.random() < .25) sfx.sparkle()
    const dd = Math.min(2, window.devicePixelRatio || 1), data = g.getImageData(0, 0, c.width, c.height).data; let clear = 0, tot = 0
    for (let i = 3; i < data.length; i += 4 * 40) { tot++; if (data[i] < 20) clear++ }
    if (clear / tot > .45) { setDone(true); sfx.fanfare(); sfx.boom('stars'); buzz([40, 30, 90]); void dd }
  }
  return <div className="scene-content occ-scene">
    <p className="eyebrow">A LUCKY SCRATCH</p><h1>You <em>won</em> something.</h1>
    <div className={`scratch-card ${done ? 'won' : ''}`}>
      <div className="scratch-prize"><span>🎁</span><p>{exp.secretMessage || 'A day full of love, just for you.'}</p></div>
      <canvas ref={cv} className="scratch-foil" onPointerDown={e => { last.current = null; scratch(e) }} onPointerMove={scratch} onPointerUp={() => { last.current = null }} style={{ opacity: done ? 0 : 1, transition: 'opacity .8s', touchAction: 'none' }} aria-label="Scratch card" />
    </div>
    {done ? <Next onClick={onDone} /> : <small className="muted">Use your finger to scratch</small>}
  </div>
}
