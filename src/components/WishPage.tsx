import { useState } from 'react'
import { Send } from 'lucide-react'
import Brand from './Brand'
import DevCredit from './DevCredit'
import { submitWish } from '../services/wishes'

/** Public page /wish/:id where friends add a wish to the birthday person's jar. */
export default function WishPage({ id }: { id: string }) {
  const [name, setName] = useState(''), [text, setText] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle'), [error, setError] = useState('')
  const send = async () => {
    setError('')
    if (text.trim().length < 2) { setError('Write a little wish first ♡'); return }
    setState('sending')
    try { await submitWish(id, name, text); setState('done') } catch (e) { setState('idle'); setError(e instanceof Error ? e.message : 'Could not send your wish.') }
  }
  return <div className="app-shell wish-page">
    <header className="site-nav"><Brand /></header>
    <main className="wish-card">
      {state === 'done' ? <div className="wish-done"><span>🫙✨</span><h1>Your wish is in the jar!</h1><p className="muted">It will drop in when they open their surprise.</p><a className="primary-btn" href="/">Make a surprise of your own</a></div>
        : <><p className="eyebrow">A BIRTHDAY WISH JAR</p><h1>Add your wish 🫙</h1><p className="muted">Write something kind. It will be a surprise for the birthday person.</p>
          <label>Your name (optional)<input value={name} maxLength={30} onChange={e => setName(e.target.value)} placeholder="e.g. Aisha" /></label>
          <label>Your wish<textarea value={text} maxLength={140} rows={4} onChange={e => setText(e.target.value)} placeholder="Wishing you a year as bright as your smile…" /></label>
          <small className="muted">{text.length}/140</small>
          {error && <p className="error-text" role="alert">{error}</p>}
          <button className="primary-btn" onClick={send} disabled={state === 'sending'}><Send size={16} /> {state === 'sending' ? 'Sending…' : 'Drop it in the jar'}</button></>}
    </main>
    <DevCredit />
  </div>
}
