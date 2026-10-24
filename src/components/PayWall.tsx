import { useEffect, useState } from 'react'
import { Check, Eye, Loader2, Lock, X } from 'lucide-react'
import type { Experience } from '../types'
import { getPrice, payForShare, type Price } from '../services/payments'
import { PRICING } from '../config'

/** Shown when someone wants a share link for an unpaid surprise. Previewing stays free. */
export default function PayWall({ item, onClose, onPaid, onPreview }: { item: Experience; onClose: () => void; onPaid: (e: Experience) => void; onPreview?: () => void }) {
  const [price, setPrice] = useState<Price>({ amount: PRICING.amount, regular: PRICING.regular })
  const [busy, setBusy] = useState(''), [err, setErr] = useState('')
  useEffect(() => { void getPrice().then(setPrice) }, [])
  const pay = async () => {
    setErr(''); setBusy('Please wait…')
    try { const paid = await payForShare(item, setBusy); if (paid) onPaid(paid) } catch (e) { setErr(e instanceof Error ? e.message : 'The payment could not be completed.') } finally { setBusy('') }
  }
  const launch = price.amount < price.regular
  return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Make it shareable" onClick={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
    <div className="quick-sheet paywall">
      <button className="icon-btn quick-x" onClick={onClose} aria-label="Close" disabled={!!busy}><X size={18} /></button>
      <p className="eyebrow"><Lock size={12} /> SHARE LINK</p>
      <h2>Love it? Make it shareable.</h2>
      <p className="muted">Preview is free, as many times as you like. Pay once to get a link you can send to anyone.</p>
      <div className="price-row"><b>₹{price.amount}</b>{launch && <s>₹{price.regular}</s>}{launch && <span className="launch-tag">Launch price</span>}<small>per surprise, one time</small></div>
      <ul className="paywall-list"><li><Check size={15} /> A public link that works on any phone</li><li><Check size={15} /> WhatsApp, Instagram and Telegram preview with their name</li><li><Check size={15} /> Your photos, music and video are kept online</li><li><Check size={15} /> Edit it later, the same link keeps working</li></ul>
      {err && <p className="error-text" role="alert">{err}</p>}
      <button className="primary-btn" onClick={() => void pay()} disabled={!!busy}>{busy ? <><Loader2 size={16} className="spin" /> {busy}</> : <>Pay ₹{price.amount} &amp; get my link</>}</button>
      {onPreview && <button className="secondary-btn" onClick={onPreview} disabled={!!busy}><Eye size={16} /> Preview it again (free)</button>}
      <small className="muted">Secure payment with UPI, cards and wallets.</small>
    </div>
  </div>
}
