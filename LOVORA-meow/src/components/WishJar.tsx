import { useEffect, useState } from 'react'
export type Wish = { name: string; text: string }
/** Paper wishes drop one by one into a glass jar; tap to read the next wish. */
export default function WishJar({ wishes, colors }: { wishes: Wish[]; colors: string[] }) {
  const [shown, setShown] = useState(0), [read, setRead] = useState(0)
  useEffect(() => { if (shown >= wishes.length) return; const t = window.setTimeout(() => setShown(s => s + 1), 700); return () => window.clearTimeout(t) }, [shown, wishes.length])
  useEffect(() => { if (wishes.length < 2) return; const t = window.setInterval(() => setRead(r => (r + 1) % wishes.length), 4200); return () => window.clearInterval(t) }, [wishes.length])
  const w = wishes[read]
  return <div className="wishjar">
    <div className="jar" aria-hidden="true"><span className="jar-lid" /><div className="jar-glass">{wishes.slice(0, shown).map((_, i) => <i key={i} className="jar-note" style={{ background: colors[i % colors.length], left: `${10 + (i * 23) % 62}%`, bottom: `${5 + Math.floor(i / 3) * 15}%`, ['--r' as string]: `${(i * 37) % 50 - 25}deg` } as React.CSSProperties} />)}</div></div>
    <button type="button" className="wish-read" onClick={() => setRead(r => (r + 1) % wishes.length)}>{w && <><p key={read}>“{w.text}”</p>{w.name && <small>— {w.name}</small>}</>}<em>{wishes.length > 1 ? 'tap for the next wish' : ''}</em></button>
  </div>
}
