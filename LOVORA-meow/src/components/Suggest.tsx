import { Lightbulb } from 'lucide-react'
/** Row of tap-to-use suggestion chips. `{name}` in a suggestion is swapped for the recipient's name. */
export default function Suggest({ items, name, onPick, label = 'Ideas' }: { items: readonly string[]; name?: string; onPick: (text: string) => void; label?: string }) {
  return <div className="suggest-row" role="group" aria-label={`${label} — tap to use`}>
    <span className="suggest-label"><Lightbulb size={12} /> {label}</span>
    {items.map(t => { const text = t.replaceAll('{name}', name || 'you'); return <button type="button" key={t} className="suggest-chip" onClick={() => onPick(text)}>{text}</button> })}
  </div>
}
