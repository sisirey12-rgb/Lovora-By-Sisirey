import { useEffect, useState } from 'react'
import { Download, Loader2, Printer, Share2, X } from 'lucide-react'
import { DESIGNS, FORMATS, downloadCanvas, printCanvas, renderGiftCard, type CardDesign, type CardFormat } from '../lib/giftCard'

const LINES = ['Scan to open your surprise', 'Open me on the day', 'A little surprise is inside', 'Point your camera here ♡']

/** Printable card designer. Custom keyword setup is handled on the main Share page. */
export default function QrStudio({ url, recipient, sender, occasion, revealDate, onClose }: { url: string; recipient: string; sender: string; occasion: string; revealDate?: string; onClose: () => void }) {
  const [design, setDesign] = useState<CardDesign>('rose'), [format, setFormat] = useState<CardFormat>('card')
  const [line, setLine] = useState(LINES[0]), [showSender, setShowSender] = useState(true), [showDate, setShowDate] = useState(!!revealDate)
  const [src, setSrc] = useState(''), [busy, setBusy] = useState(true), [err, setErr] = useState('')
  const opts = { url, recipient, sender, occasion, design, format, line, revealDate, showSender, showDate }
  useEffect(() => {
    let dead = false; setBusy(true); setErr('')
    const t = window.setTimeout(() => { void renderGiftCard(opts).then(c => { if (!dead) { setSrc(c.toDataURL('image/png')); setBusy(false) } }).catch(() => { if (!dead) { setErr('Could not draw the card. Please try again.'); setBusy(false) } }) }, 100)
    return () => { dead = true; window.clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design, format, line, showSender, showDate, url, recipient, sender, occasion, revealDate])
  const make = () => renderGiftCard(opts)
  const share = async () => { try { const c = await make(); const blob: Blob | null = await new Promise(r => c.toBlob(r, 'image/png')); if (!blob) return; const file = new File([blob], 'lovora-gift-card.png', { type: 'image/png' }); if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'A surprise for you' }); else await downloadCanvas(c) } catch { /* cancelled */ } }
  const ratio = FORMATS[format].w / FORMATS[format].h
  const width = typeof window !== 'undefined' && window.innerWidth < 720 ? Math.min(180, window.innerWidth * .48) : 240
  const height = width / ratio
  return <div className="quick-backdrop qr-backdrop" role="dialog" aria-modal="true" aria-label="Printable QR card" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
    <div className="quick-sheet qr-sheet" data-lenis-prevent>
      <header className="qr-head"><div><p className="eyebrow">PRINTABLE QR CARD</p><h2>Tuck it into the gift</h2><small>Your custom share link is included in the QR code.</small></div><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18}/></button></header>
      <div className="qr-body">
        <div className="qr-preview-wrap"><div className="qr-preview" style={{ width: `${width}px`, height: `${height}px`, aspectRatio: String(ratio) }}>{src && <img src={src} alt="Gift card preview" />}{busy && <span className="qr-busy"><Loader2 className="spin" size={24}/></span>}</div></div>
        <div className="qr-ctl">
          <div className="ai2-field"><span>Design</span><div className="qr-designs" role="radiogroup" aria-label="Design">{(Object.keys(DESIGNS) as CardDesign[]).map(d => <button key={d} type="button" role="radio" aria-checked={design === d} className={design === d ? 'on' : ''} onClick={() => setDesign(d)} style={{ ['--a' as string]: DESIGNS[d].bg[0], ['--b' as string]: DESIGNS[d].accent } as React.CSSProperties}><i/>{DESIGNS[d].name}</button>)}</div></div>
          <div className="ai2-field"><span>Size</span><div className="ai2-langs" role="radiogroup" aria-label="Size">{(Object.keys(FORMATS) as CardFormat[]).map(f => <button key={f} type="button" role="radio" aria-checked={format === f} className={format === f ? 'on' : ''} onClick={() => setFormat(f)}>{FORMATS[f].name}</button>)}</div><small>{FORMATS[format].hint} · prints at {FORMATS[format].mm[0]} × {FORMATS[format].mm[1]} mm</small></div>
          <label className="ai2-field"><span>Line under the code</span><input value={line} maxLength={40} onChange={e => setLine(e.target.value)}/><div className="ai2-langs">{LINES.map(l => <button key={l} type="button" onClick={() => setLine(l)}>{l.replace(' ♡', '')}</button>)}</div></label>
          <div className="qr-toggles"><label><input type="checkbox" checked={showSender} onChange={e => setShowSender(e.target.checked)}/> Show “with love, {sender || 'me'}”</label>{revealDate && <label><input type="checkbox" checked={showDate} onChange={e => setShowDate(e.target.checked)}/> Show the reveal date</label>}</div>
          {err && <p className="pw-error" role="alert">{err}</p>}
        </div>
      </div>
      <footer className="ai2-foot qr-foot"><button className="primary-btn" onClick={() => void make().then(c => downloadCanvas(c)).catch(() => setErr('Could not download the card.'))}><Download size={17}/> Download</button><button className="secondary-btn" onClick={() => void make().then(c => { if (!printCanvas(c, format)) setErr('Printing is not available here. Download the card and print it instead.') }).catch(() => setErr('Could not prepare the card.'))}><Printer size={17}/> Print</button><button className="secondary-btn" onClick={() => void share()}><Share2 size={17}/> Share</button></footer>
    </div>
  </div>
}
