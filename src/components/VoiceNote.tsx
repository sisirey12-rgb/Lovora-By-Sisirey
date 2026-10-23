import { useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { audio } from '../lib/audioManager'

/** Play button for the creator's voice note. The soundtrack pauses while it plays and resumes after. */
export default function VoiceNote({ src }: { src: string }) {
  const a = useRef<HTMLAudioElement>(null)
  const [on, setOn] = useState(false)
  const toggle = () => { const el = a.current; if (!el) return; if (el.paused) { audio.pauseForVideo(); void el.play().catch(() => setOn(false)) } else el.pause() }
  return <div className="voice-note">
    <button type="button" className="secondary-btn" onClick={toggle} aria-label={on ? 'Pause voice note' : 'Play voice note'}>{on ? <Pause size={16} /> : <Play size={16} />} {on ? 'Pause' : '🎙️ Hear my voice'}</button>
    <audio ref={a} src={src} onPlay={() => setOn(true)} onPause={() => { setOn(false); audio.resumeAfterVideo() }} onEnded={() => { setOn(false); audio.resumeAfterVideo() }} />
  </div>
}
