import type { Experience, SceneId } from '../types'
import { flowFor, occasionKey } from './occasionContent'
import { normalizeScenes } from '../data'

/** The scenes this occasion and person start with, plus any optional extra scenes the creator switched on (placed before the video/letter). */
export function baseFlow(e: Experience): SceneId[] {
  const base = e.relation ? flowFor(occasionKey(e.occasion), e.relation) : normalizeScenes(e.scenes, e.v)
  const extra = (e.extraScenes || []).filter(x => !base.includes(x))
  if (!extra.length) return base
  let at = base.indexOf('video'); if (at < 0) at = base.indexOf('letter'); if (at < 0) at = base.length - 1
  return [...base.slice(0, at), ...extra, ...base.slice(at)]
}
/** The order that is actually played: the creator's own order if they set one, otherwise the default. */
export function effectiveFlow(e: Experience): SceneId[] {
  const all = baseFlow(e)
  if (!e.sceneOrder?.length) return all
  return e.sceneOrder.filter(s => all.includes(s))
}
