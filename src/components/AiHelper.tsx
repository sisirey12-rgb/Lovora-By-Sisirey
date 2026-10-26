import { useEffect, useState } from 'react'
import { Sparkles, X, Wand2, RefreshCw, CalendarDays } from 'lucide-react'
import { supabase } from '../services/supabase/client'
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
  { label: 'About them', ph: 'Calls me at 2am to gossip, loves momo, hates mornings' },
  { label: 'A memory or inside joke (optional)', ph: 'We got lost in Pokhara and ate maggi on the roof' },
  { label: 'What you want to say (optional)', ph: 'Thank you for always being there' },
]
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const addDays = (n: number) => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d }
const niceDate = (v: string) => new Date(`${v}T12:00:00`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })

/** "Write it with AI": up to three free prompts, any language mix, plus words you want sprinkled in. The server drafts the letter and the text for every scene. */
export default function AiHelper({ item, onApply, initialFacts = '' }: { item: Experience; onApply: (p: Partial<Experience>) => void; initialFacts?: string }) {
  const [open, setOpen] = useState(false)
  const [prompts, setPrompts] = useState<string[]>([initialFacts, '', ''])
  const [words, setWords] = useState('')
  const [lang, setLang] = useState<(typeof LANGS)[number]['id']>(item.language === 'Hinglish' ? 'Hinglish' : 'English')
  const [tone, setTone] = useState<(typeof TONES)[number]>('Sweet')
  const [reveal, setReveal] = useState(item.targetDate || '')
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
    if (reveal) p.targetDate = reveal
    onApply(p); setOpen(false); setDraft(null)
  }
  if (!open) return <button type="button" className="ai-btn" onClick={() => setOpen(true)}><Wand2 size={17} /><span><strong>Write it with AI</strong><small>Give 1 to 3 short lines, in English, Hinglish or Nepali</small></span><Sparkles size={16} /></button>
  const count = (a?: unknown[]) => (a?.length || 0)
  const minD = iso(addDays(0)), maxD = iso(addDays(62))
  const chips: [string, string][] = [['Today', iso(addDays(0))], ['Tomorrow', iso(addDays(1))], ['In a week', iso(addDays(7))]]
  return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Write with AI" onClick={e => { if (e.target === e.currentTarget && !busy) setOpen(false) }}>
    <div className="quick-sheet ai-sheet2">
      <header className="ai2-head"><div><p className="eyebrow">AI WRITING HELPER</p><h2>{draft ? 'Here is your draft' : `Write for ${item.recipient || 'them'}`}</h2></div><button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button></header>
      <div className="ai2-body" data-lenis-prevent>
        {!draft ? <>
          <ol className="ai2-steps"><li><b>1</b>Write a few short lines</li><li><b>2</b>Pick a language</li><li><b>3</b>Choose the reveal date</li></ol>
          {[0, 1, 2].map(i => <label key={i} className="ai2-field"><span>{PROMPTS[i].label}</span><textarea value={prompts[i]} onChange={e => setP(i, e.target.value)} rows={i === 0 ? 3 : 2} maxLength={400} placeholder={PROMPTS[i].ph} /></label>)}
          <div className="ai2-field"><span>Language</span><div className="ai2-langs" role="radiogroup" aria-label="Language">{LANGS.map(l => <button key={l.id} type="button" role="radio" aria-checked={lang === l.id} className={lang === l.id ? 'on' : ''} onClick={() => setLang(l.id)}>{l.id}</button>)}</div><small>{LANGS.find(l => l.id === lang)?.hint}</small></div>
          <div className="ai2-field"><span><CalendarDays size={14} /> Reveal date (optional)</span>
            <div className="ai2-langs">{chips.map(([t, v]) => <button key={t} type="button" className={reveal === v ? 'on' : ''} onClick={() => setReveal(v)}>{t}</button>)}{reveal && <button type="button" onClick={() => setReveal('')}>No date</button>}</div>
            <input type="date" value={reveal} min={minD} max={maxD} onChange={e => setReveal(e.target.value)} />
            <small>{reveal ? `The link opens at midnight on ${niceDate(reveal)}. Previews always open straight away.` : 'Leave empty and the link opens whenever they tap it.'}</small></div>
          <details className="ai2-more"><summary>More options</summary>
            <label className="ai2-field"><span>Words you want included</span><input value={words} onChange={e => setWords(e.target.value)} maxLength={160} placeholder="e.g. dai, bahini, maya, yaar, chiya" /></label>
            <div className="ai2-field"><span>Tone</span><div className="ai2-langs">{TONES.map(t => <button key={t} type="button" className={tone === t ? 'on' : ''} onClick={() => setTone(t)}>{t}</button>)}</div></div></details>
        </> : <>
          <div className="ai-prev"><b>{draft.greeting}</b><p>{draft.message}</p><em>{draft.closing}</em></div>
          <div className="ai-counts"><span>{count(draft.balloonWishes)} wishes</span><span>{count(draft.moments)} moments</span><span>{count(draft.mystery)} mystery messages</span><span>{count(draft.openWhen)} open-when notes</span>{draft.vows && <span>vows</span>}{draft.reasons?.length ? <span>{draft.reasons.length} reasons</span> : null}{draft.awardTitle && <span>award: {draft.awardTitle}</span>}</div>
          <p className="muted">"Use this" fills your letter and the words for every scene{reveal ? ` and sets the reveal date to ${niceDate(reveal)}` : ''}. You can edit everything afterwards.</p>
        </>}
      </div>
      <footer className="ai2-foot">
        {err && <p className="error-text" role="alert">{err}</p>}
        {!draft ? <button className="primary-btn" onClick={() => void run()} disabled={busy || !ready}>{busy ? 'Writing…' : `Write my draft${used.length > 1 ? ` from ${used.length} lines` : ''}`} <Wand2 size={16} /></button>
          : <div className="occ-actions"><button className="secondary-btn" onClick={() => void run()} disabled={busy}><RefreshCw size={15} /> Try again</button><button className="primary-btn" onClick={apply}>Use this</button></div>}
      </footer>
    </div>
  </div>
}
