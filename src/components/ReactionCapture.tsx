import { useEffect, useRef, useState } from 'react'
import { Video, Download, Share2, X } from 'lucide-react'

/** Optional keepsake: with the viewer's clear permission, records a short selfie reaction they can send back. Nothing is uploaded. */
export default function ReactionCapture({ sender }: { sender?: string }) {
  const [state, setState] = useState<'idle' | 'ask' | 'rec' | 'done' | 'err'>('idle'), [left, setLeft] = useState(10), [blob, setBlob] = useState<Blob | null>(null), [err, setErr] = useState('')
  const vid = useRef<HTMLVideoElement>(null), stream = useRef<MediaStream | null>(null), rec = useRef<MediaRecorder | null>(null)
  useEffect(() => () => { stream.current?.getTracks().forEach(t => t.stop()) }, [])
  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true }); stream.current = s
      setState('rec'); window.setTimeout(() => { if (vid.current) { vid.current.srcObject = s; void vid.current.play() } }, 30)
      const chunks: BlobPart[] = [], mr = new MediaRecorder(s); rec.current = mr
      mr.ondataavailable = e => chunks.push(e.data); mr.onstop = () => { setBlob(new Blob(chunks, { type: mr.mimeType || 'video/webm' })); s.getTracks().forEach(t => t.stop()); setState('done') }
      mr.start(); let n = 10; setLeft(n); const t = window.setInterval(() => { n -= 1; setLeft(n); if (n <= 0) { window.clearInterval(t); if (mr.state !== 'inactive') mr.stop() } }, 1000)
    } catch { setErr('Camera access was not allowed, so nothing was recorded.'); setState('err') }
  }
  const file = () => blob ? new File([blob], 'my-reaction.webm', { type: blob.type }) : null
  const send = async () => { const f = file(); if (f && navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], title: `My reaction${sender ? ' for ' + sender : ''}` }); return } catch { /* cancelled */ } } save() }
  const save = () => { if (!blob) return; const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-reaction.webm'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000) }
  if (state === 'idle') return <button className="secondary-btn" onClick={() => setState('ask')}><Video size={16} /> Record my reaction</button>
  return <div className="react-box">
    <button className="icon-btn react-x" onClick={() => { stream.current?.getTracks().forEach(t => t.stop()); setState('idle'); setBlob(null) }} aria-label="Close"><X size={14} /></button>
    {state === 'ask' && <><strong>Send {sender || 'them'} your reaction?</strong><small>Uses your front camera and mic for 10 seconds. It stays on your phone until you choose to send it.</small><button className="primary-btn" onClick={() => void start()}>Start recording</button></>}
    {state === 'rec' && <><video ref={vid} muted playsInline className="react-vid" /><span className="react-rec">● REC {left}s</span></>}
    {state === 'done' && blob && <><video src={URL.createObjectURL(blob)} controls playsInline className="react-vid" /><div className="occ-actions"><button className="primary-btn" onClick={() => void send()}><Share2 size={15} /> Send it</button><button className="secondary-btn" onClick={save}><Download size={15} /> Save</button></div></>}
    {state === 'err' && <small>{err}</small>}
  </div>
}
