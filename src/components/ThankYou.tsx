import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, Instagram, MessageCircle, Send, Share2, X } from 'lucide-react'

type Props = { sender: string; recipient: string; occasion: string; whatsapp?: string; instagram?: string; url?: string; onClose: () => void }
const kindOf = (o: string) => (o === 'Birthday' ? 'birthday surprise' : o === 'Anniversary' ? 'anniversary surprise' : 'surprise')
/** "Send a thank-you" sheet: a pre-typed, editable message that opens WhatsApp or Instagram (and can be copied or shared anywhere else). */
export default function ThankYou({ sender, recipient, occasion, whatsapp, instagram, url, onClose }: Props) {
  const [msg, setMsg] = useState(`Thank you so much for my ${kindOf(occasion)}${sender ? `, ${sender}` : ''}! 💖 I loved every single moment of it.`)
  const [note, setNote] = useState('')
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [onClose])
  const phone = (whatsapp || '').replace(/[^0-9]/g, '')
  const text = msg.trim() || 'Thank you for my surprise 💖'
  const waHref = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
  const igHandle = (instagram || '').replace(/^@/, '').trim()
  const igHref = igHandle ? `https://ig.me/m/${encodeURIComponent(igHandle)}` : 'https://www.instagram.com/direct/inbox/'
  const copy = async () => { try { await navigator.clipboard.writeText(text); return true } catch { return false } }
  const onCopy = async () => setNote((await copy()) ? 'Message copied ♡' : 'Could not copy. Select the text and copy it.')
  // Instagram cannot be opened with a ready-typed message, so the message is copied first and just needs a paste.
  const onInsta = async () => setNote((await copy()) ? 'Message copied. Paste it in the chat ♡' : 'Open the chat and type your thank-you ♡')
  const onShare = async () => { try { if (navigator.share) await navigator.share({ text: url ? `${text} ${url}` : text }); else setNote((await copy()) ? 'Message copied ♡' : '') } catch { /* cancelled */ } }
  const btn = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 14px', borderRadius: 14, fontWeight: 700, fontSize: 14, textDecoration: 'none', border: '1px solid rgba(255,255,255,.22)', color: '#fff', cursor: 'pointer', flex: '1 1 140px' } as const
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Send a thank-you" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(8,4,14,.62)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 12 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: 'min(100%,460px)', background: 'linear-gradient(160deg,#2b1838,#170f26)', color: '#fff', border: '1px solid rgba(255,190,225,.3)', borderRadius: 22, padding: 18, boxShadow: '0 -10px 50px rgba(0,0,0,.5)', display: 'grid', gap: 12, marginBottom: 'env(safe-area-inset-bottom)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <strong style={{ fontSize: 17 }}>Send a thank-you 💌{recipient ? '' : ''}</strong>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 0, color: '#fff', padding: 6 }}><X size={20} /></button>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#e9cfe0' }}>We typed a message for you. Change it if you like, then choose where to send it.</p>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} maxLength={400} rows={4} aria-label="Your thank-you message" style={{ width: '100%', borderRadius: 14, border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.07)', color: '#fff', padding: 12, fontSize: 15, resize: 'none' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <a href={waHref} target="_blank" rel="noopener noreferrer" style={{ ...btn, background: '#1faa59', borderColor: '#1faa59' }}><MessageCircle size={17} /> WhatsApp</a>
          <a href={igHref} target="_blank" rel="noopener noreferrer" onClick={onInsta} style={{ ...btn, background: 'linear-gradient(45deg,#f9a03a,#e1306c 55%,#833ab4)', borderColor: 'transparent' }}><Instagram size={17} /> Instagram</a>
          <button type="button" onClick={onShare} style={{ ...btn, background: 'rgba(255,255,255,.1)' }}><Share2 size={16} /> Other apps</button>
          <button type="button" onClick={onCopy} style={{ ...btn, background: 'rgba(255,255,255,.1)' }}><Copy size={16} /> Copy</button>
        </div>
        <small style={{ color: '#d9bfd0', minHeight: 18, display: 'flex', alignItems: 'center', gap: 6 }}>{note ? <><Check size={13} /> {note}</> : <><Send size={12} /> {igHandle || phone ? 'Opens a chat with the person who made this.' : 'WhatsApp lets you pick the chat. Instagram opens your messages: paste the copied text.'}</>}</small>
      </div>
    </div>, document.body)
}
