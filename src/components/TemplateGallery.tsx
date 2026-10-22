import { themes } from '../data'
import { templates, type Template } from '../lib/templates'

/** Ready-made surprises: pick a vibe, then only add names and photos. */
export default function TemplateGallery({ onPick, compact = false }: { onPick: (t: Template) => void; compact?: boolean }) {
  return <section className={`template-gallery ${compact ? 'compact' : ''}`} id="templates">
    <div className="section-kicker"><span /> START FROM A TEMPLATE</div>
    <h2>Pick a vibe, <em>add the names.</em></h2>
    <div className="template-row">{templates.map(t => <button type="button" key={t.id} className="template-card" style={{ background: themes.find(x => x.name === t.theme)?.colors }} onClick={() => onPick(t)}>
      <span className="tpl-emoji">{t.emoji}</span><strong>{t.title}</strong><small>{t.blurb}</small><em>Use this ✦</em>
    </button>)}</div>
  </section>
}
