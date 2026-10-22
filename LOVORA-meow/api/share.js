// Vercel function for /s/:id. Social apps read this HTML (they do not run the React app),
// so we fill in a personal title/description for each published surprise.
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s)

export default async function handler(req, res) {
  const proto = req.headers['x-forwarded-proto'] || 'https'
  const origin = `${proto}://${req.headers['x-forwarded-host'] || req.headers.host}`
  const id = String(req.query.id || '')
  let html
  try { html = await (await fetch(`${origin}/`)).text() } catch { res.status(500).send('Could not load the app.'); return }

  let title = 'A birthday surprise is waiting for you 🎂'
  let desc = 'Lovora Meow by Sisirey: tap to open a little birthday world made just for you.'
  const url = process.env.VITE_SUPABASE_URL, key = process.env.VITE_SUPABASE_ANON_KEY
  if (url && key && /^[A-Za-z0-9_-]{6,64}$/.test(id)) {
    try {
      const r = await fetch(`${url}/rest/v1/published_experiences?id=eq.${encodeURIComponent(id)}&select=payload`, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
      const p = (await r.json())?.[0]?.payload
      if (p) {
        const to = clip(String(p.recipient || '').trim(), 40), from = clip(String(p.sender || '').trim(), 40)
        if (to) title = `A birthday surprise for ${to} 🎂`
        desc = from ? `${from} made you something special. Tap to open it 🎁` : 'Someone made you something special. Tap to open it 🎁'
      }
    } catch { /* fall back to the generic preview */ }
  }
  const t = esc(title), d = esc(desc), u = esc(`${origin}/s/${id}`)
  html = html
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${t}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${d}"`)
    .replace(/(<meta name="twitter:title" content=")[^"]*"/, `$1${t}"`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${d}"`)
    .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
    .replace(/content="\/og-image\.png"/g, `content="${origin}/og-image.png"`)
    .replace('</head>', `    <meta property="og:url" content="${u}" />\n  </head>`)
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  res.status(200).send(html)
}
