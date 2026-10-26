import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowRight, CalendarClock, Check, Gift, Images, Link2, Play, QrCode, ShieldCheck, Smartphone, Sparkles, Volume2, Wand2, Zap } from 'lucide-react'
import { PRICING } from '../config'
import OccasionCards from './OccasionCards'
import { Rotator } from './LandingFX'
import { seasonFromPath, useLiveSeason } from '../lib/seasons'
import type { Occasion, Relation, SceneId } from '../types'
import { flowFor } from '../lib/occasionContent'
import { sceneLabels } from '../data'

const toStart = () => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth', block: 'start' })

/** Fades sections in as they scroll into view. */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = ref.current; if (!root) return
    const els: HTMLElement[] = []; root.querySelectorAll<HTMLElement>('.nl-rv').forEach(e => els.push(e))
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .15 })
    els.forEach(e => io.observe(e)); return () => io.disconnect()
  }, [])
  return ref
}

const REEL = [
  { id: 'gift', label: 'Tap the gift', tag: 'The opening' },
  { id: 'balloons', label: 'Pop a wish balloon', tag: 'Birthday' },
  { id: 'candles', label: 'Blow the candles', tag: 'Birthday' },
  { id: 'petals', label: 'Touch the rose', tag: 'Love letter' },
  { id: 'stars', label: 'Catch a shooting star', tag: 'Special surprise' },
  { id: 'bottle', label: 'Open the bottle', tag: 'Anniversary' },
] as const

function ReelScene({ id }: { id: (typeof REEL)[number]['id'] }) {
  const n = (k: number) => ({ ['--k' as string]: k } as CSSProperties)
  if (id === 'gift') return <div className="rs rs-gift"><i className="rs-glow" /><div className="rs-g"><i className="lid"><b /></i><i className="box"><b /></i></div>{[0, 1, 2, 3, 4, 5, 6].map(k => <u key={k} style={n(k)} />)}</div>
  if (id === 'balloons') return <div className="rs rs-bal">{['#ff5a3c', '#ffb703', '#0fb5a4', '#ff8fa3', '#7b5cff'].map((c, k) => <i key={k} style={{ ...n(k), background: c, left: `${6 + k * 19}%` }} />)}<p className="rs-note">You deserve every good thing ✨</p></div>
  if (id === 'candles') return <div className="rs rs-can"><div className="cake"><i /><i /><i />{[0, 1, 2].map(k => <span key={k} style={n(k)}><em /></span>)}</div><small>make a wish…</small></div>
  if (id === 'petals') return <div className="rs rs-pet"><svg viewBox="0 0 120 150" className="rose" aria-hidden="true"><path d="M60 80 C58 110 62 130 60 148" stroke="#3f8f5a" strokeWidth="5" fill="none" strokeLinecap="round" /><circle cx="60" cy="52" r="34" fill="#ff5a6e" /><path d="M60 24 C84 30 92 56 70 72 C58 80 42 70 44 54 C46 42 60 40 66 50" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="3" strokeLinecap="round" /></svg>{Array.from({ length: 12 }, (_, k) => <u key={k} style={{ ...n(k), left: `${8 + (k * 8) % 84}%` }} />)}</div>
  if (id === 'stars') return <div className="rs rs-star">{Array.from({ length: 18 }, (_, k) => <b key={k} style={{ left: `${(k * 37) % 100}%`, top: `${(k * 23) % 80}%`, animationDelay: `${(k % 5) * .4}s` }} />)}<i className="s1" /><i className="s2" /></div>
  return <div className="rs rs-bot"><span className="sun" /><svg className="bottle" viewBox="0 0 80 150" aria-hidden="true"><rect x="30" y="2" width="20" height="16" rx="3" fill="#c98f5a" /><path d="M32 18h16v22c0 6 16 12 16 34v54c0 10-8 18-18 18H34c-10 0-18-8-18-18V74c0-22 16-28 16-34Z" fill="rgba(200,240,250,.55)" stroke="rgba(255,255,255,.8)" strokeWidth="2.5" /><rect x="30" y="68" width="20" height="62" rx="4" fill="#fff3d6" /></svg><svg className="waves" viewBox="0 0 400 80" preserveAspectRatio="none" aria-hidden="true"><path className="w1" d="M0 30 Q50 6 100 30 T200 30 T300 30 T400 30 V80 H0Z" /><path className="w2" d="M0 44 Q50 22 100 44 T200 44 T300 44 T400 44 V80 H0Z" /></svg></div>
}

function ReelPhone() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = window.setInterval(() => setI(v => (v + 1) % REEL.length), 3800); return () => window.clearInterval(t) }, [])
  const s = REEL[i]
  return <div className="nl-stage">
    <span className="nl-sticker st1">💌 Letter sealed</span><span className="nl-sticker st2">🎂 Candles lit</span><span className="nl-sticker st3">🔗 One link</span>
    <div className="nl-phone" aria-label="A surprise playing on a phone">
      <div className="nl-notch" />
      <div className="nl-dots">{REEL.map((r, k) => <i key={r.id} className={k < i ? 'done' : k === i ? 'now' : ''} />)}</div>
      <div className="nl-screen" key={s.id}><ReelScene id={s.id} /></div>
      <div className="nl-cap"><small>{s.tag}</small><b>{s.label}</b></div>
    </div>
  </div>
}

const SCENE_EMOJI: Partial<Record<SceneId, string>> = { heart: '💘', intro: '🎆', balloons: '🎈', cake: '🎂', candles: '🕯️', spinwheel: '🎡', polaroids: '📸', moments: '✨', wishjar: '🫙', counter: '⏳', starsky: '🌌', timeline: '🧭', vows: '💍', openwhen: '💌', waxseal: '✉️', lanterns: '🏮', memories: '🖼️', mystery: '🎁', scratch: '🎟️', video: '🎬', letter: '📜', finale: '🎉', petalfall: '🌹', shootingstars: '🌠', parcel: '📦', bottle: '🍾', trophy: '🏆', recipe: '🍲', meter: '📊', reasons: '💗' }
const OCCS: { o: Occasion; e: string }[] = [{ o: 'Birthday', e: '🎂' }, { o: 'Anniversary', e: '💞' }, { o: 'Love letter', e: '💌' }, { o: 'Special surprise', e: '✨' }]
const PEOPLE: Relation[] = ['Partner', 'Mom', 'Dad', 'Brother', 'Sister', 'Friend']
const LANG_SAMPLES: { l: string; t: string }[] = [
  { l: 'English', t: 'You make ordinary days feel like a small celebration.' },
  { l: 'Hinglish', t: 'Yaar, tere bina toh meri chai bhi adhoori lagti hai.' },
  { l: 'Roman Nepali', t: 'Timi sanga bitaeko har pal mero lagi khas chha.' },
  { l: 'Nepali', t: 'तिमी साथमा हुँदा हरेक दिन चाड जस्तै लाग्छ।' },
  { l: 'Nepali + English', t: 'Dai, you are the best thing that ever happened to this family, sachchai!' },
]

/** Pick an occasion and a person and watch their own story build up, scene by scene. */
function StoryBuilder({ onStart }: { onStart: (o: Occasion) => void }) {
  const [occ, setOcc] = useState<Occasion>('Birthday'), [rel, setRel] = useState<Relation>('Friend')
  const people = occ === 'Love letter' ? (['Partner'] as Relation[]) : PEOPLE
  const r = occ === 'Love letter' ? 'Partner' : rel
  const flow = flowFor(occ, r).filter(x => x !== 'heart')
  return <section className="nl-sec nl-story">
    <header className="nl-head nl-rv"><p>YOUR STORY, YOUR WAY</p><h2>Every person gets a <em>different</em> surprise.</h2><span>Choose who it is for and see the scenes we line up for them. You can reorder, hide and rewrite every one.</span></header>
    <div className="nl-pickers nl-rv">
      <div className="nl-chips" role="radiogroup" aria-label="Occasion">{OCCS.map(x => <button key={x.o} type="button" role="radio" aria-checked={occ === x.o} className={occ === x.o ? 'on' : ''} onClick={() => setOcc(x.o)}>{x.e} {x.o}</button>)}</div>
      <div className="nl-chips alt" role="radiogroup" aria-label="Person">{people.map(p => <button key={p} type="button" role="radio" aria-checked={r === p} className={r === p ? 'on' : ''} onClick={() => setRel(p)}>{p}</button>)}</div>
    </div>
    <ol className="nl-path nl-rv" key={`${occ}-${r}`}>{flow.map((id, i) => <li key={id + i} style={{ ['--i' as string]: i } as CSSProperties}><span>{SCENE_EMOJI[id] || '✦'}</span><b>{sceneLabels[id]}</b></li>)}</ol>
    <div className="nl-story-cta nl-rv"><button className="nl-btn" onClick={() => onStart(occ)}>Build this {occ.toLowerCase()} surprise <ArrowRight size={18} /></button></div>
  </section>
}

/** Shows the AI writer speaking the languages people actually use. */
function Languages() {
  const [i, setI] = useState(0)
  useEffect(() => { const t = window.setInterval(() => setI(v => (v + 1) % LANG_SAMPLES.length), 3200); return () => window.clearInterval(t) }, [])
  const cur = LANG_SAMPLES[i]
  return <section className="nl-sec nl-lang">
    <div className="nl-lang-card nl-rv">
      <div><p className="nl-k">WRITE IT WITH AI</p><h2>Say it in the <em>language of your heart.</em></h2><p className="nl-lead">Give two or three prompts, pick a language and add the words you love. English, Hinglish, Hindi, Nepali, Roman Nepali, or a mix of both.</p>
        <div className="nl-langchips">{LANG_SAMPLES.map((x, k) => <button key={x.l} type="button" className={k === i ? 'on' : ''} onClick={() => setI(k)}>{x.l}</button>)}</div></div>
      <div className="nl-bubble" key={cur.l}><small>{cur.l}</small><p>{cur.t}</p><i aria-hidden="true">✍️</i></div>
    </div>
  </section>
}

const LIB: { e: string; t: string; d: string; c: string; a: string }[] = [
  { e: '🎈', t: 'Wish tree', d: 'Pop a balloon, read a wish.', c: '#ffb703', a: 'float' },
  { e: '🎂', t: 'Cake and candles', d: 'Build the cake, blow into the mic.', c: '#ff5a3c', a: 'flick' },
  { e: '🌹', t: 'Rose petals', d: 'Touch the rose, petals write a line.', c: '#ff5a6e', a: 'fall' },
  { e: '🌠', t: 'Shooting stars', d: 'Catch the streaks, keep the wishes.', c: '#7b5cff', a: 'streak' },
  { e: '🎁', t: 'Pass the parcel', d: 'Tear a layer, find a note.', c: '#0fb5a4', a: 'wob' },
  { e: '🍾', t: 'Message in a bottle', d: 'Pull the cork, unroll the note.', c: '#2a9cc8', a: 'bob' },
  { e: '✉️', t: 'Wax-seal letter', d: 'Break the seal, read it aloud.', c: '#c2410c', a: 'wob' },
  { e: '🏮', t: 'Sky lanterns', d: 'Release a lantern for each line.', c: '#f59e0b', a: 'float' },
  { e: '🏆', t: 'Award ceremony', d: 'Polish the trophy, hear why they won.', c: '#d4a017', a: 'wob' },
  { e: '🍲', t: 'Recipe for happiness', d: 'Add each ingredient, stir, serve.', c: '#e76f51', a: 'bob' },
  { e: '📊', t: 'Love-o-meter', d: 'Bars rise and go off the charts.', c: '#2a9d8f', a: 'float' },
  { e: '💗', t: 'Reasons card flip', d: 'Flip each heart to read a reason.', c: '#e5446d', a: 'flick' },
]
const STEPS: [string, string, string][] = [
  ['1', 'Pick who it is for', 'Choose the occasion and the person. Each combination gets its own story, scenes and entrance.'],
  ['2', 'Add your words', 'A name, a few real details, a photo. The AI writer drafts it with you, or you edit every scene yourself.'],
  ['3', 'Preview, then send', 'Watch it free as many times as you like. When it feels right, unlock one private link.'],
]
const BITS = [
  { i: <Sparkles size={20} />, t: 'Cinematic entrances' }, { i: <Gift size={20} />, t: '23 cakes, 16 bouquets' }, { i: <Volume2 size={20} />, t: 'Read-aloud voice' },
  { i: <Wand2 size={20} />, t: 'AI-assisted writing' }, { i: <Images size={20} />, t: 'Polaroid gallery' }, { i: <CalendarClock size={20} />, t: 'Reveal on the day' }, { i: <QrCode size={20} />, t: 'QR gift card' },
]
const FAQ: [string, string][] = [
  ['Do they need to install an app?', 'No. They open the link in any phone browser and the surprise starts.'],
  ['Is previewing really free?', 'Yes. Build it and watch it as often as you like. You only pay when you want the share link.'],
  ['Who can see my surprise?', 'Only people who have your link.'],
  ['Can I add my own photos, voice and video?', 'Yes: photos for the gallery, a voice note and your own video.'],
  ['Can the reveal wait for the right day?', 'Yes. Pick a date and the link unlocks at midnight on that day.'],
]

export default function LandingNew({ onStart }: { onStart: (o: Occasion) => void }) {
  const live = useLiveSeason()
  const season = seasonFromPath() ?? live
  const root = useReveal()
  useEffect(() => {
    const old = document.title, meta = document.querySelector<HTMLMetaElement>('meta[name="description"]'), oldMeta = meta?.content
    if (season) { document.title = `${season.label} surprise: make an interactive gift | Lovora Meow`; if (meta) meta.content = season.meta }
    return () => { document.title = old; if (meta && oldMeta !== undefined) meta.content = oldMeta }
  }, [season])
  return <div className="nl" ref={root}>
    <section className="nl-hero">
      <div className="nl-blob b1" aria-hidden="true" /><div className="nl-blob b2" aria-hidden="true" /><div className="nl-confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, k) => <i key={k} style={{ ['--k' as string]: k, left: `${(k * 53) % 100}%` } as CSSProperties} />)}</div>
      <div className="nl-copy">
        <span className="nl-badge">{season ? <span aria-hidden="true">{season.emoji}</span> : <Sparkles size={14} />} {season ? season.pill : 'Interactive surprises in minutes'}</span>
        <h1>{season ? <>{season.h1a} <em>{season.h1b}</em></> : <>Gifts that <em>open</em><br />like a story.</>}</h1>
        <p className="nl-lede">{season ? season.lede : 'Turn a birthday, an anniversary or a few kind words into a tiny interactive world. They open one link, and the surprise begins.'}</p>
        <p className="nl-for">For your <Rotator words={season?.rot} /></p>
        <div className="nl-cta"><button className="nl-btn" onClick={toStart}>Create a surprise <ArrowRight size={18} /></button><button className="nl-btn ghost" onClick={() => document.getElementById('nl-library')?.scrollIntoView({ behavior: 'smooth' })}><Play size={15} /> See the scenes</button></div>
        <ul className="nl-trust"><li><Smartphone size={15} /> No app needed</li><li><ShieldCheck size={15} /> Private link</li><li><Zap size={15} /> Free to preview</li></ul>
      </div>
      <ReelPhone />
    </section>

    <div className="nl-ribbon" aria-hidden="true"><div>{[0, 1].map(k => <span key={k}>{['BIRTHDAYS', 'ANNIVERSARIES', 'LOVE LETTERS', 'JUST BECAUSE', 'BALLOONS', 'ROSE PETALS', 'SHOOTING STARS', 'MESSAGES IN BOTTLES'].map(t => <b key={t}>{t}<i>✦</i></b>)}</span>)}</div></div>

    <div id="templates" className="nl-pick nl-rv"><OccasionCards onStart={onStart} /></div>

    <StoryBuilder onStart={onStart} />

    <section id="nl-library" className="nl-sec">
      <header className="nl-head nl-rv"><p>THE SCENE LIBRARY</p><h2>Every surprise is a little <em>story.</em></h2><span>Each person and occasion gets its own mix of scenes, with its own animation.</span></header>
      <div className="nl-lib nl-rv">{LIB.map((l, k) => <article key={l.t} style={{ ['--c' as string]: l.c, ['--k' as string]: k } as CSSProperties}><span className={`nl-emo ${l.a}`}>{l.e}</span><h3>{l.t}</h3><p>{l.d}</p></article>)}</div>
    </section>

    <Languages />

    <section className="nl-sec nl-how">
      <header className="nl-head nl-rv"><p>HOW IT WORKS</p><h2>From idea to <em>goosebumps</em> in three steps.</h2></header>
      <ol className="nl-steps">{STEPS.map(([n, t, d]) => <li key={n} className="nl-rv"><b>{n}</b><h3>{t}</h3><p>{d}</p></li>)}</ol>
      <ul className="nl-bits nl-rv">{BITS.map(b => <li key={b.t}>{b.i}{b.t}</li>)}</ul>
    </section>

    <section className="nl-sec nl-split">
      <div className="nl-rv">
        <header className="nl-head left"><p>SIMPLE PRICING</p><h2>Preview free. <em>Pay only to share.</em></h2></header>
        <div className="nl-ticket"><div className="nl-amt"><b>₹{PRICING.amount}</b><s>₹{PRICING.regular}</s></div><span>per surprise, one time</span>
          <ul><li><Check size={16} /> Your own private share link</li><li><Check size={16} /> Every scene, entrance, cake and bouquet</li><li><Check size={16} /> Photos, voice note and video</li><li><Check size={16} /> Story card and printable QR card</li><li><Check size={16} /> Unlimited free previews</li></ul>
          <button className="nl-btn" onClick={toStart}>Start for free <ArrowRight size={18} /></button><small><Link2 size={12} /> Launch price, for a limited time</small></div>
      </div>
      <div className="nl-rv">
        <header className="nl-head left"><p>GOOD TO KNOW</p><h2>Questions, <em>answered.</em></h2></header>
        <div className="nl-faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
      </div>
    </section>

    <section className="nl-final nl-rv"><h2>Someone came to mind, <em>didn’t they?</em></h2><p>One link. A whole little world. Ready in a minute.</p><button className="nl-btn light" onClick={toStart}>Create a surprise <ArrowRight size={18} /></button></section>
  </div>
}
