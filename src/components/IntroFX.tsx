import { useEffect, useRef } from 'react'

/** Heavy full-screen intro effects drawn on one canvas. Mounted inside FullScreenFX so it always fills the whole screen (never cropped). */
export type IntroStyle = 'confetti' | 'fireworks' | 'petals' | 'butterflies' | 'galaxy' | 'neon' | 'hearts' | 'gold' | 'aurora'
type P = { x: number; y: number; vx: number; vy: number; a: number; life: number; max: number; s: number; c: string; r: number; vr: number; k: number; ph: number }
const rnd = (a: number, b: number) => a + Math.random() * (b - a)

export default function IntroFX({ style, colors }: { style: IntroStyle; colors: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current, g = cv?.getContext('2d'); if (!cv || !g) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let W = 0, H = 0
    const size = () => { W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0) }
    size(); window.addEventListener('resize', size)
    const col = () => colors[Math.floor(Math.random() * colors.length)] || '#ff8fc2'
    let ps: P[] = [], t = 0, raf = 0, last = performance.now()
    const mk = (o: Partial<P>): P => ({ x: 0, y: 0, vx: 0, vy: 0, a: 1, life: 0, max: 4, s: 6, c: col(), r: 0, vr: 0, k: 0, ph: Math.random() * 6.28, ...o })
    const max = reduce ? 30 : style === 'galaxy' ? 150 : 110
    const spawn = () => {
      switch (style) {
        case 'confetti': { const side = Math.random() < .5 ? 0 : 1; ps.push(mk({ x: side ? W + 10 : -10, y: H * .75, vx: (side ? -1 : 1) * rnd(150, 420), vy: -rnd(380, 760), s: rnd(6, 11), r: rnd(0, 6), vr: rnd(-9, 9), max: 5 })); break }
        case 'petals': ps.push(mk({ x: rnd(-40, W + 40), y: -20, vx: rnd(-20, 30), vy: rnd(50, 110), s: rnd(8, 16), r: rnd(0, 6), vr: rnd(-2, 2), max: 14 })); break
        case 'butterflies': ps.push(mk({ x: Math.random() < .5 ? -30 : W + 30, y: rnd(H * .1, H * .9), vx: 0, vy: 0, s: rnd(14, 26), max: 11, k: Math.random() < .5 ? 1 : -1 })); break
        case 'galaxy': ps.push(mk({ x: W / 2, y: H / 2, vx: rnd(-1, 1), vy: rnd(-1, 1), s: rnd(.6, 2.2), max: 3.5, c: Math.random() < .2 ? col() : '#ffffff' })); break
        case 'neon': ps.push(mk({ x: W / 2, y: H * .42, s: 10, max: 3.2, k: 1 })); break
        case 'hearts': ps.push(mk({ x: rnd(0, W), y: H + 20, vx: rnd(-15, 15), vy: -rnd(60, 150), s: rnd(9, 24), max: 10 })); break
        case 'gold': ps.push(mk({ x: rnd(0, W), y: rnd(0, H), vx: rnd(-10, 10), vy: rnd(-30, -6), s: rnd(1, 3.5), max: rnd(2, 4.5), c: Math.random() < .5 ? '#ffd36e' : '#fff3c4' })); break
        case 'aurora': break
        case 'fireworks': { const x = rnd(W * .12, W * .88), y = rnd(H * .1, H * .5), c = col(); for (let i = 0; i < 46; i++) { const an = (i / 46) * 6.28, sp = rnd(70, 230); ps.push(mk({ x, y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, s: rnd(1.6, 3), max: rnd(1, 1.9), c })) } break }
      }
    }
    const heart = (x: number, y: number, s: number) => { g.beginPath(); g.moveTo(x, y + s * .3); g.bezierCurveTo(x - s, y - s * .5, x - s * .5, y - s, x, y - s * .35); g.bezierCurveTo(x + s * .5, y - s, x + s, y - s * .5, x, y + s * .3); g.fill() }
    const wing = (s: number, flap: number) => { g.beginPath(); g.ellipse(-s * .55, -s * .3, s * .6 * flap, s * .8, -.5, 0, 6.28); g.fill(); g.beginPath(); g.ellipse(-s * .4, s * .5, s * .38 * flap, s * .5, .5, 0, 6.28); g.fill() }
    const tick = (now: number) => {
      const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt
      const fade = style === 'galaxy' ? .22 : style === 'neon' ? .18 : 1
      if (fade < 1) { g.fillStyle = `rgba(10,6,24,${fade})`; g.globalCompositeOperation = 'source-over'; g.fillRect(0, 0, W, H) } else g.clearRect(0, 0, W, H)
      const rate = style === 'fireworks' ? .9 : style === 'neon' ? .22 : style === 'butterflies' ? .5 : style === 'galaxy' ? .02 : .035
      if (ps.length < max && (style === 'confetti' ? Math.random() < .5 : Math.random() < dt / rate || (style === 'fireworks' && t < .2))) { const n = style === 'confetti' ? 3 : 1; for (let i = 0; i < n; i++) spawn() }
      if (style === 'aurora') {
        g.globalCompositeOperation = 'lighter'
        for (let i = 0; i < 4; i++) { const gr = g.createLinearGradient(0, 0, 0, H * .7); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.5, (colors[i % colors.length] || '#ff8fc2') + '55'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, H * .7); for (let x = 0; x <= W; x += 16) g.lineTo(x, H * .25 + Math.sin(x * .008 + t * .8 + i * 1.7) * 60 + Math.sin(x * .02 - t * 1.2 + i) * 22 + i * 26); g.lineTo(W, H * .7); g.fill() }
        g.globalCompositeOperation = 'source-over'
      }
      if (style === 'neon') { g.globalCompositeOperation = 'lighter'; g.lineWidth = 2 }
      ps = ps.filter(p => p.life < p.max)
      for (const p of ps) {
        p.life += dt; const u = p.life / p.max; p.a = u < .12 ? u / .12 : u > .75 ? (1 - u) / .25 : 1
        g.globalAlpha = Math.max(0, p.a) * (style === 'galaxy' ? 1 : .92); g.fillStyle = p.c; g.strokeStyle = p.c
        if (style === 'confetti') { p.vy += 620 * dt; p.vx *= .992; p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.scale(1, Math.cos(p.r * 1.7)); g.fillRect(-p.s / 2, -p.s, p.s, p.s * 1.8); g.restore() }
        else if (style === 'petals') { p.x += (p.vx + Math.sin(p.life * 1.6 + p.ph) * 38) * dt; p.y += p.vy * dt; p.r += p.vr * dt; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.beginPath(); g.ellipse(0, 0, p.s, p.s * .55 * Math.abs(Math.cos(p.life * 2 + p.ph)) + 1.5, 0, 0, 6.28); g.fill(); g.restore() }
        else if (style === 'butterflies') { const sp = 90; p.vx += (Math.cos(p.life * 1.3 + p.ph) * sp * p.k * -1 + p.k * -1 * -30) * dt * 2; p.x += (p.k * -1 * -1 * 0 + Math.sin(p.life * .9 + p.ph) * 60 + (p.k > 0 ? 70 : -70)) * dt; p.y += (Math.cos(p.life * 1.7 + p.ph) * 70 - 22) * dt; const ang = Math.atan2(Math.cos(p.life * 1.7 + p.ph) * 70 - 22, (p.k > 0 ? 70 : -70)); g.save(); g.translate(p.x, p.y); g.rotate(ang * .5); if (p.k < 0) g.scale(-1, 1); const fl = Math.abs(Math.sin(p.life * 11 + p.ph)) * .85 + .15; wing(p.s, fl); g.scale(-1, 1); wing(p.s, fl); g.restore() }
        else if (style === 'galaxy') { const sp = 1 + p.life * 2.4; p.x += p.vx * sp * 140 * dt * (1 + p.life); p.y += p.vy * sp * 140 * dt * (1 + p.life); g.beginPath(); g.arc(p.x, p.y, p.s * (1 + p.life * .7), 0, 6.28); g.fill() }
        else if (style === 'neon') { const r = p.life * 190 + 10; g.beginPath(); g.arc(p.x, p.y, r, 0, 6.28); g.stroke(); g.beginPath(); g.arc(p.x, p.y, r * .62, 0, 6.28); g.stroke() }
        else if (style === 'hearts') { p.x += (p.vx + Math.sin(p.life * 2 + p.ph) * 22) * dt; p.y += p.vy * dt; heart(p.x, p.y, p.s) }
        else if (style === 'gold') { p.x += (p.vx + Math.sin(p.life * 2 + p.ph) * 14) * dt; p.y += p.vy * dt; g.shadowColor = '#ffd36e'; g.shadowBlur = 10; g.beginPath(); g.arc(p.x, p.y, p.s * (.7 + Math.sin(p.life * 7 + p.ph) * .3), 0, 6.28); g.fill(); g.shadowBlur = 0 }
        else if (style === 'fireworks') { p.vy += 110 * dt; p.vx *= .985; p.vy *= .985; p.x += p.vx * dt; p.y += p.vy * dt; g.shadowColor = p.c; g.shadowBlur = 8; g.beginPath(); g.arc(p.x, p.y, p.s, 0, 6.28); g.fill(); g.shadowBlur = 0 }
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size) }
  }, [style, colors])
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
}
