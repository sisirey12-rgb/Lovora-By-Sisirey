import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Eye, ImagePlus, Palette, X } from 'lucide-react'
import { useAuth } from '../services/auth'
import { supabase } from '../services/supabase/client'
import { PRICING } from '../config'
import CreatingOverlay from './CreatingOverlay'
import PayWall from './PayWall'
import { getPrice, publishShare } from '../services/payments'
import { fromTemplate, type Template } from '../lib/templates'
import { compressImage } from '../lib/media'
import { storage } from '../services/storage'
import type { Experience } from '../types'

/** Quick mode: pick a template, add two names and (optionally) one photo, and get a share link in under a minute. */
export type QuickForm = { to: string; from: string; photo: string; id: string }
export default function QuickStart({ template, form, setForm, onClose, onFull, onPreview, onDone }: { template: Template; form: QuickForm; setForm: (f: QuickForm) => void; onClose: () => void; onFull: (e: Experience) => void; onPreview: (e: Experience) => void; onDone: () => void }) {
  const { to, from, photo, id } = form
  const setTo = (v: string) => setForm({ ...form, to: v }), setFrom = (v: string) => setForm({ ...form, from: v }), setPhoto = (v: string) => setForm({ ...form, photo: v })
  const { user } = useAuth()
  const meta = (user?.user_metadata || {}) as { full_name?: string }
  const myName = (meta.full_name || user?.email?.split('@')[0] || '').trim()
  const [fact, setFact] = useState(''), [ai, setAi] = useState<Partial<Experience> | null>(null), [previewed, setPreviewed] = useState(false), [working, setWorking] = useState(false)
  useEffect(() => { if (!from && myName) setForm({ ...form, from: myName.charAt(0).toUpperCase() + myName.slice(1) }) }, [myName])   // eslint-disable-line react-hooks/exhaustive-deps
  const [amount, setAmount] = useState(149), [pay, setPay] = useState(false)
  useEffect(() => { void getPrice().then(p => setAmount(p.amount)) }, [])
  const [saving, setSaving] = useState<Experience | null>(null)
  const [busy, setBusy] = useState(''), [err, setErr] = useState(''), [done, setDone] = useState<Experience | null>(null), [copied, setCopied] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const build = (over: Partial<Experience> | null = ai): Experience => {
    const e = fromTemplate(template)
    return { ...e, ...(over || {}), id, recipient: to.trim(), sender: from.trim() || myName || 'Someone who loves you', memories: photo ? [{ id: crypto.randomUUID(), kind: 'image', src: photo, caption: '', name: 'photo.jpg' }] : [] }
  }
  const pick = async (f?: File) => {
    if (!f) return
    if (!f.type.startsWith('image/')) { setErr('Choose a photo.'); return }
    try { setPhoto(await compressImage(f)); setErr('') } catch (e) { setErr(e instanceof Error ? e.message : 'That photo could not be read.') }
  }
  const valid = () => {
    if (!to.trim()) { setErr('Add the name of the person it is for.'); return false }
    setErr(''); return true
  }
  /** Runs after payment: puts the paid surprise online and shows the link. */
  const finish = async (paid: Experience) => {
    setPay(false); setBusy('Creating your link…')
    try { const r = await publishShare(paid, m => setBusy(m)); if (!r.ok) { setPay(true); return } storage.saveDraft(r.item); onDone(); setDone(r.item) }
    catch (e) { setErr(e instanceof Error ? e.message : 'Could not create the link. Please try again.') } finally { setBusy('') }
  }
  /** One tap: optionally let the AI write around one fact about them, save, and play the preview. */
  const go = async () => {
    if (!valid()) return
    let patch = ai
    if (fact.trim().length >= 8 && !ai && supabase) {
      setWorking(true)
      try {
        const { data } = await supabase.auth.getSession()
        const r = await fetch('/api/ai-draft', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token}` }, body: JSON.stringify({ occasion: template.occasion, relation: template.relation, recipient: to.trim(), sender: from.trim() || myName, facts: fact, language: 'English', tone: 'Sweet' }) })
        const j = await r.json()
        if (r.ok) { const p: Partial<Experience> = {}; if (j.greeting) p.greeting = j.greeting; if (j.message) p.message = j.message; if (j.closing) p.closing = j.closing; if (j.balloonWishes?.length) p.balloonWishes = j.balloonWishes; if (j.vows) p.vows = j.vows; if (j.mystery?.length) p.mystery = j.mystery; if (j.moments?.length) p.moments = j.moments; if (j.openWhen?.length) p.openWhen = j.openWhen; patch = p; setAi(p) }
      } catch { /* the ready-made template text is used */ } finally { setWorking(false) }
    }
    const e = build(patch); try { storage.saveDraft(e); onDone() } catch { /* the preview still opens */ }
    setPreviewed(true); setSaving(e)
  }
  const url = done ? `${window.location.origin}/s/${done.id}` : ''
  return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Quick surprise" onClick={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
    <div className="quick-sheet">
      <button className="icon-btn quick-x" onClick={onClose} aria-label="Close" disabled={!!busy}><X size={18} /></button>
      <p className="eyebrow">QUICK MODE · {template.occasion.toUpperCase()} · {template.relation.toUpperCase()}</p>
      {!done ? <>
        <h2>{template.emoji} {template.occasion} for your {template.relation.toLowerCase()}</h2>
        <p className="muted">Everything is already set up. Just type their name and we will make it. Want it extra personal? Add one thing about them.</p>
        <label>Who is it for?<input value={to} onChange={e => setTo(e.target.value)} placeholder={template.relation === 'Mom' || template.relation === 'Dad' ? template.relation : 'Their name'} maxLength={30} /></label>
        <label>Your name <small>(filled in for you)</small><input value={from} onChange={e => setFrom(e.target.value)} placeholder="Who is sending it?" maxLength={30} /></label>
        <input ref={file} type="file" accept="image/*" hidden onChange={e => { void pick(e.target.files?.[0]); e.target.value = '' }} />
        <button type="button" className="quick-photo" onClick={() => file.current?.click()}>{photo ? <img src={photo} alt="Your photo" /> : <ImagePlus size={20} />}<span>{photo ? 'Change photo' : 'Add one photo (optional)'}</span></button>
        <label>One thing about them <small>(optional: we write around it)</small><textarea value={fact} onChange={e => { setFact(e.target.value); setAi(null) }} rows={2} maxLength={200} placeholder="Loves chai, always late, best hugs" style={{ minHeight: 70 }} /></label>
        {err && <p className="error-text" role="alert">{err}</p>}
        <button type="button" className="customise-btn" onClick={() => onFull(build())} disabled={!!busy}><span className="customise-ico"><Palette size={20} /></span><span><strong>Customise it</strong><small>Your words, photos, look and balloon wishes</small></span><span className="customise-go">→</span></button>
        {!previewed ? <button className="primary-btn big-btn quick-go" onClick={() => void go()} disabled={!!busy || working}>{working ? 'Writing your surprise…' : 'Create and preview ✨'}</button>
          : <div className="quick-send"><p className="quick-ready">🎉 Happy with it? Send it now.</p><button className="primary-btn big-btn quick-go" onClick={() => { if (valid()) void finish(build()) }} disabled={!!busy}>{busy || <>Get my share link · ₹{amount} <s>₹{PRICING.regular}</s></>}</button><button className="secondary-btn" onClick={() => void go()} disabled={working}><Eye size={16} /> Watch it again</button></div>}
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
    {saving && <CreatingOverlay occasion={saving.occasion} relation={saving.relation} name={saving.recipient} onDone={() => { const e = saving; setSaving(null); onPreview(e) }} />}
    {pay && <PayWall item={build()} onClose={() => setPay(false)} onPaid={e => void finish(e)} onPreview={() => { setPay(false); onPreview(build()) }} />}
  </div>
}
