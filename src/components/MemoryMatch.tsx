import { useEffect, useMemo, useRef, useState } from 'react'
import { Cat } from 'lucide-react'
import type { MemoryItem } from '../types'

type Card = { id: number; key: string; src?: string; emoji?: string; caption: string }
const EMOJI = ['🎂', '🎈', '💌', '🐱', '🎁', '🌸'], EMOJI_CAP = ['Sweet cake', 'Party balloons', 'Love letters', 'Birthday cat', 'Gifts for you', 'Fresh flowers']

/** Flip-card pairs game built from the surprise photos (emoji pairs if fewer than 2 photos). */
export default function MemoryMatch({ memories, buzz }: { memories: MemoryItem[]; buzz: (p: number | number[]) => void }) {
  const cards = useMemo<Card[]>(() => {
    const photos = memories.filter(m => m.kind !== 'video').slice(0, 6)
    const base = photos.length >= 2 ? photos.map(m => ({ key: m.id, src: m.src, caption: m.caption })) : EMOJI.map((e, i) => ({ key: `e${i}`, emoji: e, caption: EMOJI_CAP[i] }))
    const arr: Card[] = [...base, ...base].map((c, i) => ({ ...c, id: i }))
    let s = 11
    return arr.map(a => ({ a, r: (s = (s * 1103515245 + 12345) & 0x7fffffff) })).sort((x, y) => x.r - y.r).map(x => x.a)
  }, [memories])
  const [flipped, setFlipped] = useState<number[]>([]), [matched, setMatched] = useState<string[]>([])
  const [moves, setMoves] = useState(0), [note, setNote] = useState(''), [lock, setLock] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const done = matched.length === cards.length / 2
  const flip = (c: Card) => {
    if (lock || flipped.includes(c.id) || matched.includes(c.key)) return
    const f = [...flipped, c.id]; setFlipped(f); buzz(8)
    if (f.length < 2) return
    setMoves(m => m + 1)
    const [a, b] = f.map(id => cards.find(x => x.id === id)!)
    if (a.key === b.key) { setMatched(m => [...m, a.key]); setNote(a.caption || 'A match!'); buzz([20, 30, 20]); setFlipped([]) }
    else { setLock(true); timer.current = window.setTimeout(() => { setFlipped([]); setLock(false) }, 850) }
  }
  return <div className="mm">
    <p className="mm-status" role="status">{done ? `All matched in ${moves} moves 🎉` : note ? `♡ ${note}` : 'Flip two cards to find a pair'}</p>
    <div className="mm-grid">{cards.map(c => {
      const open = flipped.includes(c.id) || matched.includes(c.key)
      return <button type="button" key={c.id} className={`mm-card ${open ? 'open' : ''} ${matched.includes(c.key) ? 'matched' : ''}`} onClick={() => flip(c)} aria-label={open ? c.caption || 'Memory' : 'Hidden card'}>
        <span className="mm-face mm-front"><Cat size={26} /></span>
        <span className="mm-face mm-back">{c.src ? <img src={c.src} alt={c.caption} loading="lazy" /> : <b>{c.emoji}</b>}</span>
      </button>
    })}</div>
  </div>
}
