import { useMemo, type CSSProperties } from 'react'
import { motifFor, worldClass } from '../lib/worlds'
import type { Occasion, Relation } from '../types'

/** The surrounding of one occasion + person: a soft backdrop and a few floating little things that fit them (never hearts for family or friends). */
export default function WorldAmbient({ occasion, relation }: { occasion: Occasion; relation?: Relation }) {
  const items = useMemo(() => motifFor(occasion, relation).map((e, i) => ({ e, left: (i * 41 + 8) % 92, delay: -((i * 1.7) % 12), dur: 14 + (i % 5) * 3, size: 15 + (i % 3) * 6 })), [occasion, relation])
  return <div className={`world-bg ${worldClass(occasion, relation)}`} aria-hidden="true">
    {items.map((p, i) => <span key={i} style={{ left: `${p.left}%`, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, fontSize: p.size } as CSSProperties}>{p.e}</span>)}
  </div>
}
