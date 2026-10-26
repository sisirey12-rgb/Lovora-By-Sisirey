import { useState } from 'react'
import { Sparkles, X, Wand2, RefreshCw } from 'lucide-react'
import { supabase } from '../services/supabase/client'
import type { Experience } from '../types'

export type AiDraft = { greeting: string; message: string; closing: string; balloonWishes: string[]; vows: string; mystery: string[]; moments: string[]; openWhen: { label: string; note: string }[] }
const LANGS = ['English', 'Hinglish', 'Hindi'] as const, TONES = ['Sweet', 'Funny', 'Emotional'] as const

/** "Write it with AI": the creator types a few facts, the server drafts the letter, wishes, vows, mystery boxes and open-when notes. */
export default function AiHelper({ item, onApply }: { item: Experience; onApply: (p: Partial<Experience>) => void }) {
  const [open, setOpen] = useState(false), [facts, setFacts] = useState(''), [lang, setLang] = useState<(typeof LANGS)[number]>(item.language === 'Hinglish' ? 'Hinglish' : 'English'), [tone, setTone] = useState<(typeof TONES)[number]>('Sweet')
  const [busy, setBusy] = useState(false), [err, setErr] = useState(''), [draft, setDraft] = useState<AiDraft | null>(null)
  const run = async () => {
    setErr(''); setBusy(true)
    try {
      const { data } = await supabase!.auth.getSession(); const token = data.session?.access_token
      if (!token) throw new Error('Please sign in to use the AI helper.')
      const r = await fetch('/api/ai-draft', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ occasion: item.occasion, relation: item.relation, recipient: item.recipient, sender: item.sender, facts, language: lang, tone }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || 'The AI helper could not write that. Please try again.')
      setDraft(j as AiDraft)
    } catch (e) { setErr(e instanceof Error ? e.message : 'Something went wrong.') } finally { setBusy(false) }
  }
  const apply = () => {
    if (!draft) return
    const p: Partial<Experience> = { greeting: draft.greeting || item.greeting, message: draft.message || item.message, closing: draft.closing || item.closing, language: lang === 'Hinglish' ? 'Hinglish' : 'English' }
    if (draft.balloonWishes.length) p.balloonWishes = draft.balloonWishes
    if (draft.vows) p.vows = draft.vows
    if (draft.mystery.length) p.mystery = draft.mystery
    if (draft.moments.length) p.moments = draft.moments
    if (draft.openWhen.length) p.openWhen = draft.openWhen
    onApply(p); setOpen(false); setDraft(null)
  }
  if (!open) return <button type="button" className="ai-btn" onClick={() => setOpen(true)}><Wand2 size={17} /><span><strong>Write it with AI</strong><small>Tell us a few things, get a full draft</small></span><Sparkles size={16} /></button>
  return <div className="quick-backdrop" role="dialog" aria-modal="true" aria-label="Write with AI" onClick={e => { if (e.target === e.currentTarget && !busy) setOpen(false) }}>
    <div className="quick-sheet ai-sheet" data-lenis-prevent>
      <button className="icon-btn quick-x" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
      <p className="eyebrow">AI WRITING HELPER</p><h2>{draft ? 'Here is your draft' : `Tell us about ${item.recipient || 'them'}`}</h2>
      {!draft ? <>
        <label>Three or four things about them<textarea value={facts} onChange={e => setFacts(e.target.value)} rows={5} maxLength={700} placeholder={'Loves chai and bad puns\nWe met in college hostel\nAlways picks up my calls at 2am'} style={{ minHeight: 130 }} /></label>
        <div className="ai-row"><span>Language</span>{LANGS.map(l => <button key={l} className={`ai-chip ${lang === l ? 'on' : ''}`} onClick={() => setLang(l)}>{l}</button>)}</div>
        <div className="ai-row"><span>Tone</span>{TONES.map(t => <button key={t} className={`ai-chip ${tone === t ? 'on' : ''}`} onClick={() => setTone(t)}>{t}</button>)}</div>
        {err && <p className="error-text" role="alert">{err}</p>}
        <button className="primary-btn" onClick={() => void run()} disabled={busy || facts.trim().length < 8}>{busy ? 'Writing…' : 'Write my draft'} <Wand2 size={16} /></button>
        <small className="muted">Only the text you type here is sent to the AI. Nothing is saved until you tap "Use this".</small>
      </> : <>
        <div className="ai-prev"><b>{draft.greeting}</b><p>{draft.message}</p><em>{draft.closing}</em></div>
        <div className="ai-counts"><span>{draft.balloonWishes.length} wishes</span><span>{draft.moments.length} moments</span><span>{draft.mystery.length} mystery messages</span><span>{draft.openWhen.length} open-when notes</span>{draft.vows && <span>vows</span>}</div>
        <p className="muted">"Use this" fills your letter, wishes, vows, mystery boxes, lantern lines and open-when notes. You can edit everything afterwards.</p>
        <div className="occ-actions"><button className="secondary-btn" onClick={() => void run()} disabled={busy}><RefreshCw size={15} /> Try again</button><button className="primary-btn" onClick={apply}>Use this</button></div>
        {err && <p className="error-text" role="alert">{err}</p>}
      </>}
    </div>
  </div>
}
