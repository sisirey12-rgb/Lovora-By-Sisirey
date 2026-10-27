import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowRight, CalendarClock, Check, Gift, Images, Link2, Play, QrCode, ShieldCheck, Smartphone, Sparkles, Volume2, Wand2, Zap } from 'lucide-react'
import { PRICING } from '../config'
import OccasionCards from './OccasionCards'
import type { Occasion } from '../types'
import { FinalCTA, Rotator } from './LandingFX'
import { useLiveSeason } from '../lib/seasons'

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
    <span className="lp-chip c1">🎉 Opened just now</span><span className="lp-chip c2">💌 A letter is waiting</span>
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

const STEPS: [string, string, string][] = [
  ['01', 'Pick who it is for', 'Choose the occasion and the person. Each one gets its own scenes, colours, sounds and entrance.'],
  ['02', 'Add your words', 'A name, a few real details, a photo. We write the first draft with you, or you customise every scene yourself.'],
  ['03', 'Preview, then send', 'Watch it for free as many times as you like. When it feels right, unlock one private link.'],
]
const FEATURES: { i: ReactNode; t: string; d: string; w?: boolean }[] = [
  { i: <Sparkles size={22} />, t: 'Nine cinematic entrances', d: 'Fireworks, galaxy, falling petals, butterflies. Every person starts with a fitting one, and you can change it.', w: true },
  { i: <Gift size={22} />, t: 'Cakes and bouquets', d: 'Twenty-three cakes and sixteen hand-tied bouquets, built live on screen.' },
  { i: <Volume2 size={22} />, t: 'A warm read-aloud voice', d: 'Your letter, read gently to them.' },
  { i: <Wand2 size={22} />, t: 'Written with you, not for you', d: 'Share a few real details and get a draft that sounds like you.' },
  { i: <Images size={22} />, t: 'Polaroid gallery', d: 'Photos hang on a string and sway.' },
  { i: <CalendarClock size={22} />, t: 'Reveal on the right day', d: 'Lock the link until midnight on the big day.' },
  { i: <QrCode size={22} />, t: 'Story card and QR gift card', d: 'Share the moment, or print a card that opens the surprise.', w: true },
]
const PROOF = [{ n: '4', l: 'occasions' }, { n: '6', l: 'people, each with their own world' }, { n: '9', l: 'cinematic entrances' }, { n: '1', l: 'link, no app to install' }]
const FAQ: [string, string][] = [
  ['Do they need to install an app?', 'No. They open the link in any phone browser and the surprise starts.'],
  ['Is previewing really free?', 'Yes. Build it and watch it as many times as you like. You only pay when you want the share link.'],
  ['Who can see my surprise?', 'Only people who have your link. It stays private until you share it.'],
  ['Can I add my own photos, voice and video?', 'Yes. Add photos for the polaroid gallery, a voice note and your own video.'],
  ['Can the reveal wait for the right day?', 'Yes. Pick a reveal date and the link unlocks at midnight on that day.'],
]

export default function LandingPro({ onStart }: { onStart: (o: Occasion) => void }) {
  const onCreate = toStart
  const live = useLiveSeason()
  const season = live
  useEffect(() => {
    const old = document.title, meta = document.querySelector<HTMLMetaElement>('meta[name="description"]'), oldMeta = meta?.content
    if (season) { document.title = `${season.label} surprise: make an interactive gift | Lovora Meow`; if (meta) meta.content = season.meta }
    return () => { document.title = old; if (meta && oldMeta !== undefined) meta.content = oldMeta }
  }, [season])
  return <div className="lp lx">
    <section className="lx-hero">
      <div className="lx-aura" aria-hidden="true" />
      <div className="lx-copy">
        <span className="lx-badge">{season ? <span aria-hidden="true">{season.emoji}</span> : <Sparkles size={14} />} {season ? season.pill : 'Interactive surprises, made in minutes'}</span>
        <h1>{season ? <>{season.h1a} <em>{season.h1b}</em></> : <>Send a feeling,<br /><em>not just a link.</em></>}</h1>
        <p className="lx-lede">{season ? season.lede : 'Turn a birthday, an anniversary or a few kind words into a small interactive world. They open one link and the surprise begins.'}</p>
        <p className="lx-for">For your <Rotator words={season?.rot} /></p>
        <div className="lx-cta"><button className="primary-btn big-btn" onClick={onCreate}>Create a surprise <ArrowRight size={18} /></button><button className="lx-ghost" onClick={() => document.getElementById('lp-how')?.scrollIntoView({ behavior: 'smooth' })}><Play size={15} /> See how it works</button></div>
        <ul className="lx-trust"><li><Smartphone size={15} /> No app needed</li><li><ShieldCheck size={15} /> Private link</li><li><Zap size={15} /> Free to preview</li></ul>
      </div>
      <HeroPhone />
    </section>

    <section className="lx-proof" aria-label="At a glance">{PROOF.map(p => <div key={p.l}><b>{p.n}</b><span>{p.l}</span></div>)}</section>

    <OccasionCards onStart={onStart} />

    <section id="lp-how" className="lx-sec">
      <header className="lx-head"><p className="lp-kicker">HOW IT WORKS</p><h2>From idea to <em>goosebumps</em> in three steps.</h2></header>
      <ol className="lx-steps">{STEPS.map(([n, t, d]) => <li key={n}><span className="lx-n">{n}</span><h3>{t}</h3><p>{d}</p></li>)}</ol>
    </section>

    <section className="lx-sec">
      <header className="lx-head"><p className="lp-kicker">INSIDE EVERY SURPRISE</p><h2>Small details that make it <em>feel real.</em></h2></header>
      <div className="lx-feat">{FEATURES.map(f => <article key={f.t} className={f.w ? 'wide' : ''}><span className="lx-ico">{f.i}</span><h3>{f.t}</h3><p>{f.d}</p></article>)}</div>
    </section>

    <section className="lx-sec lx-split">
      <div>
        <header className="lx-head"><p className="lp-kicker">SIMPLE PRICING</p><h2>Preview free. <em>Pay only to share.</em></h2></header>
        <div className="lx-price"><div className="lx-amt"><b>₹{PRICING.amount}</b><span>per surprise, one time</span></div>
          <ul><li><Check size={16} /> Your own private share link</li><li><Check size={16} /> Every scene, entrance, cake and bouquet</li><li><Check size={16} /> Photos, voice note and video</li><li><Check size={16} /> Story card and printable QR card</li><li><Check size={16} /> Preview as many times as you like, free</li></ul>
          <button className="primary-btn big-btn" onClick={onCreate}>Start for free <ArrowRight size={18} /></button><small><Link2 size={12} /> Launch price, for a limited time</small></div>
      </div>
      <div>
        <header className="lx-head"><p className="lp-kicker">GOOD TO KNOW</p><h2>Questions, <em>answered.</em></h2></header>
        <div className="lx-faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </div>
    </section>
    <FinalCTA onCreate={onCreate} />
  </div>
}
