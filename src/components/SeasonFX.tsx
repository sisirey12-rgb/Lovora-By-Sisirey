import type { CSSProperties } from 'react'
import type { FxKind } from '../lib/seasonTheme'

const n = (i: number, m: number, o = 0) => ((i * 37 + o * 11) % m)   // tiny deterministic scatter: no Math.random, so renders are stable
/** Seasonal effects behind the landing page. Every kind is pure CSS (see seasons.css) and switches off for reduced motion. */
export default function SeasonFX({ fx, bits }: { fx: FxKind[]; bits: string[] }) {
  const emoji = bits.length ? bits : ['✨']
  return <div className="sx-layer" aria-hidden="true">
    {fx.map(kind => {
      if (kind === 'burst') return Array.from({ length: 4 }, (_, i) => <span key={`b${i}`} className="sx-burst" style={{ left: `${14 + i * 24 + n(i, 6)}%`, top: `${12 + n(i, 30, 3)}%`, ['--d' as string]: `${i * 1.7}s` } as CSSProperties}>{Array.from({ length: 12 }, (_, k) => <u key={k} style={{ ['--a' as string]: `${k * 30}deg`, ['--c' as string]: k % 3 === 0 ? 'var(--accent)' : k % 3 === 1 ? 'var(--accent2)' : 'var(--teal)' } as CSSProperties} />)}</span>)
      if (kind === 'splash') return Array.from({ length: 7 }, (_, i) => <i key={`s${i}`} className="sx-splash" style={{ left: `${8 + n(i, 80, 2)}%`, top: `${6 + n(i, 70, 5)}%`, ['--d' as string]: `${i * 1.1}s`, ['--c' as string]: ['var(--accent)', 'var(--accent2)', 'var(--teal)'][i % 3] } as CSSProperties} />)
      const count = kind === 'twinkle' ? 18 : kind === 'drift' ? 7 : 16
      return Array.from({ length: count }, (_, i) => <i key={`${kind}${i}`} className={`sx sx-${kind}`} style={{ left: kind === 'drift' ? undefined : `${n(i, 96, 1)}%`, top: kind === 'twinkle' || kind === 'drift' ? `${4 + n(i, 80, 7)}%` : undefined, fontSize: `${16 + n(i, 18)}px`, ['--d' as string]: `${(n(i, 12, 4)) * -1}s`, ['--t' as string]: `${8 + n(i, 9)}s`, ['--sw' as string]: `${(i % 2 ? 1 : -1) * (20 + n(i, 50))}px` } as CSSProperties}>{emoji[i % emoji.length]}</i>)
    })}
  </div>
}
