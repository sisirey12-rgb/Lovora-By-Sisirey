import { useEffect, useRef, useState } from 'react'
import { sfx } from '../lib/sfx'

/** Silver scratch-off coating over a photo. Tap the frame to arm it, then scratch with a finger. */
export default function ScratchLayer({ armed, color, onReveal }: { armed: boolean; color: string; onReveal: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const [done, setDone] = useState(false)
  useEffect(() => {
    const c = ref.current; if (!c) return
    const w = c.offsetWidth || 160, h = c.offsetHeight || 200, d = Math.min(2, window.devicePixelRatio || 1)
    c.width = w * d; c.height = h * d
    const x = c.getContext('2d'); if (!x) return
    x.scale(d, d)
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#d9d4e6'); g.addColorStop(.5, '#f6f2ff'); g.addColorStop(1, color)
    x.fillStyle = g; x.fillRect(0, 0, w, h)
    x.fillStyle = 'rgba(255,255,255,.75)'
    for (let i = 0; i < 70; i++) { x.beginPath(); x.arc(Math.random() * w, Math.random() * h, Math.random() * 1.8 + .4, 0, 6.3); x.fill() }
    x.fillStyle = 'rgba(90,60,120,.85)'; x.font = '600 13px DM Sans, sans-serif'; x.textAlign = 'center'; x.fillText('tap, then scratch ✦', w / 2, h / 2)
  }, [color])
  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !armed) return
    const c = ref.current, x = c?.getContext('2d'); if (!c || !x) return
    const r = c.getBoundingClientRect()
    x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(e.clientX - r.left, e.clientY - r.top, 18, 0, 6.3); x.fill()
  }
  const check = () => {
    const c = ref.current, x = c?.getContext('2d'); if (!c || !x) return
    const { data } = x.getImageData(0, 0, c.width, c.height); let clear = 0, n = 0
    for (let i = 3; i < data.length; i += 148) { n++; if (data[i] < 40) clear++ }
    if (n && clear / n > .5) { setDone(true); sfx.boom('stars'); onReveal() }
  }
  return <canvas ref={ref} className={`scratch ${armed ? 'armed' : ''} ${done ? 'done' : ''}`}
    onClick={e => { if (armed) e.stopPropagation() }}
    onPointerDown={e => { if (!armed) return; drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); scratch(e) }}
    onPointerMove={scratch} onPointerUp={() => { if (drawing.current) { drawing.current = false; check() } }} onPointerCancel={() => { drawing.current = false }} />
}
