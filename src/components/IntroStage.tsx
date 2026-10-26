import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import FullScreenFX from './FullScreenFX'
import IntroFX, { type IntroStyle } from './IntroFX'
import { Shape, type FloatKind } from './Floaties'
import { sfx } from '../lib/sfx'

const ORBIT: FloatKind[] = ['star', 'sparkle', 'heart', 'sparkle', 'star', 'flower', 'sparkle', 'heart']
/** The second moment: a curtain of light parts, the title rises word by word out of a mask, a shine sweeps across it, an underline draws itself, shapes orbit, and only then does the button appear. */
export default function IntroStage({ text, subtitle, colors, style = 'confetti', onNext }: { text: string; subtitle: string; colors: string[]; style?: IntroStyle; onNext: () => void }) {
  const words = useMemo(() => text.split(/\s+/).filter(Boolean), [text])
  const longest = useMemo(() => Math.max(4, ...words.map(w => [...w].length)), [words])
  const fs = `min(68px, calc((100vw - 56px) / ${(longest * .64).toFixed(2)}))`
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const a = window.setTimeout(() => { sfx.whoosh() }, 450), b = window.setTimeout(() => { sfx.chime(); setReady(true) }, 2900)
    return () => { window.clearTimeout(a); window.clearTimeout(b) }
  }, [])
  const c0 = colors[0] || '#ff8fc2', c1 = colors[1] || '#ffd36e'
  return <div className={`scene-content is is-${style}`} style={{ ['--is-fs' as string]: fs, ['--is-a' as string]: c0, ['--is-b' as string]: c1 } as CSSProperties}>
    <FullScreenFX><div className={`bi-bg bi-bg-${style}`} /><IntroFX style={style} colors={colors} /></FullScreenFX>
    <FullScreenFX><div className="is-curtain" aria-hidden="true"><i /><i /></div><div className="is-beam" aria-hidden="true" /></FullScreenFX>
    <div className="is-orbit" aria-hidden="true">{ORBIT.map((k, i) => <i key={i} style={{ ['--i' as string]: i } as CSSProperties}><Shape kind={k} color={colors[i % colors.length] || c0} size={i % 2 ? 14 : 20} /></i>)}</div>
    <p className="is-eyebrow">A MOMENT MADE WITH LOVE</p>
    <h1 className="is-title" aria-label={text}>{words.map((w, i) => <span className="is-line" key={i} aria-hidden="true"><span className="is-word" style={{ ['--i' as string]: i } as CSSProperties}>{w}</span></span>)}</h1>
    <svg className="is-rule" viewBox="0 0 200 14" aria-hidden="true"><path d="M4 8 C 40 1, 70 14, 100 7 S 160 2, 196 8" /></svg>
    <p className="is-sub">{subtitle}</p>
    <button className={`primary-btn is-cta ${ready ? 'on' : ''}`} onClick={onNext} disabled={!ready} tabIndex={ready ? 0 : -1}>Open your surprise <ArrowRight size={17} /></button>
  </div>
}
