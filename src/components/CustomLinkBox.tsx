import { useState } from 'react'
import { CheckCircle2, Link2, Loader2 } from 'lucide-react'
import { supabase } from '../services/supabase/client'

const clean = (v: string) => v.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24)

/**
 * Optional ₹50 custom link, shown on the share step. Once it is active it REPLACES the long default link:
 * the old /s/<long id> address stops working, so only the custom link is given out.
 */
export default function CustomLinkBox({ experienceId, recipient, occasion, slug, onActive }: { experienceId: string; recipient: string; occasion: string; slug?: string; onActive: (slug: string) => void }) {
  const [keyword, setKeyword] = useState(() => clean(`${recipient}-${occasion}`)), [busy, setBusy] = useState(false), [err, setErr] = useState(''), [copied, setCopied] = useState(false)
  const host = typeof window !== 'undefined' ? window.location.host : 'lovora.meow'
  const suggestions = Array.from(new Set([`${recipient}-${occasion}`, `${recipient}-surprise`, `${occasion}-${recipient}`, `${recipient}-love`].map(clean))).filter(v => v.length >= 3)
  if (slug) return <div className="qr-custom-link cl-box active">
    <div className="qr-custom-title"><span><Link2 size={16} /> Your custom link</span><b>Active</b></div>
    <p className="qr-link-success"><CheckCircle2 size={15} /> {host}/s/{slug}</p>
    <p className="muted">This replaced your long link. The old address no longer opens the surprise, so send only this one.</p>
    <button type="button" className="secondary-btn" onClick={() => void navigator.clipboard.writeText(`${window.location.origin}/s/${slug}`).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1800) }).catch(() => undefined)}>{copied ? 'Copied ♡' : 'Copy custom link'}</button>
  </div>
  const buy = async () => {
    setErr('')
    const word = keyword.trim().toLowerCase()
    if (!/^[a-z0-9][a-z0-9-]{2,23}$/.test(word)) { setErr('Use 3–24 lowercase letters, numbers or hyphens.'); return }
    if (!supabase) { setErr('Sign in first, then add a custom link.'); return }
    if (!window.Razorpay) {
      try { await new Promise<void>((resolve, reject) => { const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = () => resolve(); s.onerror = () => reject(new Error('Could not load secure checkout.')); document.head.appendChild(s) }) } catch (e) { setErr(e instanceof Error ? e.message : 'Could not load checkout.'); return }
    }
    setBusy(true)
    try {
      const { data } = await supabase.auth.getSession(), token = data.session?.access_token
      if (!token) throw new Error('Please sign in again.')
      const call = async (body: Record<string, string>) => { const r = await fetch('/api/custom-link', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || 'Custom link checkout failed.'); return j }
      const order = await call({ action: 'create-order', experienceId, slug: word })
      const done = await new Promise<string>((resolve, reject) => {
        const rz = new window.Razorpay!({
          key: order.keyId, order_id: order.orderId, amount: order.amount, currency: 'INR', name: 'Lovora Meow', description: 'Custom surprise link', prefill: { email: order.email || '' }, theme: { color: '#d56fa8' },
          handler: async (resp: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => { try { const v = await call({ action: 'verify', orderId: resp.razorpay_order_id, paymentId: resp.razorpay_payment_id, signature: resp.razorpay_signature }); resolve(String(v.slug || word)) } catch (e) { reject(e) } },
          modal: { ondismiss: () => reject(new Error('Checkout closed. Nothing was charged.')) },
        })
        rz.on('payment.failed', () => reject(new Error('The payment did not go through. You have not been charged.')))
        rz.open()
      })
      onActive(done)
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not activate this link.') } finally { setBusy(false) }
  }
  return <div className="qr-custom-link cl-box">
    <div className="qr-custom-title"><span><Link2 size={16} /> Custom link</span><b>+ ₹50</b></div>
    <p>Swap the long link for one people can remember. <b>It replaces your current link</b>: the long address stops working once this is active.</p>
    <div className="qr-keyword-input"><span>{host}/s/</span><input value={keyword} maxLength={24} onChange={e => setKeyword(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 24))} aria-label="Custom link keyword" placeholder="sita-birthday" /></div>
    <div className="qr-keyword-suggestions"><small>Ideas</small>{suggestions.map(s => <button type="button" key={s} onClick={() => setKeyword(s)}>{s}</button>)}</div>
    {err && <p className="pw-error" role="alert">{err}</p>}
    <button type="button" className="secondary-btn qr-keyword-buy" onClick={() => void buy()} disabled={busy}>{busy ? <><Loader2 size={15} className="spin" /> Preparing secure checkout…</> : <>Get my custom link · ₹50</>}</button>
  </div>
}
