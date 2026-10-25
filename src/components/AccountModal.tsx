import { useState } from 'react'
import { KeyRound, LogOut, Mail, Save, X, Heart, Link2, CalendarDays, ShieldCheck } from 'lucide-react'
import { useAuth } from '../services/auth'
import { supabase } from '../services/supabase/client'

/** Account info: who is signed in, a display name, how many surprises exist, password reset and sign out. */
export default function AccountModal({ total, live, onClose, onSignedOut }: { total: number; live: number; onClose: () => void; onSignedOut: () => void }) {
  const { user, signOut, resetPassword } = useAuth()
  const meta = (user?.user_metadata || {}) as { full_name?: string }
  const [name, setName] = useState(meta.full_name || ''), [busy, setBusy] = useState(''), [msg, setMsg] = useState(''), [err, setErr] = useState('')
  if (!user) return null
  const email = user.email || ''
  const initial = (name || email || '?').trim().charAt(0).toUpperCase()
  const since = user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '-'
  const via = user.app_metadata?.provider === 'email' || !user.app_metadata?.provider ? 'Email' : String(user.app_metadata.provider)
  const run = async (key: string, fn: () => Promise<void>, ok: string) => {
    setBusy(key); setErr(''); setMsg('')
    try { await fn(); setMsg(ok) } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong. Please try again.') } finally { setBusy('') }
  }
  const saveName = () => run('name', async () => { if (!supabase) throw new Error('Cloud accounts are not configured.'); const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim().slice(0, 40) } }); if (error) throw error }, 'Name saved.')
  return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Account" onClick={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
    <div className="quick-sheet account-sheet">
      <button className="icon-btn quick-x" onClick={onClose} aria-label="Close"><X size={18} /></button>
      <div className="acc-head"><span className="acc-avatar">{initial}</span><div><p className="eyebrow">YOUR ACCOUNT</p><h2>{name.trim() || email.split('@')[0]}</h2><small><Mail size={12} /> {email}</small></div></div>
      <div className="acc-stats">
        <div><Heart size={16} /><b>{total}</b><small>Surprises</small></div>
        <div><Link2 size={16} /><b>{live}</b><small>Live links</small></div>
        <div><CalendarDays size={16} /><b>{since}</b><small>Joined</small></div>
      </div>
      <label>Display name<div className="acc-row"><input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" maxLength={40} /><button className="secondary-btn" onClick={() => void saveName()} disabled={!!busy}><Save size={15} /> Save</button></div></label>
      <p className="acc-line"><ShieldCheck size={15} /> Signed in with {via}. Your surprises are saved to this account.</p>
      {msg && <p className="acc-ok" role="status">{msg}</p>}{err && <p className="error-text" role="alert">{err}</p>}
      <button className="secondary-btn" onClick={() => void run('pw', () => resetPassword(email), 'Password reset link sent to your email.')} disabled={!!busy}><KeyRound size={15} /> Change password by email</button>
      <button className="primary-btn" onClick={() => void run('out', async () => { await signOut(); onSignedOut() }, '')} disabled={!!busy}><LogOut size={15} /> Sign out</button>
    </div>
  </div>
}
