import { useState } from 'react'
import { themes, sceneLabels } from '../data'
import { templates, type Template } from '../lib/templates'
import { CORE_OCCASIONS, RELATIONS, occasionEmoji } from '../lib/occasionContent'
import type { Occasion } from '../types'

/** Pick the occasion, then the person: only names and photos are left to add. */
export default function TemplateGallery({ onPick, compact = false }: { onPick: (t: Template) => void; compact?: boolean }) {
  const [occ, setOcc] = useState<Occasion>('Birthday')
  return <section className={`template-gallery ${compact ? 'compact' : ''}`} id="templates">
    <div className="section-kicker"><span /> START FROM A TEMPLATE</div>
    <h2>Pick the occasion, <em>then who it is for.</em></h2>
    <div className="occasion-chips" role="tablist" aria-label="Occasion">{CORE_OCCASIONS.map(o => <button type="button" role="tab" aria-selected={occ === o} key={o} className={occ === o ? 'selected' : ''} onClick={() => setOcc(o)}>{occasionEmoji[o]} {o}</button>)}</div>
    <div className="template-row">{templates.filter(t => t.occasion === occ).map(t => <button type="button" key={t.id} className="template-card" style={{ background: themes.find(x => x.name === t.theme)?.colors }} onClick={() => onPick(t)}>
      <span className="tpl-emoji">{t.emoji}</span><strong>{RELATIONS.find(r => r.id === t.relation)?.id}</strong><small>{t.blurb}</small><span className="tpl-flow" aria-label="Scene flow">{(t.patch.scenes || []).filter(x => x !== 'heart').slice(0, 5).map(x => <i key={x}>{sceneLabels[x].replace('Floating heart', 'Heart')}</i>)}{(t.patch.scenes || []).length > 6 && <i>+{(t.patch.scenes || []).length - 6}</i>}</span><em>Use this ✦</em>
    </button>)}</div>
  </section>
}
