import { useState, type ReactNode } from 'react'
import { ChevronDown, Lightbulb } from 'lucide-react'
import type { Relation } from '../types'

type Prompt = { label: string; seed: string }
const BASE: Prompt[] = [
  { label: 'How you met', seed: 'We met ' },
  { label: 'Something they always do', seed: 'They always ' },
  { label: 'An inside joke', seed: 'Our inside joke is ' },
  { label: 'A time they showed up', seed: 'Once, they ' },
  { label: 'What you love most', seed: 'What I love most is ' },
]
const BY_REL: Partial<Record<Relation, Prompt[]>> = {
  Mom: [{ label: 'Her cooking or care', seed: 'Her ' }, { label: 'Something she says', seed: 'She always says ' }],
  Dad: [{ label: 'His advice', seed: 'He always tells me ' }, { label: 'A thing he does quietly', seed: 'He quietly ' }],
  Brother: [{ label: 'A fight you laugh at now', seed: 'We once fought about ' }, { label: 'A memory from childhood', seed: 'As kids we ' }],
  Sister: [{ label: 'A secret only you share', seed: 'Only we know ' }, { label: 'A memory from childhood', seed: 'As kids we ' }],
  Partner: [{ label: 'Your first moment', seed: 'The first time I knew ' }, { label: 'A small thing they do', seed: 'The way they ' }],
  Friend: [{ label: 'A trip or plan gone wrong', seed: 'That time we ' }, { label: 'What they do at 2am', seed: 'At 2am they ' }],
}
const TIPS = [
  'Short and specific beats big and fancy. “Steals my fries and says sorry after” is better than “you are the best”.',
  'Use real names, places and moments. The AI only knows what you tell it, so it will not invent anything.',
  'One line per thing. Three or four lines is plenty. More than six starts to blur.',
  'Write the way you would text them. We keep your voice and skip the greeting-card words.',
]
const EXAMPLE = { weak: 'She is my best friend and very kind.', strong: 'Calls me at 2am to gossip\nWe got lost in Goa and ate maggi on the beach\nShe cried at my graduation more than I did' }

/** Wraps the "things about them" box with tap-to-start prompts, a short how-to, and a gentle progress hint. */
export default function AiGuide({ value, onChange, relation, children }: { value: string; onChange: (v: string) => void; relation?: Relation | ''; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const prompts = [...(relation ? BY_REL[relation] || [] : []), ...BASE].slice(0, 6)
  const lines = value.split('\n').map(x => x.trim()).filter(x => x.length >= 6).length
  const add = (seed: string) => { const base = value.trimEnd(); onChange(base ? `${base}\n${seed}` : seed) }
  const level = lines >= 4 ? 3 : lines >= 2 ? 2 : lines >= 1 ? 1 : 0
  const msg = ['Add a few details and it will sound like you.', 'Good start. One or two more lines will make it feel personal.', 'Nice. This is enough for a warm, specific draft.', 'Lovely. That is plenty to work with.'][level]
  return <div className="aig">
    {children}
    <div className="aig-meter" aria-live="polite"><span className="aig-bar" aria-hidden="true">{[1, 2, 3].map(n => <i key={n} className={level >= n ? 'on' : ''} />)}</span><small>{msg}</small></div>
    <div className="aig-chips" role="group" aria-label="Start a line">{prompts.map(p => <button type="button" key={p.label} onClick={() => add(p.seed)}>+ {p.label}</button>)}</div>
    <button type="button" className="aig-toggle" aria-expanded={open} onClick={() => setOpen(v => !v)}><Lightbulb size={14} /> How to get a draft that sounds like you <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : undefined }} /></button>
    {open && <div className="aig-body">
      <ol>{TIPS.map(t => <li key={t}>{t}</li>)}</ol>
      <div className="aig-ex"><div><b>Too vague</b><p>{EXAMPLE.weak}</p></div><div className="good"><b>Works well</b><p>{EXAMPLE.strong}</p></div></div>
    </div>}
  </div>
}
