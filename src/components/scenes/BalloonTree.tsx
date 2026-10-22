import { useEffect, useId, useMemo, useState, type CSSProperties } from 'react'
import type { ThemePalette } from '../../data'

const VB_W = 600, BALLOON_W = 40, WISH_W = 88
const TRUNK = 'M300 470 C296 420 304 360 300 300'
const BRANCHES = [
  'M300 360 C250 335 215 300 175 245', 'M300 345 C350 320 385 285 430 235', 'M300 300 C270 260 262 215 240 160',
  'M300 300 C332 255 338 210 362 155', 'M300 250 C296 210 300 170 300 110',
]
const TWIGS = [
  'M175 245 C150 235 130 215 115 190', 'M175 245 C185 215 190 190 180 160', 'M430 235 C455 225 475 205 488 180', 'M430 235 C425 205 420 180 432 155',
  'M240 160 C220 140 205 120 205 95', 'M240 160 C250 135 258 115 262 85', 'M362 155 C380 135 395 118 398 92', 'M362 155 C352 130 345 110 340 85',
  'M300 110 C285 90 275 75 270 55', 'M300 110 C315 90 325 75 330 55',
]
// Wish-balloon slots (viewBox units) ordered so any count from 3 to 10 looks balanced.
const SLOTS = [[300, 92], [190, 165], [410, 165], [135, 262], [465, 262], [255, 240], [345, 240], [92, 150], [508, 150], [300, 175]]
const shade = (hex: string, amt: number) => { const n = parseInt(hex.slice(1), 16); const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + (amt > 0 ? (255 - c) * amt : c * amt)))); return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('')}` }
const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }

function useCanopy() {
  return useMemo(() => {
    const R = rng(7), pts: { x: number; y: number }[] = []
    for (let tries = 0; tries < 900 && pts.length < 26; tries++) {
      const hx = (R() * 2.6 - 1.3), hy = (R() * 2.6 - 1.3)
      if (Math.pow(hx * hx + hy * hy - 1, 3) - hx * hx * Math.pow(hy, 3) > 0) continue   // inside the classic heart curve
      const x = 300 + hx * 130, y = 175 - hy * 100
      if (pts.some(p => Math.hypot(p.x - x, p.y - y) < 40)) continue
      pts.push({ x, y })
    }
    return pts
  }, [])
}

function HeartBalloon({ grad, glyph }: { grad: string; glyph?: string }) {
  return <svg viewBox="0 0 44 60" className="hb-svg" aria-hidden="true">
    <path d="M22 50 C15 42 1 33 3 18 C5 5 18 3 22 14 C26 3 39 5 41 18 C43 33 29 42 22 50Z" fill={`url(#${grad})`} stroke="#ffffff55" strokeWidth=".8" />
    <path d="M9 15 Q12 8 18 11" stroke="#fff" strokeOpacity=".75" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    <path d="M22 50 L18 55 L26 55Z" fill={`url(#${grad})`} /><path d="M22 55 C20 58 24 59 22 60" stroke="#ffffffaa" strokeWidth=".8" fill="none" />
    {glyph && <text x="22" y="29" textAnchor="middle" fontSize="12" fill="#fff" fontFamily="Playfair Display, serif">{glyph}</text>}
  </svg>
}

/**
 * 1) trunk and branches draw themselves (bare tree)  2) heart balloons inflate at the base, rise and take their place  3) they sway forever.
 * Colours come from the selected theme's palette.
 */
export default function BalloonTree({ palette, count, popped, onPop }: { palette: ThemePalette; count: number; popped: number[]; onPop: (i: number, variant: number) => void }) {
  const uid = useId().replace(/:/g, '')
  const canopy = useCanopy()
  const [ready, setReady] = useState(false)
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  useEffect(() => { const t = window.setTimeout(() => setReady(true), reduced ? 0 : 4300); return () => window.clearTimeout(t) }, [reduced])
  const colors = palette.balloons
  const place = (x: number, y: number, w: number, delay: number): CSSProperties => ({
    left: `${(x - w / 2) / VB_W * 100}%`, top: `${(y - w * .6) / 500 * 100}%`, width: `${w / VB_W * 100}%`,
    ['--sx' as string]: `${(300 - x) / w * 100}%`, ['--sy' as string]: `${(455 - y) / (w * 1.36) * 100}%`, ['--delay' as string]: `${delay}s`, ['--sway' as string]: `${(delay + 2.2).toFixed(2)}s`,
  } as CSSProperties)
  const slots = SLOTS.slice(0, Math.max(3, Math.min(10, count)))
  const glyphs = ['♡', '✦', '♡', '✧', '♡', '✦', '♡', '✧', '♡', '✦']
  return <div className="tb-wrap" style={{ ['--branch' as string]: palette.branch, ['--trunk' as string]: palette.trunk, ['--tb-glow' as string]: palette.glow } as CSSProperties}>
    <svg width="0" height="0" className="tb-defs" aria-hidden="true"><defs>{colors.map((c, i) => <radialGradient key={i} id={`g${i}-${uid}`} cx=".32" cy=".28" r=".85"><stop offset="0" stopColor={shade(c, .55)} /><stop offset=".45" stopColor={c} /><stop offset="1" stopColor={shade(c, -.35)} /></radialGradient>)}</defs></svg>
    <div className="tb-glow" />
    <svg viewBox="0 0 600 500" className="tb-svg" aria-hidden="true">
      <ellipse cx="300" cy="474" rx="120" ry="11" fill="#000" opacity=".22" />
      <path d={TRUNK} pathLength="1" className="tb-branch tb-trunk" style={{ ['--delay' as string]: '0s', ['--dur' as string]: '1.1s' } as CSSProperties} />
      {BRANCHES.map((d, i) => <path key={d} d={d} pathLength="1" className="tb-branch tb-limb" style={{ ['--delay' as string]: `${.9 + i * .2}s`, ['--dur' as string]: '.9s' } as CSSProperties} />)}
      {TWIGS.map((d, i) => <path key={d} d={d} pathLength="1" className="tb-branch tb-twig" style={{ ['--delay' as string]: `${1.9 + i * .1}s`, ['--dur' as string]: '.7s' } as CSSProperties} />)}
    </svg>
    <div className="tb-layer" aria-hidden="true">
      {canopy.map((p, i) => <span key={i} className="tb-balloon tb-canopy" style={place(p.x, p.y, BALLOON_W, 3 + (i * .09))}><HeartBalloon grad={`g${i % colors.length}-${uid}`} /></span>)}
    </div>
    <div className="tb-layer">
      {slots.map(([x, y], i) => {
        const isPopped = popped.includes(i)
        return <div key={i} className={`tb-balloon tb-wish ${isPopped ? 'popped' : ''} ${ready ? 'ready' : ''}`} style={place(x, y, WISH_W, 3.4 + i * .16)}>
          {!isPopped && <button type="button" className="tb-wish-btn" onClick={() => onPop(i, i)} disabled={!ready} aria-label={`Pop wish balloon ${i + 1}`}><HeartBalloon grad={`g${(i + 2) % colors.length}-${uid}`} glyph={glyphs[i]} /></button>}
          {isPopped && <span className={`tb-burst tb-burst-${i % 4}`} aria-hidden="true">{Array.from({ length: i % 4 === 1 ? 16 : 14 }, (_, k) => <i key={k} style={{ ['--a' as string]: `${k * (360 / (i % 4 === 1 ? 16 : 14))}deg`, background: colors[(i + k) % colors.length], color: colors[(i + k) % colors.length], ['--r' as string]: `${58 + (k % 3) * 22}px`, ['--d' as string]: `${(k % 4) * .03}s` } as CSSProperties}>{i % 4 === 0 ? '♥' : i % 4 === 2 ? '✿' : i % 4 === 3 ? '★' : ''}</i>)}<b className="tb-ring" /></span>}
        </div>
      })}
    </div>
  </div>
}
