// Vercel function for /s/:id. Social apps read this HTML (they do not run the React app),
// so we fill in a personal title/description for each published surprise.
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const origin = `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`
  const requested = String(req.query.id || '')
  let id = requested
  if (!/^[0-9a-f-]{36}$/i.test(requested)) {
    const alias = await (async () => { try { return await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/custom_links?slug=eq.${encodeURIComponent(requested.toLowerCase())}&select=experience_id`, { headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || '', Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}` } }).then(r => r.json()) } catch { return [] } })()
    if (alias?.[0]?.experience_id) id = String(alias[0].experience_id)
  }
  else {
    // The custom link replaces the long default one: once a surprise has a custom keyword, its /s/<id> address stops working.
    const replaced = await (async () => { try { return await fetch(`${process.env.VITE_SUPABASE_URL}/rest/v1/custom_links?experience_id=eq.${encodeURIComponent(requested.toLowerCase())}&select=slug`, { headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || '', Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}` } }).then(r => r.json()) } catch { return [] } })()
    if (Array.isArray(replaced) && replaced[0]?.slug) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-store')
      return res.status(410).send(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>This link has moved</title><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#160e20;color:#f8effa;font-family:system-ui,sans-serif;text-align:center;padding:24px"><div><div style="font-size:44px">💌</div><h1 style="margin:10px 0">This link has been replaced</h1><p style="opacity:.8;max-width:360px;margin:0 auto 18px">The creator gave this surprise a new link. Ask them to send you the new one.</p><a href="/" style="color:#f7a7ca">Go to Lovora Meow</a></div></body>`)
    }
  }
  let html
  try { html = await (await fetch(`${origin}/`)).text() } catch { res.status(500).send('Could not load the app.'); return }

  let found = false
  let title = 'A surprise is waiting for you ✨'
  let desc = 'Lovora Meow by Sisirey: tap to open a little world made just for you.'
  const url = process.env.VITE_SUPABASE_URL, key = process.env.VITE_SUPABASE_ANON_KEY
  if (url && key && /^[A-Za-z0-9_-]{6,64}$/.test(id)) {
    try {
      const r = await fetch(`${url}/rest/v1/published_experiences?id=eq.${encodeURIComponent(id)}&select=payload`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
      const p = (await r.json())?.[0]?.payload
      if (p) {
        found = true
        const to = clip(String(p.recipient || '').trim(), 40), from = clip(String(p.sender || '').trim(), 40)
        const T = { Birthday: n => `A birthday surprise for ${n} 🎂`, Anniversary: n => `An anniversary surprise for ${n} 💞`, 'Love letter': n => `A love letter for ${n} 💌`, 'Special surprise': n => `A special surprise for ${n} ✨` }
        if (to) title = (T[p.occasion] || T['Special surprise'])(to)
        desc = from ? `${from} made you something special. Tap to open it 🎁` : 'Someone made you something special. Tap to open it 🎁'
      }
    } catch { /* fall back to the generic preview */ }
  }
  const img = esc(found ? `${origin}/api/og?id=${encodeURIComponent(id)}` : `${origin}/og-image.png`)
  const t = esc(title), d = esc(desc), u = esc(`${origin}/s/${requested}`)
  html = html
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${t}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${d}"`)
    .replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${t}"`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${d}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
    .replace(/(<meta (?:property="og:image"|name="twitter:image") content=")[^"]*"/g, `$1${img}"`)
    .replace('</head>', `    <meta property="og:url" content="${u}" />\n  </head>`)
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  res.status(200).send(html)
}
