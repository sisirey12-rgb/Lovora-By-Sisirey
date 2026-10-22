import { ArrowRight, Cat, CirclePlay, Clock3, Cloud, Copy, Heart, Link2, Loader2, LogIn, Plus, CloudUpload, Trash2 } from 'lucide-react'
import type { Experience } from '../types'
import { themes } from '../data'

export type DashItem = { exp: Experience; inCloud: boolean; unsynced: boolean }
type Props = {
  items: DashItem[]; signedIn: boolean; cloudConfigured: boolean; loading: boolean; cloudError: string; busyId: string
  onNew: () => void; onEdit: (x: Experience) => void; onPreview: (x: Experience) => void; onDuplicate: (x: Experience) => void; onDelete: (x: Experience) => void
  onCopy: (x: Experience) => void; onTogglePublish: (x: Experience) => void; onSync: (x: Experience) => void; onSignIn: () => void; onRetry: () => void
}
export default function Dashboard(p: Props) {
  const art = (name: string) => themes.find(t => t.name === name)?.colors
  return <main className="dashboard-page">
    <div className="section-kicker"><span /> YOUR LITTLE UNIVERSES</div>
    <div className="dashboard-heading"><div><h1>My creations<span>.</span></h1><p>Every little world you’ve made, all in one place.</p></div><button className="primary-btn" onClick={p.onNew}><Plus size={17} /> New surprise</button></div>
    {p.cloudConfigured && !p.signedIn && <div className="dash-banner"><Cloud size={18} /><p><strong>Sign in to keep your surprises in your account.</strong> Drafts below live only on this device until you do — and only signed-in creators can publish a share link.</p><button className="secondary-btn" onClick={p.onSignIn}><LogIn size={15} /> Sign in</button></div>}
    {p.cloudError && <div className="dash-banner error"><p>{p.cloudError}</p><button className="secondary-btn" onClick={p.onRetry}>Try again</button></div>}
    {p.loading && <p className="dash-loading"><Loader2 size={15} className="spin" /> Loading your account…</p>}
    {p.items.length === 0 && !p.loading ? <div className="empty-dashboard"><div className="empty-icon"><Cat size={38} /></div><h2>Your story starts here.</h2><p>You haven’t made a surprise yet. Let’s change that.</p><button className="primary-btn" onClick={p.onNew}>Create your first surprise <ArrowRight size={16} /></button></div>
      : <div className="draft-grid">{p.items.map(({ exp: x, inCloud, unsynced }) => <article className="draft-card" key={x.id}>
        <div className="draft-art" style={{ background: art(x.theme) }}><span>✦ {x.occasion}</span><Heart fill="currentColor" size={36} /></div>
        <div className="draft-info">
          <div className="draft-status"><span className={`status-dot ${x.published ? 'live' : ''}`} />{x.published ? 'Published' : 'Private draft'}<em className="dash-chip">{inCloud ? (unsynced ? 'Unsynced edits' : 'In your account') : 'This device only'}</em></div>
          <h3>{x.title}</h3><p>For {x.recipient || 'someone special'}</p>
          <small><Clock3 size={13} /> Updated {new Date(x.updatedAt).toLocaleDateString()}</small>
          <div className="draft-actions">
            <button onClick={() => p.onEdit(x)}>Edit</button>
            <button onClick={() => p.onPreview(x)}><CirclePlay size={14} /> Preview</button>
            {x.published && inCloud && <button onClick={() => p.onCopy(x)}><Link2 size={14} /> Copy link</button>}
            {p.signedIn && (!inCloud || unsynced) && <button onClick={() => p.onSync(x)} disabled={p.busyId === x.id}>{p.busyId === x.id ? <Loader2 size={14} className="spin" /> : <CloudUpload size={14} />} Save to account</button>}
            {p.signedIn && inCloud && !unsynced && <button onClick={() => p.onTogglePublish(x)} disabled={p.busyId === x.id}>{p.busyId === x.id && <Loader2 size={14} className="spin" />}{x.published ? 'Unpublish' : 'Publish'}</button>}
            <button onClick={() => p.onDuplicate(x)} title="Duplicate" aria-label="Duplicate"><Copy size={14} /></button>
            <button onClick={() => p.onDelete(x)} title="Delete" aria-label="Delete"><Trash2 size={14} /></button>
          </div>
        </div></article>)}</div>}
  </main>
}
