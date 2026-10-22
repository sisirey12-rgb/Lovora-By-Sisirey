// @ts-nocheck  (canvas simulation; checked by running it headless, see README)
/**
 * Birthday cake baker: a small physics simulation drawn on a canvas.
 * Batter and cream really pour from a piping nozzle and fill each layer, frosting rosettes and
 * decorations fall with gravity and bounce, candles drop in and light. Time-driven, so it never glitches
 * on re-render.
 */
export type CakeCfg = { sponge: [string, string]; cream: string; frost: string; frost2: string; deco: string }
type Opts = {
  age?: number; seed: number; reduced: boolean
  get: () => { wished: boolean; blowAt: number; level: number }
  onUpdate: (u: { caption: string; progress: number; ready: boolean }) => void
}
const CW = 420, CH = 520, CX = 210, BASE = 450, R = 104, RY = 25, NY = 56
const SPONGE_H = 58, CREAM_H = 11, FROST_H = 9
const SEQ: [string, number][] = [['plate', .5], ['sponge', 1.1], ['cream', .6], ['sponge', 1.1], ['cream', .6], ['sponge', 1.1], ['frost', 1.3], ['deco', 1.4], ['candle', .8]]
const STARTS: number[] = []
let acc = 0
for (const [, d] of SEQ) { STARTS.push(acc); acc += d }
export const CAKE_TOTAL = acc
const TOPF = BASE - SPONGE_H * 3 - CREAM_H * 2 - FROST_H

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (q: number) => 1 - Math.pow(1 - q, 3)
const hex = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16))
const mix = (a: string, b: string, t: number) => { const x = hex(a), y = hex(b); return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})` }
const rng = (seed: number) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }

type Body = { x: number; y: number; vy: number; yl: number; td: number; rest: boolean; e: number; la: number; k: string; a: number; c: string; s: number }
const mk = (x: number, y: number, yl: number, td: number, e: number, k: string, c = '', a = 0, s = 0): Body => ({ x, y, vy: 0, yl, td, rest: false, e, la: 0, k, a, c, s })
const step = (b: Body, t: number, dt: number) => {
  if (t < b.td || b.rest) return
  b.vy += 2600 * dt; b.y += b.vy * dt
  if (b.y >= b.yl) { b.y = b.yl; if (!b.la) b.la = t; if (b.vy > 130) b.vy = -b.vy * b.e; else { b.vy = 0; b.rest = true } }
}
const ball = (g, cy: number, r: number, c1: string, c2: string) => { const gr = g.createRadialGradient(-r * .35, cy - r * .4, r * .1, 0, cy, r); gr.addColorStop(0, c1); gr.addColorStop(1, c2); g.fillStyle = gr; g.beginPath(); g.arc(0, cy, r, 0, Math.PI * 2); g.fill() }
const heartPath = (g, s: number) => { g.beginPath(); g.moveTo(0, s * .9); g.bezierCurveTo(-s * 1.25, s * .1, -s * .95, -s * .95, 0, -s * .35); g.bezierCurveTo(s * .95, -s * .95, s * 1.25, s * .1, 0, s * .9); g.closePath() }

function drawDeco(g, k: string, b: Body) {
  switch (k) {
    case 'berries': ball(g, -9, 9, '#ff8aa6', '#c01f52'); g.fillStyle = '#4fae5f'; g.beginPath(); g.ellipse(-3, -19, 5, 2.4, -.5, 0, 6.3); g.ellipse(3, -19, 5, 2.4, .5, 0, 6.3); g.fill(); g.fillStyle = '#ffe9a8'; for (let i = 0; i < 5; i++) g.fillRect(-5 + i * 2.5, -12 + (i % 2) * 5, 1.2, 1.6); break
    case 'blueberries': ball(g, -8, 8, '#8a9cf2', '#2a3787'); g.fillStyle = '#1d2766'; g.beginPath(); g.arc(0, -12, 2.4, 0, 6.3); g.fill(); break
    case 'choco': { const gr = g.createLinearGradient(-8, -12, 8, 0); gr.addColorStop(0, '#7a4636'); gr.addColorStop(1, '#2b130f'); g.fillStyle = gr; g.fillRect(-8, -12, 16, 12); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-8, -12, 16, 2); break }
    case 'gold': ball(g, -6, 6.5, '#fff3b0', '#c8922c'); break
    case 'hearts': { g.save(); g.translate(0, -9); heartPath(g, 9); const gr = g.createLinearGradient(-8, -8, 8, 8); gr.addColorStop(0, '#ffa6cb'); gr.addColorStop(1, '#d9306f'); g.fillStyle = gr; g.fill(); g.restore(); break }
    case 'crumb': g.fillStyle = '#8c1f3a'; g.beginPath(); g.moveTo(-8, 0); g.lineTo(-6, -9); g.lineTo(0, -12); g.lineTo(7, -8); g.lineTo(8, 0); g.closePath(); g.fill(); g.fillStyle = 'rgba(255,170,190,.35)'; g.fillRect(-4, -9, 5, 2); break
    case 'flowers': { g.save(); g.translate(0, -9); for (let i = 0; i < 5; i++) { g.save(); g.rotate(i * 1.2566); g.fillStyle = i % 2 ? '#ffffff' : '#ffd1e4'; g.beginPath(); g.ellipse(0, -6, 4, 6, 0, 0, 6.3); g.fill(); g.restore() } g.fillStyle = '#ffcf4a'; g.beginPath(); g.arc(0, 0, 3.4, 0, 6.3); g.fill(); g.restore(); break }
    case 'sprinkle': g.rotate(b.a); g.fillStyle = b.c; g.fillRect(-4.2, -1.4, 8.4, 2.8); break
    default: ball(g, -6, 6.5, '#ffffff', '#e7c9dd')
  }
}
function drawRose(g, cfg: CakeCfg) {
  const cols = [cfg.frost2, mix(cfg.frost2, cfg.frost, .5), cfg.frost]
  for (let i = 0; i < 3; i++) { g.fillStyle = cols[i]; g.beginPath(); g.ellipse(0, -5 - i * 6, 15 - i * 4, 7 - i * 1.4, 0, 0, 6.3); g.fill() }
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(-3, -19, 3, 1.6, -.3, 0, 6.3); g.fill()
}
function flame(g, x: number, y: number, sc: number, lean: number, t: number, seed: number) {
  if (sc <= .02) return
  const f = 1 + Math.sin(t * 18 + seed) * .06 + Math.sin(t * 31 + seed * 2) * .04
  g.save(); g.translate(x, y); g.transform(1, 0, -lean * .6, 1, 0, 0); g.scale(sc, sc * f)
  const gl = g.createRadialGradient(0, -14, 2, 0, -14, 30); gl.addColorStop(0, 'rgba(255,200,90,.45)'); gl.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = gl; g.beginPath(); g.arc(0, -14, 30, 0, 6.3); g.fill()
  g.fillStyle = '#ffb93d'; g.beginPath(); g.moveTo(0, -32); g.bezierCurveTo(9, -20, 8, -6, 0, -2); g.bezierCurveTo(-8, -6, -9, -20, 0, -32); g.fill()
  g.fillStyle = '#fff3b8'; g.beginPath(); g.moveTo(0, -24); g.bezierCurveTo(4, -16, 3.5, -8, 0, -5); g.bezierCurveTo(-3.5, -8, -4, -16, 0, -24); g.fill()
  g.restore()
}

export function createCakeSim(cv: HTMLCanvasElement, cfg: CakeCfg, o: Opts): () => void {
  const g = cv.getContext('2d'); if (!g) return () => {}
  const dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1)
  cv.width = CW * dpr; cv.height = CH * dpr
  const rnd = rng(o.seed), [c0, c1] = cfg.sponge
  const digits = o.age && o.age >= 1 && o.age <= 99 ? String(Math.round(o.age)).split('') : null
  const rosettes: Body[] = []
  for (let i = 0; i < 16; i++) { const ang = (i / 16) * Math.PI * 2 + .35; rosettes.push(mk(CX + Math.cos(ang) * R * .8, NY + 8, TOPF + Math.sin(ang) * RY * .8 + 3, STARTS[6] + .1 + (i / 16) * (SEQ[6][1] - .45), 0, 'rose')) }
  rosettes.push(mk(CX, NY + 8, TOPF + 3, STARTS[6] + SEQ[6][1] - .3, 0, 'rose'))
  const decos: Body[] = []
  for (let i = 0; i < 11; i++) { const ang = (i / 11) * Math.PI * 2 + rnd() * .4, rad = i === 10 ? 0 : .42 + rnd() * .4; decos.push(mk(CX + Math.cos(ang) * R * rad, -30, TOPF + Math.sin(ang) * RY * rad - 1, STARTS[7] + (i / 11) * (SEQ[7][1] - .5), .38, cfg.deco)) }
  const palette = [cfg.frost2, c1, '#ffd36e', '#ffffff', '#8fe3b6', '#9fb8ff']
  const sprinkles: Body[] = []
  for (let i = 0; i < 34; i++) { const ang = rnd() * Math.PI * 2, rad = .15 + rnd() * .7; sprinkles.push(mk(CX + Math.cos(ang) * R * rad, -20, TOPF + Math.sin(ang) * RY * rad, STARTS[7] + rnd() * (SEQ[7][1] - .35), .3, 'sprinkle', palette[i % palette.length], rnd() * Math.PI)) }
  const n = digits ? digits.length : 1
  const candles: Body[] = []
  for (let i = 0; i < n; i++) candles.push(mk(CX + (i - (n - 1) / 2) * (digits ? 50 : 0), -90, TOPF + 5, STARTS[8] + .02 + i * .1, .25, 'candle', digits ? digits[i] : '', 0, i))
  const all = [...rosettes, ...decos, ...sprinkles, ...candles]
  const drips = [0, 1].map(() => Array.from({ length: 9 }, (_, j) => ({ a: Math.PI * (.1 + .8 * j / 8), len: 7 + rnd() * 17 })))
  const parts: { x: number; y: number; vx: number; vy: number; r: number; c: string; life: number }[] = []
  const smoke: { x: number; y: number; t0: number; r: number }[] = []
  let raf = 0, last = 0, t0 = 0, cap = '', pct = -1, readyFired = false, wishedAt = -1, lastPuff = 0
  const flamePts: { x: number; y: number }[] = []

  const body = (yb: number, h: number, rx: number, ry: number, cs: string[], top: string, ripple = 0) => {
    const yt = yb - h
    const gr = g.createLinearGradient(CX - rx, 0, CX + rx, 0); gr.addColorStop(0, cs[0]); gr.addColorStop(.35, cs[1]); gr.addColorStop(.7, cs[1]); gr.addColorStop(1, cs[0])
    g.fillStyle = gr; g.beginPath(); g.ellipse(CX, yt, rx, ry, 0, Math.PI, 0, true); g.lineTo(CX + rx, yb); g.ellipse(CX, yb, rx, ry, 0, 0, Math.PI, false); g.closePath(); g.fill()
    g.fillStyle = top; g.beginPath(); g.ellipse(CX, yt, rx, ry * (1 + ripple), 0, 0, Math.PI * 2); g.fill()
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.4; g.beginPath(); g.ellipse(CX, yt, rx - 2, ry * (1 + ripple) - 1, 0, Math.PI * .1, Math.PI * .9); g.stroke()
  }

  const frame = (now: number) => {
    if (!t0) t0 = now - (o.reduced ? CAKE_TOTAL * 1000 : 0)
    const dt = last ? Math.min(.04, (now - last) / 1000) : .016; last = now
    const t = (now - t0) / 1000, st = o.get()
    for (const b of all) step(b, t, dt)
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, CW, CH)

    // plate + stand
    const pq = ease(clamp(t / SEQ[0][1]))
    g.save(); g.globalAlpha = pq
    g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(CX, BASE + 62, R + 54, 13, 0, 0, 6.3); g.fill()
    const ped = g.createLinearGradient(CX - 20, 0, CX + 20, 0); ped.addColorStop(0, '#cfc3dc'); ped.addColorStop(.5, '#fbf7ff'); ped.addColorStop(1, '#b9abc9')
    g.fillStyle = ped; g.fillRect(CX - 18, BASE + 24, 36, 34); g.beginPath(); g.ellipse(CX, BASE + 58, 64, 9, 0, 0, 6.3); g.fill()
    const pl = g.createLinearGradient(0, BASE - 20, 0, BASE + 50); pl.addColorStop(0, '#ffffff'); pl.addColorStop(1, '#d6cbe4')
    g.fillStyle = pl; g.beginPath(); g.ellipse(CX, BASE + 8, R + 34, RY + 9, 0, 0, 6.3); g.fill(); g.strokeStyle = 'rgba(160,130,190,.5)'; g.lineWidth = 1.5; g.stroke()
    g.restore()

    // stack of layers (sponge / cream / frosting), growing while poured
    let yb = BASE, curK = 'plate', curQ = 0, curI = 0
    SEQ.forEach(([k, d], i) => { if (t >= STARTS[i] && (t < STARTS[i] + d || i === SEQ.length - 1)) { curK = k; curQ = clamp((t - STARTS[i]) / d); curI = i } })
    let creamIdx = 0, topNow = BASE
    SEQ.forEach(([k, d], i) => {
      if (t < STARTS[i] || (k !== 'sponge' && k !== 'cream' && k !== 'frost')) return
      const q = clamp((t - STARTS[i]) / d), full = k === 'sponge' ? SPONGE_H : k === 'cream' ? CREAM_H : FROST_H, h = full * ease(q)
      if (h < .5) return
      const age = t - STARTS[i] - d, ripple = age > 0 && age < 1 ? .14 * Math.sin(age * 34) * Math.exp(-age * 5) : 0
      if (k === 'sponge') body(yb, h, R, RY, [c0, c1], mix(c1, '#ffffff', .3), ripple)
      else if (k === 'cream') {
        body(yb, h, R + 2, RY, [mix(cfg.cream, '#d8c4d2', .4), cfg.cream], cfg.cream, ripple)
        const dq = clamp((q - .55) / .45); g.lineCap = 'round'; g.strokeStyle = cfg.cream; g.lineWidth = 7
        drips[creamIdx % 2].forEach(dp => { const x = CX + Math.cos(dp.a) * (R + 1), y = yb - h + Math.sin(dp.a) * RY; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + dp.len * ease(dq) + 2); g.stroke() })
        creamIdx++
      } else body(yb, h, R + 1, RY, [mix(cfg.frost, '#b98aa0', .25), cfg.frost], mix(cfg.frost, '#ffffff', .4), ripple)
      yb -= h; topNow = yb
    })

    // frosting rosettes, sprinkles and decorations fall in (back to front)
    const drawBodies = (list: Body[], fn: (b: Body) => void) => {
      list.filter(b => t >= b.td).sort((a, b) => a.yl - b.yl).forEach(b => {
        const sq = b.la ? Math.exp(-(t - b.la) * 10) * Math.cos((t - b.la) * 30) * .3 : 0
        const sy = b.la ? 1 - sq : 1 + Math.min(.3, Math.abs(b.vy) / 5000)
        g.save(); g.translate(b.x, b.y); g.scale(b.k === 'sprinkle' ? 1 : (b.la ? 1 + sq * .6 : 1 / sy), b.k === 'sprinkle' ? 1 : sy); fn(b); g.restore()
      })
    }
    drawBodies(rosettes, () => drawRose(g, cfg))
    drawBodies(sprinkles, b => drawDeco(g, 'sprinkle', b))
    drawBodies(decos, b => drawDeco(g, b.k, b))

    // candles + flames
    const ign = clamp((t - (CAKE_TOTAL - .25)) / .35)
    const blowT = st.blowAt ? (now - st.blowAt) / 1000 : 0
    const lean = Math.max(st.level, ease(clamp(blowT / .5)))
    const fs = st.wished ? 0 : ign * (1 - clamp((blowT - .45) / .55))
    flamePts.length = 0
    drawBodies(candles, b => {
      if (digits) {
        const gr = g.createLinearGradient(-22, -60, 22, 0); [0, .25, .5, .75, 1].forEach((p, i) => gr.addColorStop(p, i % 2 ? '#ffffff' : '#ff9fc4'))
        g.font = '800 70px Fredoka, "DM Sans", sans-serif'; g.textAlign = 'center'; g.lineJoin = 'round'
        g.lineWidth = 5; g.strokeStyle = 'rgba(255,255,255,.85)'; g.strokeText(b.c, 0, -2); g.fillStyle = gr; g.fillText(b.c, 0, -2)
        g.strokeStyle = '#3a2a30'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -60); g.lineTo(0, -66); g.stroke()
        flamePts.push({ x: b.x, y: b.y - 66 })
      } else {
        const gr = g.createLinearGradient(-5, 0, 5, 0); gr.addColorStop(0, '#ff9fc4'); gr.addColorStop(.5, '#ffffff'); gr.addColorStop(1, '#ff9fc4')
        g.fillStyle = gr; g.fillRect(-4.5, -48, 9, 48); g.strokeStyle = 'rgba(255,120,170,.6)'; g.lineWidth = 2; for (let y = -42; y < 0; y += 12) { g.beginPath(); g.moveTo(-4.5, y + 8); g.lineTo(4.5, y); g.stroke() }
        g.strokeStyle = '#3a2a30'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(0, -48); g.lineTo(0, -54); g.stroke()
        flamePts.push({ x: b.x, y: b.y - 54 })
      }
    })
    candles.forEach((b, i) => { if (t >= b.td && flamePts[i]) flame(g, b.x + 0, flamePts[i].y, fs, lean, t, i * 3.7) })

    // smoke after the wish
    if (st.wished && wishedAt < 0) wishedAt = t
    if (wishedAt >= 0 && t - wishedAt < 1.1 && t - lastPuff > .07) { lastPuff = t; flamePts.forEach(p => smoke.push({ x: p.x, y: p.y - 6, t0: t, r: rnd() * 6 })) }
    for (let i = smoke.length - 1; i >= 0; i--) { const p = smoke[i], a = t - p.t0; if (a > 1.8) { smoke.splice(i, 1); continue } g.fillStyle = `rgba(230,225,240,${.32 * (1 - a / 1.8)})`; g.beginPath(); g.arc(p.x + Math.sin(a * 3 + p.r) * 8, p.y - a * 55, 5 + a * 10, 0, 6.3); g.fill() }

    // piping bag, nozzle and the pouring stream
    const retire = t >= STARTS[7] ? ease(clamp((t - STARTS[7]) / .5)) : 0, enter = ease(clamp(t / .5))
    let nx = CX
    if (curK === 'sponge') nx = CX + Math.sin(t * 6) * 8
    else if (curK === 'cream') nx = CX + Math.sin((t - STARTS[curI]) * 10) * 40
    else if (curK === 'frost') { for (const r of rosettes) if (t >= r.td) nx = r.x }
    const ny = NY - 110 * (1 - enter) - 140 * retire
    if (ny > -150) {
      const pouring = (curK === 'sponge' || curK === 'cream') && curQ > .04 && curQ < .93
      if (pouring) {
        const col = curK === 'sponge' ? c1 : cfg.cream, w = 9 * (1 - clamp((curQ - .8) / .13) * .7)
        g.lineCap = 'round'; g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.moveTo(nx, ny + 12); g.quadraticCurveTo(nx + Math.sin(t * 25) * 3, (ny + topNow) / 2, nx, topNow); g.stroke()
        g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = w * .3; g.beginPath(); g.moveTo(nx - 1.5, ny + 14); g.lineTo(nx - 1.5, topNow); g.stroke()
        for (let i = 0; i < 2 && parts.length < 140; i++) parts.push({ x: nx + (Math.random() - .5) * 8, y: topNow, vx: (Math.random() - .5) * 150, vy: -(60 + Math.random() * 140), r: 1.2 + Math.random() * 2, c: col, life: .55 })
      }
      const bag = g.createLinearGradient(nx - 40, 0, nx + 40, 0); bag.addColorStop(0, '#eadff2'); bag.addColorStop(.5, '#ffffff'); bag.addColorStop(1, '#d4c7e2')
      g.fillStyle = bag; g.strokeStyle = 'rgba(120,90,140,.35)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(nx - 40, ny - 190); g.lineTo(nx + 40, ny - 190); g.lineTo(nx + 9, ny - 6); g.lineTo(nx - 9, ny - 6); g.closePath(); g.fill(); g.stroke()
      g.beginPath(); g.moveTo(nx - 14, ny - 120); g.lineTo(nx - 3, ny - 10); g.moveTo(nx + 16, ny - 110); g.lineTo(nx + 4, ny - 10); g.stroke()
      const tip = g.createLinearGradient(nx - 10, 0, nx + 10, 0); tip.addColorStop(0, '#9d92ad'); tip.addColorStop(.5, '#f4efff'); tip.addColorStop(1, '#8b809b')
      g.fillStyle = tip; g.beginPath(); g.moveTo(nx - 10, ny - 6); g.lineTo(nx + 10, ny - 6); g.lineTo(nx + 4, ny + 12); g.lineTo(nx - 4, ny + 12); g.closePath(); g.fill(); g.stroke()
    }
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue } g.globalAlpha = clamp(p.life * 2.2); g.fillStyle = p.c; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.3); g.fill(); g.globalAlpha = 1 }

    // report progress to the page (captions, progress bar, ready)
    const sIdx = [1, 3, 5].indexOf(curI)
    const caption = t >= CAKE_TOTAL ? '' : curK === 'plate' ? 'Setting the stand…' : curK === 'sponge' ? ['Pouring the first sponge…', 'Another soft layer…', 'The last sponge layer…'][Math.max(0, sIdx)] : curK === 'cream' ? 'Piping fluffy cream…' : curK === 'frost' ? 'Frosting swirls…' : curK === 'deco' ? 'Adding the sweet finishing touches ✨' : 'Placing the candles 🕯️'
    const p100 = Math.round(clamp(t / CAKE_TOTAL) * 100), ready = t >= CAKE_TOTAL + .3
    if (caption !== cap || p100 !== pct || (ready && !readyFired)) { cap = caption; pct = p100; if (ready) readyFired = true; o.onUpdate({ caption, progress: p100, ready }) }
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(raf)
}
