import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Heart } from 'lucide-react'
import { sfx } from '../../lib/sfx'

type Stage = 'closed' | 'flap' | 'rise' | 'read'
type Props = { recipient: string; greeting: string; text: string; closing: string; sender: string; buzz: (p: number | number[]) => void; onDone: () => void }

/** Envelope: seal cracks → flap rotates open in 3D → letter slides up out of the pocket → letter unfolds and types itself. */
import ReadAloud from '../ReadAloud'
export default function EnvelopeLetter({ recipient, greeting, text, closing, sender, buzz, onDone }: Props) {
  const [stage, setStage] = useState<Stage>('closed')
  const [typed, setTyped] = useState(0)
  const timers = useRef<number[]>([])
  useEffect(() => () => timers.current.forEach(window.clearTimeout), [])
  const open = () => {
    if (stage !== 'closed') return
    buzz([20, 30]); setStage('flap')
    timers.current.push(window.setTimeout(() => setStage('rise'), 950))
    timers.current.push(window.setTimeout(() => setStage('read'), 2350))
  }
  useEffect(() => {
    if (stage !== 'read') return
    setTyped(0)
    let cursor = 0
    const t = window.setInterval(() => {
      const nextSpace = text.indexOf(' ', cursor)
      cursor = Math.max(cursor + 1, nextSpace < 0 ? text.length : nextSpace + 1)
      setTyped(cursor)
      buzz(14); sfx.tick()   // one soft tap on the phone for every word
      if (cursor >= text.length) window.clearInterval(t)
    }, 230)
    return () => window.clearInterval(t)
  }, [stage, text, buzz])
  const finished = stage === 'read' && typed >= text.length
  const skipScene = () => { timers.current.forEach(window.clearTimeout); timers.current = []; onDone() }
  return <div className={`env-scene stage-${stage}`}>
    {stage !== 'read' && <p className="eyebrow env-eyebrow">A LETTER FOR {recipient || 'YOU'}</p>}
    <div className="env-stage">
      <button type="button" className="env" onClick={open} disabled={stage !== 'closed'} aria-label={stage === 'closed' ? 'Tap to open the envelope' : 'Envelope opening'}>
        <span className="env-back" />
        <span className="env-liner" />
        <span className="env-sheet" aria-hidden="true">
          <b>{greeting}</b><i /><i /><i /><i className="short" />
          <Heart size={14} fill="currentColor" className="env-sheet-heart" />
        </span>
        <span className="env-pocket"><span className="env-fold env-fold-l" /><span className="env-fold env-fold-r" /><span className="env-fold env-fold-b" /></span>
        <span className="env-flap"><span className="env-flap-front" /><span className="env-flap-back" /></span>
        <span className="env-seal"><Heart size={17} fill="currentColor" /></span>
      </button>
      {stage === 'closed' && <p className="env-tap">Tap the seal to open ♡</p>}
    </div>
    {stage === 'read' && <article className="letter-card letter-unfold">
      <span className="letter-flower">✿</span>
      <p className="eyebrow">A LETTER FOR {recipient || 'YOU'}</p>
      <h2>{greeting}</h2>
      <ReadAloud text={`${greeting}. ${text}. ${closing || 'With love'}, ${sender || ''}`} />
      <p className="letter-message">{text.slice(0, typed)}{typed < text.length && <span className="type-caret">▍</span>}</p>
      <p className="letter-closing" style={{ opacity: finished ? 1 : 0 }}>{closing || 'With love,'}<br /><strong>{sender || 'Someone who cares'}</strong></p>
    </article>}
    {stage !== 'closed' && <button type="button" className="primary-btn env-next env-skip-scene" onClick={skipScene}><ArrowRight size={17} /> Skip this scene</button>}
    {stage === 'read' && <button type="button" className="secondary-btn env-next" onClick={() => { setTyped(text.length); }} style={{ opacity: finished ? .7 : 1 }}>{finished ? 'Letter read' : 'Show full letter'} <ArrowRight size={17} /></button>}
  </div>
}
