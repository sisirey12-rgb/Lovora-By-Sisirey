import { useMemo, type CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import FullScreenFX from './FullScreenFX'

/** The big-words moment after the bow (editable text): letters drop in one by one, then wave; confetti falls and balloons rise over the full screen. */
export default function BirthdayIntro({ text, subtitle, colors, onNext }: { text: string; subtitle: string; colors: string[]; onNext: () => void }) {
  const confetti = useMemo(() => Array.from({ length: 46 }, (_, i) => ({ left: (i * 29) % 100, delay: (i % 12) * .1, dur: 3 + (i % 5) * .5, rot: (i * 67) % 360, c: colors[i % colors.length] || '#ff8fc2', w: 6 + (i % 3) * 3 })), [colors])
  let n = 0
  return <div className="scene-content bi">
    <FullScreenFX>
      <div className="bi-confetti" style={{ position: 'absolute', inset: 0 }}>{confetti.map((p, i) => <i key={i} style={{ left: `${p.left}%`, width: p.w, height: p.w * 1.6, background: p.c, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, ['--r' as string]: `${p.rot}deg` } as CSSProperties} />)}</div>
      <div className="bi-balloons" style={{ position: 'absolute', inset: 0 }}>{[0, 1, 2, 3, 4, 5].map(i => <span key={i} style={{ left: `${4 + i * 18}%`, background: colors[i % colors.length] || '#ff8fc2', animationDelay: `${i * .6}s` } as CSSProperties} />)}</div>
    </FullScreenFX>
    <span className="scene-emoji bi-star">✦</span>
    <p className="eyebrow">A MOMENT MADE WITH LOVE</p>
    <h1 className="bi-title" aria-label={text}>{text.split(' ').map((w, wi) => <span className="bi-word" key={wi} aria-hidden="true">{[...w].map((ch, ci) => { const i = n++; return <span key={ci} className="bi-ch" style={{ ['--i' as string]: i } as CSSProperties}>{ch}</span> })}</span>)}</h1>
    <p className="scene-copy bi-sub">{subtitle}</p>
    <button className="primary-btn bi-cta" onClick={onNext}>Open your surprise <ArrowRight size={17} /></button>
  </div>
}
