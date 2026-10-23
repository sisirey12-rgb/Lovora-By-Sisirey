import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Trash2 } from 'lucide-react'

const MAX_SECONDS = 45
/** Creator tool: record a short voice note (kept inside the surprise as a small data URL). */
export default function VoiceRecorder({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  const [rec, setRec] = useState(false), [secs, setSecs] = useState(0), [err, setErr] = useState('')
  const mr = useRef<MediaRecorder | null>(null), chunks = useRef<Blob[]>([]), timer = useRef(0), stream = useRef<MediaStream | null>(null)
  useEffect(() => () => { window.clearInterval(timer.current); stream.current?.getTracks().forEach(t => t.stop()) }, [])
  const stop = () => { try { mr.current?.state === 'recording' && mr.current.stop() } catch { /* already stopped */ } }
  const start = async () => {
    setErr('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setErr('Recording is not supported in this browser.'); return }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true }); stream.current = s
      const r = new MediaRecorder(s); mr.current = r; chunks.current = []
      r.ondataavailable = e => { if (e.data.size) chunks.current.push(e.data) }
      r.onstop = () => {
        window.clearInterval(timer.current); setRec(false); s.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunks.current, { type: r.mimeType || 'audio/webm' })
        if (!blob.size) return
        const fr = new FileReader(); fr.onload = () => onChange(String(fr.result)); fr.readAsDataURL(blob)
      }
      r.start(); setRec(true); setSecs(0)
      timer.current = window.setInterval(() => setSecs(n => { if (n + 1 >= MAX_SECONDS) stop(); return n + 1 }), 1000)
    } catch { setErr('Microphone access was blocked. Allow it in your browser settings and try again.') }
  }
  return <div className="note-card extras-card"><strong>🎙️ Voice note</strong>
    <p className="muted">Record up to {MAX_SECONDS} seconds. It plays in the letter scene, so they can hear your voice.</p>
    {value && !rec && <audio controls src={value} style={{ width: '100%' }} />}
    <div className="extras-row">
      {!rec ? <button type="button" className="secondary-btn" onClick={start}><Mic size={15} /> {value ? 'Record again' : 'Record'}</button>
        : <button type="button" className="primary-btn" onClick={stop}><Square size={14} /> Stop · {secs}s</button>}
      {value && !rec && <button type="button" className="secondary-btn" onClick={() => onChange(undefined)}><Trash2 size={15} /> Remove</button>}
    </div>
    {err && <p className="error-text" role="alert">{err}</p>}
  </div>
}
