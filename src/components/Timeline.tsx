import { motion } from 'framer-motion'
import type { MemoryItem } from '../types'
const fmt = (d?: string) => { if (!d) return ''; const t = new Date(d); return isNaN(+t) ? d : t.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) }
/** Vertical story: each memory slides in from alternating sides along a glowing line, oldest first. */
export default function Timeline({ memories }: { memories: MemoryItem[] }) {
  const items = [...memories].sort((a, b) => { const x = Date.parse(a.date || ''), y = Date.parse(b.date || ''); return isNaN(x) || isNaN(y) ? 0 : x - y })
  return <div className="timeline" role="list"><span className="timeline-line" aria-hidden="true" />
    {items.map((m, i) => <motion.div role="listitem" key={m.id} className={`tl-item ${i % 2 ? 'right' : 'left'}`} initial={{ opacity: 0, x: i % 2 ? 60 : -60 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: .4 + i * .6, type: 'spring', stiffness: 70, damping: 14 }}>
      <span className="tl-dot" /><div className="tl-card"><small>{fmt(m.date) || `Chapter ${i + 1}`}</small>{m.kind !== 'video' && <img src={m.src} alt={m.caption || ''} loading="lazy" />}<strong>{m.caption || 'A moment to keep'}</strong></div>
    </motion.div>)}
  </div>
}
