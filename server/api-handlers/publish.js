import { sb, userFromReq, isUuid, isOwner } from '../../api/_shared.js'

/**
 * Creates the public share link. The server (not the browser) decides:
 *  - owner accounts (OWNER_EMAILS) always get the link, free
 *  - everyone else needs a paid surprise
 * It uses the service key, so it works even when the browser-side database guard would refuse.
 * The browser saves the surprise first (private), then calls this.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const user = await userFromReq(req)
  if (!user) return res.status(401).json({ error: 'Please sign in again.' })
  const id = String(req.body?.experienceId || '')
  if (!isUuid(id)) return res.status(400).json({ error: 'Invalid surprise.' })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return res.status(500).json({ error: 'Server setup missing: add SUPABASE_SERVICE_ROLE_KEY in Vercel > Environment Variables, then redeploy.' })
  const look = await sb(`experiences?id=eq.${id}&owner_id=eq.${user.id}&select=id,paid,payload`)
  if (!look.ok) { console.error('publish lookup failed', look.status, look.data); return res.status(500).json({ error: 'Database setup missing: run the SQL files in supabase/migrations (0005_payments.sql adds the paid column).' }) }
  const row = look.data?.[0]
  if (!row) return res.status(404).json({ error: 'We could not find this surprise on your account yet. Open it once and try again.' })
  const owner = isOwner(user)
  if (!owner && !row.paid) return res.status(402).json({ needsPayment: true, error: 'Payment is needed to create the share link.' })
  const now = new Date().toISOString()
  const cl = await sb(`custom_links?experience_id=eq.${id}&select=slug`)
  const slug = cl.ok && cl.data?.[0]?.slug ? String(cl.data[0].slug) : ''
  const payload = { ...(row.payload || {}), published: true, paid: true, updatedAt: now, ...(slug ? { customSlug: slug } : {}) }
  let w = await sb(`experiences?id=eq.${id}&owner_id=eq.${user.id}`, { method: 'PATCH', body: { is_published: true, paid: true, paid_at: now, payload, updated_at: now } })
  if (!w.ok) w = await sb(`experiences?id=eq.${id}&owner_id=eq.${user.id}`, { method: 'PATCH', body: { is_published: true, paid: true, payload, updated_at: now } })
  if (!w.ok) { console.error('publish write failed', w.status, w.data); return res.status(500).json({ error: 'Could not create the link. Check the Vercel function logs for the database message.' }) }
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json({ published: true, owner, slug, url: `/s/${slug || id}` })
}
