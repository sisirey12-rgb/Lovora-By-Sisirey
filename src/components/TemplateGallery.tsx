import { useState } from 'react'
import { themes } from '../data'
import { templates, type Template } from '../lib/templates'
import { CORE_OCCASIONS, RELATIONS, occasionEmoji } from '../lib/occasionContent'
import { worldClass } from '../lib/worlds'
import type { Occasion } from '../types'

/** Pick the occasion, then the person. Every combination has its own look, opening scene and story. */
export default function TemplateGallery({ onPick, compact = false, occasion, onOccasion }: { onPick: (t: Template) => void; compact?: boolean; occasion?: Occasion; onOccasion?: (o: Occasion) => void }) {
  const [own, setOwn] = useState<Occasion>('Birthday')
  const occ = occasion ?? own
  const choose = (o: Occasion) => { setOwn(o); onOccasion?.(o) }
  return <section className={`template-gallery ${compact ? 'compact' : ''}`} id="templates">
    <div className="section-kicker"><span /> START HERE</div>
    <h2>Pick the occasion, <em>then who it is for.</em></h2>
    <div className="occasion-chips" role="tablist" aria-label="Occasion">{CORE_OCCASIONS.map(o => <button type="button" role="tab" aria-selected={occ === o} key={o} className={occ === o ? 'selected' : ''} onClick={() => choose(o)}>{occasionEmoji[o]} {o}</button>)}</div>
    <div className="template-row">{templates.filter(t => t.occasion === occ).map(t => <button type="button" key={t.id} className={`template-card world-card ${worldClass(t.occasion, t.relation)}`} style={{ background: themes.find(x => x.name === t.theme)?.colors }} onClick={() => onPick(t)}>
      <span className="tpl-emoji">{t.emoji}</span><strong>{RELATIONS.find(r => r.id === t.relation)?.id}</strong><small>{t.blurb}</small><em>Use this ✦</em>
    </button>)}</div>
  </section>
}
