import { useEffect, useRef } from 'react'
import { sfx } from '../lib/sfx'

type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; g: number; size: number; color: string; kind: 'spark' | 'heart' | 'conf' | 'star' | 'flash'; rot: number; vr: number; drag: number }
const KINDS = ['firework', 'love', 'confetti', 'crackers', 'stars'] as const
type Kind = typeof KINDS[number]

/**
 * Full-screen tap playground: every tap on empty space sets off a different big effect —
 * firework, heart burst, confetti cannon, string of firecrackers, star shower — with sound and vibration.
 */
export default function TapFX({ active = true, colors, buzz }: { active?: boolean; colors: string[]; buzz?: (p: number | number[]) => void }) {
  const cv = useRef<HTMLCanvasElement>(null)
  const parts = useRef<P[]>([])
  const raf = useRef(0)
  const turn = useRef(Math.floor(Math.random() * KINDS.length))
  const colorsRef = useRef(colors); colorsRef.current = colors
  const buzzRef = useRef(buzz); buzzRef.current = buzz

  useEffect(() => {
    const c = cv.current; if (!c) return
    const ctx = c.getContext('2d'); if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const size = () => { c.width = window.innerWidth * dpr; c.height = window.innerHeight * dpr; c.style.width = '100%'; c.style.height = '100%' }
    size(); window.addEventListener('resize', size)
    const col = () => colorsRef.current[Math.floor(Math.random() * colorsRef.current.length)] || '#ff7aa8'
    const add = (p: Partial<P> & { x: number; y: number }) => parts.current.push({ vx: 0, vy: 0, life: 0, max: 1.2, g: 0, size: 3, color: col(), kind: 'spark', rot: 0, vr: 0, drag: .985, ...p })
    const firework = (x: number, y: number) => {
      add({ x, y, kind: 'flash', max: .25, size: 90, color: '#fff' })
      for (let i = 0; i < 70; i++) { const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 260; add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 180, max: 1 + Math.random() * .9, size: 2 + Math.random() * 2.2 }) }
      for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; add({ x, y, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, g: 140, max: 1.4, size: 3, color: '#fff3c2' }) }
    }
    const love = (x: number, y: number) => {
      add({ x, y, kind: 'flash', max: .3, size: 110, color: '#ffb3d1' })
      for (let i = 0; i < 46; i++) { const t = (i / 46) * Math.PI * 2; const hx = 16 * Math.pow(Math.sin(t), 3), hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); add({ x, y, vx: hx * 16, vy: hy * 16, g: -10, max: 1.7, size: 9 + Math.random() * 9, kind: 'heart', rot: (Math.random() - .5) * .6 }) }
      for (let i = 0; i < 14; i++) add({ x: x + (Math.random() - .5) * 80, y, vx: (Math.random() - .5) * 60, vy: -80 - Math.random() * 160, g: -20, max: 2.2, size: 8 + Math.random() * 10, kind: 'heart' })
    }
    const confetti = (x: number, y: number) => {
      for (let side = -1; side <= 1; side += 2) for (let i = 0; i < 42; i++) { const a = -Math.PI / 2 + side * (.25 + Math.random() * .7); const v = 380 + Math.random() * 380; add({ x: side < 0 ? x - 30 : x + 30, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 520, max: 2.4 + Math.random(), size: 5 + Math.random() * 6, kind: 'conf', rot: Math.random() * 6, vr: (Math.random() - .5) * 16, drag: .975 }) }
    }
    const crackers = (x: number, y: number) => {
      for (let n = 0; n < 11; n++) window.setTimeout(() => {
        const px = x + (Math.random() - .5) * 220, py = y + (Math.random() - .5) * 120
        add({ x: px, y: py, kind: 'flash', max: .12, size: 34, color: '#fff7d6' })
        for (let i = 0; i < 16; i++) { const a = Math.random() * Math.PI * 2, v = 70 + Math.random() * 190; add({ x: px, y: py, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 260, max: .45 + Math.random() * .4, size: 1.6 + Math.random() * 1.6, color: Math.random() > .5 ? '#ffd27a' : '#ff8a5c' }) }
      }, n * 75)
    }
    const stars = (x: number, y: number) => {
      for (let i = 0; i < 38; i++) { const a = Math.random() * Math.PI * 2, v = 40 + Math.random() * 200; add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, g: 60, max: 1.6 + Math.random(), size: 7 + Math.random() * 11, kind: 'star', rot: Math.random() * 6, vr: (Math.random() - .5) * 5 }) }
    }
    const FX: Record<Kind, (x: number, y: number) => void> = { firework, love, confetti, crackers, stars }
    const buzzes: Record<Kind, number[]> = { firework: [30, 30, 60], love: [20, 40, 20, 40, 50], confetti: [15, 15, 15, 15, 15], crackers: [8, 20, 8, 20, 8, 20, 8, 20, 8], stars: [10, 30, 10] }

    let last = 0
    const draw = (t: number) => {
      const dt = Math.min(.04, (t - (last || t)) / 1000); last = t
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, c.width, c.height)
      ctx.globalCompositeOperation = 'lighter'
      parts.current = parts.current.filter(p => (p.life += dt) < p.max)
      for (const p of parts.current) {
        p.vx *= Math.pow(p.drag, dt * 60); p.vy = p.vy * Math.pow(p.drag, dt * 60) + p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt
        const k = 1 - p.life / p.max; ctx.globalAlpha = Math.max(0, Math.min(1, k * 1.4)); ctx.fillStyle = p.color; ctx.strokeStyle = p.color
        if (p.kind === 'flash') { const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * (1.4 - k)); g.addColorStop(0, p.color); g.addColorStop(1, 'transparent'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 1.4, 0, 7); ctx.fill() }
        else if (p.kind === 'spark') { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (.4 + k * .6), 0, 7); ctx.fill(); ctx.lineWidth = p.size * .6; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * .035, p.y - p.vy * .035); ctx.stroke() }
        else if (p.kind === 'conf') { ctx.globalCompositeOperation = 'source-over'; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.scale(1, Math.cos(p.life * 9 + p.rot)); ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); ctx.restore(); ctx.globalCompositeOperation = 'lighter' }
        else { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.font = `${p.size * 2}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.kind === 'heart' ? '♥' : '✦', 0, 0); ctx.restore() }
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'
      if (parts.current.length) raf.current = requestAnimationFrame(draw); else { raf.current = 0; last = 0; ctx.clearRect(0, 0, c.width, c.height) }
    }
    const onTap = (e: PointerEvent) => {
      if (!active) return
      const t = e.target as HTMLElement | null
      if (t?.closest('button,a,input,textarea,video,select,[role="dialog"] .icon-btn,.no-tapfx')) return
      const kind = KINDS[turn.current++ % KINDS.length]
      FX[kind](e.clientX, e.clientY); sfx.boom(kind); buzzRef.current?.(buzzes[kind])
      if (!raf.current) raf.current = requestAnimationFrame(draw)
    }
    window.addEventListener('pointerdown', onTap)
    return () => { window.removeEventListener('pointerdown', onTap); window.removeEventListener('resize', size); cancelAnimationFrame(raf.current); raf.current = 0; parts.current = [] }
  }, [active])
  return <canvas ref={cv} className="tapfx-canvas" aria-hidden="true" />
}
