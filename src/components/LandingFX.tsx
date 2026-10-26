import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowRight, Heart } from 'lucide-react'
import { bouquetStyles, cakeStyles, introStyles } from '../data'

const WORDS = ['birthday', 'anniversary', 'love letter', 'best friend', 'mom', 'dad', 'little brother', 'big sister']
/** Cycles through who the surprise could be for, letter by letter. */
export function Rotator({ words = WORDS }: { words?: string[] }) {
  const [i, setI] = useState(0), [n, setN] = useState(0), [del, setDel] = useState(false)
  useEffect(() => {
    const w = words[i % words.length], t = window.setTimeout(() => {
      if (!del && n < w.length) setN(n + 1)
      else if (!del) setDel(true)
      else if (n > 0) setN(n - 1)
      else { setDel(false); setI((i + 1) % words.length) }
    }, !del && n === w.length ? 1300 : del ? 40 : 85)
    return () => window.clearTimeout(t)
  }, [i, n, del, words])
  return <span className="lf-rot-word">{words[i % words.length].slice(0, n)}<i /></span>
}

/** Scroll progress bar, a soft glow that follows the pointer, and reveal-on-scroll for cards and headings. */
export function LandingChrome() {
  const glow = useRef<HTMLDivElement>(null), bar = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const move = (e: PointerEvent) => { if (glow.current) glow.current.style.transform = `translate(${e.clientX - 180}px,${e.clientY - 180}px)` }
    const scroll = () => { const h = document.documentElement; if (bar.current) bar.current.style.transform = `scaleX(${h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)})` }
    window.addEventListener('pointermove', move, { passive: true }); window.addEventListener('scroll', scroll, { passive: true }); scroll()
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('scroll', scroll) }
  }, [])
  return <><div className="lf-progress" ref={bar} aria-hidden="true" /><div className="lf-glow" ref={glow} aria-hidden="true" /></>
}

export function Marquee() {
  const items = ['🎂 BIRTHDAYS', '💞 ANNIVERSARIES', '💌 LOVE LETTERS', '✨ JUST BECAUSE', '🎈 BALLOONS', '🎆 FIREWORKS', '💐 BOUQUETS', '🦋 BUTTERFLIES', '🌌 GALAXY INTROS']
  return <div className="lf-marquee" aria-hidden="true"><div>{[0, 1].map(k => <span key={k}>{items.map(t => <b key={t}>{t}<i>✦</i></b>)}</span>)}</div></div>
}

function Count({ to }: { to: number }) {
  const ref = useRef<HTMLElement>(null), [v, setV] = useState(0)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect()
      const t0 = performance.now(), tick = (t: number) => { const p = Math.min(1, (t - t0) / 1200); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick) }; requestAnimationFrame(tick)
    }, { threshold: .4 }); io.observe(el); return () => io.disconnect()
  }, [to])
  return <strong ref={ref}>{v}</strong>
}
export function Stats() {
  const s = [{ n: 4, l: 'Occasions', e: '🎉' }, { n: 6, l: 'People to surprise', e: '💞' }, { n: introStyles.length, l: 'Intro effects', e: '🎆' }, { n: cakeStyles.length, l: 'Cakes', e: '🎂' }, { n: bouquetStyles.length, l: 'Bouquets', e: '💐' }]
  return <section className="lf-stats" aria-label="What you get">{s.map(x => <div className="lf-stat" key={x.l}><span aria-hidden="true">{x.e}</span><Count to={x.n} /><small>{x.l}</small></div>)}</section>
}

const SHOW_BG: Record<string, string> = { confetti: 'linear-gradient(160deg,#ffb36b,#ff5fa2)', fireworks: 'linear-gradient(160deg,#1b1048,#6a2bd9)', petals: 'linear-gradient(160deg,#ffc2d9,#f06fa4)', butterflies: 'linear-gradient(160deg,#7fd6ff,#7b5cff)', galaxy: 'linear-gradient(160deg,#0a0626,#3b2a8f)', neon: 'linear-gradient(160deg,#12063a,#d63fa8)', hearts: 'linear-gradient(160deg,#ff8fb6,#d6336c)', gold: 'linear-gradient(160deg,#3b2a12,#e5a93a)', aurora: 'linear-gradient(160deg,#061a3a,#18a889)' }
/** Swipeable showcase of every intro effect, each card with its own moving scene. */
export function IntroShowcase() {
  return <section className="lf-show"><div className="section-kicker"><span /> NINE WAYS TO OPEN IT</div><h2>Pick the entrance. <em>Make them gasp.</em></h2>
    <div className="lf-show-row">{introStyles.map((s, i) => <article key={s.id} className="lf-show-card" style={{ background: SHOW_BG[s.id] }}>
      <div className="lf-show-sky" aria-hidden="true">{Array.from({ length: 9 }, (_, k) => <span key={k} style={{ ['--x' as string]: `${(k * 37 + i * 11) % 90 + 4}%`, ['--d' as string]: `${(k % 5) * .6}s`, ['--s' as string]: `${16 + (k % 3) * 8}px` } as CSSProperties}>{s.emoji}</span>)}</div>
      <div className="lf-show-body"><b>{s.title}</b><small>{s.desc}</small></div></article>)}</div></section>
}

export function FinalCTA({ onCreate }: { onCreate: () => void }) {
  return <section className="lf-cta"><div className="lf-cta-rain" aria-hidden="true">{Array.from({ length: 14 }, (_, k) => <span key={k} style={{ left: `${k * 7.3}%`, animationDelay: `${-k * .7}s` }}>{['💖', '✨', '🎈', '🌸'][k % 4]}</span>)}</div>
    <p className="eyebrow">SOMEONE CAME TO MIND, DIDN’T THEY?</p><h2>Give them a moment <em>they’ll replay.</em></h2><p>One link. A whole little world. Ready in a minute.</p>
    <button className="primary-btn big-btn" onClick={onCreate}>Create a surprise <ArrowRight size={18} /></button><small><Heart size={12} fill="currentColor" /> Free to preview, always</small></section>
}
