import { useEffect, useState } from 'react'
import { Eye, EyeOff, Loader2, Mail, X } from 'lucide-react'
import { useAuth } from '../services/auth'

type Mode = 'email' | 'signin' | 'signup' | 'reset' | 'recover'
export default function AuthModal({ onClose, onDone, reason, recovery = false }: { onClose: () => void; onDone?: () => void; reason?: string; recovery?: boolean }) {
  const { signIn, signInWithLink, signUp, resetPassword, updatePassword, configured } = useAuth()
  const [mode, setMode] = useState<Mode>(recovery ? 'recover' : 'email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k) }, [onClose])
  const switchMode = (m: Mode) => { setMode(m); setError(''); setNotice('') }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (busy) return
    setError(''); setNotice('')
    if (mode !== 'recover' && !/^\S+@\S+\.\S+$/.test(email.trim())) { setError('Enter a valid email address.'); return }
    if (mode !== 'reset' && mode !== 'email' && password.length < 6) { setError('Your password needs at least 6 characters.'); return }
    setBusy(true)
    try {
      if (mode === 'recover') { await updatePassword(password); setNotice('Password updated. You are signed in.'); onDone?.(); window.setTimeout(onClose, 900) }
      else if (mode === 'email') { await signInWithLink(email); setNotice('Check your inbox — tap the link we just sent and you’re in. You can close this window.') }
      else if (mode === 'signin') { await signIn(email, password); onDone?.(); onClose() }
      else if (mode === 'signup') {
        const r = await signUp(email, password)
        if (r.needsConfirmation) { setNotice('Account created. Check your inbox and open the confirmation link, then come back and sign in.'); setMode('signin'); setPassword('') }
        else { onDone?.(); onClose() }
      } else { await resetPassword(email); setNotice('If that email has an account, a reset link is on its way.') }
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.') }
    finally { setBusy(false) }
  }
  return <div className="ui-modal-backdrop" onClick={onClose}><form className="ui-modal auth-modal" onSubmit={submit} onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Sign in to LOVORA" noValidate>
    <button type="button" className="icon-btn auth-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
    <p className="eyebrow">YOUR CREATOR ACCOUNT</p>
    <h3>{mode === 'email' ? 'Sign in with your email' : mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : mode === 'recover' ? 'Choose a new password' : 'Reset your password'}</h3>
    <p className="auth-sub">{reason || 'Sign in to save, edit and share your surprises from any device.'}</p>
    {!configured && <p className="error-text" role="alert">Cloud accounts are not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and redeploy.</p>}
    {mode !== 'recover' && <label className="auth-field"><span>Email</span><div><Mail size={15} /><input type="email" autoComplete="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoFocus /></div></label>}
    {mode !== 'reset' && mode !== 'email' && <label className="auth-field"><span>Password</span><div><input type={show ? 'text' : 'password'} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'recover' ? 'New password' : 'At least 6 characters'} /><button type="button" onClick={() => setShow(v => !v)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>}
    {error && <p className="error-text" role="alert">{error}</p>}
    {notice && <p className="success-text" role="status">{notice}</p>}
    <button className="primary-btn auth-submit" type="submit" disabled={busy || !configured}>{busy && <Loader2 size={15} className="spin" />}{mode === 'email' ? 'Email me a sign-in link' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : mode === 'recover' ? 'Save new password' : 'Send reset link'}</button>
    <div className="auth-links">
      {mode === 'email' && <button type="button" onClick={() => switchMode('signin')}>Prefer a password instead?</button>}
      {mode === 'signin' && <><button type="button" onClick={() => switchMode('signup')}>New here? Create an account</button><button type="button" onClick={() => switchMode('reset')}>Forgot password?</button></>}
      {mode !== 'email' && mode !== 'recover' && <button type="button" onClick={() => switchMode('email')}>Back to email sign-in</button>}
    </div>
  </form></div>
}
