import { useEffect, useState } from 'react'
import { Check, Copy, Gift, Loader2, X } from 'lucide-react'
import { buyGift, getPrice, listGifts, type GiftRow, type PayProvider, type Price } from '../services/payments'
import { PRICING } from '../config'

const NAMES: Record<PayProvider, string> = { razorpay: 'UPI / cards', esewa: 'eSewa', khalti: 'Khalti' }

/** "Gift a surprise": buy a prepaid share-link code for someone. They enter it instead of paying. Owner accounts create codes free. */
export default function GiftModal({ onClose, owner = false, justPaidCode = '' }: { onClose: () => void; owner?: boolean; justPaidCode?: string }) {
  const [price, setPrice] = useState<Price>({ amount: PRICING.amount, regular: PRICING.regular, giftAmount: PRICING.giftAmount })
  const [code, setCode] = useState(justPaidCode), [busy, setBusy] = useState(''), [err, setErr] = useState(''), [copied, setCopied] = useState(false), [rows, setRows] = useState<GiftRow[]>([])
  useEffect(() => { void getPrice().then(setPrice); void listGifts().then(setRows) }, [code])
  const pv = price.providers
  const methods = (['razorpay', 'esewa', 'khalti'] as PayProvider[]).filter(m => !pv || pv[m])
  const buy = async (m: PayProvider) => {
    setErr(''); setBusy('Please wait…')
    try { const c = await buyGift(m, setBusy); if (c) setCode(c) } catch (e) { setErr(e instanceof Error ? e.message : 'Could not create the gift.') } finally { setBusy('') }
  }
  const link = code ? `${window.location.origin}/?gift=${code}` : ''
  const msg = `I got you a surprise! Use gift code ${code} to share your own Lovora Meow surprise for free: ${link}`
  const copy = () => { void navigator.clipboard.writeText(msg).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 2000) }).catch(() => undefined) }
  return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Gift a surprise" onClick={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
    <div className="quick-sheet gift-sheet" data-lenis-prevent>
      <button className="icon-btn quick-x" onClick={onClose} aria-label="Close" disabled={!!busy}><X size={18} /></button>
      <p className="eyebrow">GIFT A SURPRISE</p>
      {!code ? <>
        <h2 className="gift-title">Give someone a free share link</h2>
        <p className="pw-big">Buy a gift code. Whoever you send it to enters it when they share their surprise, and they pay nothing.</p>
        <div className="pw-price"><b>{owner ? 'Free' : `₹${price.giftAmount}`}</b></div>
        <p className="pw-sub">{owner ? 'Owner account: no payment needed' : 'per gift code · eSewa and Khalti are charged in NPR'}</p>
        {err && <p className="pw-error" role="alert">{err}</p>}
        {owner ? <button className="primary-btn pw-pay" onClick={() => void buy(methods[0] || 'razorpay')} disabled={!!busy}>{busy ? <><Loader2 size={20} className="spin" /> {busy}</> : <><Gift size={20} /> Create a free gift code</>}</button>
          : <div className="gift-buy">{methods.map(m => <button key={m} className="primary-btn pw-pay" onClick={() => void buy(m)} disabled={!!busy}>{busy ? <><Loader2 size={20} className="spin" /> {busy}</> : <>Pay with {NAMES[m]}</>}</button>)}{!methods.length && <p className="muted">Payments are not set up yet.</p>}</div>}
      </> : <>
        <h2 className="pw-huge">Your gift is ready 🎁</h2>
        <div className="gift-code" aria-label="Gift code">{code}</div>
        <p className="pw-big">Send it to them. They can type it in when sharing, or open the link below.</p>
        <button className="primary-btn pw-pay" onClick={copy}>{copied ? <><Check size={18} /> Copied</> : <><Copy size={18} /> Copy the message</>}</button>
        <a className="secondary-btn" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(msg)}`}>Send on WhatsApp</a>
        <button className="text-btn" onClick={() => setCode('')}>Create another gift</button>
      </>}
      {rows.length > 0 && <details className="gift-rows"><summary>My gift codes ({rows.length})</summary><ul>{rows.map(r => <li key={r.code}><b>{r.code}</b><span className={r.redeemed_at ? 'used' : ''}>{r.redeemed_at ? 'Used' : 'Unused'}</span></li>)}</ul></details>}
    </div>
  </div>
}
