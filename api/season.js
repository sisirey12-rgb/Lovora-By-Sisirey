import { userFromReq, sb } from './_shared.js'

const SLUGS = ['rakhi', 'diwali', 'eid', 'valentines-day', 'mothers-day', 'fathers-day', 'friendship-day', 'new-year']

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
  const owners = String(process.env.OWNER_EMAILS || '').toLowerCase().split(/[,\s;]+/).filter(Boolean)
  if (!user?.email || !owners.includes(String(user.email).toLowerCase())) return res.status(403).json({ error: 'Only the owner can change the landing season.' })
  const season = String(req.body?.season || '')
  if (season && !SLUGS.includes(season)) return res.status(400).json({ error: 'Unknown season.' })
  const w = await sb('site_settings', { method: 'POST', body: { key: 'season', value: season, updated_at: new Date().toISOString() }, prefer: 'resolution=merge-duplicates,return=minimal' })
  if (!w.ok) { console.error('season save failed', w.status, w.data); return res.status(500).json({ error: 'Could not save. Run supabase/migrations/0006_site_settings.sql in Supabase first.' }) }
  return res.status(200).json({ season })
}
