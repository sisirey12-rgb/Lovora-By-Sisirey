import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Bow, string and arrow with real(ish) physics, all in one SVG coordinate space.
 *  - bow: vertical, belly toward the target, limb tips bend toward the archer as the string is drawn
 *  - drag: the nock follows the pointer through a saturating curve (rubber-band tension: harder to pull the further you go)
 *  - release: damped spring snaps the string forward, the arrow leaves when the nock passes rest, then the string vibrates
 *  - flight: gravity + air drag, arrow rotates with its velocity; a gentle aim-assist keeps the shot on the heart
 *  - the reveal only fires once the arrow tip actually reaches the heart
 */
const W = 360, H = 220
const REST = { x: 58, y: 110 }
const GRIP = { x: 86, y: 110 }
const TIP_TOP = { x: 58, y: 26 }, TIP_BOT = { x: 58, y: 194 }
const HEART = { x: 296, y: 110, r: 36 }
const ARROW_LEN = 118
const MAX_PULL = 70, MIN_PULL = 16, GRAVITY = 170, DRAG = 0.12, ASSIST = 0.8
const rad2deg = 180 / Math.PI

/** Launch velocity from a given nock displacement (same maths for the real shot and the aim preview). */
function launch(nx: number, ny: number) {
  const pull = Math.hypot(nx, ny), speed = 300 + pull * 5.2
  const ang = Math.atan2(GRIP.y - (REST.y + ny), GRIP.x - (REST.x + nx))
  const sx = REST.x + nx, sy = REST.y + ny
  const tFlight = Math.max(.12, (HEART.x - 18 - sx - ARROW_LEN) / (speed * .9) + ARROW_LEN / speed)
  const vyIdeal = (HEART.y - sy - 0.5 * GRAVITY * tFlight * tFlight) / tFlight
  const vxIdeal = Math.sqrt(Math.max(1, speed * speed - vyIdeal * vyIdeal))
  return { sx, sy, avx: Math.cos(ang) * speed * (1 - ASSIST) + vxIdeal * ASSIST, avy: Math.sin(ang) * speed * (1 - ASSIST) + vyIdeal * ASSIST }
}
type Phase = 'idle' | 'drawing' | 'flying' | 'hit' | 'miss'
export default function BowScene({ onHit, buzz, onGesture }: { onHit: () => void; buzz: (p: number | number[]) => void; onGesture?: () => void }) {
  const svg = useRef<SVGSVGElement>(null)
  const limbTop = useRef<SVGPathElement>(null), limbBot = useRef<SVGPathElement>(null), string = useRef<SVGPathElement>(null)
  const arrow = useRef<SVGGElement>(null), power = useRef<HTMLSpanElement>(null)
  const traj = useRef<SVGPathElement>(null)
  const trail = useRef<(SVGCircleElement | null)[]>([])
  const trailPts = useRef<{ x: number; y: number }[]>([])
  const raf = useRef(0)
  const alive = useRef(true)
  const s = useRef({ nx: 0, ny: 0, vx: 0, vy: 0, vib: false, phase: 'idle' as Phase, pull: 0, px: 0, py: 0, avx: 0, avy: 0, last: 0, tier: 0, pointer: -1 })
  const [shots, setShots] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [hint, setHint] = useState('Drag the arrow back — the further you pull, the harder it flies.')

  const set = (p: Phase) => { s.current.phase = p; setPhase(p) }
  const draw = useCallback(() => {
    const st = s.current
    const pull = Math.hypot(st.nx, st.ny)
    const tipX = TIP_TOP.x - Math.min(pull, MAX_PULL) * 0.11
    const nockX = REST.x + st.nx, nockY = REST.y + st.ny
    limbTop.current?.setAttribute('d', `M${tipX} ${TIP_TOP.y} C${tipX + 38} ${TIP_TOP.y + 20} ${GRIP.x + 4} ${GRIP.y - 46} ${GRIP.x} ${GRIP.y - 6}`)
    limbBot.current?.setAttribute('d', `M${tipX} ${TIP_BOT.y} C${tipX + 38} ${TIP_BOT.y - 20} ${GRIP.x + 4} ${GRIP.y + 46} ${GRIP.x} ${GRIP.y + 6}`)
    string.current?.setAttribute('d', `M${tipX} ${TIP_TOP.y} L${nockX} ${nockY} L${tipX} ${TIP_BOT.y}`)
    const t = Math.min(1, pull / MAX_PULL)
    string.current?.setAttribute('stroke-width', String(1.6 + t * 1.2))
    string.current?.setAttribute('stroke', t > .02 ? `hsl(${330 - t * 40} 90% ${80 + t * 10}%)` : '#fbe6f1')
    if (power.current) power.current.style.width = `${Math.round(t * 100)}%`
    const pts = trailPts.current
    if (st.phase === 'flying') { pts.push({ x: st.px, y: st.py }); if (pts.length > 12) pts.shift() } else if (st.phase !== 'hit') pts.length = 0
    trail.current.forEach((c, i) => { if (!c) return; const q = pts[i - (12 - pts.length)]; if (q) { c.setAttribute('cx', String(q.x)); c.setAttribute('cy', String(q.y)); c.setAttribute('opacity', String(i / 12 * .75)); c.setAttribute('r', String(1.2 + i * .3)) } else c.setAttribute('opacity', '0') })
    if (traj.current) {
      if (st.phase === 'drawing' && pull >= MIN_PULL) {
        const L = launch(st.nx, st.ny); const a0 = Math.atan2(L.avy, L.avx)
        let x = L.sx + Math.cos(a0) * ARROW_LEN, y = L.sy + Math.sin(a0) * ARROW_LEN, vx = L.avx, vy = L.avy, d = `M${x} ${y}`
        for (let i = 0; i < 20; i++) { for (let k = 0; k < 3; k++) { vy += GRAVITY * .02; vx *= 1 - DRAG * .02; vy *= 1 - DRAG * .02; x += vx * .02; y += vy * .02 } d += ` L${x} ${y}` }
        traj.current.setAttribute('d', d)
      } else traj.current.setAttribute('d', '')
    }
    if (arrow.current) {
      if (st.phase === 'flying' || st.phase === 'hit') arrow.current.setAttribute('transform', `translate(${st.px} ${st.py}) rotate(${Math.atan2(st.avy, st.avx) * rad2deg})`)
      else arrow.current.setAttribute('transform', `translate(${nockX} ${nockY}) rotate(${Math.atan2(GRIP.y - nockY, GRIP.x - nockX) * rad2deg})`)
      arrow.current.style.opacity = st.phase === 'miss' ? '0' : '1'
    }
  }, [])

  const reset = useCallback(() => {
    const st = s.current
    st.nx = 0; st.ny = 0; st.vx = 0; st.vy = 0; st.vib = false; st.pull = 0
    set('idle'); draw()
  }, [draw])

  const loop = useCallback((now: number) => {
    const st = s.current
    let dt = Math.min(0.033, (now - (st.last || now)) / 1000); st.last = now
    const steps = 4; dt /= steps
    for (let i = 0; i < steps; i++) {
      if (st.vib) { // string vibration / snap-forward: damped spring on the nock
        const k = 1100, c = 7
        st.vx += (-k * st.nx - c * st.vx) * dt; st.vy += (-k * st.ny - c * st.vy) * dt
        st.nx += st.vx * dt; st.ny += st.vy * dt
        if (st.phase !== 'flying' && Math.hypot(st.nx, st.ny) < .15 && Math.hypot(st.vx, st.vy) < 4) { st.nx = 0; st.ny = 0; st.vib = false }
      }
      if (st.phase === 'flying') {
        st.avy += GRAVITY * dt; const drag = 1 - DRAG * dt; st.avx *= drag; st.avy *= drag
        st.px += st.avx * dt; st.py += st.avy * dt
        const a = Math.atan2(st.avy, st.avx)
        const tx = st.px + Math.cos(a) * ARROW_LEN, ty = st.py + Math.sin(a) * ARROW_LEN
        if (Math.hypot(tx - HEART.x, ty - HEART.y) < HEART.r || (tx >= HEART.x - 18 && Math.abs(ty - HEART.y) < HEART.r + 4)) {
          set('hit'); st.vib = true
          // bury the tip slightly so it reads as stuck in the heart
          st.px = tx - Math.cos(a) * ARROW_LEN + Math.cos(a) * 10; st.py = ty - Math.sin(a) * ARROW_LEN + Math.sin(a) * 10
          buzz([30, 40, 60]); setHint('Right in the heart ♡')
          window.setTimeout(() => { if (alive.current) onHit() }, 480)
        } else if (tx > W + 40 || ty > H + 40 || ty < -40 || st.px > W + 80) {
          set('miss'); setHint('Just missed — draw it back and try again.')
          window.setTimeout(() => { if (alive.current) reset() }, 900)
        }
      }
    }
    draw()
    if (st.vib || st.phase === 'flying') raf.current = requestAnimationFrame(loop)
    else { raf.current = 0; st.last = 0 }
  }, [draw, onHit, buzz, reset])
  const ensureLoop = useCallback(() => { if (!raf.current) { s.current.last = 0; raf.current = requestAnimationFrame(loop) } }, [loop])

  useEffect(() => { alive.current = true; draw(); return () => { alive.current = false; cancelAnimationFrame(raf.current); raf.current = 0 } }, [draw])

  const toSvg = (e: React.PointerEvent) => {
    const el = svg.current!, pt = el.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY
    const p = pt.matrixTransform(el.getScreenCTM()!.inverse()); return { x: p.x, y: p.y }
  }
  const onDown = (e: React.PointerEvent) => {
    const st = s.current
    if (st.phase !== 'idle' || st.vib) return
    const p = toSvg(e)
    if (Math.hypot(p.x - (REST.x + st.nx), p.y - (REST.y + st.ny)) > 62) return // grab near the nock / arrow tail
    onGesture?.()   // a real pull is a user gesture: unlock audio so the soundtrack can start on the hit
    st.pointer = e.pointerId; (e.currentTarget as Element).setPointerCapture(e.pointerId)
    st.tier = 0; set('drawing'); setHint('Hold steady… release to shoot.'); buzz(8)
  }
  const onMove = (e: React.PointerEvent) => {
    const st = s.current
    if (st.phase !== 'drawing' || e.pointerId !== st.pointer) return
    const p = toSvg(e)
    const dx = Math.max(0, REST.x - p.x), dy = p.y - REST.y           // only a rearward pull counts
    const d = Math.hypot(dx, dy)
    if (dx < 3) { st.nx = 0; st.ny = 0; draw(); return }
    // rubber-band tension: stiffens as you pull (saturating curve) instead of a linear 1:1 follow
    const eff = MAX_PULL * (1 - Math.exp(-d / (MAX_PULL * 0.85)))
    const ux = -dx / d, uy = Math.max(-1, Math.min(1, dy / Math.max(d, 1))) * 0.8
    const n = Math.hypot(ux, uy)
    st.nx = (ux / n) * eff; st.ny = (uy / n) * eff
    const tier = Math.floor((eff / MAX_PULL) * 4)
    if (tier > st.tier) { buzz(6 + tier * 4); st.tier = tier } else st.tier = tier
    draw()
  }
  const release = (e: React.PointerEvent) => {
    const st = s.current
    if (st.phase !== 'drawing' || e.pointerId !== st.pointer) return
    st.pointer = -1
    const pull = Math.hypot(st.nx, st.ny)
    if (pull < MIN_PULL) { // too weak: string eases back, arrow stays nocked
      st.vib = true; st.vx = 0; st.vy = 0; set('idle'); setHint('Pull a little further back — the arrow needs more tension.'); ensureLoop(); return
    }
    const L = launch(st.nx, st.ny)
    st.avx = L.avx; st.avy = L.avy; st.px = L.sx; st.py = L.sy
    setShots(n => n + 1)
    st.pull = pull
    // string snaps forward (nock keeps its displacement as initial spring state)
    st.vx = 0; st.vy = 0; st.vib = true
    set('flying'); setHint('Flying…'); buzz([14, 20]); ensureLoop()
  }
  const hit = phase === 'hit'
  return <div className={`bow-stage ${phase}`}>
    <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="bow-svg" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={release} onPointerCancel={release} role="img" aria-label="Interactive bow and arrow. Drag the arrow back and release it toward the heart.">
      <defs>
        <linearGradient id="bowWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6d3e6" /><stop offset=".5" stopColor="#c98ab5" /><stop offset="1" stopColor="#f6d3e6" /></linearGradient>
        <radialGradient id="heartFill" cx=".35" cy=".3" r=".9"><stop offset="0" stopColor="#ffd0e6" /><stop offset=".45" stopColor="#ff6fa8" /><stop offset="1" stopColor="#b8286a" /></radialGradient>
      </defs>
      <g className={`bow-heart ${hit ? 'hit' : ''}`} transform={`translate(${HEART.x} ${HEART.y})`}>
        <circle r="74" className="bow-ring" /><circle r="90" className="bow-ring two" /><circle r="52" className="bow-heart-halo" /><circle r="62" className="bow-heart-halo two" />
        <path d="M0 36 C-9 25 -48 5 -42 -22 C-39 -41 -10 -43 0 -22 C10 -43 39 -41 42 -22 C48 5 9 25 0 36Z" fill="url(#heartFill)" stroke="#ffc9e2" strokeOpacity=".6" strokeWidth="1.5" />
        <path d="M-26 -26 Q-18 -35 -8 -29" stroke="#fff" strokeOpacity=".7" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
      <path ref={traj} className="bow-traj" fill="none" />
      {hit && <g className="bow-burst" transform={`translate(${HEART.x} ${HEART.y})`}>{Array.from({ length: 18 }, (_, i) => <line key={i} className={`bow-spark sp${i % 3}`} x1="0" y1="0" x2="0" y2="-12" style={{ ['--a' as string]: `${i * 20}deg` } as React.CSSProperties} />)}</g>}
      <path ref={limbTop} fill="none" stroke="url(#bowWood)" strokeWidth="6.5" strokeLinecap="round" />
      <path ref={limbBot} fill="none" stroke="url(#bowWood)" strokeWidth="6.5" strokeLinecap="round" />
      <rect x={GRIP.x - 4} y={GRIP.y - 14} width="8" height="28" rx="4" fill="#8f4f7e" stroke="#f6d3e6" strokeOpacity=".5" />
      <path ref={string} fill="none" stroke="#fbe6f1" strokeWidth="1.6" strokeLinejoin="round" />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} ref={el => { trail.current[i] = el }} r="2" fill="#ffd36e" opacity="0" />)}
      {hit && <><circle className="bow-shock" cx={HEART.x} cy={HEART.y} r="30" /><circle className="bow-shock two" cx={HEART.x} cy={HEART.y} r="30" /></>}
      <g ref={arrow} className="bow-arrow">
        <line x1="-2" y1="0" x2={ARROW_LEN - 8} y2="0" stroke="#f7e0ef" strokeWidth="2.6" strokeLinecap="round" />
        <path d={`M${ARROW_LEN - 10} -6 L${ARROW_LEN + 6} 0 L${ARROW_LEN - 10} 6Z`} fill="#ffe8f3" stroke="#d58cb8" strokeWidth="1" strokeLinejoin="round" />
        <path d="M2 0 L-8 -7 L10 -6 Z M2 0 L-8 7 L10 6 Z M16 0 L8 -6 L24 -5 Z M16 0 L8 6 L24 5 Z" fill="#f08cbc" opacity=".92" />
        <circle cx="-2" cy="0" r="1.8" fill="#8f4f7e" />
      </g>
    </svg>
    <div className="bow-hud" aria-hidden="true"><span>LEVEL 1</span><span>SHOTS <b>{shots}</b></span><span className="bow-stars">{[0, 1, 2].map(i => <i key={i} className={hit && i < (shots <= 1 ? 3 : shots === 2 ? 2 : 1) ? 'on' : ''}>★</i>)}</span></div>
    <div className="bow-power-wrap" aria-hidden="true"><small>POWER</small><div className="bow-power"><span ref={power} /></div></div>
    {hit && <div className="bow-popup" aria-hidden="true">{shots <= 1 ? 'PERFECT!' : 'BULLSEYE!'}</div>}
    <p className="bow-hint" role="status">{hint}</p>
    {phase === 'flying' && <span className="sr-only">Arrow in flight</span>}
  </div>
}
