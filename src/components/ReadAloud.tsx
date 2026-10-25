import { useEffect, useRef, useState } from 'react'
import { Volume2, Square } from 'lucide-react'

const SOFT = /natural|neural|online|aria|jenny|sonia|libby|samantha|ava|allison|serena|moira|tessa|karen|zira|google uk english female|google us english|female|swara|heera|neerja/i
/** Reads the letter aloud in the softest voice the device has (uses the browser's built-in speech, no data leaves the phone). */
export default function ReadAloud({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false), supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const voices = useRef<SpeechSynthesisVoice[]>([])
  useEffect(() => {
    if (!supported) return
    const load = () => { voices.current = window.speechSynthesis.getVoices() }; load(); window.speechSynthesis.addEventListener?.('voiceschanged', load)
    return () => { window.speechSynthesis.cancel(); window.speechSynthesis.removeEventListener?.('voiceschanged', load) }
  }, [supported])
  if (!supported) return null
  const pick = () => {
    const lang = (navigator.language || 'en-US').toLowerCase(), base = lang.slice(0, 2), hindi = /[\u0900-\u097F]/.test(text)
    const want = hindi ? 'hi' : base, pool = voices.current.filter(v => v.lang.toLowerCase().startsWith(want))
    return pool.find(v => SOFT.test(v.name)) || pool.find(v => /female/i.test(v.name)) || pool[0] || voices.current.find(v => v.lang.toLowerCase().startsWith('en')) || null
  }
  const toggle = () => {
    const s = window.speechSynthesis
    if (playing) { s.cancel(); setPlaying(false); return }
    s.cancel(); const u = new SpeechSynthesisUtterance(text.replace(/\n+/g, '. ')), v = pick()
    if (v) { u.voice = v; u.lang = v.lang }
    u.rate = .9; u.pitch = 1.08; u.volume = 1; u.onend = u.onerror = () => setPlaying(false)
    setPlaying(true); s.speak(u)
  }
  return <button type="button" className={`read-aloud ${playing ? 'on' : ''}`} onClick={toggle} aria-pressed={playing}>{playing ? <><Square size={13} /> Stop reading</> : <><Volume2 size={15} /> Read it to me</>}{playing && <i className="ra-bars"><b /><b /><b /><b /></i>}</button>
}
