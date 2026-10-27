import { useEffect, useMemo, useState } from 'react'
import { Gift, KeyRound, LogOut, Mail, Save, X, Heart, Link2, CalendarDays, ShieldCheck, Copy, Download, Crown, Trash2, Clock3, BadgeCheck, Palette } from 'lucide-react'
import { useAuth } from '../services/auth'
import { supabase } from '../services/supabase/client'
import { PRICING } from '../config'
import { fetchAccount, checkAi, type AccountInfo, type AiCheck } from '../services/account'
import { SEASONS } from '../lib/seasons'
import { emojiFor } from '../lib/templates'
import ThemePicker from './ThemePicker'
import type { Experience } from '../types'
import { DEFAULT_SCENE_STUDIO, STUDIO_SCENES, fetchSceneStudio, type SceneStudioConfig, type AnimationPreset } from '../lib/sceneStudio'

type Tab = 'profile' | 'surprises' | 'plan' | 'settings'
type Meta = { full_name?: string; phone?: string; city?: string; about?: string; avatar?: string }
const BADGES: { id: string; e: string; t: string; how: string; test: (l: Experience[]) => boolean }[] = [
  { id: 'first', e: '🌱', t: 'First surprise', how: 'Create one', test: l => l.length >= 1 },
  { id: 'live', e: '🚀', t: 'Sent with love', how: 'Share a live link', test: l => l.some(i => i.published) },
  { id: 'five', e: '📚', t: 'Storyteller', how: 'Create 5', test: l => l.length >= 5 },
  { id: 'all4', e: '🎭', t: 'All-rounder', how: 'Try all 4 occasions', test: l => new Set(l.map(i => i.occasion)).size >= 4 },
  { id: 'photo', e: '📸', t: 'Photographer', how: 'Add 3+ photos', test: l => l.some(i => i.memories.filter(m => m.kind === 'image').length >= 3) },
  { id: 'word', e: '✍️', t: 'Wordsmith', how: 'Write a long letter', test: l => l.some(i => (i.message || '').length >= 300) },
]
const AVATARS = ['#ff8fc2', '#ffd36e', '#7fd6ff', '#b79bff', '#7be0b0', '#ff9a62']
const fmt = (d?: string, time = false) => d ? new Date(d).toLocaleString(undefined, time ? { dateStyle: 'medium', timeStyle: 'short' } : { year: 'numeric', month: 'short', day: 'numeric' }) : '-'

/** Full account centre: profile, every surprise with its status, plan and security, and site settings. */
export default function AccountModal({ items, setDark, onClose, onSignedOut, onGift }: { items: Experience[]; setDark: (d: boolean) => void; onClose: () => void; onSignedOut: () => void; onGift?: () => void }) {
  const { user, signOut, resetPassword } = useAuth()
  const meta = (user?.user_metadata || {}) as Meta
  const [tab, setTab] = useState<Tab>('profile')
  const [f, setF] = useState<Meta>({ full_name: meta.full_name || '', phone: meta.phone || '', city: meta.city || '', about: meta.about || '', avatar: meta.avatar || AVATARS[0] })
  const [busy, setBusy] = useState(''), [msg, setMsg] = useState(''), [err, setErr] = useState('')
  const [liveSeason, setLiveSeason] = useState('')
  const [sceneStudio, setSceneStudio] = useState<SceneStudioConfig>(DEFAULT_SCENE_STUDIO)
  const [sceneStudioLoaded, setSceneStudioLoaded] = useState(false)
  const [acct, setAcct] = useState<AccountInfo | null>(null)
  const [aiRes, setAiRes] = useState<AiCheck | { error: string } | null>(null), [aiBusy, setAiBusy] = useState(false)
  useEffect(() => {
    let dead = false
    void (async () => { const a = await fetchAccount(); if (a && !dead) { setAcct(a); if (a.owner) { const sj = await fetch('/api/season').then(x => x.json()).catch(() => null); if (sj && !dead) setLiveSeason(sj.season || ''); const sc = await fetchSceneStudio(); if (!dead) { setSceneStudio(sc); setSceneStudioLoaded(true) } } } })()
    return () => { dead = true }
  }, [])
  const stats = useMemo(() => {
    const by: Record<string, number> = {}; items.forEach(i => { by[i.occasion] = (by[i.occasion] || 0) + 1 })
    return { total: items.length, live: items.filter(i => i.published).length, drafts: items.filter(i => !i.published).length, paid: items.filter(i => i.paid || i.published).length, by }
  }, [items])
  if (!user) return null
  const email = user.email || ''
  const shown = (f.full_name || '').trim() || email.split('@')[0]
  const provider = (user.app_metadata?.provider as string) || 'email'
  const run = async (key: string, fn: () => Promise<void>, ok: string) => {
    setBusy(key); setErr(''); setMsg('')
    try { await fn(); if (ok) setMsg(ok) } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong. Please try again.') } finally { setBusy('') }
  }
  const save = () => run('save', async () => { if (!supabase) throw new Error('Cloud accounts are not configured.'); const { error } = await supabase.auth.updateUser({ data: { full_name: (f.full_name || '').trim().slice(0, 40), phone: (f.phone || '').trim().slice(0, 20), city: (f.city || '').trim().slice(0, 40), about: (f.about || '').trim().slice(0, 140), avatar: f.avatar } }); if (error) throw error }, 'Profile saved.')
  const copy = (t: string, ok: string) => { void navigator.clipboard?.writeText(t); setMsg(ok); setErr('') }
  const exportData = () => { const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), account: { email, name: shown }, surprises: items.map(i => ({ ...i, memories: i.memories.map(m => ({ ...m, src: m.src.startsWith('data:') ? '(embedded media)' : m.src })), musicData: undefined, voiceData: undefined, videoData: undefined })) }, null, 2)], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'lovora-meow-my-data.json'; a.click(); URL.revokeObjectURL(a.href) }
  const tabs: [Tab, string][] = [['profile', 'Profile'], ['surprises', `Surprises (${stats.total})`], ['plan', 'Plan & security'], ...(acct?.owner ? [['settings', 'Website settings'] as [Tab, string]] : [])]
  return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Account" onClick={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
    <div className="quick-sheet account-sheet acc2" data-lenis-prevent>
      <button className="icon-btn quick-x" onClick={onClose} aria-label="Close"><X size={18} /></button>
      <div className="acc-head"><span className="acc-avatar" style={{ background: `linear-gradient(135deg,${f.avatar},#ffd36e)` }}>{shown.charAt(0).toUpperCase()}</span><div><p className="eyebrow">{acct?.owner ? <><Crown size={11} /> OWNER ACCOUNT</> : 'YOUR ACCOUNT'}</p><h2>{shown}</h2><small><Mail size={12} /> {acct?.owner ? `Owner email: ${email}` : email}</small></div></div>
      <div className="acc-stats4"><div><Heart size={15} /><b>{stats.total}</b><small>Surprises</small></div><div><Link2 size={15} /><b>{stats.live}</b><small>Live links</small></div><div><Clock3 size={15} /><b>{stats.drafts}</b><small>Drafts</small></div><div><CalendarDays size={15} /><b>{fmt(user.created_at)}</b><small>Joined</small></div></div>
      <div className="acc-tabs" role="tablist">{tabs.map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => { setTab(id); setMsg(''); setErr('') }}>{l}</button>)}</div>

      {tab === 'profile' && <div className="acc-pane">
        <div className="acc-colors" aria-label="Avatar colour">{AVATARS.map(c => <button key={c} className={f.avatar === c ? 'on' : ''} style={{ background: c }} onClick={() => setF({ ...f, avatar: c })} aria-label={`Colour ${c}`} />)}</div>
        <label>Display name<input value={f.full_name} onChange={e => setF({ ...f, full_name: e.target.value })} maxLength={40} placeholder="Your name" /></label>
        <div className="acc-two"><label>Phone (optional)<input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} maxLength={20} inputMode="tel" placeholder="+91 …" /></label><label>City (optional)<input value={f.city} onChange={e => setF({ ...f, city: e.target.value })} maxLength={40} placeholder="Where you are" /></label></div>
        <label>About you<textarea value={f.about} onChange={e => setF({ ...f, about: e.target.value })} maxLength={140} rows={2} placeholder="A line about you" style={{ minHeight: 70 }} /></label>
        <button className="primary-btn" onClick={() => void save()} disabled={!!busy}><Save size={15} /> Save profile</button>
        <dl className="acc-dl"><div><dt>Email</dt><dd>{email} {user.email_confirmed_at && <BadgeCheck size={14} className="acc-ok-ic" />}</dd></div><div><dt>Sign-in method</dt><dd style={{ textTransform: 'capitalize' }}>{provider}</dd></div><div><dt>Last sign-in</dt><dd>{fmt(user.last_sign_in_at, true)}</dd></div><div><dt>Account ID</dt><dd><code>{user.id.slice(0, 8)}…</code> <button className="text-btn" onClick={() => copy(user.id, 'Account ID copied.')}><Copy size={12} /> copy</button></dd></div></dl>
      </div>}

      {tab === 'surprises' && <div className="acc-pane">
        <div className="acc-badges">{BADGES.map(b => { const on = b.test(items); return <span key={b.id} className={on ? 'on' : ''} title={b.how}><i>{b.e}</i><b>{b.t}</b><small>{on ? 'Earned' : b.how}</small></span> })}</div>
        {!!Object.keys(stats.by).length && <div className="acc-chips">{Object.entries(stats.by).map(([o, n]) => <span key={o}>{emojiFor(o)} {o} · {n}</span>)}</div>}
        {!items.length && <p className="muted">No surprises yet. Create your first one from the home page.</p>}
        <ul className="acc-list">{[...items].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).map(i => <li key={i.id}><span className="acc-li-emoji">{emojiFor(i.occasion)}</span><div><strong>{i.recipient || 'Untitled'}</strong><small>{i.occasion}{i.relation ? ` · ${i.relation}` : ''} · edited {fmt(i.updatedAt)}</small></div><em className={i.published ? 'live' : i.paid ? 'paid' : ''}>{i.published ? 'Live' : i.paid ? 'Paid' : 'Draft'}</em>{i.published && <button className="icon-btn" aria-label="Copy share link" onClick={() => copy(`${window.location.origin}/s/${i.id}`, 'Share link copied.')}><Copy size={14} /></button>}</li>)}</ul>
        <button className="secondary-btn" onClick={exportData}><Download size={15} /> Download all my data</button>
      </div>}

      {tab === 'plan' && <div className="acc-pane">
        <div className={`acc-plan ${acct?.owner ? 'owner' : ''}`}>{acct?.owner ? <><Crown size={20} /><div><strong>Owner account</strong><small>Share links are free on this account. Owner email: {email}</small></div></> : <><Link2 size={20} /><div><strong>Pay per share link</strong><small>₹{PRICING.amount} launch price <s>₹{PRICING.regular}</s> per surprise. Previewing is always free.</small></div></>}</div>
        {onGift && <button type="button" className="secondary-btn" onClick={onGift}><Gift size={15} /> {acct?.owner ? 'Create a free gift code' : 'Gift a surprise'}</button>}
        {acct && !acct.owner && <p className="acc-line" style={{ fontSize: 12, opacity: .8 }}>Signed in as <b>{email}</b>. {acct.ownerConfigured ? 'This email is not on the owner list.' : 'The owner list is empty on the server: add OWNER_EMAILS in Vercel and redeploy.'}</p>}
        <dl className="acc-dl"><div><dt>Paid / live links</dt><dd>{acct ? acct.paid : stats.paid} of {acct ? acct.total : stats.total}</dd></div><div><dt>Password</dt><dd>{provider === 'email' ? 'Managed by email' : `Managed by ${provider}`}</dd></div></dl>
        {provider === 'email' && <button className="secondary-btn" onClick={() => void run('pw', () => resetPassword(email), 'Password reset link sent to your email.')} disabled={!!busy}><KeyRound size={15} /> Change password by email</button>}
        <button className="secondary-btn" onClick={() => void run('all', async () => { await supabase!.auth.signOut({ scope: 'global' }); onSignedOut() }, '')} disabled={!!busy}><ShieldCheck size={15} /> Sign out on all devices</button>
      </div>}

      {tab === 'settings' && acct?.owner && <div className="acc-pane">
        <p className="acc-line"><Crown size={15} /> Owner email: <b>{email}</b></p>
        <dl className="acc-dl"><div><dt>Share links</dt><dd>Free for you</dd></div><div><dt>Database key</dt><dd>{acct.serviceKey ? 'Set' : 'Missing (SUPABASE_SERVICE_ROLE_KEY)'}</dd></div></dl>
        <p className="acc-line"><Link2 size={15} /> Add a "Make a surprise" button to your own website</p>
        <code className="acc-code">{`<script src="${window.location.origin}/embed.js" async></script>`}</code>
        <button className="secondary-btn" onClick={() => copy(`<script src="${window.location.origin}/embed.js" async></script>`, 'Embed code copied.')}><Copy size={15} /> Copy embed code</button>
        <>        <p className="acc-line"><Crown size={15} /> AI writer status</p>
        <button type="button" className="secondary-btn" disabled={aiBusy} onClick={() => { setAiBusy(true); setAiRes(null); void checkAi().then(r => { setAiRes(r); setAiBusy(false) }) }}>{aiBusy ? 'Testing Groq…' : 'Test the AI connection'}</button>
        {aiRes && ('error' in aiRes ? <p className="pw-error" role="alert">{aiRes.error}</p> : <div className={`ai-check ${aiRes.ok ? 'ok' : 'bad'}`} role="status"><b>{aiRes.ok ? 'Working ✓' : 'Not working'}</b><p>{aiRes.message}</p><small>Key: {aiRes.keySet ? `set (${aiRes.keyLength} characters${aiRes.keyLooksRight ? '' : ', does not start with gsk_'})` : 'missing'} · Model: {aiRes.model}{aiRes.ms ? ` · ${aiRes.ms} ms` : ''}</small></div>)}
<p className="acc-line"><Crown size={15} /> Home page season (owner only)</p>
          <div className="season-chips">{[{ slug: '', label: 'Normal', emoji: '🏠' }, ...SEASONS].map(x => <button key={x.slug} className={liveSeason === x.slug ? 'on' : ''} disabled={!!busy} onClick={() => void run('season', async () => { const { data } = await supabase!.auth.getSession(); const r = await fetch('/api/season', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token}` }, body: JSON.stringify({ season: x.slug }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Could not change the season.'); setLiveSeason(j.season || ''); try { sessionStorage.setItem('lovora-season', j.season || '') } catch { /* ignore */ } }, x.slug ? `${x.label} is now on the home page. Visitors see it within a minute.` : 'Home page is back to normal.')}>{x.emoji} {x.label}</button>)}</div></>
        <section className="lv-scene-studio" aria-labelledby="lv-scene-studio-title">
          <div className="lv-studio-head"><span className="lv-studio-icon">✦</span><div><p className="eyebrow">LIVE SITE CONTROL</p><h3 id="lv-scene-studio-title">Scene Studio</h3><p>Publish animation and scene-player settings for everyone visiting Lovora.</p></div></div>
          <label className="lv-studio-toggle"><input type="checkbox" checked={sceneStudio.enabled} onChange={e => setSceneStudio(v => ({ ...v, enabled: e.target.checked }))} /><span><b>Seasonal effects</b><small>Animated atmosphere on the landing page and scene player</small></span></label>
          <label>Animation style<select value={sceneStudio.preset} onChange={e => setSceneStudio(v => ({ ...v, preset: e.target.value as AnimationPreset }))}><option value="dreamy">Dreamy · soft glow and float</option><option value="cinematic">Cinematic · dramatic reveal</option><option value="playful">Playful · springy and bright</option><option value="gentle">Gentle · calm transitions</option></select></label>
          <label className="lv-studio-range">Effect intensity <b>{sceneStudio.intensity}%</b><input type="range" min="0" max="100" step="5" value={sceneStudio.intensity} onChange={e => setSceneStudio(v => ({ ...v, intensity: Number(e.target.value) }))} /></label>
          <label className="lv-studio-toggle"><input type="checkbox" checked={sceneStudio.playerOrderEnabled} onChange={e => setSceneStudio(v => ({ ...v, playerOrderEnabled: e.target.checked }))} /><span><b>Use owner-curated scene order</b><small>Reorders scenes that exist in each surprise; creator-added content is preserved.</small></span></label>
          <p className="acc-line">Scene order · tap to add or remove, drag order not required</p>
          <div className="lv-studio-scenes">{STUDIO_SCENES.map((sc, i) => { const on = sceneStudio.playerOrder.includes(sc.id); return <button type="button" key={sc.id} className={on ? 'on' : ''} onClick={() => setSceneStudio(v => ({ ...v, playerOrder: on ? v.playerOrder.filter(id => id !== sc.id) : [...v.playerOrder, sc.id].slice(0, 18) }))} aria-pressed={on}><span>{sc.emoji}</span>{sc.label}{on && <i>{sceneStudio.playerOrder.indexOf(sc.id) + 1}</i>}</button> })}</div>
          <div className="lv-studio-order" aria-label="Reorder selected scenes">{sceneStudio.playerOrder.map((id, i) => { const sc = STUDIO_SCENES.find(x => x.id === id); if (!sc) return null; return <div key={id}><span>{i + 1}. {sc.emoji} {sc.label}</span><div><button type="button" disabled={i === 0} aria-label={`Move ${sc.label} up`} onClick={() => setSceneStudio(v => { const a = [...v.playerOrder]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return { ...v, playerOrder: a } })}>↑</button><button type="button" disabled={i === sceneStudio.playerOrder.length - 1} aria-label={`Move ${sc.label} down`} onClick={() => setSceneStudio(v => { const a = [...v.playerOrder]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return { ...v, playerOrder: a } })}>↓</button></div></div> })}</div>
          <p className="lv-studio-note">The selected order is published to the live scene player when you save.</p>
          <button type="button" className="primary-btn" disabled={!!busy || !sceneStudioLoaded} onClick={() => void run('scene-studio', async () => { if (!supabase) throw new Error('Cloud accounts are not configured.'); const { data } = await supabase.auth.getSession(); const r = await fetch('/api/scene-config', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token}` }, body: JSON.stringify(sceneStudio) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Could not publish the scene settings.'); setSceneStudio({ ...DEFAULT_SCENE_STUDIO, ...j.config }); window.dispatchEvent(new CustomEvent('lovora:scene-config', { detail: j.config })); }, 'Scene Studio published. Visitors will see the new effects and player settings shortly.')}><Save size={15} /> {busy === 'scene-studio' ? 'Publishing…' : 'Publish live scene settings'}</button>
          <small className="lv-studio-foot">Owner-only controls · settings are stored server-side and shared with visitors. Existing custom scenes are not deleted.</small>
        </section>
        <p className="acc-line"><Palette size={15} /> Site theme</p><ThemePicker setDark={setDark} inline />
        <button className="secondary-btn danger" onClick={() => { if (window.confirm('Remove surprises saved on this device? Surprises saved to your account stay safe.')) { Object.keys(localStorage).filter(k => k.startsWith('lovora') && k !== 'lovora-theme' && k !== 'lovora-skin').forEach(k => localStorage.removeItem(k)); setMsg('Local copies cleared. Reload to refresh.') } }}><Trash2 size={15} /> Clear data stored on this device</button>
      </div>}

      {msg && <p className="acc-ok" role="status">{msg}</p>}{err && <p className="error-text" role="alert">{err}</p>}
      <button className="primary-btn" onClick={() => void run('out', async () => { await signOut(); onSignedOut() }, '')} disabled={!!busy}><LogOut size={15} /> Sign out</button>
    </div>
  </div>
}
