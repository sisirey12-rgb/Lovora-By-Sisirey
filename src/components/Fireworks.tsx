import { useEffect, useRef } from 'react'
import { audio } from '../lib/audioManager'
type P = { x: number; y: number; vx: number; vy: number; life: number; c: string; r: number }
/** Fireworks that launch on the music's bass beat (falls back to a steady rhythm if the beat can't be read). */
export default function Fireworks({ colors }: { colors: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current, x = c?.getContext('2d'); if (!c || !x) return
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = c.clientWidth, H = c.clientHeight
    c.width = W * dpr; c.height = H * dpr; x.scale(dpr, dpr)
    const an = audio.getAnalyser(), bins = an ? new Uint8Array(an.frequencyBinCount) : null
    const parts: P[] = [], rockets: { x: number; y: number; vy: number; ty: number; c: string }[] = []
    let raf = 0, last = 0, avg = 0, lastBeat = 0, lastAuto = 0
    const launch = () => { rockets.push({ x: W * (.15 + Math.random() * .7), y: H, vy: -H * .9, ty: H * (.12 + Math.random() * .35), c: colors[Math.floor(Math.random() * colors.length)] || '#ff8fc2' }) }
    const burst = (rx: number, ry: number, col: string) => { for (let i = 0; i < 46; i++) { const a = Math.random() * 6.283, s = 40 + Math.random() * 130; parts.push({ x: rx, y: ry, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, c: i % 4 ? col : '#fff', r: 1.6 + Math.random() * 1.6 }) } }
    const loop = (t: number) => {
      const dt = Math.min(.05, (t - last) / 1000 || .016); last = t
      if (an && bins) { an.getByteFrequencyData(bins); let e = 0; for (let i = 0; i < 8; i++) e += bins[i]; e /= 8; avg = avg * .94 + e * .06; if (e > avg * 1.22 && e > 110 && t - lastBeat > 320) { lastBeat = t; launch(); if (e > 180) launch() } }
      if (t - lastAuto > (an ? 1800 : 900)) { lastAuto = t; if (!an || t - lastBeat > 1800) launch() }
      x.clearRect(0, 0, W, H)
      for (let i = rockets.length - 1; i >= 0; i--) { const r = rockets[i]; r.y += r.vy * dt; x.fillStyle = '#fff'; x.fillRect(r.x - 1, r.y, 2, 8); if (r.y <= r.ty) { burst(r.x, r.y, r.c); rockets.splice(i, 1) } }
      for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.vy += 90 * dt; p.vx *= .985; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * .7; if (p.life <= 0) { parts.splice(i, 1); continue } x.globalAlpha = p.life; x.fillStyle = p.c; x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fill() }
      x.globalAlpha = 1; raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf)
  }, [colors])
  return <canvas ref={ref} className="fireworks" aria-hidden="true" />
}
