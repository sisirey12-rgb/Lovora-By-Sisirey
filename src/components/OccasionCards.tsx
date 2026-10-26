import type { CSSProperties, ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import Floaties, { type FloatKind } from './Floaties'
import type { Occasion } from '../types'

type Card = { occ: Occasion; t: string; d: string; scenes: string[]; c: string; kinds: FloatKind[]; art: ReactNode; people: string }
const CARDS: Card[] = [
  { occ: 'Birthday', t: 'Birthday', d: 'A party in their pocket.', scenes: ['Balloon wishes', 'Cake and candles', 'Wheel of wishes', 'Polaroids'], c: 'o1', kinds: ['balloon', 'confetti', 'star'], people: 'Brother, sister, partner, mom, dad, friend',
    art: <svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="108" rx="42" ry="6" fill="rgba(0,0,0,.22)" /><rect x="22" y="70" width="76" height="34" rx="9" fill="#fff3e4" /><rect x="22" y="70" width="76" height="9" rx="4" fill="#ffb3cf" /><rect x="34" y="46" width="52" height="28" rx="8" fill="#fff" /><rect x="34" y="46" width="52" height="8" rx="4" fill="#ff8fc2" />{[46, 60, 74].map((x, i) => <g key={x}><rect x={x - 2.5} y="28" width="5" height="19" rx="2.5" fill={['#7fd6ff', '#ffd36e', '#b79bff'][i]} /><ellipse className="flm" cx={x} cy="23" rx="4" ry="6.5" fill="#ffb347" style={{ animationDelay: `${i * .12}s` }} /></g>)}</svg> },
  { occ: 'Anniversary', t: 'Anniversary', d: 'Your story, under the stars.', scenes: ['Our counter', 'Star constellation', 'Typed vows', 'Open-when notes'], c: 'o2', kinds: ['heart', 'sparkle', 'moon'], people: 'Partner, mom and dad, friends',
    art: <svg viewBox="0 0 120 120" aria-hidden="true">{[[24, 20], [96, 30], [100, 88], [18, 92], [60, 12]].map(([x, y], i) => <path key={i} className="tw" style={{ animationDelay: `${i * .4}s` }} d={`M${x} ${y - 6}l1.8 4.2 4.2 1.8-4.2 1.8L${x} ${y + 6}l-1.8-4.2-4.2-1.8 4.2-1.8z`} fill="#ffe08a" />)}<path className="hb" d="M60 96C26 72 22 46 40 38c9-4 17 0 20 8 3-8 11-12 20-8 18 8 14 34-20 58z" fill="#ff6fa3" /><path d="M46 46c4-5 10-4 12 1" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".6" /></svg> },
  { occ: 'Love letter', t: 'Love letter', d: 'Words first, always.', scenes: ['Wax-seal letter', 'Sky lanterns', 'Open-when notes', 'Read aloud'], c: 'o3', kinds: ['heart', 'flower', 'leaf'], people: 'Partner',
    art: <svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="106" rx="40" ry="6" fill="rgba(0,0,0,.2)" /><rect x="18" y="38" width="84" height="60" rx="8" fill="#fff6ea" /><rect className="sheet" x="30" y="26" width="60" height="50" rx="4" fill="#fff" /><path d="M18 42l42 30 42-30" stroke="#e9cfa6" strokeWidth="3" fill="none" /><path d="M18 98l34-30M102 98L68 68" stroke="#ecd5b0" strokeWidth="3" /><circle cx="60" cy="72" r="11" fill="#d92f4f" /><path d="M60 78c-6-4-8-8-5-11 2-2 4-1 5 1 1-2 3-3 5-1 3 3 1 7-5 11z" fill="#ffd0d8" /></svg> },
  { occ: 'Special surprise', t: 'Special surprise', d: 'Just because they exist.', scenes: ['Mystery boxes', 'Scratch card', 'Fortune cookie', 'Balloons'], c: 'o4', kinds: ['sparkle', 'star', 'bolt'], people: 'Anyone you like',
    art: <svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="108" rx="38" ry="6" fill="rgba(0,0,0,.22)" /><rect x="26" y="62" width="68" height="44" rx="8" fill="#7aa2ff" /><rect x="54" y="62" width="12" height="44" fill="#ffe08a" /><g className="lid"><rect x="20" y="46" width="80" height="20" rx="7" fill="#9bb8ff" /><rect x="54" y="46" width="12" height="20" fill="#ffe08a" /><path d="M60 46c-14-14-26-6-18 2zM60 46c14-14 26-6 18 2z" fill="#ffe08a" /></g>{[[24, 30], [98, 26], [104, 70]].map(([x, y], i) => <path key={i} className="tw" style={{ animationDelay: `${i * .5}s` }} d={`M${x} ${y - 7}l2 5 5 2-5 2-2 5-2-5-5-2 5-2z`} fill="#fff" />)}</svg> },
]
const tilt = (e: React.PointerEvent<HTMLButtonElement>) => { const r = e.currentTarget.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; e.currentTarget.style.setProperty('--rx', `${-y * 7}deg`); e.currentTarget.style.setProperty('--ry', `${x * 9}deg`); e.currentTarget.style.setProperty('--mx', `${(x + .5) * 100}%`); e.currentTarget.style.setProperty('--my', `${(y + .5) * 100}%`) }
const untilt = (e: React.PointerEvent<HTMLButtonElement>) => { e.currentTarget.style.setProperty('--rx', '0deg'); e.currentTarget.style.setProperty('--ry', '0deg') }

/** The main way into the app: tap an occasion, then type a name and pick who it is for. */
export default function OccasionCards({ onStart }: { onStart: (o: Occasion) => void }) {
  return <section id="start" className="lp-sec oc-sec"><p className="lp-kicker">START HERE</p><h2>What are we <em>celebrating?</em></h2>
    <p className="oc-lead">Tap an occasion, type their name and who they are to you. We pick the template and set everything up.</p>
    <div className="oc-grid">{CARDS.map((c, i) => <button key={c.t} className={`oc-card ${c.c}`} onClick={() => onStart(c.occ)} onPointerMove={tilt} onPointerLeave={untilt} style={{ ['--i' as string]: i } as CSSProperties}>
      <Floaties kinds={c.kinds} colors={['#ffffff', '#ffe9a8', '#ffd1e6']} count={7} size={[10, 20]} className="oc-fl" />
      <span className="oc-art">{c.art}</span>
      <span className="oc-num">0{i + 1}</span>
      <h3>{c.t}</h3><p>{c.d}</p>
      <ul>{c.scenes.map(s => <li key={s}>{s}</li>)}</ul>
      <small className="oc-who">For: {c.people}</small>
      <span className="oc-go">Start this one <b><ArrowRight size={16} /></b></span>
    </button>)}</div></section>
}
