import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Experience } from '../types'
import { sceneLabels } from '../data'
import { getStats, type Stats } from '../services/stats'

const dur = (s: number) => (s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`)
/** Creator-only dashboard card: opens, people, watch time, how far they got, recent opens. */
export default function StatsModal({ exp, onClose }: { exp: Experience; onClose: () => void }) {
  const [stats, setStats] = useState<Stats | undefined>(), [error, setError] = useState('')
  useEffect(() => { getStats(exp.id).then(setStats).catch(e => setError(e instanceof Error ? e.message : 'Could not load stats.')) }, [exp.id])
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  const finished = stats && stats.opens ? Math.round((stats.completed / stats.opens) * 100) : 0
  return <div className="stats-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Surprise stats">
    <div className="stats-card" onClick={e => e.stopPropagation()}>
      <button className="icon-btn stats-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
      <p className="eyebrow">WHO OPENED IT</p>
      <h2>{exp.recipient ? `For ${exp.recipient}` : exp.title}</h2>
      {!stats && !error && <p className="muted">Loading…</p>}
      {error && <p className="error-text" role="alert">{error}</p>}
      {stats && (stats.opens === 0 ? <p className="muted">No one has opened it yet. Share your link and check back here ♡</p> : <>
        <div className="stats-grid">
          <div><b>{stats.opens}</b><span>Opens</span></div><div><b>{stats.viewers}</b><span>People</span></div>
          <div><b>{dur(Number(stats.avg_seconds))}</b><span>Avg. watch time</span></div><div><b>{finished}%</b><span>Reached the end</span></div>
        </div>
        <h3>Where they got to</h3>
        <div className="stats-funnel">{stats.reach.map((c, i) => <div key={i}><span>{sceneLabels[exp.scenes[i]] || `Scene ${i + 1}`}</span><i><em style={{ width: `${Math.round((c / stats.opens) * 100)}%` }} /></i><b>{c}</b></div>)}</div>
        <p className="muted stats-foot">{stats.replays} replays · {stats.mobile} on phones{stats.last_opened ? ` · last opened ${new Date(stats.last_opened).toLocaleString()}` : ''}</p>
        <h3>Recent opens</h3>
        <ul className="stats-recent">{stats.recent.map((r, i) => <li key={i}><span>{new Date(r.opened_at).toLocaleString()}</span><span>{r.device === 'mobile' ? '📱' : '💻'} {dur(r.seconds)}</span></li>)}</ul>
      </>)}
    </div>
  </div>
}
