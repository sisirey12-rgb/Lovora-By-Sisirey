import { useEffect, useRef, useState } from 'react'
import { Loader2, Square, Volume2 } from 'lucide-react'

/* Voice ranking: neural / natural / premium voices sound human, compact and novelty ones sound like a machine. */
const GOOD = /neural|natural|online|premium|enhanced|siri|studio|wavenet|journey/i
const NAMED = /aria|jenny|sonia|libby|ava\b|allison|serena|moira|tessa|karen|samantha|zira|swara|neerja|heera|kajal|google (uk|us) english|google हिन्दी|google hindi/i
const BAD = /compact|espeak|robot|fred|albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|junior|kathy|organ|princess|ralph|trinoids|whisper|zarvox|superstar|wobble/i
const score = (v: SpeechSynthesisVoice) => (GOOD.test(v.name) ? 6 : 0) + (NAMED.test(v.name) ? 3 : 0) + (v.localService ? 0 : 1) + (/female|woman/i.test(v.name) ? 1 : 0) - (BAD.test(v.name) ? 12 : 0)

/** Makes written text sound spoken: no emoji, ellipses become pauses, line breaks become breaths. */
const spoken = (t: string) => t.replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu, '').replace(/[♡♥❤✦✧✿★☆]/g, '').replace(/\.{2,}|…/g, ', ').replace(/\s*[—–]\s*/g, ', ').replace(/[ \t]+/g, ' ').trim()
type Piece = { text: string; gap: number }
/** Splits into sentences with a pause after each. Paragraph breaks get a longer one. Short pieces also stop the browser cutting long speech off. */
function pieces(raw: string): Piece[] {
  const out: Piece[] = []
  for (const para of spoken(raw).split(/\n+/)) {
    const sentences = para.match(/[^.!?।]+[.!?।]*\s*/g) || [para]
    sentences.map(x => x.trim()).filter(Boolean).forEach((s, i, a) => {
      const chunks = s.length > 170 ? s.split(/(?<=,)\s+/).reduce<string[]>((m, w) => { const l = m[m.length - 1]; if (l && l.length + w.length < 150) m[m.length - 1] = `${l} ${w}`; else m.push(w); return m }, []) : [s]
      chunks.forEach((c, k) => out.push({ text: c, gap: k < chunks.length - 1 ? 120 : i === a.length - 1 ? 520 : 260 }))
    })
  }
  return out
}

let serverOff = false   // set once the optional studio voice is not configured, so we stop asking
/** Reads the letter aloud. Uses the optional studio voice (/api/tts) when the site has one, otherwise the softest voice on the device, with natural pauses. */
export default function ReadAloud({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'playing'>('idle'), supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const voices = useRef<SpeechSynthesisVoice[]>([]), audio = useRef<HTMLAudioElement | null>(null), run = useRef(0), timer = useRef(0), ctl = useRef<AbortController | null>(null)
  const stop = () => { run.current++; window.clearTimeout(timer.current); ctl.current?.abort(); try { window.speechSynthesis?.cancel() } catch { /* none */ } if (audio.current) { audio.current.pause(); audio.current.src = ''; audio.current = null } setState('idle') }
  useEffect(() => {
    if (!supported) return
    const load = () => { voices.current = window.speechSynthesis.getVoices() }; load(); window.speechSynthesis.addEventListener?.('voiceschanged', load)
    return () => { run.current++; window.clearTimeout(timer.current); ctl.current?.abort(); window.speechSynthesis.cancel(); audio.current?.pause(); window.speechSynthesis.removeEventListener?.('voiceschanged', load) }
  }, [supported])
  const pickVoice = () => {
    const hindi = /[\u0900-\u097F]/.test(text), want = hindi ? 'hi' : (navigator.language || 'en-US').toLowerCase().slice(0, 2)
    const best = (list: SpeechSynthesisVoice[]) => [...list].sort((a, b) => score(b) - score(a))[0]
    const same = voices.current.filter(v => v.lang.toLowerCase().startsWith(want))
    return (same.length ? best(same) : best(voices.current.filter(v => v.lang.toLowerCase().startsWith('en')))) || null
  }
  const speak = (list: Piece[]) => {
    const my = ++run.current, v = pickVoice(), s = window.speechSynthesis; s.cancel(); setState('playing')
    const next = (i: number) => {
      if (my !== run.current) return
      if (i >= list.length) { setState('idle'); return }
      const p = list[i], u = new SpeechSynthesisUtterance(p.text), last = i === list.length - 1
      if (v) { u.voice = v; u.lang = v.lang }
      // a little life: questions lift, exclamations warm up, the last line lands softly
      u.rate = last ? .86 : /!\s*$/.test(p.text) ? .95 : .91; u.pitch = /\?\s*$/.test(p.text) ? 1.04 : last ? .96 : 1; u.volume = 1
      u.onend = () => { timer.current = window.setTimeout(() => next(i + 1), p.gap) }
      u.onerror = e => { if ((e as SpeechSynthesisErrorEvent).error === 'interrupted' || (e as SpeechSynthesisErrorEvent).error === 'canceled') return; if (my === run.current) setState('idle') }
      s.speak(u)
    }
    next(0)
  }
  const studio = async (): Promise<boolean> => {
    if (serverOff) return false
    const my = ++run.current; ctl.current = new AbortController(); setState('loading')
    try {
      const r = await fetch('/api/tts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: spoken(text) }), signal: ctl.current.signal })
      if (!r.ok) { if (r.status === 503 || r.status === 404) serverOff = true; return false }
      const url = URL.createObjectURL(await r.blob())
      if (my !== run.current) { URL.revokeObjectURL(url); return true }
      const a = new Audio(url); audio.current = a; a.onended = () => { URL.revokeObjectURL(url); audio.current = null; setState('idle') }; a.onerror = () => { audio.current = null; setState('idle') }
      await a.play(); setState('playing'); return true
    } catch (e) { return (e as Error).name === 'AbortError' }
  }
  if (!supported) return null
  const toggle = async () => {
    if (state !== 'idle') { stop(); return }
    if (await studio()) return
    speak(pieces(text))
  }
  return <button type="button" className={`read-aloud ${state !== 'idle' ? 'on' : ''}`} onClick={() => void toggle()} aria-pressed={state === 'playing'}>
    {state === 'loading' ? <><Loader2 size={14} className="ra-spin" /> Getting the voice ready…</> : state === 'playing' ? <><Square size={13} /> Stop reading</> : <><Volume2 size={15} /> Read it to me</>}{state === 'playing' && <i className="ra-bars"><b /><b /><b /><b /></i>}</button>
}
