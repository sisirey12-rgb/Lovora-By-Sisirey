import { useState } from 'react'
import { Trash2, Video } from 'lucide-react'

const MAX_MB = 4
/** Creator tool: your own video message, shown in the video scene instead of the cat video. */
export default function VideoPicker({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  const [err, setErr] = useState('')
  const pick = (file?: File) => {
    setErr(''); if (!file) return
    if (!file.type.startsWith('video/')) { setErr('Choose a video file.'); return }
    if (file.size > MAX_MB * 1024 * 1024) { setErr(`Keep it under ${MAX_MB} MB (about 10 to 15 seconds). Trim or compress it first.`); return }
    const fr = new FileReader(); fr.onload = () => onChange(String(fr.result)); fr.readAsDataURL(file)
  }
  return <div className="note-card extras-card"><strong>🎬 Your own video message</strong>
    <p className="muted">Optional. Replaces the cat video. Up to {MAX_MB} MB, portrait looks best.</p>
    {value && <video src={value} controls playsInline style={{ width: '100%', maxHeight: 220, borderRadius: 12, background: '#000' }} />}
    <div className="extras-row">
      <label className="secondary-btn" style={{ cursor: 'pointer' }}><Video size={15} /> {value ? 'Choose another' : 'Choose video'}<input type="file" accept="video/*" hidden onChange={e => { pick(e.target.files?.[0]); e.target.value = '' }} /></label>
      {value && <button type="button" className="secondary-btn" onClick={() => onChange(undefined)}><Trash2 size={15} /> Use the cat video</button>}
    </div>
    {err && <p className="error-text" role="alert">{err}</p>}
  </div>
}
