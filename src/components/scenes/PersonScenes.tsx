import { useMemo, useState, type CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import { sfx } from '../../lib/sfx'
import type { Experience } from '../../types'

type Buzz = (p: number | number[]) => void
type P = { exp: Experience; colors: string[]; onDone: () => void; buzz: Buzz }
const Next = ({ onClick, label = 'Continue' }: { onClick: () => void; label?: string }) => <button className="primary-btn occ-next" onClick={onClick}>{label} <ArrowRight size={16} /></button>
const lines = (a: string[] | undefined, fallback: string[], n: number) => { const l = (a || []).map(x => x.trim()).filter(Boolean); return (l.length ? l : fallback).slice(0, n) }
const who = (e: Experience) => (e.extras?.nickname?.trim() || e.recipient || 'you').trim()

/* Sensible defaults for each person, so every scene looks finished before the creator customises anything. */
export const AWARD_TITLE: Record<string, string> = { Brother: 'Brother of the Year', Sister: 'Sister of the Year', Dad: 'World’s Best Dad', Mom: 'World’s Best Mom', Friend: 'Best Friend Award', Partner: 'My Favourite Human' }
export const AWARD_LINES: Record<string, string[]> = {
  Brother: ['Always has my back', 'Best at annoying me, lovingly', 'Shares the last slice'], Sister: ['Keeps all my secrets', 'Understands without words', 'Makes every room warmer'],
  Dad: ['Fixes everything', 'Dad jokes, premium quality', 'Quiet hero, every day'], Mom: ['Hugs on demand', 'Knows what I need first', 'Love, served daily'],
  Friend: ['Shows up, always', 'Laughs at my worst jokes', 'Late-night talks champion'], Partner: ['Makes ordinary days magic', 'Best hugs in the world', 'My home, my person'],
}
export const RECIPE: Record<string, string[]> = {
  Mom: ['2 cups of endless patience', '1 spoon of loving scolding', 'A dash of late-night chai', 'Warm hugs, to taste', 'Serve with a big smile'],
  Dad: ['2 cups of quiet strength', '1 spoon of dad jokes', 'A pinch of worry', 'Endless support', 'Serve with pride'],
  Friend: ['2 cups of laughter', '1 spoon of chaos', 'A dash of gossip', 'Endless memories', 'Serve with snacks'],
}
const meterDefault = (r?: string): { label: string; pct: number }[] => ({
  Friend: [{ label: 'Friendship', pct: 100 }, { label: 'Chaos together', pct: 97 }, { label: 'Late-night talks', pct: 100 }],
  Sister: [{ label: 'Sister bond', pct: 100 }, { label: 'Secrets kept', pct: 99 }, { label: 'Fights forgotten', pct: 100 }],
  Brother: [{ label: 'Brother bond', pct: 100 }, { label: 'Teasing level', pct: 96 }, { label: 'Got my back', pct: 100 }],
  Partner: [{ label: 'Love', pct: 100 }, { label: 'Hugs needed', pct: 100 }, { label: 'Missing you', pct: 99 }],
} as Record<string, { label: string; pct: number }[]>)[r || 'Friend'] || [{ label: 'Love', pct: 100 }, { label: 'Joy', pct: 98 }, { label: 'Gratitude', pct: 100 }]

/* ---- AWARD CEREMONY: polish the trophy, a banner unrolls, reasons are read out ---- */
export function Trophy({ exp, onDone, buzz }: P) {
  const rel = exp.relation || 'Friend'
  const title = exp.extras?.awardTitle?.trim() || AWARD_TITLE[rel] || 'Star of the Year'
  const why = useMemo(() => lines(exp.extras?.awardLines, AWARD_LINES[rel] || AWARD_LINES.Friend, 3), [exp.extras?.awardLines, rel])
  const [polish, setPolish] = useState(0), won = polish >= 3
  const rub = () => { if (won) return; sfx.unlock(); sfx.tick(); buzz(14); const n = polish + 1; setPolish(n); if (n >= 3) { sfx.chime(); sfx.boom('confetti'); buzz([30, 30, 90]) } }
  return <div className="scene-content occ-scene ps-trophy">
    <p className="eyebrow">AND THE AWARD GOES TO…</p><h1>{won ? <><em>{who(exp)}</em>!</> : <>Polish the <em>trophy.</em></>}</h1>
    <div className={`ps-stage ${won ? 'won' : ''}`}>
      <span className="ps-spot" aria-hidden="true" />
      <button type="button" className="ps-cup" onClick={rub} aria-label="Polish the trophy" style={{ ['--p' as string]: polish } as CSSProperties}>
        <svg viewBox="0 0 160 190" aria-hidden="true"><defs><linearGradient id="psg" x1="0" x2="1"><stop offset="0" stopColor="#b8791f" /><stop offset=".45" stopColor="#ffe08a" /><stop offset="1" stopColor="#c98a2b" /></linearGradient></defs>
          <path d="M40 20h80v44c0 28-18 46-40 46S40 92 40 64Z" fill="url(#psg)" /><path d="M40 30H18c0 30 12 44 30 48M120 30h22c0 30-12 44-30 48" fill="none" stroke="url(#psg)" strokeWidth="9" strokeLinecap="round" />
          <rect x="70" y="108" width="20" height="30" fill="url(#psg)" /><rect x="48" y="138" width="64" height="14" rx="4" fill="url(#psg)" /><rect x="38" y="152" width="84" height="26" rx="6" fill="#7a4a16" />
          <path className="ps-shine" d="M58 26c0 30 4 56 22 70" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".7" /></svg>
        {!won && <i className="ps-ring" aria-hidden="true" />}
      </button>
      {won && <div className="ps-rays" aria-hidden="true">{Array.from({ length: 16 }, (_, k) => <u key={k} style={{ ['--a' as string]: `${k * 22.5}deg`, ['--d' as string]: `${(k % 5) * .06}s` } as CSSProperties} />)}</div>}
    </div>
    {won ? <div className="ps-banner"><b>{title}</b></div> : <small className="muted">Tap the trophy to polish it · {polish}/3</small>}
    {won && <ul className="ps-why">{why.map((l, i) => <li key={i} style={{ animationDelay: `${.5 + i * .5}s` }}><span>★</span>{l}</li>)}</ul>}
    {won && <Next onClick={onDone} />}
  </div>
}

/* ---- RECIPE FOR HAPPINESS: each ingredient drops in, then stir ---- */
export function Recipe({ exp, onDone, buzz }: P) {
  const rel = exp.relation || 'Mom'
  const items = useMemo(() => lines(exp.extras?.recipe, RECIPE[rel] || RECIPE.Mom, 5), [exp.extras?.recipe, rel])
  const emoji = ['🥛', '🧂', '☕', '🤗', '😊']
  const [n, setN] = useState(0), [stir, setStir] = useState(false)
  const add = () => { if (n >= items.length) return; sfx.unlock(); sfx.pop(n); buzz(16); setN(n + 1) }
  const stirIt = () => { if (stir || n < items.length) return; setStir(true); sfx.whoosh(); buzz([30, 40, 80]); window.setTimeout(() => { sfx.chime(); sfx.boom('love') }, 900) }
  return <div className="scene-content occ-scene ps-recipe">
    <p className="eyebrow">A SECRET FAMILY RECIPE</p><h1>{who(exp)}’s recipe for <em>happiness.</em></h1>
    <div className="ps-card">
      <ol>{items.map((t, i) => <li key={i} className={n > i ? 'in' : ''}><span>{emoji[i % emoji.length]}</span>{t}</li>)}</ol>
    </div>
    <div className={`ps-pot ${stir ? 'stir' : ''}`} aria-hidden="true"><i className="steam" /><i className="steam s2" /><i className="steam s3" /><div className="rim" /><div className="body">{n > 0 && <b style={{ height: `${Math.min(100, n / items.length * 100)}%` }} />}</div>{n > 0 && n <= items.length && !stir && <span key={n} className="drop">{emoji[(n - 1) % emoji.length]}</span>}</div>
    {n < items.length ? <button type="button" className="secondary-btn" onClick={add}>Add ingredient {n + 1} of {items.length}</button>
      : !stir ? <button type="button" className="primary-btn" onClick={stirIt}>Stir it all together 🥄</button>
        : <div className="occ-result ps-line"><small>Ready to serve</small><strong>Serves: you, forever ♡</strong></div>}
    {stir && <Next onClick={onDone} />}
  </div>
}

/* ---- LOVE-O-METER: bars fill up and go off the charts ---- */
export function Meter({ exp, onDone, buzz }: P) {
  const rel = exp.relation || 'Friend'
  const meters = useMemo(() => { const m = (exp.extras?.meters || []).filter(x => x.label.trim()); return (m.length ? m : meterDefault(rel)).slice(0, 3) }, [exp.extras?.meters, rel])
  const [go, setGo] = useState(false), [done, setDone] = useState(false)
  const start = () => { if (go) return; sfx.unlock(); setGo(true); buzz([20, 30, 20, 30]); let k = 0; const t = window.setInterval(() => { sfx.tick(); if (++k > 10) window.clearInterval(t) }, 150); window.setTimeout(() => { setDone(true); sfx.chime(); sfx.boom('stars'); buzz([40, 30, 100]) }, 2200) }
  return <div className="scene-content occ-scene ps-meter">
    <p className="eyebrow">SCIENTIFICALLY MEASURED</p><h1>The <em>{rel === 'Partner' ? 'love' : 'bond'}-o-meter.</em></h1>
    <div className="ps-bars">{meters.map((m, i) => <div key={i} className={`ps-bar ${go ? 'go' : ''}`} style={{ ['--pct' as string]: `${m.pct}%`, ['--i' as string]: i } as CSSProperties}><div className="lab"><span>{m.label}</span><b>{go ? `${m.pct}%` : '0%'}</b></div><div className="track"><i /></div></div>)}</div>
    {done && <div className="occ-result ps-line"><small>Result</small><strong>Off the charts, {who(exp)} ✨</strong></div>}
    {!go && <button type="button" className="primary-btn" onClick={start}>Start measuring</button>}
    {done && <Next onClick={onDone} />}
  </div>
}

/* ---- REASONS: flip each heart card to read a reason ---- */
export function Reasons({ exp, onDone, buzz }: P) {
  const rel = exp.relation || 'Partner'
  const items = useMemo(() => lines(exp.extras?.reasons, rel === 'Partner' ? ['You make ordinary days feel magical.', 'Your laugh is my favourite sound.', 'You listen like it matters.', 'Home feels like you.', 'You believe in me.', 'You are simply you.'] : ['You make life lighter.', 'You show up, always.', 'You are kind without trying.', 'You make me laugh.', 'You are so easy to love.', 'You are one of a kind.'], 6), [exp.extras?.reasons, rel])
  const [open, setOpen] = useState<number[]>([])
  const flip = (i: number) => { if (open.includes(i)) return; sfx.unlock(); sfx.pop(i); buzz(14); setOpen(o => [...o, i]); if (open.length + 1 >= items.length) window.setTimeout(() => { sfx.chime(); sfx.boom('love') }, 500) }
  const all = open.length >= items.length
  return <div className="scene-content occ-scene ps-reasons">
    <p className="eyebrow">{items.length} REASONS</p><h1>Why you are <em>so loved.</em></h1>
    <div className="ps-grid">{items.map((t, i) => <button key={i} type="button" className={`ps-flip ${open.includes(i) ? 'open' : ''}`} onClick={() => flip(i)} aria-label={open.includes(i) ? t : `Flip card ${i + 1}`} style={{ ['--i' as string]: i } as CSSProperties}><span className="in"><i className="front">♡<small>{i + 1}</small></i><i className="back">{t}</i></span></button>)}</div>
    <p className="muted">{all ? 'Every single one is true.' : `Tap a card · ${open.length}/${items.length}`}</p>
    {all && <div className="ps-rain" aria-hidden="true">{Array.from({ length: 16 }, (_, k) => <u key={k} style={{ left: `${(k * 37) % 100}%`, animationDelay: `${(k % 6) * .25}s` }}>♡</u>)}</div>}
    {all && <Next onClick={onDone} />}
  </div>
}
