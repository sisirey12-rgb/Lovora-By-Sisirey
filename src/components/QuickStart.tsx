import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Eye, ImagePlus, Palette, X } from 'lucide-react'
import SavingOverlay from './SavingOverlay'
import PayWall from './PayWall'
import { getPrice } from '../services/payments'
import { fromTemplate, type Template } from '../lib/templates'
import { compressImage } from '../lib/media'
import { storage } from '../services/storage'
import type { Experience } from '../types'

/** Quick mode: pick a template, add two names and (optionally) one photo, and get a share link in under a minute. */
export type QuickForm = { to: string; from: string; photo: string; id: string }
export default function QuickStart({ template, form, setForm, onClose, onFull, onPreview, onDone }: { template: Template; form: QuickForm; setForm: (f: QuickForm) => void; onClose: () => void; onFull: (e: Experience) => void; onPreview: (e: Experience) => void; onDone: () => void }) {
  const { to, from, photo, id } = form
  const setTo = (v: string) => setForm({ ...form, to: v }), setFrom = (v: string) => setForm({ ...form, from: v }), setPhoto = (v: string) => setForm({ ...form, photo: v })
  const [amount, setAmount] = useState(149), [pay, setPay] = useState(false)
  useEffect(() => { void getPrice().then(p => setAmount(p.amount)) }, [])
  const [saving, setSaving] = useState<Experience | null>(null)
  const [busy, setBusy] = useState(''), [err, setErr] = useState(''), [done, setDone] = useState<Experience | null>(null), [copied, setCopied] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const build = (): Experience => {
    const e = fromTemplate(template)
    return { ...e, id, recipient: to.trim(), sender: from.trim(), memories: photo ? [{ id: crypto.randomUUID(), kind: 'image', src: photo, caption: '', name: 'photo.jpg' }] : [] }
  }
  const pick = async (f?: File) => {
    if (!f) return
    if (!f.type.startsWith('image/')) { setErr('Choose a photo.'); return }
    try { setPhoto(await compressImage(f)); setErr('') } catch (e) { setErr(e instanceof Error ? e.message : 'That photo could not be read.') }
  }
  const valid = () => {
    if (!to.trim()) { setErr('Add the name of the person it is for.'); return false }
    if (!from.trim()) { setErr('Add your name so they know who sent it.'); return false }
    setErr(''); return true
  }
  /** Runs after payment: puts the paid surprise online and shows the link. */
  const finish = async (paid: Experience) => {
    setPay(false); setBusy('Creating your link…')
    try { const published = await storage.publish(paid); storage.saveDraft(published); onDone(); setDone(published) }
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not create the link. Please try again.') } finally { setBusy('') }
  }
  const url = done ? `${window.location.origin}/s/${done.id}` : ''
  return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Quick surprise" onClick={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
    <div className="quick-sheet">
      <button className="icon-btn quick-x" onClick={onClose} aria-label="Close" disabled={!!busy}><X size={18} /></button>
      <p className="eyebrow">QUICK MODE · {template.occasion.toUpperCase()} · {template.relation.toUpperCase()}</p>
      {!done ? <>
        <h2>{template.emoji} {template.occasion} for your {template.relation.toLowerCase()}</h2>
        <p className="muted">The story, look and wishes are already set. Add the names, then customise or preview.</p>
        <label>Who is it for?<input value={to} onChange={e => setTo(e.target.value)} placeholder={template.relation === 'Mom' || template.relation === 'Dad' ? template.relation : 'Their name'} maxLength={30} /></label>
        <label>Your name<input value={from} onChange={e => setFrom(e.target.value)} placeholder="Who is sending it?" maxLength={30} /></label>
        <input ref={file} type="file" accept="image/*" hidden onChange={e => { void pick(e.target.files?.[0]); e.target.value = '' }} />
        <button type="button" className="quick-photo" onClick={() => file.current?.click()}>{photo ? <img src={photo} alt="Your photo" /> : <ImagePlus size={20} />}<span>{photo ? 'Change photo' : 'Add one photo (optional)'}</span></button>
        {err && <p className="error-text" role="alert">{err}</p>}
        <button type="button" className="customise-btn" onClick={() => onFull(build())} disabled={!!busy}><span className="customise-ico"><Palette size={20} /></span><span><strong>Customise it</strong><small>Your words, photos, look and balloon wishes</small></span><span className="customise-go">→</span></button>
        <div className="quick-row">
          <button className="secondary-btn" onClick={() => { if (valid()) { const e = build(); try { storage.saveDraft(e); onDone() } catch { /* the preview still opens */ } setSaving(e) } }} disabled={!!busy}><Eye size={16} /> Preview</button>
          <button className="secondary-btn" onClick={() => { if (valid()) setPay(true) }} disabled={!!busy}>{busy || `Share link · ₹${amount}`}</button>
        </div>
      </> : <>
        <h2>Your surprise is live ♡</h2>
        <input readOnly value={url} onFocus={e => e.currentTarget.select()} aria-label="Share link" />
        <div className="share-actions">
          <button className="secondary-btn" onClick={() => { void navigator.clipboard.writeText(url).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 2000) }).catch(() => undefined) }}>{copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy link</>}</button>
          <a className="secondary-btn" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${done.title || 'A little surprise'} 💌 ${url}`)}`}>Send on WhatsApp</a>
          <button className="secondary-btn" onClick={() => onPreview(done)}>Preview it</button>
          <button className="text-btn" onClick={() => onFull(done)}>Add more photos, music or scenes</button>
        </div>
      </>}
    </div>
    {saving && <SavingOverlay onDone={() => { const e = saving; setSaving(null); onPreview(e) }} />}
    {pay && <PayWall item={build()} onClose={() => setPay(false)} onPaid={e => void finish(e)} onPreview={() => { setPay(false); onPreview(build()) }} />}
  </div>
}
