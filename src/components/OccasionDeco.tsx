import type { Occasion } from '../types'

/** One soft wash behind every scene, tinted from the chosen theme so the colours always agree. The drifting shapes come from WorldAmbient, so there is only ever one set. */
export default function OccasionDeco({ occasion }: { occasion: Occasion; relation?: unknown; colors?: string[] }) {
  return <div className={`occ-deco occ-${occasion.toLowerCase().replace(/\s+/g, '-')}`} aria-hidden="true">
    <div className="occ-wash" />
  </div>
}
