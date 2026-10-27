import { userFromReq, sb, isOwner } from './_shared.js'

const SLUGS = ['rakhi', 'diwali', 'eid', 'valentines-day', 'mothers-day', 'fathers-day', 'friendship-day', 'new-year', 'holi', 'dashain', 'tihar', 'christmas']

/** GET: which season the home page should show ('' = normal). POST (owner only): change it with one click. */
export default async function handler(req, res) {
  if (req.method === 'GET') {
    let season = String(process.env.ACTIVE_SEASON || '')
    try { const r = await sb('site_settings?key=eq.season&select=value'); if (r.ok && r.data?.[0]) season = String(r.data[0].value || '') } catch { /* table not created yet: use the env value */ }
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120')
    return res.status(200).json({ season: SLUGS.includes(season) ? season : '' })
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'GET or POST only' })
  const user = await userFromReq(req)
  if (!isOwner(user)) return res.status(403).json({ error: 'Only the owner can change the landing season.' })
  const season = String(req.body?.season || '')
  if (season && !SLUGS.includes(season)) return res.status(400).json({ error: 'Unknown season.' })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is missing in Vercel (Settings → Environment Variables). Add it, then redeploy.' })
  const w = await sb('site_settings?on_conflict=key', { method: 'POST', body: { key: 'season', value: season, updated_at: new Date().toISOString() }, prefer: 'resolution=merge-duplicates,return=minimal' })
  if (!w.ok) {
    console.error('season save failed', w.status, w.data)
    const code = String(w.data?.code || ''), msg = String(w.data?.message || '')
    let hint = `Supabase said: ${msg || `HTTP ${w.status}`}`
    if (code === 'PGRST205' || (w.status === 404 && /schema cache|site_settings/i.test(msg))) hint = 'The table exists but Supabase has not noticed it yet. In the SQL editor run:  notify pgrst, \'reload schema\';  (or re-run supabase/migrations/0006_site_settings.sql), then try again.'
    else if (w.status === 401 || w.status === 403 || code === '42501') hint = 'Supabase refused the write. SUPABASE_SERVICE_ROLE_KEY in Vercel must be the service_role key (not the anon key). Fix it and redeploy.'
    else if (w.status === 404 && !msg) hint = 'Supabase URL looks wrong. Check VITE_SUPABASE_URL in Vercel.'
    else if (code === '42P01') hint = 'The site_settings table is missing. Run supabase/migrations/0006_site_settings.sql in Supabase.'
    return res.status(500).json({ error: hint })
  }
  return res.status(200).json({ season })
}
