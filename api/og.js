// Vercel Node function (not Edge: the Edge bundler rejects the @vercel/og import): draws a personal 1200x630 preview picture for a published surprise.
// Used as og:image by api/share.js, so links shared on WhatsApp / Instagram / Telegram show the person's name.
import { ImageResponse } from '@vercel/og'

const THEMES = {
 "Rose Romance": [
  "#ff9db7",
  "#5e285e"
 ],
 "Midnight Galaxy": [
  "#131b51",
  "#a35cff"
 ],
 "Peach Dream": [
  "#ffd0b5",
  "#f37f9c"
 ],
 "Golden Celebration": [
  "#482a63",
  "#e6b85e"
 ],
 "Lavender Night": [
  "#bba7ff",
  "#38225f"
 ],
 "Sakura Garden": [
  "#ffd0e3",
  "#b54d87"
 ],
 "Ocean Hearts": [
  "#8fe4e8",
  "#245d91"
 ],
 "Pastel Wonderland": [
  "#ffe2f2",
  "#b8d8ff"
 ],
 "Neon Fantasy": [
  "#18122f",
  "#ff4fc8"
 ],
 "Meow Magic": [
  "#f4a5d7",
  "#a68bff"
 ],
 "Sunset Glow": [
  "#ff9a5c",
  "#c2307a"
 ],
 "Emerald Garden": [
  "#7be0a8",
  "#1c5c4a"
 ],
 "Cotton Candy": [
  "#ffc2e8",
  "#a8d8ff"
 ],
 "Royal Velvet": [
  "#7b2cbf",
  "#240046"
 ],
 "Aurora Sky": [
  "#5ef2c8",
  "#4a5bd6"
 ],
 "Mocha Cream": [
  "#e8c9a8",
  "#7a4a38"
 ]
};
const el = (style, children) => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } })
const txt = (style, s) => el(style, s)
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

export default async function handler(req, res) {
  const id = String((req.query && req.query.id) || new URL(req.url, 'http://x').searchParams.get('id') || '')
  let to = '', from = '', theme = 'Meow Magic'
  const url = process.env.VITE_SUPABASE_URL, key = process.env.VITE_SUPABASE_ANON_KEY
  if (url && key && /^[A-Za-z0-9_-]{6,64}$/.test(id)) {
    try {
      const r = await fetch(`${url}/rest/v1/published_experiences?id=eq.${encodeURIComponent(id)}&select=payload`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
      const p = (await r.json())?.[0]?.payload
      if (p) { to = clip(String(p.recipient || '').trim(), 24); from = clip(String(p.sender || '').trim(), 28); if (THEMES[p.theme]) theme = p.theme }
    } catch { /* generic picture */ }
  }
  const [c1, c2] = THEMES[theme] || ['#f4a5d7', '#a68bff']
  const size = to.length > 16 ? 84 : to.length > 10 ? 112 : 140
  const balloon = (left, top, w, h, a, b) => el({ position: 'absolute', left, top, width: w, height: h, borderRadius: '50%', background: `linear-gradient(135deg, ${a}, ${b})`, opacity: 0.85 }, '')
  const image = el({ width: '100%', height: '100%', position: 'relative', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, #1a0c35 0%, ${c2} 55%, ${c1} 120%)`, color: '#fff', fontFamily: 'sans-serif' }, [
    balloon(70, 60, 110, 140, '#ffd36e', '#ff8fc2'), balloon(210, 250, 80, 100, '#ffffff', c1), balloon(1010, 70, 120, 150, c1, '#ffffff'), balloon(930, 330, 90, 112, '#ffd36e', c2), balloon(1090, 380, 70, 88, '#ff8fc2', c1),
    el({ width: 120, height: 120, borderRadius: '50%', background: '#3a1a55', border: '5px solid #ff8fc2', position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 26 }, [
      el({ position: 'absolute', top: -16, left: 14, width: 34, height: 34, background: '#ff8fc2', transform: 'rotate(45deg)' }, ''),
      el({ position: 'absolute', top: -16, right: 14, width: 34, height: 34, background: '#ff8fc2', transform: 'rotate(45deg)' }, ''),
      el({ width: 76, height: 56, borderRadius: '50%', background: '#ffd36e' }, ''),
    ]),
    txt({ fontSize: 40, letterSpacing: 8, color: '#ffd36e' }, to ? 'HAPPY BIRTHDAY' : 'A BIRTHDAY SURPRISE'),
    txt({ fontSize: size, fontWeight: 800, lineHeight: 1.05, marginTop: 6, textAlign: 'center' }, to || 'is waiting for you'),
    txt({ fontSize: 36, marginTop: 22, color: '#ffd9ea' }, from ? `from ${from}` : 'open your surprise'),
    txt({ position: 'absolute', bottom: 30, fontSize: 30, color: '#ff8fc2' }, 'Lovora Meow by Sisirey'),
  ])
  try {
    const out = new ImageResponse(image, { width: 1200, height: 630 })
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
