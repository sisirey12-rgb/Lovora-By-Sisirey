import { useEffect, useState } from 'react'
import { CheckCircle2, Download, Link2, Loader2, Printer, Share2, X } from 'lucide-react'
import { supabase } from '../services/supabase/client'
import { DESIGNS, FORMATS, downloadCanvas, printCanvas, renderGiftCard, type CardDesign, type CardFormat } from '../lib/giftCard'

const LINES = ['Scan to open your surprise', 'Open me on the day', 'A little surprise is inside', 'Point your camera here ♡']

/** Printable QR card studio: pick a design and size, add a line, then download, print or share. */
export default function QrStudio({ url, recipient, sender, occasion, revealDate, onClose }: { url: string; recipient: string; sender: string; occasion: string; revealDate?: string; onClose: () => void }) {
  const [design, setDesign] = useState<CardDesign>('rose'), [format, setFormat] = useState<CardFormat>('card')
  const [line, setLine] = useState(LINES[0]), [showSender, setShowSender] = useState(true), [showDate, setShowDate] = useState(!!revealDate)
  const [src, setSrc] = useState(''), [busy, setBusy] = useState(true), [err, setErr] = useState('')
  const [shareUrl, setShareUrl] = useState(url), [keyword, setKeyword] = useState(() => `${recipient}-${occasion}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24)), [linkBusy, setLinkBusy] = useState(false), [customReady, setCustomReady] = useState(false)
  const experienceId = url.match(/\/s\/([0-9a-f-]{36})/i)?.[1] || ''
  const suggestions = Array.from(new Set([`${recipient}-${occasion}`, `${recipient}-surprise`, `${occasion}-${recipient}`, `${recipient}-love`].map(v => v.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24)))).filter(v => v.length >= 3 && v.length <= 24)
  const opts = { url: shareUrl, recipient, sender, occasion, design, format, line, revealDate, showSender, showDate }
  useEffect(() => {
    let dead = false; setBusy(true)
    const t = window.setTimeout(() => { void renderGiftCard(opts).then(c => { if (!dead) { setSrc(c.toDataURL('image/png')); setBusy(false) } }).catch(() => { if (!dead) { setErr('Could not draw the card. Please try again.'); setBusy(false) } }) }, 120)
    return () => { dead = true; window.clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design, format, line, showSender, showDate, shareUrl, recipient, sender, occasion, revealDate])
  const make = () => renderGiftCard(opts)
  const share = async () => {
    try { const c = await make(); const blob: Blob | null = await new Promise(r => c.toBlob(r, 'image/png')); if (!blob) return
      const file = new File([blob], 'gift-card.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'A surprise for you' }); else await downloadCanvas(c)
    } catch { /* cancelled */ }
  }
  const buyCustomLink = async () => {
    setErr('')
    const slug = keyword.trim().toLowerCase()
    if (!/^[a-z0-9][a-z0-9-]{2,23}$/.test(slug)) { setErr('Use 3–24 lowercase letters, numbers or hyphens for your keyword.'); return }
    if (!experienceId) { setErr('Save and publish your surprise first, then add a custom keyword.'); return }
    if (!supabase) { setErr('Sign in and connect your account before adding a custom keyword.'); return }
    if (!window.Razorpay) {
      try { await new Promise<void>((resolve, reject) => { const script = document.createElement('script'); script.src = 'https://checkout.razorpay.com/v1/checkout.js'; script.onload = () => resolve(); script.onerror = () => reject(new Error('Could not load secure checkout.')); document.head.appendChild(script) }) } catch (e) { setErr(e instanceof Error ? e.message : 'Could not load checkout.'); return }
    }
    setLinkBusy(true)
    try {
      const { data } = await supabase.auth.getSession(), token = data.session?.access_token
      if (!token) throw new Error('Please sign in again.')
      const request = async (body: Record<string, string>) => { const r = await fetch('/api/custom-link', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify(body) }); const j = await r.json().catch(()=>({})); if (!r.ok) throw new Error(j.error || 'Custom link checkout failed.'); return j }
      const order = await request({ action:'create-order', experienceId, slug })
      await new Promise<void>((resolve, reject) => {
        const checkout = new window.Razorpay!({ key:order.keyId, order_id:order.orderId, amount:order.amount, currency:'INR', name:'Lovora', description:'Custom surprise link keyword', prefill:{ email:order.email || '' }, theme:{ color:'#d56fa8' },
          handler: async (response: { razorpay_order_id:string; razorpay_payment_id:string; razorpay_signature:string }) => { try { const result = await request({ action:'verify', orderId:response.razorpay_order_id, paymentId:response.razorpay_payment_id, signature:response.razorpay_signature }); setShareUrl(`${window.location.origin}${result.url}`); setCustomReady(true); resolve() } catch (e) { reject(e) } },
          modal:{ ondismiss:()=>reject(new Error('Checkout closed. No custom keyword was activated.')) }
        })
        checkout.on('payment.failed',()=>reject(new Error('Payment did not complete. You have not been charged.')))
        checkout.open()
      })
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not activate this keyword.') } finally { setLinkBusy(false) }
  }
  const ratio = FORMATS[format].w / FORMATS[format].h
  return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Printable QR card" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
    <div className="quick-sheet qr-sheet" data-lenis-prevent>
      <header className="qr-head"><div><p className="eyebrow">PRINTABLE QR CARD</p><h2>Tuck it into the gift</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button></header>
      <div className="qr-body">
        <div className="qr-preview" style={{ aspectRatio: String(ratio) }}>{src && <img src={src} alt="Card preview" />}{busy && <span className="qr-busy"><Loader2 className="spin" size={26} /></span>}</div>
        <div className="qr-ctl">
          <div className="ai2-field"><span>Design</span><div className="qr-designs" role="radiogroup" aria-label="Design">{(Object.keys(DESIGNS) as CardDesign[]).map(d => <button key={d} type="button" role="radio" aria-checked={design === d} className={design === d ? 'on' : ''} onClick={() => setDesign(d)} style={{ ['--a' as string]: DESIGNS[d].bg[0], ['--b' as string]: DESIGNS[d].accent } as React.CSSProperties}><i />{DESIGNS[d].name}</button>)}</div></div>
          <div className="qr-custom-link">
            <div className="qr-custom-title"><span><Link2 size={16} /> Custom link keyword</span><b>+ ₹50</b></div>
            <p>Give your surprise a memorable address. Your main surprise price stays the same; this is optional.</p>
            <div className="qr-keyword-input"><span>{typeof window !== 'undefined' ? window.location.host : 'lovora.meow'}/s/</span><input value={keyword} maxLength={24} onChange={e => { setKeyword(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0,24)); setCustomReady(false) }} aria-label="Custom link keyword" placeholder="subi-birthday" /></div>
            <div className="qr-keyword-suggestions"><small>Suggestions</small>{suggestions.map(s => <button type="button" key={s} onClick={() => { setKeyword(s); setCustomReady(false) }}>{s}</button>)}</div>
            {customReady ? <><p className="qr-link-success"><CheckCircle2 size={15} /> Custom link is active. Your QR preview now uses it.</p><button type="button" className="secondary-btn qr-keyword-buy" onClick={() => void navigator.clipboard.writeText(shareUrl).then(()=>setErr('Custom link copied to clipboard ♡')).catch(()=>setErr(shareUrl))}>Copy custom link</button></> : <button type="button" className="secondary-btn qr-keyword-buy" onClick={() => void buyCustomLink()} disabled={linkBusy}>{linkBusy ? <><Loader2 size={15} className="spin" /> Preparing secure checkout…</> : <>Activate custom link · ₹50</>}</button>}
          </div>
          <div className="ai2-field"><span>Size</span><div className="ai2-langs" role="radiogroup" aria-label="Size">{(Object.keys(FORMATS) as CardFormat[]).map(f => <button key={f} type="button" role="radio" aria-checked={format === f} className={format === f ? 'on' : ''} onClick={() => setFormat(f)}>{FORMATS[f].name}</button>)}</div><small>{FORMATS[format].hint} · prints at {FORMATS[format].mm[0]} × {FORMATS[format].mm[1]} mm</small></div>
          <label className="ai2-field"><span>Line under the code</span><input value={line} maxLength={40} onChange={e => setLine(e.target.value)} /><div className="ai2-langs">{LINES.map(l => <button key={l} type="button" onClick={() => setLine(l)}>{l.replace(' ♡', '')}</button>)}</div></label>
          <div className="qr-toggles"><label><input type="checkbox" checked={showSender} onChange={e => setShowSender(e.target.checked)} /> Show “with love, {sender || 'me'}”</label>{revealDate && <label><input type="checkbox" checked={showDate} onChange={e => setShowDate(e.target.checked)} /> Show the reveal date</label>}</div>
        </div>
      </div>
      {err && <p className="pw-error" role="alert">{err}</p>}
      <footer className="ai2-foot qr-foot"><button className="primary-btn" onClick={() => void make().then(c => downloadCanvas(c))}><Download size={17} /> Download</button><button className="secondary-btn" onClick={() => void make().then(c => { if (!printCanvas(c, format)) setErr('Printing is not available here. Download the card and print it instead.') })}><Printer size={17} /> Print</button><button className="secondary-btn" onClick={() => void share()}><Share2 size={17} /> Share</button></footer>
    </div>
  </div>
}
