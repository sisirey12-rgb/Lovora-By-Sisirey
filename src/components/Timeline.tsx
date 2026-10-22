import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { MemoryItem } from '../types'
const fmt = (d?: string) => { if (!d) return ''; const t = new Date(d); return isNaN(+t) ? d : t.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) }
/** Vertical story told one memory at a time: tap to slide in the next one (oldest first); after the last, a tap goes on. */
export default function Timeline({ memories, buzz, onDone }: { memories: MemoryItem[]; buzz: (p: number | number[]) => void; onDone: () => void }) {
  const items = [...memories].sort((a, b) => { const x = Date.parse(a.date || ''), y = Date.parse(b.date || ''); return isNaN(x) || isNaN(y) ? 0 : x - y })
  const [shown, setShown] = useState(Math.min(1, items.length))
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) }, [shown])
  const tap = () => { if (shown < items.length) { setShown(s => s + 1); buzz(10) } else onDone() }
  return <div className="timeline" role="list" onClick={tap}><span className="timeline-line" aria-hidden="true" />
    {items.slice(0, shown).map((m, i) => <motion.div role="listitem" key={m.id} className={`tl-item ${i % 2 ? 'right' : 'left'}`} initial={{ opacity: 0, x: i % 2 ? 70 : -70 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 70, damping: 14 }}>
      <span className="tl-dot" /><div className="tl-card"><small>{fmt(m.date) || `Chapter ${i + 1}`}</small>{m.kind !== 'video' && <img src={m.src} alt={m.caption || ''} loading="lazy" />}<strong>{m.caption || 'A moment to keep'}</strong></div>
    </motion.div>)}
    <div ref={end} />
    <p className="timeline-hint">{shown < items.length ? `Tap for the next memory · ${shown}/${items.length}` : 'That’s our story ♡ Tap to continue'}</p>
  </div>
}
