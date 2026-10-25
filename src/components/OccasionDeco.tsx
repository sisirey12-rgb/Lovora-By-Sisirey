import { motifFor } from '../lib/worlds'
import type { Occasion, Relation } from '../types'

/** A slow, themed layer behind every scene: each occasion has its own colours and drifting decoration. */
export default function OccasionDeco({ occasion, relation }: { occasion: Occasion; relation?: Relation }) {
  const m = motifFor(occasion, relation)
  const kind = occasion === 'Birthday' ? 'up' : occasion === 'Anniversary' ? 'twinkle' : occasion === 'Love letter' ? 'down' : 'orbit'
  return <div className={`occ-deco occ-${occasion.toLowerCase().replace(/\s+/g, '-')} occ-${kind}`} aria-hidden="true">
    <div className="occ-wash" />
    {Array.from({ length: 16 }, (_, i) => <span key={i} style={{ left: `${(i * 37 + 6) % 96}%`, top: kind === 'up' || kind === 'down' ? undefined : `${(i * 29) % 90}%`, animationDelay: `${-i * 1.1}s`, animationDuration: `${10 + (i % 5) * 2.4}s`, fontSize: `${16 + (i % 4) * 7}px` }}>{m[i % m.length]}</span>)}
  </div>
}
