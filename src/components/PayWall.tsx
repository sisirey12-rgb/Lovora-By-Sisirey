import { useEffect, useRef, useState } from 'react'
import { BadgeCheck, Check, Eye, Gift, Loader2, Lock, X } from 'lucide-react'
import type { Experience } from '../types'
import { getPrice, payForShare, payForShareRedirect, redeemGift, savedGiftCode, saveGiftCode, type Price } from '../services/payments'
import { PRICING } from '../config'

type Method = 'razorpay' | 'esewa' | 'khalti'
const NAMES: Record<Method, string> = { razorpay: 'UPI, cards, netbanking', esewa: 'eSewa', khalti: 'Khalti' }

/** Shown when someone wants a share link for an unpaid surprise (owner accounts never see it: the server unlocks them). Previewing stays free. Payment messages are BIG on purpose. */
export default function PayWall({ item, onClose, onPaid, onPreview }: { item: Experience; onClose: () => void; onPaid: (e: Experience) => void; onPreview?: () => void }) {
  const [price, setPrice] = useState<Price>({ amount: PRICING.amount, regular: PRICING.regular })
  const [method, setMethod] = useState<Method>('razorpay')
  const [busy, setBusy] = useState(''), [err, setErr] = useState(''), [thanks, setThanks] = useState<{ e: Experience; how: string } | null>(null)
  const [code, setCode] = useState(savedGiftCode()), [codeOpen, setCodeOpen] = useState(!!savedGiftCode())
  const paidCb = useRef(onPaid); paidCb.current = onPaid   // the parent passes a fresh function every render: keep the timer stable
  useEffect(() => { void getPrice().then(p => { setPrice(p); if (p.providers && !p.providers.razorpay) setMethod(p.providers.esewa ? 'esewa' : p.providers.khalti ? 'khalti' : 'razorpay') }) }, [])
  useEffect(() => { if (!thanks) return; const t = window.setTimeout(() => paidCb.current(thanks.e), 2200); return () => window.clearTimeout(t) }, [thanks])
  const pv = price.providers
  const methods = (['razorpay', 'esewa', 'khalti'] as Method[]).filter(m => !pv || pv[m])
  const npr = price.npr
  const shown = method === 'razorpay' ? `₹${price.amount}` : `NPR ${npr ?? Math.round(price.amount * 1.6)}`
  const pay = async () => {
    setErr(''); setBusy('Please wait…')
    try {
      const paid = method === 'razorpay' ? await payForShare(item, setBusy) : await payForShareRedirect(method, item, setBusy)
      if (paid) setThanks({ e: paid, how: shown })   // for eSewa and Khalti the page navigates away instead, and returns to the site once paid
    } catch (e) { setErr(e instanceof Error ? e.message : 'The payment could not be completed.') } finally { setBusy('') }
  }
  const redeem = async () => {
    setErr(''); setBusy('Checking the code…')
    try { const paid = await redeemGift(code, item, setBusy); saveGiftCode(''); setThanks({ e: paid, how: 'Gift code' }) } catch (e) { setErr(e instanceof Error ? e.message : 'That code did not work.') } finally { setBusy('') }
  }
  const launch = price.amount < price.regular
  if (thanks) return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Payment received">
    <div className="quick-sheet paywall pw-done"><span className="pw-tick"><BadgeCheck size={56} /></span><h2 className="pw-huge">{thanks.how === 'Gift code' ? 'Gift code accepted!' : 'Payment received!'}</h2><p className="pw-big">{thanks.how === 'Gift code' ? 'Your link is free. Creating it now…' : `${thanks.how} paid. Creating your share link now…`}</p><Loader2 size={26} className="spin" /></div>
  </div>
  return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Make it shareable" onClick={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
    <div className="quick-sheet paywall" data-lenis-prevent>
      <button className="icon-btn quick-x" onClick={onClose} aria-label="Close" disabled={!!busy}><X size={18} /></button>
      <div className="pw-banner" role="note"><Lock size={22} /><b>PAYMENT NEEDED</b><span>to create your share link</span></div>
      <h2 className="pw-title">Love it? Make it shareable.</h2>
      <p className="pw-big">Previewing is free, as many times as you like. Pay once and get one link you can send to anyone.</p>
      <div className="pw-price"><b>{shown}</b>{launch && method === 'razorpay' && <s>₹{price.regular}</s>}</div>
      <p className="pw-sub">{launch && <span className="launch-tag">Launch price</span>} per surprise, one time only</p>
      {methods.length > 1 && <div className="pw-methods" role="radiogroup" aria-label="Payment method">{methods.map(m => <button key={m} type="button" role="radio" aria-checked={method === m} className={method === m ? 'on' : ''} onClick={() => setMethod(m)}>{NAMES[m]}</button>)}</div>}
      <ul className="paywall-list"><li><Check size={18} /> A public link that works on any phone</li><li><Check size={18} /> Photos, music and video kept online</li><li><Check size={18} /> Edit later, the same link keeps working</li></ul>
      {err && <p className="pw-error" role="alert">{err}</p>}
      <button className="primary-btn pw-pay" onClick={() => void pay()} disabled={!!busy}>{busy ? <><Loader2 size={20} className="spin" /> {busy}</> : <>Pay {shown} with {method === 'razorpay' ? 'UPI / card' : NAMES[method]}</>}</button>
      {!codeOpen ? <button type="button" className="pw-gift-link" onClick={() => setCodeOpen(true)} disabled={!!busy}><Gift size={16} /> I have a gift code</button>
        : <div className="pw-code"><label>Gift code<input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="LM-ABCD-EFGH" maxLength={14} autoCapitalize="characters" autoComplete="off" /></label><button className="secondary-btn" onClick={() => void redeem()} disabled={!!busy || code.replace(/[^A-Za-z0-9]/g, '').length < 10}>Use code (free)</button></div>}
      {onPreview && <button className="secondary-btn" onClick={onPreview} disabled={!!busy}><Eye size={16} /> Preview it again (free)</button>}
      <small className="muted pw-secure">Secure payment. eSewa and Khalti are charged in NPR.</small>
    </div>
  </div>
}
