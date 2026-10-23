import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Minimal cupid-bow game: a small wooden bow bottom-left, a glossy heart above, "PULL & RELEASE".
 *  - drag the arrow down/back, let go, it flies up to the heart (strong aim assist, light physics)
 *  - the reveal fires once the arrow tip actually reaches the heart
 * Everything lives in a portal that fills the player (below the top bar, above the bottom bar), so scene transforms can't crop or move it.
 * One SVG coordinate space, drawn rotated -90deg so the game axis x points UP the screen.
 */
const W = 360, H = 220
const REST = { x: 62, y: 64 }                 // nock position at rest (middle of the string)
const HOLD = { x: 38, y: 64 }                 // grip: the V of the bow sits below the string
const AIM = { x: REST.x + 30, y: REST.y }     // direction the arrow points at rest
const TIP_DY = 27
const HEART = { x: 226, y: 110, r: 30 }
const ARROW_LEN = 27
const MAX_PULL = 44, MIN_PULL = 10, GRAVITY = 40, DRAG = 0.1, ASSIST = 0.85
const rad2deg = 180 / Math.PI

function launch(nx: number, ny: number) {
  const pull = Math.hypot(nx, ny), speed = 290 + pull * 4
  const sx = REST.x + nx, sy = REST.y + ny
  const raw = Math.atan2(AIM.y - sy, AIM.x - sx), aimed = Math.atan2(HEART.y - sy, HEART.x - 16 - sx)
  const ang = raw * (1 - ASSIST) + aimed * ASSIST
  return { sx, sy, avx: Math.cos(ang) * speed, avy: Math.sin(ang) * speed }
}
type Phase = 'idle' | 'drawing' | 'flying' | 'hit' | 'miss'
export default function BowScene({ onHit, buzz, onGesture, title = 'a little something, for you' }: { onHit: () => void; buzz: (p: number | number[]) => void; onGesture?: () => void; title?: string }) {
  const [host, setHost] = useState<Element | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  const limbTop = useRef<SVGPathElement>(null), limbBot = useRef<SVGPathElement>(null), string = useRef<SVGPathElement>(null)
  const arrow = useRef<SVGGElement>(null), traj = useRef<SVGPathElement>(null)
  const raf = useRef(0), alive = useRef(true)
  const s = useRef({ nx: 0, ny: 0, vx: 0, vy: 0, vib: false, phase: 'idle' as Phase, px: 0, py: 0, avx: 0, avy: 0, last: 0, tier: 0, pointer: -1 })
  const [phase, setPhase] = useState<Phase>('idle')
  const [hint, setHint] = useState('Pull the arrow back and release it to shoot the heart.')
  useEffect(() => { setHost(document.querySelector('.player')) }, [])

  const set = (p: Phase) => { s.current.phase = p; setPhase(p) }
  const draw = useCallback(() => {
    const st = s.current
    const pull = Math.hypot(st.nx, st.ny), t = Math.min(1, pull / MAX_PULL)
    const tipX = REST.x - t * 3, dy = TIP_DY - t * 4
    const nockX = REST.x + st.nx, nockY = REST.y + st.ny
    limbTop.current?.setAttribute('d', `M${tipX} ${REST.y - dy} C${tipX - 7} ${REST.y - dy + 9} ${HOLD.x + 9} ${REST.y - 15} ${HOLD.x} ${REST.y - 4}`)
    limbBot.current?.setAttribute('d', `M${tipX} ${REST.y + dy} C${tipX - 7} ${REST.y + dy - 9} ${HOLD.x + 9} ${REST.y + 15} ${HOLD.x} ${REST.y + 4}`)
    string.current?.setAttribute('d', `M${tipX} ${REST.y - dy} L${nockX} ${nockY} L${tipX} ${REST.y + dy}`)
    if (traj.current) {
      if (st.phase === 'drawing' && pull >= MIN_PULL) {
        const L = launch(st.nx, st.ny); const a0 = Math.atan2(L.avy, L.avx)
        let x = L.sx + Math.cos(a0) * ARROW_LEN, y = L.sy + Math.sin(a0) * ARROW_LEN, vx = L.avx, vy = L.avy, d = `M${x} ${y}`
        for (let i = 0; i < 14; i++) { for (let k = 0; k < 3; k++) { vx -= GRAVITY * .02; vx *= 1 - DRAG * .02; vy *= 1 - DRAG * .02; x += vx * .02; y += vy * .02 } d += ` L${x} ${y}` }
        traj.current.setAttribute('d', d)
      } else traj.current.setAttribute('d', '')
    }
    if (arrow.current) {
      if (st.phase === 'flying' || st.phase === 'hit') arrow.current.setAttribute('transform', `translate(${st.px} ${st.py}) rotate(${Math.atan2(st.avy, st.avx) * rad2deg})`)
      else arrow.current.setAttribute('transform', `translate(${nockX} ${nockY}) rotate(${Math.atan2(AIM.y - nockY, AIM.x - nockX) * rad2deg})`)
      arrow.current.style.opacity = st.phase === 'miss' ? '0' : '1'
    }
  }, [])
  const reset = useCallback(() => { const st = s.current; st.nx = 0; st.ny = 0; st.vx = 0; st.vy = 0; st.vib = false; set('idle'); setHint('Pull the arrow back and release it to shoot the heart.'); draw() }, [draw])

  const loop = useCallback((now: number) => {
    const st = s.current
    let dt = Math.min(0.033, (now - (st.last || now)) / 1000); st.last = now
    const steps = 4; dt /= steps
    for (let i = 0; i < steps; i++) {
      if (st.vib) {
        const k = 1100, c = 7
        st.vx += (-k * st.nx - c * st.vx) * dt; st.vy += (-k * st.ny - c * st.vy) * dt
        st.nx += st.vx * dt; st.ny += st.vy * dt
        if (st.phase !== 'flying' && Math.hypot(st.nx, st.ny) < .15 && Math.hypot(st.vx, st.vy) < 4) { st.nx = 0; st.ny = 0; st.vib = false }
      }
      if (st.phase === 'flying') {
        st.avx -= GRAVITY * dt; const drag = 1 - DRAG * dt; st.avx *= drag; st.avy *= drag
        st.px += st.avx * dt; st.py += st.avy * dt
        const a = Math.atan2(st.avy, st.avx)
        const tx = st.px + Math.cos(a) * ARROW_LEN, ty = st.py + Math.sin(a) * ARROW_LEN
        if (Math.hypot(tx - HEART.x, ty - HEART.y) < HEART.r || (tx >= HEART.x - 16 && Math.abs(ty - HEART.y) < HEART.r + 4)) {
          set('hit'); st.vib = true
          st.px = tx - Math.cos(a) * ARROW_LEN + Math.cos(a) * 9; st.py = ty - Math.sin(a) * ARROW_LEN + Math.sin(a) * 9
          buzz([30, 40, 60]); setHint('Right in the heart.')
          window.setTimeout(() => { if (alive.current) onHit() }, 1400)
        } else if (tx > HEART.x + 70 || tx > W + 40 || ty > H + 40 || ty < -40 || st.px > W + 80) {
          set('miss'); setHint('Just missed. Pull it back and try again.')
          window.setTimeout(() => { if (alive.current) reset() }, 800)
        }
      }
    }
    draw()
    if (st.vib || st.phase === 'flying') raf.current = requestAnimationFrame(loop)
    else { raf.current = 0; st.last = 0 }
  }, [draw, onHit, buzz, reset])
  const ensureLoop = useCallback(() => { if (!raf.current) { s.current.last = 0; raf.current = requestAnimationFrame(loop) } }, [loop])
  useEffect(() => { alive.current = true; draw(); return () => { alive.current = false; cancelAnimationFrame(raf.current); raf.current = 0 } }, [draw, host])

  const toSvg = (e: React.PointerEvent) => {
    const el = svg.current!, pt = el.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY
    const p = pt.matrixTransform(el.getScreenCTM()!.inverse()); return { x: W - p.y, y: p.x }
  }
  const onDown = (e: React.PointerEvent) => {
    const st = s.current
    if (st.phase !== 'idle' || st.vib) return
    const p = toSvg(e)
    if (Math.hypot(p.x - (REST.x + st.nx), p.y - (REST.y + st.ny)) > 54) return
    onGesture?.()
    st.pointer = e.pointerId; (e.currentTarget as Element).setPointerCapture(e.pointerId)
    st.tier = 0; set('drawing'); setHint('Hold steady, then release to shoot.'); buzz(8)
  }
  const onMove = (e: React.PointerEvent) => {
    const st = s.current
    if (st.phase !== 'drawing' || e.pointerId !== st.pointer) return
    const p = toSvg(e)
    const dx = Math.max(0, REST.x - p.x), dy = p.y - REST.y
    const d = Math.hypot(dx, dy)
    if (dx < 3) { st.nx = 0; st.ny = 0; draw(); return }
    const eff = MAX_PULL * (1 - Math.exp(-d / (MAX_PULL * 0.85)))
    const ux = -dx / d, uy = Math.max(-1, Math.min(1, dy / Math.max(d, 1))) * 0.8
    const n = Math.hypot(ux, uy)
    st.nx = (ux / n) * eff; st.ny = (uy / n) * eff
    const tier = Math.floor((eff / MAX_PULL) * 4)
    if (tier > st.tier) { buzz(6 + tier * 3); st.tier = tier } else st.tier = tier
    draw()
  }
  const release = (e: React.PointerEvent) => {
    const st = s.current
    if (st.phase !== 'drawing' || e.pointerId !== st.pointer) return
    st.pointer = -1
    const pull = Math.hypot(st.nx, st.ny)
    if (pull < MIN_PULL) { st.vib = true; st.vx = 0; st.vy = 0; set('idle'); setHint('Pull a little further back.'); ensureLoop(); return }
    const L = launch(st.nx, st.ny)
    st.avx = L.avx; st.avy = L.avy; st.px = L.sx; st.py = L.sy
    st.vx = 0; st.vy = 0; st.vib = true
    set('flying'); setHint('Flying...'); buzz([14, 20]); ensureLoop()
  }
  const hit = phase === 'hit'
  if (!host) return null
  return createPortal(
    <div className={`hs-stage ${phase}`} style={{ position: 'fixed', left: 0, right: 0, top: 'calc(66px + env(safe-area-inset-top))', bottom: 'calc(58px + env(safe-area-inset-bottom))', zIndex: 3, userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'none' }}>
      <p className="hs-title">{title}</p>
      <svg ref={svg} className="hs-svg" viewBox={`0 0 ${H} ${W}`} preserveAspectRatio="xMidYMid meet" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={release} onPointerCancel={release}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', touchAction: 'none', cursor: 'grab', WebkitTapHighlightColor: 'transparent' }} role="img" aria-label="Interactive bow and arrow. Drag the arrow back and release it toward the heart.">
        <defs>
          <radialGradient id="hsHeart" cx=".34" cy=".28" r=".95"><stop offset="0" stopColor="#ffd3e6" /><stop offset=".42" stopColor="#ff6b9e" /><stop offset="1" stopColor="#cf1558" /></radialGradient>
          <radialGradient id="hsGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ff7aa6" stopOpacity=".55" /><stop offset=".5" stopColor="#ffa9a0" stopOpacity=".26" /><stop offset="1" stopColor="#ffd2b8" stopOpacity="0" /></radialGradient>
          <linearGradient id="hsWood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9a6a45" /><stop offset="1" stopColor="#5d3a22" /></linearGradient>
          <filter id="hsDrop" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="3" stdDeviation="3.2" floodColor="#b3205f" floodOpacity=".38" /></filter>
        </defs>
        <g transform={`translate(0 ${W}) rotate(-90)`}>
          <g transform={`translate(${HEART.x} ${HEART.y}) rotate(90)`}>
            <circle r="96" fill="url(#hsGlow)" />
            <ellipse cx="-16" cy="0" rx="70" ry="44" fill="#ffc9b0" opacity=".28" />
            <g className={`hs-heart ${hit ? 'hit' : ''}`}>
              <g transform="scale(.62)" filter="url(#hsDrop)">
                <path d="M0 36 C-9 25 -48 5 -42 -22 C-39 -41 -10 -43 0 -22 C10 -43 39 -41 42 -22 C48 5 9 25 0 36Z" fill="url(#hsHeart)" />
                <ellipse cx="-20" cy="-17" rx="11" ry="6.4" transform="rotate(-8 -20 -17)" fill="#fff" opacity=".8" />
              </g>
            </g>
          </g>
          <path ref={traj} fill="none" stroke="#e36a98" strokeOpacity=".45" strokeWidth="1.2" strokeDasharray="1 4.5" strokeLinecap="round" />
          {hit && <g transform={`translate(${HEART.x} ${HEART.y})`}>{Array.from({ length: 16 }, (_, i) => <g key={i} className="hs-mini" style={{ ['--dx' as string]: `${Math.cos(i * 2.4) * (44 + (i % 5) * 14)}px`, ['--dy' as string]: `${Math.sin(i * 2.4) * (44 + (i % 4) * 16)}px`, animationDelay: `${(i % 4) * .05}s` } as React.CSSProperties}><path d="M0 6 C-4 2 -9 -1 -6 -5 C-4 -8 0 -6 0 -4 C0 -6 4 -8 6 -5 C9 -1 4 2 0 6Z" transform="rotate(90) scale(.8)" fill={i % 2 ? '#ff7aa6' : '#f6b73c'} /></g>)}</g>}
          {hit && <><circle className="hs-shock" cx={HEART.x} cy={HEART.y} r="26" /><circle className="hs-shock two" cx={HEART.x} cy={HEART.y} r="26" /></>}
          <path ref={limbTop} fill="none" stroke="url(#hsWood)" strokeWidth="3.6" strokeLinecap="round" />
          <path ref={limbBot} fill="none" stroke="url(#hsWood)" strokeWidth="3.6" strokeLinecap="round" />
          <rect x={HOLD.x - 5.5} y={HOLD.y - 4.6} width="10" height="9.2" rx="3" fill="#4a2b17" />
          <path ref={string} fill="none" stroke="#a89488" strokeWidth=".9" strokeLinejoin="round" />
          <g ref={arrow}>
            <line x1="0" y1="0" x2={ARROW_LEN - 8} y2="0" stroke="#8a5a3b" strokeWidth="1.6" strokeLinecap="round" />
            <path d="M2 0 L-3 -4.6 L8 -3.8 Z M2 0 L-3 4.6 L8 3.8 Z" fill="#f0467a" />
            <g transform={`translate(${ARROW_LEN - 5} 0) rotate(-90)`}>
              <path d="M3 -2 Q10 -9 12.5 -3 Q8 -2 3 0Z M-3 -2 Q-10 -9 -12.5 -3 Q-8 -2 -3 0Z" fill="#fff3df" stroke="#ead3ac" strokeWidth=".5" />
              <path d="M0 5 C-1 3 -6 1 -5 -2 C-4.5 -4.6 -1 -4.6 0 -2.5 C1 -4.6 4.5 -4.6 5 -2 C6 1 1 3 0 5Z" fill="#f6b73c" stroke="#d9901a" strokeWidth=".5" />
            </g>
          </g>
        </g>
      </svg>
      <p className="hs-foot" style={{ opacity: phase === 'hit' ? 0 : 1 }}>PULL &amp; RELEASE</p>
      <span className="sr-only" role="status">{hint}</span>
    </div>, host)
}
