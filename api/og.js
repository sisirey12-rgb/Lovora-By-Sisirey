// Vercel Node function: makes the 1200x630 share preview for a published surprise.
// It loads the template picture (public/og-template.jpg) and writes the recipient's name inside the pink brush banner
// and the sender after "Created by:", in a script font that matches the artwork.
// Used as og:image by api/share.js, so links shared on WhatsApp / Instagram / Telegram show the person's name.
import { ImageResponse } from '@vercel/og'

// ---- EDIT THESE (all numbers are px on the 1200x630 picture) -------------------------------------------------------
// og-template-blank.jpg is the same artwork with the word "Birthday" erased, so the real occasion can be written there.
const TEMPLATES = ['/og-template-blank.jpg', '/og-template.jpg', '/og-template.png', '/og-image.png']
// Font for name + sender. First choice: your own file at public/fonts/name.ttf (TTF/OTF/WOFF, not WOFF2). Else Google "Pacifico".
const FONT_FILES = ['/fonts/name.ttf']
const GOOGLE_FONT = 'Pacifico'
const NAME_COLOR = '#34115a'      // dark purple, like the [ ] brackets
const FROM_COLOR = '#ffe0fa'      // soft pink-white, like the "Created by:" label
const NAME_BOX = { cx: 372, cy: 226, w: 392, maxSize: 78, minSize: 34 }   // inside the [ ] in the pink banner
const FROM_BOX = { cx: 424, cy: 543, w: 186, maxSize: 34, minSize: 18 }   // on the line after "Created by:"
const OCC_COLOR = '#ecd3ff'      // lavender, like the original "Birthday" lettering
const OCC_BOX = { cx: 372, cy: 484, w: 250, maxSize: 62, minSize: 26 }   // the spot after "ON THE OCCASION OF"
const OCCASIONS = { Birthday: 'Birthday', Anniversary: 'Anniversary', 'Love letter': 'Love Letter', 'Special surprise': 'Special Surprise' }
const NAME_MAX_CHARS = 22, FROM_MAX_CHARS = 20
const FALLBACK_NAME = 'Someone special'   // used when the link has no name (e.g. the plain site link)
// ----------------------------------------------------------------------------------------------------------------------

const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s)
const el = (style, children) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } })
const LATIN = /^[\p{Script=Latin}\p{P}\p{S}\p{Z}\p{N}]*$/u   // the script font only has Latin letters; other alphabets use the built-in font

// Per-occasion look: a colour wash and a motif badge. For fully different artwork, add public/og-template-<slug>.jpg
// (birthday, anniversary, love-letter, special-surprise, 1200x630) and it is used automatically for that occasion.
const SLUG = { Birthday: 'birthday', Anniversary: 'anniversary', 'Love letter': 'love-letter', 'Special surprise': 'special-surprise' }
const TINT = { Birthday: null, Anniversary: 'rgba(255,110,150,0.16)', 'Love letter': 'rgba(255,60,110,0.20)', 'Special surprise': 'rgba(255,205,90,0.14)' }
const svg = body => 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="#ffe3fb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`)
const MOTIF = {
  Birthday: svg('<rect x="22" y="50" width="52" height="30" rx="6"/><path d="M22 62h52M48 50V36M48 30c-4-4-2-8 0-10 2 2 4 6 0 10z" />'),
  Anniversary: svg('<circle cx="38" cy="54" r="20"/><circle cx="60" cy="54" r="20"/><path d="M42 24l6-8 6 8-6 6z"/>'),
  'Love letter': svg('<rect x="14" y="26" width="68" height="46" rx="6"/><path d="M14 30l34 24 34-24"/><path d="M48 66c-10-8-12-14-8-18 3-3 7-1 8 2 1-3 5-5 8-2 4 4 2 10-8 18z" stroke-width="3"/>'),
  'Special surprise': svg('<rect x="20" y="42" width="56" height="38" rx="5"/><path d="M20 56h56M48 42v38M48 42c-12-4-16-16-6-18 6 0 6 10 6 18zM48 42c12-4 16-16 6-18-6 0-6 10-6 18z"/>'),
}
const slugCache = {}
let templateCache = null, fontCache = null
async function loadTemplate(origin, occasion) {
  const slug = SLUG[occasion]
  if (slug && slugCache[slug] !== undefined) { if (slugCache[slug]) return slugCache[slug] }
  else if (slug) {
    try {
      const r = await fetch(`${origin}/og-template-${slug}.jpg`, { signal: AbortSignal.timeout(3000) })
      const buf = r.ok ? Buffer.from(await r.arrayBuffer()) : null
      slugCache[slug] = buf && buf[0] === 0xff ? `data:image/jpeg;base64,${buf.toString('base64')}` : ''
      if (slugCache[slug]) return slugCache[slug]
    } catch { slugCache[slug] = '' }
  }
  if (templateCache) return templateCache
  for (const path of TEMPLATES) {
    try {
      const r = await fetch(origin + path, { signal: AbortSignal.timeout(4000) })
      if (!r.ok) continue
      const buf = Buffer.from(await r.arrayBuffer())
      const mime = buf[0] === 0x89 ? 'image/png' : buf[0] === 0xff ? 'image/jpeg' : null
      if (!mime) continue
      return (templateCache = `data:${mime};base64,${buf.toString('base64')}`)
    } catch { /* try the next one */ }
  }
  return null
}
async function loadFont(origin) {
  if (fontCache) return fontCache
  const ok = d => ({ name: 'Script', data: d, weight: 400, style: 'normal' })
  for (const path of FONT_FILES) {
    try { const r = await fetch(origin + path, { signal: AbortSignal.timeout(4000) }); if (r.ok) { const d = await r.arrayBuffer(); if (d.byteLength > 1000 && !(new Uint8Array(d)[0] === 0x3c)) return (fontCache = ok(d)) } } catch { /* next */ }
  }
  try {   // old browser id makes Google return a plain .ttf (satori cannot read woff2)
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${GOOGLE_FONT.replace(/ /g, '+')}`, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.112 Safari/534.30' }, signal: AbortSignal.timeout(4000) })).text()
    const url = css.match(/url\((https:[^)]+)\)/)?.[1]
    if (url) return (fontCache = ok(await (await fetch(url, { signal: AbortSignal.timeout(5000) })).arrayBuffer()))
  } catch { /* use the built-in font */ }
  return null
}
// one-line text sized to fit a box width (script fonts average ~0.52em per character)
const fit = (text, box) => Math.max(box.minSize, Math.min(box.maxSize, Math.floor(box.w / (Math.max(text.length, 1) * 0.52))))
const line = (text, box, color, family, extra = {}) => el({ position: 'absolute', left: box.cx - 300, width: 600, top: box.cy - 60, height: 120, alignItems: 'center', justifyContent: 'center' }, [
  el({ fontSize: fit(text, box), fontFamily: family, color, whiteSpace: 'nowrap', lineHeight: 1.2, ...extra }, text),
])

export default async function handler(req, res) {
  const id = String((req.query && req.query.id) || new URL(req.url, 'http://x').searchParams.get('id') || '')
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const origin = `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`
  let to = '', from = '', occasion = 'Special surprise'
  const url = process.env.VITE_SUPABASE_URL, key = process.env.VITE_SUPABASE_ANON_KEY
  const dataP = (async () => {
    if (!(url && key && /^[A-Za-z0-9_-]{6,64}$/.test(id))) return
    try {
      const r = await fetch(`${url}/rest/v1/published_experiences?id=eq.${encodeURIComponent(id)}&select=payload`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
      const p = (await r.json())?.[0]?.payload
      if (p) { occasion = OCCASIONS[p.occasion] ? p.occasion : 'Special surprise'; to = clip(String(p.recipient || '').trim(), NAME_MAX_CHARS); from = clip(String(p.sender || '').trim(), FROM_MAX_CHARS) }
    } catch { /* generic picture */ }
  })()
  const [tpl, font] = await Promise.all([dataP.then(() => loadTemplate(origin, occasion)), loadFont(origin), dataP])
  const name = to || FALLBACK_NAME
  const useScript = font && LATIN.test(name + from)
  const family = useScript ? 'Script' : 'sans-serif'
  const bold = useScript ? {} : { fontWeight: 700 }

  const children = []
  if (tpl) children.push({ type: 'img', props: { src: tpl, width: 1200, height: 630, style: { position: 'absolute', left: 0, top: 0, width: 1200, height: 630 } } })
  if (TINT[occasion]) children.push(el({ position: 'absolute', left: 0, top: 0, width: 1200, height: 630, background: TINT[occasion] }, []))
  children.push({ type: 'img', props: { src: MOTIF[occasion], width: 76, height: 76, style: { position: 'absolute', left: 330, top: 22, width: 76, height: 76, opacity: 0.9 } } })
  children.push(line(name, NAME_BOX, NAME_COLOR, family, { ...bold, textShadow: '0 1px 0 rgba(255,255,255,.55)' }))
  children.push(line(OCCASIONS[occasion], OCC_BOX, OCC_COLOR, family, { ...bold, textShadow: '0 0 14px rgba(190,120,255,.55)' }))
  if (from) children.push(line(from, FROM_BOX, FROM_COLOR, family, { ...bold, textShadow: '0 2px 8px rgba(40,0,70,.6)' }))
  const image = el({ width: '100%', height: '100%', position: 'relative', background: 'linear-gradient(135deg,#1a0c35,#5e285e)' }, children)

  try {
    const out = new ImageResponse(image, { width: 1200, height: 630, ...(useScript ? { fonts: [font] } : {}) })
    const png = Buffer.from(await out.arrayBuffer())
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800')
    res.status(200).send(png)
  } catch (e) {
    console.error('og image failed', e)
    res.setHeader('Cache-Control', 'public, s-maxage=60')
    res.redirect(302, '/og-image.png') // never leave the share preview empty
  }
}
