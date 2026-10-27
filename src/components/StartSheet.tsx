import { useEffect, useRef, useState } from 'react'
import { ArrowRight, CalendarDays, Check, Copy, Eye, ImagePlus, Palette, Pencil, Sparkles, X } from 'lucide-react'
import CreatingOverlay from './CreatingOverlay'
import PayWall from './PayWall'
import QrStudio from './QrStudio'
import { getPrice, publishShare } from '../services/payments'
import { PRICING } from '../config'
import { fromTemplate, templates } from '../lib/templates'
import { RELATIONS } from '../lib/occasionContent'
import { compressImage } from '../lib/media'
import { storage } from '../services/storage'
import { supabase } from '../services/supabase/client'
import { useAuth } from '../services/auth'
import AiHelper from './AiHelper'
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

const isoDay = (n: number) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const niceDay = (v: string) => new Date(`${v}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

export default function StartSheet({ occasion, relation, onClose, onFull, onPreview, onDone }: { occasion: Occasion; relation?: Relation; onClose: () => void; onFull: (e: Experience) => void; onPreview: (e: Experience) => void; onDone: () => void }) {
  const { user } = useAuth()
  const meta = (user?.user_metadata || {}) as { full_name?: string }
  const myName = (meta.full_name || user?.email?.split('@')[0] || '').trim()
  const rels = RELATIONS.filter(r => occasion !== 'Love letter' || r.id === 'Partner')
  const [step, setStep] = useState<1 | 2>(1), [to, setTo] = useState(''), [from, setFrom] = useState(myName), [rel, setRel] = useState<Relation | ''>(relation || (occasion === 'Love letter' ? 'Partner' : ''))
  const [vals, setVals] = useState<Record<string, string>>({}), [facts, setFacts] = useState(''), [photo, setPhoto] = useState(''), [reveal, setReveal] = useState(''), [qrOpen, setQrOpen] = useState(false)
  const [busy, setBusy] = useState(''), [err, setErr] = useState(''), [saving, setSaving] = useState<Experience | null>(null), [last, setLast] = useState<Experience | null>(null), [previewed, setPreviewed] = useState(false)
  const [pay, setPay] = useState(false), [done, setDone] = useState<Experience | null>(null), [copied, setCopied] = useState(false), [amount, setAmount] = useState(PRICING.amount), [aiContent, setAiContent] = useState<Partial<Experience>>({})
  const id = useRef(crypto.randomUUID()), file = useRef<HTMLInputElement>(null)
  useEffect(() => { void getPrice().then(p => setAmount(p.amount)) }, [])
  useEffect(() => { if (!from && myName) setFrom(myName) }, [myName, from])
  const tpl = templates.find(t => t.occasion === occasion && t.relation === rel)
  const fields = FIELDS[occasion] || FIELDS['Special surprise']
  const build = (): Experience => {
    if (!tpl) throw new Error('Choose who it is for first.')
    let e: Experience = { ...fromTemplate(tpl), id: id.current, recipient: to.trim(), sender: from.trim() || 'Someone who loves you', targetDate: reveal || undefined, memories: photo ? [{ id: crypto.randomUUID(), kind: 'image', src: photo, caption: '', name: 'photo.jpg' }] : [] }
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
    try { let e = build(); e = Object.keys(aiContent).length ? { ...e, ...aiContent } : await personalise(e); try { storage.saveDraft(e); onDone() } catch { /* preview still opens */ } setLast(e); setSaving(e) }
    catch (x) { setErr(x instanceof Error ? x.message : 'Something went wrong.') } finally { setBusy('') }
  }
  const pick = async (f?: File) => { if (!f) return; if (!f.type.startsWith('image/')) { setErr('Choose a photo.'); return } try { setPhoto(await compressImage(f)); setErr('') } catch (x) { setErr(x instanceof Error ? x.message : 'That photo could not be read.') } }
  const finish = async (paid: Experience) => { setPay(false); setBusy('Creating your link…'); try { const r = await publishShare(paid, m => setBusy(m)); if (!r.ok) { setPay(true); return } storage.saveDraft(r.item); onDone(); setDone(r.item) } catch (x) { setErr(x instanceof Error ? x.message : 'Could not create the link. Please try again.') } finally { setBusy('') } }
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
          <h2>Make it yours <small>(optional)</small></h2>
          <p className="muted ss-lead">Everything here is optional. Skip it and we use the template.</p>
          {fields.map(f => <label key={f.key} className="ss-field">{f.label}<input type={f.type} inputMode={f.type === 'number' ? 'numeric' : undefined} max={f.type === 'date' ? new Date().toISOString().slice(0, 10) : undefined} value={vals[f.key] || ''} placeholder={f.ph} onChange={e => setVals({ ...vals, [f.key]: e.target.value })} maxLength={f.type === 'text' ? 80 : undefined} />{f.hint && <small>{f.hint}</small>}</label>)}
          <div className="ss-field ss-reveal"><span className="ss-lbl2"><CalendarDays size={15} /> Reveal date</span>
            <div className="ss-chips">{([['Today', 0], ['Tomorrow', 1], ['In a week', 7]] as [string, number][]).map(([t, n]) => { const v = isoDay(n); return <button key={t} type="button" className={reveal === v ? 'on' : ''} onClick={() => setReveal(reveal === v ? '' : v)}>{t}</button> })}</div>
            <input type="date" value={reveal} min={isoDay(0)} max={isoDay(62)} onChange={e => setReveal(e.target.value)} aria-label="Reveal date" />
            <small>{reveal ? `The link opens at midnight on ${niceDay(reveal)}. Your own previews always open now.` : 'Leave empty and it opens whenever they tap the link.'}</small></div>
          <label className="ss-field">A few details about them<textarea rows={3} value={facts} maxLength={600} onChange={e => setFacts(e.target.value)} placeholder={'Calls me at 2am to gossip\nLoves momo, hates mornings'} /></label>
          {(() => { try { return <AiHelper item={build()} initialFacts={facts} onApply={p => { setAiContent(p); setFacts(facts || 'AI draft added') }} /> } catch { return null } })()}
          <input ref={file} type="file" accept="image/*" hidden onChange={e => { void pick(e.target.files?.[0]); e.target.value = '' }} />
          <button type="button" className="quick-photo" onClick={() => file.current?.click()}>{photo ? <img src={photo} alt="Your photo" /> : <ImagePlus size={20} />}<span>{photo ? 'Change photo' : 'Add one photo'}</span></button>
          {err && <p className="error-text" role="alert">{err}</p>}
          <div className="ss-foot">
            <div className="quick-row"><button className="secondary-btn" onClick={() => setStep(1)} disabled={!!busy}>Back</button><button className="primary-btn" onClick={() => void create()} disabled={!!busy}>{busy || <>Create and preview <Eye size={16} /></>}</button></div>
            <button type="button" className="text-btn ss-skip" onClick={customise} disabled={!!busy}><Palette size={14} /> Customise everything first</button>
          </div>
        </>}
      </>}
      {!done && previewed && last && <>
        <p className="eyebrow">READY TO SEND</p><h2>{last.recipient}’s surprise is ready</h2>
        <p className="muted">Now that you have seen it, change anything you like, or send it as it is.</p>
        <button type="button" className="customise-btn" onClick={() => onFull(last)}><span className="customise-ico"><Palette size={20} /></span><span><strong>Customise it</strong><small>Words, photos, look, scenes and balloon wishes</small></span><span className="customise-go">→</span></button>
        <div className="ss-price"><b>₹{amount}</b><s>₹{PRICING.regular}</s><span>launch price, one time</span></div>
        {err && <p className="error-text" role="alert">{err}</p>}
        <button className="primary-btn big-btn" onClick={() => last && void finish(last)} disabled={!!busy}>{busy || 'Get the share link'}</button>
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
          <button className="secondary-btn" onClick={() => setQrOpen(true)}>Printable QR card</button>
          <button className="text-btn" onClick={() => onFull(done)}>Add more photos, music or scenes</button>
        </div>
      </>}
    </div>
    {saving && <CreatingOverlay occasion={saving.occasion} relation={saving.relation} name={saving.recipient} onDone={() => { const e = saving; setSaving(null); setPreviewed(true); onPreview(e) }} />}
    {qrOpen && done && <QrStudio url={url} recipient={done.recipient} sender={done.sender} occasion={done.occasion} revealDate={done.targetDate} onClose={() => setQrOpen(false)} />}
    {pay && last && <PayWall item={last} onClose={() => setPay(false)} onPaid={e => void finish(e)} onPreview={() => { setPay(false); onPreview(last) }} />}
  </div>
}
