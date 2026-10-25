import { useMemo, type CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import FullScreenFX from './FullScreenFX'
import IntroFX, { type IntroStyle } from './IntroFX'

/** The big-words moment after the opening: letters drop in one by one, over a full-screen heavy effect that depends on the chosen intro style. */
export default function BirthdayIntro({ text, subtitle, colors, style = 'confetti', onNext }: { text: string; subtitle: string; colors: string[]; style?: IntroStyle; onNext: () => void }) {
  const longest = useMemo(() => Math.max(4, ...text.split(/\s+/).map(w => [...w].length)), [text])
  // font size is derived from the longest word so the title can never be wider than the screen
  const fs = `min(64px, calc((100vw - 64px) / ${(longest * .66).toFixed(2)}))`
  let n = 0
  return <div className={`scene-content bi bi-${style}`} style={{ ['--bi-fs' as string]: fs } as CSSProperties}>
    <FullScreenFX><div className={`bi-bg bi-bg-${style}`} /><IntroFX style={style} colors={colors} /></FullScreenFX>
    <span className="scene-emoji bi-star">✦</span>
    <p className="eyebrow">A MOMENT MADE WITH LOVE</p>
    <h1 className="bi-title" aria-label={text}>{text.split(' ').map((w, wi) => <span className="bi-word" key={wi} aria-hidden="true">{[...w].map((ch, ci) => { const i = n++; return <span key={ci} className="bi-ch" style={{ ['--i' as string]: i } as CSSProperties}>{ch}</span> })}</span>)}</h1>
    <p className="scene-copy bi-sub">{subtitle}</p>
    <button className="primary-btn bi-cta" onClick={onNext}>Open your surprise <ArrowRight size={17} /></button>
  </div>
}
