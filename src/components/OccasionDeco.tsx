import Floaties, { type FloatKind } from './Floaties'
import type { Occasion } from '../types'

const KINDS: Record<string, FloatKind[]> = { Birthday: ['balloon', 'confetti', 'star', 'heart', 'sparkle'], Anniversary: ['sparkle', 'star', 'heart', 'moon'], 'Love letter': ['heart', 'flower', 'leaf', 'sparkle', 'butterfly'], 'Special surprise': ['sparkle', 'star', 'bolt', 'ring', 'confetti'] }
/** A slow, themed layer behind every scene: each occasion has its own colours and drifting shapes. */
export default function OccasionDeco({ occasion, colors }: { occasion: Occasion; relation?: unknown; colors?: string[] }) {
  const kind = occasion === 'Love letter' ? 'down' : occasion === 'Birthday' ? 'up' : 'float'
  return <div className={`occ-deco occ-${occasion.toLowerCase().replace(/\s+/g, '-')} occ-${kind}`} aria-hidden="true">
    <div className="occ-wash" />
    <Floaties kinds={KINDS[occasion] || KINDS['Special surprise']} colors={colors?.length ? colors : ['#ff8fc2', '#ffd36e', '#7fd6ff', '#b79bff']} count={13} fall={occasion === 'Love letter'} />
  </div>
}
