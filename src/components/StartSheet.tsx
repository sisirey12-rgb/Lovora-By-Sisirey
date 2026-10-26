import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check, Copy, Eye, ImagePlus, Palette, Pencil, Sparkles, X } from 'lucide-react'
import SavingOverlay from './SavingOverlay'
import PayWall from './PayWall'
import { getPrice } from '../services/payments'
import { PRICING } from '../config'
import { fromTemplate, templates } from '../lib/templates'
import { RELATIONS } from '../lib/occasionContent'
import { compressImage } from '../lib/media'
import { storage } from '../services/storage'
import { supabase } from '../services/supabase/client'
import { useAuth } from '../services/auth'
import AiGuide from './AiGuide'
import type { Experience, Extras, Occasion, Relation } from '../types'

type Field = { key: string; label: string; type: 'text' | 'date' | 'number'; ph?: string; hint?: string; apply: (e: Experience, v: string) => Experience }
const ex = (e: Experience, p: Partial<Extras>): Experience => ({ ...e, extras: { ...(e.extras || {}), ...p } })

/** Only the details that change the surprise itself. Dates, venues and event plans live in the full editor, one tap away. */
const FIELDS: Record<string, Field[]> = {
  Birthday: [{ key: 'age', label: 'Turning age', type: 'number', ph: 'e.g. 21', hint: 'Sets how many candles they blow out.', apply: (e, v) => ({ ...e, age: Math.min(120, Math.max(1, Number(v) || 0)) || undefined }) }],
  Anniversary: [{ key: 'since', label: 'Together since', type: 'date', hint: 'Counts the days you have had together.', apply: (e, v) => ({ ...e, togetherSince: v }) }],
  'Love letter': [{ key: 'nick', label: 'What you call them', type: 'text', ph: 'Chotu, Babu, Boss', apply: (e, v) => ex(e, { nickname: v }) }],
  'Special surprise': [{ key: 'why', label: 'What are we celebrating?', type: 'text', ph: 'New job, a good grade, just because', apply: (e, v) => ({ ...e, title: v }) }],
}

export default function StartSheet({ occasion, relation, onClose, onFull, onPreview, onDone }: { occasion: Occasion; relation?: Relation; onClose: () => void; onFull: (e: Experience) => void; onPreview: (e: Experience) => void; onDone: () => void }) {
  const { user } = useAuth()
  const meta = (user?.user_metadata || {}) as { full_name?: string }
  const myName = (meta.full_name || user?.email?.split('@')[0] || '').trim()
  const rels = RELATIONS.filter(r => occasion !== 'Love letter' || r.id === 'Partner')
  const [step, setStep] = useState<1 | 2>(1), [to, setTo] = useState(''), [from, setFrom] = useState(myName), [rel, setRel] = useState<Relation | ''>(relation || (occasion === 'Love letter' ? 'Partner' : ''))
  const [vals, setVals] = useState<Record<string, string>>({}), [facts, setFacts] = useState(''), [photo, setPhoto] = useState('')
  const [busy, setBusy] = useState(''), [err, setErr] = useState(''), [saving, setSaving] = useState<Experience | null>(null), [last, setLast] = useState<Experience | null>(null), [previewed, setPreviewed] = useState(false)
  const [pay, setPay] = useState(false), [done, setDone] = useState<Experience | null>(null), [copied, setCopied] = useState(false), [amount, setAmount] = useState(PRICING.amount)
  const id = useRef(crypto.randomUUID()), file = useRef<HTMLInputElement>(null)
  useEffect(() => { void getPrice().then(p => setAmount(p.amount)) }, [])
  useEffect(() => { if (!from && myName) setFrom(myName) }, [myName, from])
  const tpl = templates.find(t => t.occasion === occasion && t.relation === rel)
  const fields = FIELDS[occasion] || FIELDS['Special surprise']
  const build = (): Experience => {
    if (!tpl) throw new Error('Choose who it is for first.')
    let e: Experience = { ...fromTemplate(tpl), id: id.current, recipient: to.trim(), sender: from.trim() || 'Someone who loves you', targetDate: undefined, memories: photo ? [{ id: crypto.randomUUID(), kind: 'image', src: photo, caption: '', name: 'photo.jpg' }] : [] }
    for (const f of fields) { const v = (vals[f.key] || '').trim(); if (v) e = f.apply(e, v) }
    return e
  }
  const personalise = async (e: Experience): Promise<Experience> => {
    if (facts.trim().length < 8 || !supabase) return e
    try {
      const { data } = await supabase.auth.getSession(); const t = data.session?.access_token; if (!t) return e
      const r = await fetch('/api/ai-draft', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify({ occasion: e.occasion, relation: e.relation, recipient: e.recipient, sender: e.sender, facts, language: 'English', tone: 'Sweet' }) })
      if (!r.ok) return e
      const d = await r.json()
      return { ...e, greeting: d.greeting || e.greeting, message: d.message || e.message, closing: d.closing || e.closing, balloonWishes: d.balloonWishes?.length ? d.balloonWishes : e.balloonWishes, vows: d.vows || e.vows, mystery: d.mystery?.length ? d.mystery : e.mystery, moments: d.moments?.length ? d.moments : e.moments, openWhen: d.openWhen?.length ? d.openWhen : e.openWhen }
    } catch { return e }
  }
  /** The way into the full editor: every word, photo, look and scene, starting from this template. */
  const customise = () => { if (!rel) { setErr('Choose who they are to you first.'); return } try { onFull(build()) } catch (x) { setErr(x instanceof Error ? x.message : 'Something went wrong.') } }
  const next = () => {
    if (!to.trim()) { setErr('Add the name of the person it is for.'); return }
    if (!rel) { setErr('Choose who they are to you.'); return }
    setErr(''); setStep(2)
  }
  const create = async () => {
    setErr(''); setBusy(facts.trim().length >= 8 ? 'Writing it in your voice…' : 'Setting it up…')
    try { let e = build(); e = await personalise(e); try { storage.saveDraft(e); onDone() } catch { /* preview still opens */ } setLast(e); setSaving(e) }
    catch (x) { setErr(x instanceof Error ? x.message : 'Something went wrong.') } finally { setBusy('') }
  }
  const pick = async (f?: File) => { if (!f) return; if (!f.type.startsWith('image/')) { setErr('Choose a photo.'); return } try { setPhoto(await compressImage(f)); setErr('') } catch (x) { setErr(x instanceof Error ? x.message : 'That photo could not be read.') } }
  const finish = async (paid: Experience) => { setPay(false); setBusy('Creating your link…'); try { const published = await storage.publish(paid); storage.saveDraft(published); onDone(); setDone(published) } catch (x) { setErr(x instanceof Error ? x.message : 'Could not create the link. Please try again.') } finally { setBusy('') } }
  const url = done ? `${window.location.origin}/s/${done.id}` : ''
  return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Start a surprise" onClick={e => { if (e.target === e.currentTarget && !busy) onClose() }}>
    <div className="quick-sheet start-sheet" data-lenis-prevent>
      <button className="icon-btn quick-x" onClick={onClose} aria-label="Close" disabled={!!busy}><X size={18} /></button>
      {!done && !previewed && <>
        <div className="ss-dots" aria-hidden="true"><i className="on" /><i className={step === 2 ? 'on' : ''} /></div>
        <p className="eyebrow">{occasion.toUpperCase()} · STEP {step} OF 2</p>
        {step === 1 ? <>
          <h2>Who is it for?</h2>
          <label className="ss-field">Their name<input value={to} onChange={e => setTo(e.target.value)} placeholder="Type their name" maxLength={30} autoFocus /></label>
          <div className="ss-lbl">They are your…</div>
          <div className="ss-rels" role="radiogroup" aria-label="Relation">{rels.map(r => <button key={r.id} type="button" role="radio" aria-checked={rel === r.id} className={rel === r.id ? 'on' : ''} onClick={() => setRel(r.id)}><span>{r.emoji}</span><b>{r.id}</b></button>)}</div>
          {tpl && <p className="ss-tpl"><Sparkles size={14} /> We picked the <b>{tpl.title}</b> template with the <b>{tpl.theme}</b> look.</p>}
          <label className="ss-field">Your name<input value={from} onChange={e => setFrom(e.target.value)} placeholder="Who is sending it?" maxLength={30} /></label>
          {err && <p className="error-text" role="alert">{err}</p>}
          <button className="primary-btn" onClick={next}>Continue <ArrowRight size={16} /></button>
          <button type="button" className="text-btn ss-skip" onClick={customise} disabled={!!busy}><Palette size={14} /> I would rather customise everything first</button>
        </> : <>
          <h2>Make it sound like you <small>(optional)</small></h2>
          <p className="muted">A few real details and we do the writing. Skip it and the template text is used.</p>
          {fields.map(f => <label key={f.key} className="ss-field">{f.label}<input type={f.type} inputMode={f.type === 'number' ? 'numeric' : undefined} max={f.type === 'date' ? new Date().toISOString().slice(0, 10) : undefined} value={vals[f.key] || ''} placeholder={f.ph} onChange={e => setVals({ ...vals, [f.key]: e.target.value })} maxLength={f.type === 'text' ? 80 : undefined} />{f.hint && <small>{f.hint}</small>}</label>)}
          <AiGuide value={facts} onChange={setFacts} relation={rel}><label className="ss-field">Things about them, so it sounds like you<textarea rows={4} value={facts} maxLength={600} onChange={e => setFacts(e.target.value)} placeholder={'Calls me at 2am to gossip\nWe got lost in Goa and ate maggi on the beach'} style={{ minHeight: 110 }} /><small>Optional. We write the letter and wishes around this (needs sign-in).</small></label></AiGuide>
          <input ref={file} type="file" accept="image/*" hidden onChange={e => { void pick(e.target.files?.[0]); e.target.value = '' }} />
          <button type="button" className="quick-photo" onClick={() => file.current?.click()}>{photo ? <img src={photo} alt="Your photo" /> : <ImagePlus size={20} />}<span>{photo ? 'Change photo' : 'Add one photo (optional)'}</span></button>
          {err && <p className="error-text" role="alert">{err}</p>}
          <button type="button" className="text-btn ss-skip" onClick={customise} disabled={!!busy}><Palette size={14} /> I would rather customise everything first</button>
          <div className="quick-row"><button className="secondary-btn" onClick={() => setStep(1)} disabled={!!busy}>Back</button><button className="primary-btn" onClick={() => void create()} disabled={!!busy}>{busy || <>Create and preview <Eye size={16} /></>}</button></div>
        </>}
      </>}
      {!done && previewed && last && <>
        <p className="eyebrow">READY TO SEND</p><h2>{last.recipient}’s surprise is ready</h2>
        <p className="muted">Now that you have seen it, change anything you like, or send it as it is.</p>
        <button type="button" className="customise-btn" onClick={() => onFull(last)}><span className="customise-ico"><Palette size={20} /></span><span><strong>Customise it</strong><small>Words, photos, look, scenes and balloon wishes</small></span><span className="customise-go">→</span></button>
        <div className="ss-price"><b>₹{amount}</b><s>₹{PRICING.regular}</s><span>launch price, one time</span></div>
        {err && <p className="error-text" role="alert">{err}</p>}
        <button className="primary-btn big-btn" onClick={() => setPay(true)} disabled={!!busy}>{busy || 'Get the share link'}</button>
        <div className="quick-row"><button className="secondary-btn" onClick={() => onPreview(last)}><Eye size={15} /> Watch again</button></div>
        <button className="text-btn" onClick={() => { setPreviewed(false); setStep(2) }}><Pencil size={13} /> Change these details</button>
      </>}
      {done && <>
        <h2>Your surprise is live ✨</h2>
        <input readOnly value={url} onFocus={e => e.currentTarget.select()} aria-label="Share link" />
        <div className="share-actions">
          <button className="secondary-btn" onClick={() => { void navigator.clipboard.writeText(url).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 2000) }).catch(() => undefined) }}>{copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy link</>}</button>
          <a className="secondary-btn" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${encodeURIComponent(`${done.title || 'A little surprise'} ${url}`)}`}>Send on WhatsApp</a>
          <button className="secondary-btn" onClick={() => onPreview(done)}>Preview it</button>
          <button className="text-btn" onClick={() => onFull(done)}>Add more photos, music or scenes</button>
        </div>
      </>}
    </div>
    {saving && <SavingOverlay onDone={() => { const e = saving; setSaving(null); setPreviewed(true); onPreview(e) }} />}
    {pay && last && <PayWall item={last} onClose={() => setPay(false)} onPaid={e => void finish(e)} onPreview={() => { setPay(false); onPreview(last) }} />}
  </div>
}
