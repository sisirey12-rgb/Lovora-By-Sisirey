import { useState } from 'react'
import { Bell, Calendar } from 'lucide-react'
import { sfx } from '../lib/sfx'
import { addReminder } from '../lib/reminder'
import type { Experience } from '../types'

const GUESSES: [string, string][] = [['🎂', 'a cake'], ['💌', 'a letter'], ['📸', 'memories'], ['🎶', 'a song'], ['🤫', 'a secret']]
const REPLIES = ['No spoilers… but you will love it ♡', 'Hmm, you are warm 🔥', 'Ha! Keep guessing 😄', 'Maybe all of them…', 'Shhh, it is a surprise 🤫']
const pad = (n: number) => String(n).padStart(2, '0')

/** What someone sees when they open the link BEFORE the reveal date: a shaking gift, a live countdown, a hint from the sender, and a reminder button. */
export default function Teaser({ experience, themeClass, countdown }: { experience: Experience; themeClass: string; countdown: number }) {
  const [shakes, setShakes] = useState(0), [reply, setReply] = useState('')
  const d = Math.floor(countdown / 86400000), h = Math.floor(countdown / 3600000) % 24, m = Math.floor(countdown / 60000) % 60, s = Math.floor(countdown / 1000) % 60
  const date = experience.targetDate ? new Date(`${experience.targetDate}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) : ''
  const hint = experience.extras?.teaserHint?.trim()
  const who = experience.recipient?.trim()
  const shake = () => { sfx.unlock(); sfx.pop(shakes); setShakes(n => n + 1); try { navigator.vibrate?.([20, 30, 20]) } catch { /* not supported */ } }
  const guess = (i: number) => { sfx.unlock(); sfx.pop(i); setReply(REPLIES[(i + shakes) % REPLIES.length]); setShakes(n => n + 1) }
  const parts: [string, number][] = [['DAYS', d], ['HOURS', h], ['MINUTES', m], ['SECONDS', s]]
  return <div className={`player ${themeClass} countdown-lock tz`} role="dialog" aria-modal="true" aria-label="Surprise countdown">
    <div className="tz-card">
      <div className="tz-sparkles" aria-hidden="true">{Array.from({ length: 10 }, (_, k) => <i key={k} style={{ left: `${(k * 41) % 100}%`, animationDelay: `${(k % 5) * .5}s` }} />)}</div>
      <button type="button" key={shakes} className={`tz-gift ${shakes ? 'shake' : ''}`} onClick={shake} aria-label="Shake the gift"><i className="lid"><b /></i><i className="box"><b /></i><span className="tz-glow" /></button>
      <p className="eyebrow">{who ? `A SURPRISE FOR ${who.toUpperCase()}` : 'A LITTLE WORLD IS WAITING'}</p>
      <h1>Something lovely is<br /><em>almost here.</em></h1>
      {experience.sender && <p className="tz-from">From {experience.sender}</p>}
      <div className="tz-clock" role="timer" aria-live="off">{parts.map(([l, v]) => <div key={l}><strong key={v} className="tick">{pad(v)}</strong><small>{l}</small></div>)}</div>
      {date && <p className="tz-date">Opens {date}, at midnight</p>}
      {(hint || experience.openingInstruction) && <div className="tz-hint"><small>{hint ? `A little hint from ${experience.sender || 'someone who loves you'}` : 'Before you open it'}</small><p>{hint || experience.openingInstruction}</p></div>}
      <div className="tz-guess"><small>Guess what is inside</small><div>{GUESSES.map(([e, t], i) => <button key={t} type="button" onClick={() => guess(i)} aria-label={`Guess ${t}`}>{e}</button>)}</div>{reply && <p key={reply} className="tz-reply">{reply}</p>}</div>
      {experience.targetDate && <button className="primary-btn" onClick={() => addReminder(experience.targetDate!, `🎁 Open your surprise${experience.sender ? ' from ' + experience.sender : ''}`, window.location.href)}><Bell size={16} /> Remind me on the day</button>}
      <small className="tz-note"><Calendar size={12} /> Unlocks at midnight, on your phone’s clock</small>
    </div>
  </div>
}
