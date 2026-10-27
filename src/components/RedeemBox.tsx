import { useState } from 'react'
import { Gift, Loader2 } from 'lucide-react'
import type { Experience } from '../types'
import { redeemGift, savedGiftCode, saveGiftCode } from '../services/payments'

/** "I have a gift code" on the last share-link step. A valid code unlocks the link for free, then the link is created straight away. */
export default function RedeemBox({ item, onRedeemed, disabled }: { item: Experience; onRedeemed: (paid: Experience) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(!!savedGiftCode()), [code, setCode] = useState(savedGiftCode()), [busy, setBusy] = useState(''), [err, setErr] = useState('')
  const ready = code.replace(/[^A-Za-z0-9]/g, '').length >= 10
  const go = async () => {
    setErr(''); setBusy('Checking the code…')
    try { const paid = await redeemGift(code, item, setBusy); saveGiftCode(''); onRedeemed(paid) } catch (e) { setErr(e instanceof Error ? e.message : 'That code did not work.') } finally { setBusy('') }
  }
  if (!open) return <button type="button" className="pw-gift-link" onClick={() => setOpen(true)} disabled={disabled}><Gift size={16} /> I have a gift code</button>
  return <div className="pw-code redeem-box">
    <label>Gift code<input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="LM-ABCD-EFGH" maxLength={14} autoCapitalize="characters" autoComplete="off" /></label>
    {err && <p className="pw-error" role="alert">{err}</p>}
    <button type="button" className="secondary-btn" onClick={() => void go()} disabled={disabled || !!busy || !ready}>{busy ? <><Loader2 size={16} className="spin" /> {busy}</> : 'Redeem and get my link (free)'}</button>
  </div>
}
