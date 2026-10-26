// Optional "studio voice" for Read it to me. Set OPENAI_API_KEY in Vercel to switch it on; without it the app falls back to the phone's own voice.
// Optional: TTS_MODEL (default gpt-4o-mini-tts), TTS_VOICE (default coral), TTS_HOURLY_LIMIT per visitor (default 30).
const hits = new Map()   // per-instance, best effort: ip -> [timestamps]
const cache = new Map()  // text -> mp3 Buffer (small, per-instance)
const clean = (v, n) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, n)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const key = process.env.OPENAI_API_KEY
  if (!key) return res.status(503).json({ error: 'Studio voice is not set up.' })
  const text = clean(req.body?.text, 1200)
  if (text.length < 2) return res.status(400).json({ error: 'Nothing to read.' })
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0].trim(), now = Date.now()
  const recent = (hits.get(ip) || []).filter(t => now - t < 3600e3), limit = Number(process.env.TTS_HOURLY_LIMIT || 30)
  const model = process.env.TTS_MODEL || 'gpt-4o-mini-tts', voice = process.env.TTS_VOICE || 'coral', ck = `${model}|${voice}|${text}`
  let audio = cache.get(ck)
  if (!audio) {
    if (recent.length >= limit) return res.status(429).json({ error: 'Too many requests. The phone voice will be used.' })
    hits.set(ip, [...recent, now])
    try {
      const r = await fetch('https://api.openai.com/v1/audio/speech', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, voice, input: text, response_format: 'mp3', instructions: 'Read this like a caring friend reading a heartfelt letter aloud. Warm, soft and unhurried, natural everyday rhythm, gentle pauses between thoughts, a small smile in the voice. Never theatrical, never robotic.' }) })
      if (!r.ok) { console.error('tts error', r.status, await r.text().catch(() => '')); return res.status(502).json({ error: 'Voice unavailable.' }) }
      audio = Buffer.from(await r.arrayBuffer())
      if (cache.size > 40) cache.delete(cache.keys().next().value)
      cache.set(ck, audio)
    } catch (e) { console.error('tts failed', e); return res.status(502).json({ error: 'Voice unavailable.' }) }
  }
  res.setHeader('Content-Type', 'audio/mpeg'); res.setHeader('Cache-Control', 'private, max-age=3600')
  return res.status(200).send(audio)
}
