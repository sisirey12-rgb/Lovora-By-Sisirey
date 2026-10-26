import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowRight, Check, Play, Sparkles } from 'lucide-react'
import { PRICING } from '../config'
import { FinalCTA, Rotator } from './LandingFX'
import { seasonFromPath } from '../lib/seasons'

const SCENES = ['gift', 'balloons', 'cake', 'letter', 'finale'] as const
const CAPTION: Record<(typeof SCENES)[number], string> = { gift: 'Tap the gift', balloons: 'Pop a balloon', cake: 'Make a wish', letter: 'Read the letter', finale: 'The grand finale' }
const toStart = () => document.getElementById('start')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

/** A phone that plays the real flow in miniature: gift, balloons, cake, letter, finale. */
function HeroPhone() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = window.setInterval(() => setI(v => (v + 1) % SCENES.length), 4200); return () => window.clearInterval(t) }, [])
  const id = SCENES[i]
  return <div className="lp-stage">
    <div className="lp-orbit" aria-hidden="true"><i /><i /><i /></div>
    <span className="lp-chip c1">🎉 Opened just now</span><span className="lp-chip c2">💌 A letter is waiting</span><span className="lp-chip c3">🔊 Read aloud</span><span className="lp-chip c4">📸 Story card ready</span>
    <div className="lp-phone" aria-label="Preview of a surprise playing">
      <div className="lp-notch" />
      <div className="lp-bar">{SCENES.map((s, k) => <i key={s} className={k < i ? 'done' : k === i ? 'now' : ''} />)}</div>
      <div className={`lp-screen lp-sc-${id}`} key={id}>
        {id === 'gift' && <div className="m-gift"><i className="m-glow" /><i className="m-lid"><b /></i><i className="m-box"><b /></i></div>}
        {id === 'balloons' && <><div className="m-bals">{['#ff8fc2', '#ffd36e', '#7fd6ff', '#b79bff', '#ff9a62'].map((c, k) => <i key={k} style={{ ['--c' as string]: c, ['--x' as string]: `${8 + k * 18}%`, ['--d' as string]: `${k * .35}s` } as CSSProperties} />)}</div><div className="m-note">You deserve every good thing ✨</div></>}
        {id === 'cake' && <div className="m-cake"><i className="f" /><i className="f" /><i className="f" /><span className="c1" /><span className="c2" /><span className="c3" /></div>}
        {id === 'letter' && <div className="m-env"><i className="m-flap" /><div className="m-sheet"><b>Dear Meme,</b><u /><u /><u className="s" /></div><i className="m-pocket" /></div>}
        {id === 'finale' && <div className="m-fin"><div className="m-burst"><i /><i /><i /><i /><i /><i /></div><h4>Happy<br />Birthday!</h4></div>}
        <p className="m-cap">{CAPTION[id]}</p>
      </div>
      <div className="lp-home" />
    </div>
  </div>
}

const OCC = [
  { e: '🎂', t: 'Birthday', c: 'o1', s: ['Balloon wishes', 'Cake and candles', 'Wheel of wishes', 'Polaroid gallery'], d: 'A party in their pocket.' },
  { e: '💞', t: 'Anniversary', c: 'o2', s: ['Our counter', 'Star constellation', 'Polaroid gallery', 'Typed vows'], d: 'Your story, under the stars.' },
  { e: '💌', t: 'Love letter', c: 'o3', s: ['Wax-seal letter', 'Sky lanterns', 'Read aloud'], d: 'Words first, always.' },
  { e: '✨', t: 'Special surprise', c: 'o4', s: ['Mystery boxes', 'Scratch card', 'Balloons'], d: 'Just because they exist.' },
]
const BENTO: { k: string; t: string; d: string; e: string; w?: boolean }[] = [
  { k: 'b1', t: 'Nine cinematic entrances', d: 'Fireworks, galaxy, falling petals, butterflies. Every person starts with a fitting one, and you can change it.', e: '🎆', w: true },
  { k: 'b2', t: 'Cakes and bouquets', d: 'Twenty-three cakes and sixteen hand-tied bouquets.', e: '🎂' },
  { k: 'b3', t: 'Read-aloud letters', d: 'A soft voice reads your words to them.', e: '🔊' },
  { k: 'b4', t: 'Polaroid gallery', d: 'Photos hang on a string and sway.', e: '📸' },
  { k: 'b5', t: 'Reveal on the right day', d: 'Lock the link until midnight on the big day.', e: '⏳' },
  { k: 'b6', t: 'Story card and QR gift card', d: 'Share the moment, or print a card that opens the surprise.', e: '🎁', w: true },
]
const FAQ: [string, string][] = [
  ['Do they need to install an app?', 'No. They open the link in any phone browser and the surprise starts.'],
  ['Is previewing really free?', 'Yes. Build it and watch it as many times as you like. You only pay when you want the share link.'],
  ['Who can see my surprise?', 'Only people who have your link. It stays private until you share it.'],
  ['Can I add my own photos, voice and video?', 'Yes. Add photos for the polaroid gallery, a voice note and your own video.'],
  ['Can the reveal wait for the right day?', 'Yes. Pick a reveal date and the link unlocks at midnight on that day.'],
]
const Section = ({ id, kicker, title, children }: { id?: string; kicker: string; title: ReactNode; children: ReactNode }) => <section id={id} className="lp-sec"><p className="lp-kicker">{kicker}</p><h2>{title}</h2>{children}</section>

export default function LandingPro({ onCreate, gallery }: { onCreate: () => void; gallery: ReactNode }) {
  const season = seasonFromPath()
  useEffect(() => {
    const old = document.title, meta = document.querySelector<HTMLMetaElement>('meta[name="description"]'), oldMeta = meta?.content
    if (season) { document.title = `${season.label} surprise: make an interactive gift | Lovora Meow`; if (meta) meta.content = season.meta }
    return () => { document.title = old; if (meta && oldMeta !== undefined) meta.content = oldMeta }
  }, [season])
  return <div className="lp">
    <section className="lp-hero">
      <div className="lp-bg" aria-hidden="true"><i /><i /><i /><u /></div>
      <div className="lp-hero-copy">
        <span className="lp-pill">{season ? <span aria-hidden="true">{season.emoji}</span> : <Sparkles size={14} />} {season ? season.pill : 'Nine cinematic entrances, one link'}</span>
        <h1>{season ? <>{season.h1a}<br /><em>{season.h1b}</em></> : <>Send a feeling,<br /><em>not just a link.</em></>}</h1>
        <p className="lp-lede">{season ? season.lede : 'Turn a birthday, an anniversary or a few kind words into a little interactive world. They open one link and the surprise begins.'}</p>
        <p className="lp-for">For your <Rotator words={season?.rot} /></p>
        <div className="lp-cta"><button className="primary-btn big-btn" onClick={onCreate}>Create a surprise <ArrowRight size={18} /></button><button className="lp-ghost" onClick={() => document.getElementById('lp-how')?.scrollIntoView({ behavior: 'smooth' })}><Play size={15} /> See how it feels</button></div>
        <ul className="lp-trust"><li><Check size={14} /> No app needed</li><li><Check size={14} /> Free to preview</li><li><Check size={14} /> Ready in minutes</li></ul>
      </div>
      <HeroPhone />
    </section>

    <Section id="lp-how" kicker="HOW IT WORKS" title={<>From idea to <em>goosebumps</em> in three steps.</>}>
      <ol className="lp-steps">
        {[['1', '🎯', 'Pick who it is for', 'Choose the occasion and the person. Each one gets its own scenes, colours, sounds and entrance.'], ['2', '✍️', 'Add your words', 'Names, a message, wishes and photos. The editor shows exactly what will happen.'], ['3', '🚀', 'Preview, then send', 'Watch it for free. When it feels right, unlock the link and share it.']].map(([n, e, t, d]) => <li key={n}><span className="n">{n}</span><i aria-hidden="true">{e}</i><h3>{t}</h3><p>{d}</p></li>)}
      </ol>
    </Section>

    <Section kicker="FOUR OCCASIONS" title={<>Every occasion is <em>its own experience.</em></>}>
      <div className="lp-occ">{OCC.map(o => <button key={o.t} className={`lp-occ-card ${o.c}`} onClick={toStart}><span className="e">{o.e}</span><h3>{o.t}</h3><p>{o.d}</p><ul>{o.s.map(x => <li key={x}>{x}</li>)}</ul><b>Start this one <ArrowRight size={15} /></b></button>)}</div>
    </Section>

    <Section kicker="INSIDE EVERY SURPRISE" title={<>Small details that make it <em>feel real.</em></>}>
      <div className="lp-bento">{BENTO.map(b => <article key={b.k} className={`lp-tile ${b.k} ${b.w ? 'wide' : ''}`}><span className="e" aria-hidden="true">{b.e}</span><h3>{b.t}</h3><p>{b.d}</p></article>)}</div>
    </Section>

    <div id="start" className="lp-start">{gallery}</div>

    <Section kicker="SIMPLE PRICING" title={<>Preview free. <em>Pay only to share.</em></>}>
      <div className="lp-price"><div className="lp-price-card"><span className="lp-tag">Launch price</span><div className="amt"><b>₹{PRICING.amount}</b><s>₹{PRICING.regular}</s></div><p>per surprise, one time</p>
        <ul><li><Check size={15} /> Your own private share link</li><li><Check size={15} /> Every scene, entrance, cake and bouquet</li><li><Check size={15} /> Photos, voice note and video</li><li><Check size={15} /> Story card and printable QR card</li><li><Check size={15} /> Preview as many times as you like, free</li></ul>
        <button className="primary-btn big-btn" onClick={onCreate}>Start for free <ArrowRight size={18} /></button></div></div>
    </Section>

    <Section kicker="GOOD TO KNOW" title={<>Questions, <em>answered.</em></>}>
      <div className="lp-faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
    </Section>
    <FinalCTA onCreate={onCreate} />
  </div>
}
