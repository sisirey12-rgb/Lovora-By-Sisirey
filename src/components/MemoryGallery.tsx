import { useState, type CSSProperties } from 'react'
import { Heart } from 'lucide-react'
import type { MemoryItem } from '../types'
import { sfx } from '../lib/sfx'
import ScratchLayer from './ScratchLayer'

const FRAMES = ['gold', 'wood', 'heart', 'film', 'washi', 'arch', 'scallop', 'neon'] as const
const FX = ['sparkle', 'petals', 'glow', 'flicker', 'hearts', 'twinkle', 'sparkle', 'pulse']
const TILT = [-4, 3, -2, 5, -5, 2, -3, 4]

/** Photos hang from a rope under a string of fairy lights, each in a different frame style with its own little effect. */
export default function MemoryGallery({ memories, colors, buzz }: { memories: MemoryItem[]; colors: string[]; buzz: (p: number | number[]) => void }) {
  const [active, setActive] = useState<number | null>(null)
  const [burstKey, setBurstKey] = useState(0)
  const bulbs = Array.from({ length: 14 }, (_, i) => i)
  const poke = (i: number) => { setActive(a => (a === i ? null : i)); setBurstKey(k => k + 1); buzz([12, 24, 12]); sfx.boom('stars') }
  return <div className="gallery">
    <svg className="gallery-lights" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-5 8 Q50 46 100 14 T200 14 T300 14 T405 8" className="light-wire" />
      {bulbs.map(i => { const x = 14 + i * 28.2; const y = 14 + Math.sin(i * 1.12) * 14 + 6; return <g key={i} className="bulb" style={{ ['--bd' as string]: `${(i % 5) * .35}s`, ['--bc' as string]: colors[i % colors.length] } as CSSProperties}><line x1={x} y1={y - 4} x2={x} y2={y} /><ellipse cx={x} cy={y + 5} rx="3.2" ry="4.6" /></g> })}
    </svg>
    <div className="gallery-rope" aria-hidden="true" />
    <div className="gallery-row" role="list">
      {memories.map((m, i) => {
        const f = FRAMES[i % FRAMES.length], on = active === i
        return <figure key={m.id} role="listitem" className={`hang frame-${f} fx-${FX[i % FX.length]} ${on ? 'is-active' : ''}`} style={{ ['--tilt' as string]: `${TILT[i % TILT.length]}deg`, ['--sw' as string]: `${3.2 + (i % 4) * .5}s` } as CSSProperties}>
          <span className="peg" aria-hidden="true" />
          <button type="button" className="frame-btn" onClick={() => poke(i)} aria-label={`${m.caption || 'Memory'} — tap for a little sparkle`}>
            <span className="frame-mat">{m.kind === 'video' ? <video src={m.src} controls playsInline preload="metadata" onClick={e => e.stopPropagation()} /> : <img src={m.src} alt={m.caption || 'Shared memory'} loading="lazy" />}{m.kind !== 'video' && <ScratchLayer armed={on} color={colors[i % colors.length]} onReveal={() => buzz([20, 30, 20])} />}</span>
            {f === 'heart' && <Heart className="frame-heart-deco" size={22} fill="currentColor" />}
          </button>
          {on && <span key={burstKey} className="frame-burst" aria-hidden="true">{Array.from({ length: 12 }, (_, k) => <i key={k} style={{ ['--a' as string]: `${k * 30}deg`, ['--c' as string]: colors[k % colors.length] } as CSSProperties}>{k % 3 === 0 ? '♥' : '✦'}</i>)}</span>}
          <figcaption><strong>{m.caption || 'A moment to keep'}</strong>{m.date && <small>{m.date}</small>}</figcaption>
        </figure>
      })}
    </div>
    <p className="gallery-hint">Swipe along the rope · tap a frame, then scratch to reveal</p>
  </div>
}
