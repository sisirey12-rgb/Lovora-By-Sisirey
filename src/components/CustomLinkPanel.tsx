import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Link2, Loader2, Sparkles } from 'lucide-react'
import { supabase } from '../services/supabase/client'

type Props = { url: string; experienceId: string; recipient: string; sender: string; occasion: string; onActivated: (url: string) => void }

/** Custom keyword setup lives on the main Share step; QR Studio only designs/prints the card. */
export default function CustomLinkPanel({ url, experienceId, recipient, sender, occasion, onActivated }: Props) {
  const [keyword, setKeyword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [activeUrl, setActiveUrl] = useState('')
  const [ownerAccount, setOwnerAccount] = useState(false)
  useEffect(() => {
    let alive = true
    void (async () => {
      try {
        const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } }
        const token = data.session?.access_token
        if (!token) return
        const r = await fetch('/api/account', { headers: { Authorization: `Bearer ${token}` } })
        const j = await r.json().catch(() => ({}))
        if (alive && r.ok) setOwnerAccount(!!j.owner)
      } catch { /* standard visitor pricing stays as the fallback */ }
    })()
    return () => { alive = false }
  }, [])
  const suggestions = useMemo(() => {
    const values = [`${recipient}-${occasion}`, `${recipient}-surprise`, `${occasion}-${recipient}`, `${recipient}-love`, `${sender}-for-${recipient}`]
      .map(v => v.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24))
      .filter(v => /^[a-z0-9][a-z0-9-]{2,23}$/.test(v))
    return [...new Set(values)]
  }, [recipient, sender, occasion])
  const activate = async () => {
    setError('')
    const slug = keyword.trim().toLowerCase()
    if (!/^[a-z0-9][a-z0-9-]{2,23}$/.test(slug)) { setError('Choose 3–24 lowercase letters, numbers or hyphens.'); return }
    if (!experienceId || !url) { setError('Create your main surprise link first.'); return }
    if (!supabase) { setError('Please sign in before activating a custom keyword.'); return }
    setBusy(true)
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) throw new Error('Please sign in again.')
      const response = await fetch('/api/custom-link', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: 'create-order', experienceId, slug }) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Could not activate this keyword.')
      if (result.owner && result.url) {
        const live = `${window.location.origin}${result.url}`
        setActiveUrl(live); onActivated(live); setError(''); return
      }
      if (!window.Razorpay) await new Promise<void>((resolve, reject) => { const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = () => resolve(); script.onerror = () => reject(new Error('Could not load secure checkout.')); document.head.appendChild(script) })
      await new Promise<void>((resolve, reject) => {
        const checkout = new window.Razorpay!({ key: result.keyId, order_id: result.orderId, amount: result.amount, currency: 'INR', name: 'Lovora', description: ownerAccount ? 'Custom surprise link keyword' : 'Custom surprise link keyword · ₹50', prefill: { email: result.email || '' }, theme: { color: '#d56fa8' },
          handler: async (payment: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              const verify = await fetch('/api/custom-link', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ action: 'verify', orderId: payment.razorpay_order_id, paymentId: payment.razorpay_payment_id, signature: payment.razorpay_signature }) })
              const verified = await verify.json().catch(() => ({}))
              if (!verify.ok) throw new Error(verified.error || 'Payment was received, but the keyword could not be activated.')
              const live = `${window.location.origin}${verified.url}`
              setActiveUrl(live); onActivated(live); resolve()
            } catch (e) { reject(e) }
          }, modal: { ondismiss: () => reject(new Error('Checkout closed. No custom keyword was activated.')) }
        })
        checkout.on('payment.failed', () => reject(new Error('Payment did not complete. You have not been charged.')))
        checkout.open()
      })
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not activate this keyword.') } finally { setBusy(false) }
  }
  return <section className="main-custom-link">
    <div className="main-custom-link-head"><span><Link2 size={17}/> Personalise your share link</span><b>{ownerAccount ? 'Owner tools' : 'Optional · ₹50'}</b></div>
    <p>Keep your surprise price unchanged and choose a memorable keyword for its address. Suggestions use the names and occasion you entered.</p>
    <div className="main-custom-link-input"><span>{typeof window !== 'undefined' ? window.location.host : 'lovora.meow'}/s/</span><input value={keyword} maxLength={24} onChange={e => { setKeyword(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24)); setActiveUrl(''); setError('') }} placeholder="choose-a-keyword" aria-label="Custom share-link keyword" autoComplete="off" /></div>
    <div className="main-custom-link-suggestions"><small>Suggested for this surprise</small>{suggestions.map(s => <button type="button" key={s} onClick={() => { setKeyword(s); setActiveUrl(''); setError('') }}>{s}</button>)}</div>
    {activeUrl && <p className="main-custom-link-success"><CheckCircle2 size={16}/> Custom link active: <a href={activeUrl} target="_blank" rel="noreferrer">{activeUrl}</a></p>}
    {error && <p className="pw-error" role="alert">{error}</p>}
    <button type="button" className="secondary-btn main-custom-link-activate" onClick={() => void activate()} disabled={busy || !!activeUrl}>{busy ? <><Loader2 size={16} className="spin"/> Activating…</> : activeUrl ? <><CheckCircle2 size={16}/> Custom link activated</> : <><Sparkles size={16}/> Activate custom link{ownerAccount ? '' : ' · ₹50'}</>}</button>
  </section>
}
