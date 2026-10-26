import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, Check, Eye, Loader2, Lock, X } from 'lucide-react'
import type { Experience } from '../types'
import { getPrice, payForShare, type Price } from '../services/payments'
import { PRICING } from '../config'

/** Shown when someone wants a share link for an unpaid surprise. Previewing stays free. The payment messages are deliberately BIG so nobody misses them. */
export default function PayWall({ item, onClose, onPaid, onPreview }: { item: Experience; onClose: () => void; onPaid: (e: Experience) => void; onPreview?: () => void }) {
  const [price, setPrice] = useState<Price>({ amount: PRICING.amount, regular: PRICING.regular })
  const [busy, setBusy] = useState(''), [err, setErr] = useState(''), [thanks, setThanks] = useState<Experience | null>(null)
  const paidCb = useRef(onPaid); paidCb.current = onPaid   // the parent passes a fresh function every render: keep the timer stable
  useEffect(() => { void getPrice().then(setPrice) }, [])
  useEffect(() => { if (!thanks) return; const t = window.setTimeout(() => paidCb.current(thanks), 2200); return () => window.clearTimeout(t) }, [thanks])
  const pay = async () => {
    setErr(''); setBusy('Please wait…')
    try { const paid = await payForShare(item, setBusy); if (paid) setThanks(paid) } catch (e) { setErr(e instanceof Error ? e.message : 'The payment could not be completed.') } finally { setBusy('') }
  }
  const launch = price.amount < price.regular
  if (thanks) return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Payment received">
    <div className="quick-sheet paywall pw-done"><span className="pw-tick"><BadgeCheck size={56} /></span><h2 className="pw-huge">Payment received!</h2><p className="pw-big">₹{price.amount} paid. Creating your share link now…</p><Loader2 size={26} className="spin" /></div>
  </div>
  return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Make it shareable" onClick={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
    <div className="quick-sheet paywall">
      <button className="icon-btn quick-x" onClick={onClose} aria-label="Close" disabled={!!busy}><X size={18} /></button>
      <div className="pw-banner" role="note"><Lock size={22} /><b>PAYMENT NEEDED</b><span>to create your share link</span></div>
      <h2 className="pw-title">Love it? Make it shareable.</h2>
      <p className="pw-big">Previewing is free, as many times as you like. Pay once and get one link you can send to anyone.</p>
      <div className="pw-price"><b>₹{price.amount}</b>{launch && <s>₹{price.regular}</s>}</div>
      <p className="pw-sub">{launch && <span className="launch-tag">Launch price</span>} per surprise, one time only</p>
      <ul className="paywall-list"><li><Check size={18} /> A public link that works on any phone</li><li><Check size={18} /> WhatsApp, Instagram and Telegram preview with their name</li><li><Check size={18} /> Photos, music and video kept online</li><li><Check size={18} /> Edit later, the same link keeps working</li></ul>
      {err && <p className="pw-error" role="alert">{err}</p>}
      <button className="primary-btn pw-pay" onClick={() => void pay()} disabled={!!busy}>{busy ? <><Loader2 size={20} className="spin" /> {busy}</> : <>Pay ₹{price.amount} &amp; get my link</>}</button>
      {onPreview && <button className="secondary-btn" onClick={onPreview} disabled={!!busy}><Eye size={16} /> Preview it again (free)</button>}
      <small className="muted pw-secure">Secure payment with UPI, cards and wallets.</small>
    </div>
  </div>
}
