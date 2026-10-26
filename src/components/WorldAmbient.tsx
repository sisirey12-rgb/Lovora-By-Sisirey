import { useMemo } from 'react'
import { motifFor, worldClass } from '../lib/worlds'
import Floaties, { kindOf, type FloatKind } from './Floaties'
import type { Occasion, Relation } from '../types'

const SOFT = ['#ffd1e6', '#ffe9a8', '#cfe8ff', '#e0d2ff', '#d4f5e2']
/** The surrounding of one occasion + person: a soft backdrop and drawn shapes that fit them (no pasted emojis). */
export default function WorldAmbient({ occasion, relation, colors = SOFT }: { occasion: Occasion; relation?: Relation; colors?: string[] }) {
  const kinds = useMemo(() => ([...new Set(motifFor(occasion, relation).map(kindOf))] as FloatKind[]).slice(0, 3), [occasion, relation])
  return <div className={`world-bg ${worldClass(occasion, relation)}`} aria-hidden="true"><Floaties kinds={kinds} colors={colors} count={7} /></div>
}
