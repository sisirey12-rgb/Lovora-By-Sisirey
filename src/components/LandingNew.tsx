import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowRight, CalendarClock, Check, Gift, Images, Link2, Play, QrCode, ShieldCheck, Smartphone, Sparkles, Volume2, Wand2, Zap } from 'lucide-react'
import { PRICING } from '../config'
import { getPrice } from '../services/payments'
import { Rotator } from './LandingFX'
import { SEASONS, seasonFromPath, useLiveSeason } from '../lib/seasons'
import { SEASON_THEME } from '../lib/seasonTheme'
import SeasonFX from './SeasonFX'
import type { Occasion, Relation, SceneId } from '../types'
import { flowFor } from '../lib/occasionContent'
import { sceneLabels } from '../data'
import { DEFAULT_SCENE_STUDIO, fetchSceneStudio, type SceneStudioConfig } from '../lib/sceneStudio'

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

function ReelPhone({ stickers }: { stickers?: [string, string, string] }) {
  const [i, setI] = useState(0)
  useEffect(() => { const t = window.setInterval(() => setI(v => (v + 1) % REEL.length), 3800); return () => window.clearInterval(t) }, [])
  const s = REEL[i]
  return <div className="nl-stage">
    <span className="nl-sticker st1">{stickers?.[0] ?? '💌 Letter sealed'}</span><span className="nl-sticker st2">{stickers?.[1] ?? '🎂 Candles lit'}</span><span className="nl-sticker st3">{stickers?.[2] ?? '🔗 One link'}</span>
    <div className="nl-phone" aria-label="A surprise playing on a phone">
      <div className="nl-notch" />
      <div className="nl-dots">{REEL.map((r, k) => <i key={r.id} className={k < i ? 'done' : k === i ? 'now' : ''} />)}</div>
      <div className="nl-screen" key={s.id}><ReelScene id={s.id} /></div>
      <div className="nl-cap"><small>{s.tag}</small><b>{s.label}</b></div>
    </div>
  </div>
}

const SCENE_EMOJI: Partial<Record<SceneId, string>> = { heart: '💘', intro: '🎆', balloons: '🎈', cake: '🎂', candles: '🕯️', spinwheel: '🎡', polaroids: '📸', moments: '✨', wishjar: '🫙', counter: '⏳', starsky: '🌌', timeline: '🧭', vows: '💍', openwhen: '💌', waxseal: '✉️', lanterns: '🏮', memories: '🖼️', mystery: '🎁', scratch: '🎟️', video: '🎬', letter: '📜', finale: '🎉', petalfall: '🌹', shootingstars: '🌠', parcel: '📦', bottle: '🍾', trophy: '🏆', recipe: '🍲', meter: '📊', reasons: '💗' }
const PEOPLE: Relation[] = ['Partner', 'Mom', 'Dad', 'Brother', 'Sister', 'Friend']
const LANG_SAMPLES: { l: string; t: string }[] = [
  { l: 'English', t: 'You make ordinary days feel like a small celebration.' },
  { l: 'Hinglish', t: 'Yaar, tere bina toh meri chai bhi adhoori lagti hai.' },
  { l: 'Roman Nepali', t: 'Timi sanga bitaeko har pal mero lagi khas chha.' },
  { l: 'Nepali', t: 'तिमी साथमा हुँदा हरेक दिन चाड जस्तै लाग्छ।' },
  { l: 'Nepali + English', t: 'Dai, you are the best thing that ever happened to this family, sachchai!' },
]

const OCC_INFO: Record<Occasion, { e: string; d: string; c: string }> = {
  Birthday: { e: '🎂', d: 'A party in their pocket', c: '#ffb703' }, Anniversary: { e: '💞', d: 'Your story, under the stars', c: '#ff5a6e' },
  'Love letter': { e: '💌', d: 'Words first, always', c: '#7b5cff' }, 'Special surprise': { e: '✨', d: 'Just because they exist', c: '#0fb5a4' },
}
const PERSON_E: Record<Relation, string> = { Partner: '💞', Mom: '🌸', Dad: '🧢', Brother: '🎮', Sister: '🎀', Friend: '🤝' }

/** The ONE place to start: pick the occasion, pick the person, see their story, begin. */
function Creator({ onStart, startOcc = 'Birthday', startRel = 'Friend', seasonSlug }: { onStart: (o: Occasion, r?: Relation, seasonSlug?: string) => void; startOcc?: Occasion; startRel?: Relation; seasonSlug?: string }) {
  const [occ, setOcc] = useState<Occasion>(startOcc), [rel, setRel] = useState<Relation>(startRel)
  useEffect(() => { setOcc(startOcc); setRel(startRel) }, [startOcc, startRel])
  const seasonalPeople: Record<string, Relation[]> = { rakhi: ['Brother', 'Sister'], 'valentines-day': ['Partner'], 'mothers-day': ['Mom'], 'fathers-day': ['Dad'], 'friendship-day': ['Friend'], diwali: ['Mom', 'Dad', 'Brother', 'Sister', 'Partner', 'Friend'], eid: ['Mom', 'Dad', 'Brother', 'Sister', 'Partner', 'Friend'], holi: ['Friend', 'Brother', 'Sister', 'Partner'], dashain: ['Mom', 'Dad', 'Brother', 'Sister'], tihar: ['Brother', 'Sister', 'Mom', 'Dad', 'Friend'], christmas: ['Mom', 'Dad', 'Brother', 'Sister', 'Partner', 'Friend'], 'new-year': PEOPLE }
  const people = occ === 'Love letter' ? (['Partner'] as Relation[]) : (seasonalPeople[seasonSlug || ''] || PEOPLE)
  const r: Relation = occ === 'Love letter' ? 'Partner' : (people.includes(rel) ? rel : people[0] || 'Friend')
  const flow = flowFor(occ, r).filter(x => x !== 'heart')
  const info = OCC_INFO[occ]
  return <section id="templates" className="nl-sec nl-make" style={{ ['--oc' as string]: info.c } as CSSProperties}>
    <header className="nl-head nl-rv"><p>START HERE</p><h2>Make one for <em>someone you love.</em></h2><span>Two taps and we line up the right scenes for them.</span></header>
    <div className="nl-card nl-rv">
      <div className="nl-step"><b>1</b><span>What are we celebrating?</span></div>
      <div className="nl-occs" role="radiogroup" aria-label="Occasion">{(Object.keys(OCC_INFO) as Occasion[]).map(o => <button key={o} type="button" role="radio" aria-checked={occ === o} className={occ === o ? 'on' : ''} style={{ ['--c' as string]: OCC_INFO[o].c } as CSSProperties} onClick={() => setOcc(o)}><span className="e">{OCC_INFO[o].e}</span><b>{o}</b><small>{OCC_INFO[o].d}</small></button>)}</div>
      <div className="nl-step"><b>2</b><span>Who is it for?</span></div>
      <div className="nl-people" role="radiogroup" aria-label="Person">{people.map(p => <button key={p} type="button" role="radio" aria-checked={r === p} className={r === p ? 'on' : ''} onClick={() => setRel(p)}><span>{PERSON_E[p]}</span>{seasonSlug === 'rakhi' && p === 'Brother' ? 'Brother · Bhai' : seasonSlug === 'rakhi' && p === 'Sister' ? 'Sister · Behna' : p}</button>)}</div>
      <div className="nl-step"><b>3</b><span>Their story, {flow.length} scenes</span></div>
      <ol className="nl-path" key={`${occ}-${r}`}>{flow.map((id, i) => <li key={id + i} style={{ ['--i' as string]: i } as CSSProperties}><span>{SCENE_EMOJI[id] || '✦'}</span><b>{sceneLabels[id]}</b></li>)}</ol>
      <button className="nl-btn nl-go" onClick={() => onStart(occ, r, seasonSlug)}>Start the {occ.toLowerCase()} for your {r.toLowerCase()} <ArrowRight size={18} /></button>
      <small className="nl-fine">Free to preview. You can change every scene, word and photo.</small>
    </div>
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
const FAQ = (first: number, repeat: number): [string, string][] => [
  ['How much does it cost?', `Your first share link (or first gift code) is ₹${first}. Every one after that is ₹${repeat}. Previewing is always free.`],
  ['What is a custom link?', 'For ₹50 you can swap the long link for one people remember, like yoursite.com/s/sita-birthday. It replaces the long link, which stops working once the custom link is active.'],
  ['Do they need to install an app?', 'No. They open the link in any phone browser and the surprise starts.'],
  ['Is previewing really free?', 'Yes. Build it and watch it as often as you like. The surprise and standard share link are covered by the main purchase; a custom keyword link is an optional ₹50 add-on.'],
  ['Who can see my surprise?', 'Only people who have your link.'],
  ['Can I add my own photos, voice and video?', 'Yes: photos for the gallery, a voice note and your own video.'],
  ['Can the reveal wait for the right day?', 'Yes. Pick a date and the link unlocks at midnight on that day. Before it, they see a countdown and a hint from you.'],
  ['How does a gift code work?', 'Buy a gift code and send it to someone. When they are ready to share their surprise, they enter the code on the last step and the link is free.'],
  ['Which payments do you accept?', 'UPI, cards and netbanking (INR), plus eSewa and Khalti (NPR) for Nepal.'],
  ['Can it be written in Nepali or Hinglish?', 'Yes. The AI writer takes one to three prompts and writes in English, Hinglish, Hindi, Nepali, Roman Nepali or a mix.'],
]

export default function LandingNew({ onStart, onGift }: { onStart: (o: Occasion, r?: Relation, seasonSlug?: string) => void; onGift?: () => void }) {
  const live = useLiveSeason()
  const [pr, setPr] = useState({ first: PRICING.first, repeat: PRICING.repeat })
  useEffect(() => { void getPrice().then(p => setPr({ first: p.first ?? p.amount, repeat: p.repeat ?? p.regular })) }, [])
  const [studio, setStudio] = useState<SceneStudioConfig>(DEFAULT_SCENE_STUDIO)
  useEffect(() => { let alive = true; void fetchSceneStudio().then(v => { if (alive) setStudio(v) }); const changed = (e: Event) => { const d = (e as CustomEvent<SceneStudioConfig>).detail; if (d) setStudio({ ...DEFAULT_SCENE_STUDIO, ...d }) }; window.addEventListener('lovora:scene-config', changed); return () => { alive = false; window.removeEventListener('lovora:scene-config', changed) } }, [])
  const season = seasonFromPath() ?? live
  const root = useReveal()
  const theme = season ? SEASON_THEME[season.slug] : undefined
  // the whole page (and the nav) recolours through <html data-season>; it is removed again when the landing page closes
  useEffect(() => { const el = document.documentElement; if (season) el.dataset.season = season.slug; else delete el.dataset.season; el.dataset.lvPreset = studio.preset; el.dataset.lvFx = studio.enabled ? 'on' : 'off'; el.style.setProperty('--lv-fx-intensity', String(studio.intensity / 100)); return () => { delete el.dataset.season; delete el.dataset.lvPreset; delete el.dataset.lvFx; el.style.removeProperty('--lv-fx-intensity') } }, [season, studio])
  useEffect(() => {
    const old = document.title, meta = document.querySelector<HTMLMetaElement>('meta[name="description"]'), oldMeta = meta?.content
    if (season) { document.title = `${season.label} surprise: make an interactive gift | Lovora Meow`; if (meta) meta.content = season.meta }
    return () => { document.title = old; if (meta && oldMeta !== undefined) meta.content = oldMeta }
  }, [season])
  return <div className="nl" ref={root}>
    {theme && studio.enabled && <SeasonFX fx={theme.fx} bits={theme.bits} />}
    {season && theme && <div className="sx-banner" role="note"><span aria-hidden="true">{season.emoji}</span><b>{theme.banner}</b><span className="sx-chips" aria-label="Scenes that suit this season">{theme.scenes.map(id => <span key={id}>{SCENE_EMOJI[id] || '✦'} {sceneLabels[id]}</span>)}</span><button type="button" onClick={toStart}>Start now</button></div>}
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
      <ReelPhone stickers={theme?.stickers} />
    </section>

    <div className="nl-ribbon" aria-hidden="true"><div>{[0, 1].map(k => <span key={k}>{(theme?.ribbon ?? ['BIRTHDAYS', 'ANNIVERSARIES', 'LOVE LETTERS', 'JUST BECAUSE', 'BALLOONS', 'ROSE PETALS', 'SHOOTING STARS', 'MESSAGES IN BOTTLES']).map(t => <b key={t}>{t}<i>✦</i></b>)}</span>)}</div></div>

    <section className="nl-sec nl-season-hub" aria-labelledby="nl-season-title">
      <header className="nl-head nl-rv"><p>MADE FOR THE MOMENT</p><h2 id="nl-season-title">Every season has a <em>story.</em></h2><span>Choose a celebration to find the right mood, message and scenes.</span></header>
      <div className="nl-season-grid nl-rv">{SEASONS.map((item, k) => <a className="nl-season-card" href={`/for/${item.slug}`} key={item.slug} style={{ ['--season-index' as string]: k } as CSSProperties}>
        <span className="nl-season-emoji" aria-hidden="true">{item.emoji}</span><span className="nl-season-copy"><b>{item.label}</b><small>{item.pill}</small></span><ArrowRight size={17} aria-hidden="true" />
      </a>)}</div>
    </section>

    <Creator onStart={onStart} startOcc={theme?.occasion} startRel={theme?.relation} seasonSlug={season?.slug} />

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

    <section id="pricing" className="nl-sec nl-offers">
      <header className="nl-head nl-rv"><p>SIMPLE PRICING</p><h2>Preview free. <em>Pay only to share.</em></h2><span>₹{pr.first} for your first, ₹{pr.repeat} after that. Gift codes work the same way.</span></header>
      <div className="nl-twocards nl-rv">
        <div className="nl-ticket"><p className="nl-k">SHARE YOUR SURPRISE</p><div className="nl-amt"><b>₹{pr.first}</b><s>₹{pr.repeat}</s></div><span>your first share link, then ₹{pr.repeat} each</span>
          <ul><li><Check size={16} /> Your own private share link</li><li><Check size={16} /> Every scene, entrance, cake and bouquet</li><li><Check size={16} /> Photos, voice note and video</li><li><Check size={16} /> Reveal date and countdown teaser</li><li><Check size={16} /> Printable QR card</li></ul>
          <button className="nl-btn" onClick={toStart}>Start for free <ArrowRight size={18} /></button><small><Link2 size={12} /> The first one is at the launch price. UPI, cards, eSewa and Khalti.</small></div>
        <div className="nl-ticket gift"><p className="nl-k">GIFT A SURPRISE</p><div className="nl-amt"><b>₹{pr.first}</b><span className="nl-giftemoji" aria-hidden="true">🎁</span></div><span>your first gift code, then ₹{pr.repeat} each</span>
          <ul><li><Check size={16} /> Send the code on WhatsApp</li><li><Check size={16} /> They enter it when they share, and pay nothing</li><li><Check size={16} /> Works for any occasion and any person</li><li><Check size={16} /> Pay with UPI, cards, eSewa or Khalti</li></ul>
          <button className="nl-btn" onClick={onGift}>Gift a surprise <ArrowRight size={18} /></button><small><Gift size={12} /> Already have a code? Enter it on the last step of your surprise.</small></div>
      </div>
      <header className="nl-head nl-rv nl-faqhead"><p>GOOD TO KNOW</p><h2>Questions, <em>answered.</em></h2></header>
      <div className="nl-faq nl-faq-wide nl-rv">{FAQ(pr.first, pr.repeat).map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
    </section>

    <section className="nl-final nl-rv"><h2>Someone came to mind, <em>didn’t they?</em></h2><p>One link. A whole little world. Ready in a minute.</p><button className="nl-btn light" onClick={toStart}>Create a surprise <ArrowRight size={18} /></button></section>
  </div>
}
