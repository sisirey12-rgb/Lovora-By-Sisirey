import { userFromReq, sb, isOwner } from './_shared.js'

const SCENES = ['heart','intro','cake','balloons','letter','video','memories','timeline','wishjar','counter','moments','wishstar','calendar','snowglobe','postcard','fortune','lyric','invite','candles','openwhen','polaroids','spinwheel','starsky','vows','lanterns','waxseal','mystery','scratch','petalfall','shootingstars','parcel','bottle','trophy','recipe','meter','reasons','finale']
const PRESETS = ['dreamy','cinematic','playful','gentle']
const DEFAULT = { version: 1, enabled: true, preset: 'dreamy', intensity: 70, playerOrderEnabled: false, playerOrder: ['heart','intro','balloons','letter','memories','finale'], updatedAt: null }
function sanitize(v) {
  if (!v || typeof v !== 'object') return DEFAULT
  const order = Array.isArray(v.playerOrder) ? v.playerOrder.filter((x, i, a) => SCENES.includes(x) && a.indexOf(x) === i).slice(0, 18) : DEFAULT.playerOrder
  return { version: 1, enabled: v.enabled !== false, preset: PRESETS.includes(v.preset) ? v.preset : DEFAULT.preset, intensity: Math.max(0, Math.min(100, Number.isFinite(Number(v.intensity)) ? Number(v.intensity) : DEFAULT.intensity)), playerOrderEnabled: v.playerOrderEnabled === true, playerOrder: order.length ? order : DEFAULT.playerOrder, updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : null }
}
export default async function handler(req, res) {
  if (req.method === 'GET') {
    let config = DEFAULT
    try {
      const r = await sb('site_settings?key=eq.scene_config&select=value')
      const raw = r.ok && r.data?.[0]?.value
      if (raw) config = sanitize(typeof raw === 'string' ? JSON.parse(raw) : raw)
    } catch { /* use safe defaults until migration/settings are available */ }
    res.setHeader('Cache-Control', 'public, s-maxage=20, stale-while-revalidate=60')
    return res.status(200).json({ config })
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'GET or POST only' })
  const user = await userFromReq(req)
  if (!isOwner(user)) return res.status(403).json({ error: 'Only the site owner can publish scene and animation settings.' })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY is missing in the server environment.' })
  const config = sanitize({ ...(req.body || {}), updatedAt: new Date().toISOString() })
  const w = await sb('site_settings?on_conflict=key', { method: 'POST', body: { key: 'scene_config', value: JSON.stringify(config), updated_at: config.updatedAt }, prefer: 'resolution=merge-duplicates,return=minimal' })
  if (!w.ok) return res.status(500).json({ error: `Could not publish scene settings (Supabase HTTP ${w.status}). Ensure migration 0006_site_settings.sql has been run.` })
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ config })
}
