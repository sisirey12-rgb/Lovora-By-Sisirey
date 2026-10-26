import { useEffect, useState } from 'react'
import { Sparkles, X, Wand2, RefreshCw } from 'lucide-react'
import { supabase } from '../services/supabase/client'
import AiGuide from './AiGuide'
import type { Experience } from '../types'

export type AiDraft = {
  greeting: string; message: string; closing: string; balloonWishes: string[]; vows: string; mystery: string[]; moments: string[]; openWhen: { label: string; note: string }[]
  petalLine?: string; starWishes?: string[]; parcelNotes?: string[]; bottleNote?: string; awardTitle?: string; awardLines?: string[]; recipe?: string[]; meters?: { label: string; pct: number }[]; reasons?: string[]
}
const LANGS = [
  { id: 'English', hint: 'Plain English' }, { id: 'Hinglish', hint: 'Hindi + English in English letters' }, { id: 'Hindi', hint: 'हिन्दी' },
  { id: 'Nepali', hint: 'नेपाली' }, { id: 'Roman Nepali', hint: 'Nepali in English letters' }, { id: 'Nepali + English', hint: 'Mixed, the way friends talk' },
] as const
const TONES = ['Sweet', 'Funny', 'Emotional'] as const
const PROMPTS = [
  { label: 'Prompt 1: about them', ph: 'Calls me at 2am to gossip, loves momo, hates mornings…' },
  { label: 'Prompt 2: a memory or inside joke (optional)', ph: 'We got lost in Pokhara and ate maggi on the roof…' },
  { label: 'Prompt 3: what you want to say (optional)', ph: 'Thank you for always being there, even when I am annoying…' },
]

/** "Write it with AI": up to three free prompts, any language mix, plus words you want sprinkled in. The server drafts the letter and the text for every scene. */
export default function AiHelper({ item, onApply, initialFacts = '' }: { item: Experience; onApply: (p: Partial<Experience>) => void; initialFacts?: string }) {
  const [open, setOpen] = useState(false)
  const [prompts, setPrompts] = useState<string[]>([initialFacts, '', ''])
  const [words, setWords] = useState('')
  const [lang, setLang] = useState<(typeof LANGS)[number]['id']>(item.language === 'Hinglish' ? 'Hinglish' : 'English')
  const [tone, setTone] = useState<(typeof TONES)[number]>('Sweet')
  const [busy, setBusy] = useState(false), [err, setErr] = useState(''), [draft, setDraft] = useState<AiDraft | null>(null)
  useEffect(() => { if (open && initialFacts.trim() && !prompts[0].trim()) setPrompts(p => [initialFacts, p[1], p[2]]) }, [open, initialFacts]) // eslint-disable-line react-hooks/exhaustive-deps
  const setP = (i: number, v: string) => setPrompts(p => p.map((x, k) => (k === i ? v : x)))
  const used = prompts.map(p => p.trim()).filter(Boolean)
  const ready = used.join('').length >= 8
  const run = async () => {
    setErr(''); setBusy(true)
    try {
      if (!supabase) throw new Error('Sign-in is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel, then redeploy.')
      const { data } = await supabase.auth.getSession(); const token = data.session?.access_token
      if (!token) throw new Error('Please sign in to use the AI helper.')
      const r = await fetch('/api/ai-draft', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ occasion: item.occasion, relation: item.relation, recipient: item.recipient, sender: item.sender, prompts: used, words, language: lang, tone }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || 'The AI helper could not write that. Please try again.')
      setDraft(j as AiDraft)
    } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong.') } finally { setBusy(false) }
  }
  const apply = () => {
    if (!draft) return
    const p: Partial<Experience> = { greeting: draft.greeting || item.greeting, message: draft.message || item.message, closing: draft.closing || item.closing, language: lang === 'Hinglish' ? 'Hinglish' : 'English' }
    if (draft.balloonWishes?.length) p.balloonWishes = draft.balloonWishes
    if (draft.vows) p.vows = draft.vows
    if (draft.mystery?.length) p.mystery = draft.mystery
    if (draft.moments?.length) p.moments = draft.moments
    if (draft.openWhen?.length) p.openWhen = draft.openWhen
    const x: NonNullable<Experience['extras']> = { ...(item.extras || {}) }
    if (draft.petalLine) x.petalLine = draft.petalLine
    if (draft.starWishes?.length) x.starWishes = draft.starWishes
    if (draft.parcelNotes?.length) x.parcelNotes = draft.parcelNotes
    if (draft.bottleNote) x.bottleNote = draft.bottleNote
    if (draft.awardTitle) x.awardTitle = draft.awardTitle
    if (draft.awardLines?.length) x.awardLines = draft.awardLines
    if (draft.recipe?.length) x.recipe = draft.recipe
    if (draft.meters?.length) x.meters = draft.meters
    if (draft.reasons?.length) x.reasons = draft.reasons
    p.extras = x
    onApply(p); setOpen(false); setDraft(null)
  }
  if (!open) return <button type="button" className="ai-btn" onClick={() => setOpen(true)}><Wand2 size={17} /><span><strong>Write it with AI</strong><small>Give 2 or 3 prompts, in English, Hinglish or Nepali</small></span><Sparkles size={16} /></button>
  const count = (a?: unknown[]) => (a?.length || 0)
  return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Write with AI" onClick={e => { if (e.target === e.currentTarget && !busy) setOpen(false) }}>
    <div className="quick-sheet ai-sheet" data-lenis-prevent>
      <button className="icon-btn quick-x" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
      <p className="eyebrow">AI WRITING HELPER</p><h2>{draft ? 'Here is your draft' : `Tell us about ${item.recipient || 'them'}`}</h2>
      {!draft ? <>
        <AiGuide value={prompts[0]} onChange={v => setP(0, v)} relation={item.relation}><label>{PROMPTS[0].label}<textarea value={prompts[0]} onChange={e => setP(0, e.target.value)} rows={3} maxLength={400} placeholder={PROMPTS[0].ph} style={{ minHeight: 86 }} /></label></AiGuide>
        {[1, 2].map(i => <label key={i}>{PROMPTS[i].label}<textarea value={prompts[i]} onChange={e => setP(i, e.target.value)} rows={2} maxLength={400} placeholder={PROMPTS[i].ph} style={{ minHeight: 70 }} /></label>)}
        <div className="ai-row"><span>Language</span>{LANGS.map(l => <button key={l.id} type="button" title={l.hint} className={`ai-chip ${lang === l.id ? 'on' : ''}`} onClick={() => setLang(l.id)}>{l.id}</button>)}</div>
        <small className="muted">{LANGS.find(l => l.id === lang)?.hint}</small>
        <label>Words you want included (optional)<input value={words} onChange={e => setWords(e.target.value)} maxLength={160} placeholder="e.g. dai, bahini, maya, yaar, chiya" /></label>
        <div className="ai-row"><span>Tone</span>{TONES.map(t => <button key={t} type="button" className={`ai-chip ${tone === t ? 'on' : ''}`} onClick={() => setTone(t)}>{t}</button>)}</div>
        {err && <p className="error-text" role="alert">{err}</p>}
        <button className="primary-btn" onClick={() => void run()} disabled={busy || !ready}>{busy ? 'Writing…' : `Write my draft${used.length > 1 ? ` from ${used.length} prompts` : ''}`} <Wand2 size={16} /></button>
        <small className="muted">Only what you type here is sent to the AI. Nothing is saved until you tap "Use this".</small>
      </> : <>
        <div className="ai-prev"><b>{draft.greeting}</b><p>{draft.message}</p><em>{draft.closing}</em></div>
        <div className="ai-counts"><span>{count(draft.balloonWishes)} wishes</span><span>{count(draft.moments)} moments</span><span>{count(draft.mystery)} mystery messages</span><span>{count(draft.openWhen)} open-when notes</span>{draft.vows && <span>vows</span>}{draft.reasons?.length ? <span>{draft.reasons.length} reasons</span> : null}{draft.awardTitle && <span>award: {draft.awardTitle}</span>}</div>
        <p className="muted">"Use this" fills your letter and the words for every scene: wishes, vows, mystery boxes, stars, parcel, bottle, award, recipe, meter and reasons. You can edit everything afterwards.</p>
        <div className="occ-actions"><button className="secondary-btn" onClick={() => void run()} disabled={busy}><RefreshCw size={15} /> Try again</button><button className="primary-btn" onClick={apply}>Use this</button></div>
        {err && <p className="error-text" role="alert">{err}</p>}
      </>}
    </div>
  </div>
}
