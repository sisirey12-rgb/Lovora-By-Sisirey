import { useMemo, type CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'

/** The "Happy Birthday" moment after the bow: letters drop in one by one, then wave; confetti falls and balloons rise. */
export default function BirthdayIntro({ text, subtitle, colors, onNext }: { text: string; subtitle: string; colors: string[]; onNext: () => void }) {
  const confetti = useMemo(() => Array.from({ length: 34 }, (_, i) => ({ left: (i * 29) % 100, delay: (i % 10) * .12, dur: 3 + (i % 5) * .5, rot: (i * 67) % 360, c: colors[i % colors.length] || '#ff8fc2', w: 6 + (i % 3) * 3 })), [colors])
  let n = 0
  return <div className="scene-content bi">
    <div className="bi-confetti" aria-hidden="true">{confetti.map((p, i) => <i key={i} style={{ left: `${p.left}%`, width: p.w, height: p.w * 1.6, background: p.c, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, ['--r' as string]: `${p.rot}deg` } as CSSProperties} />)}</div>
    <div className="bi-balloons" aria-hidden="true">{[0, 1, 2, 3, 4].map(i => <span key={i} style={{ left: `${6 + i * 21}%`, background: colors[i % colors.length] || '#ff8fc2', animationDelay: `${i * .6}s` } as CSSProperties} />)}</div>
    <span className="scene-emoji bi-star">✦</span>
    <p className="eyebrow">A MOMENT MADE WITH LOVE</p>
    <h1 className="bi-title" aria-label={text}>{text.split(' ').map((w, wi) => <span className="bi-word" key={wi} aria-hidden="true">{[...w].map((ch, ci) => { const i = n++; return <span key={ci} className="bi-ch" style={{ ['--i' as string]: i } as CSSProperties}>{ch}</span> })}</span>)}</h1>
    <p className="scene-copy bi-sub">{subtitle}</p>
    <button className="primary-btn bi-cta" onClick={onNext}>Open your surprise <ArrowRight size={17} /></button>
  </div>
}
