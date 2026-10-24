// Helpers shared by the payment functions. Files starting with "_" are not exposed as routes by Vercel.
// Server-only environment variables (Vercel -> Settings -> Environment Variables):
//   SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
//   PRICE_INR (default 99, the launch price) and REGULAR_PRICE_INR (default 149, shown crossed out)
import crypto from 'node:crypto'

export const price = () => ({ amount: Number(process.env.PRICE_INR || 99), regular: Number(process.env.REGULAR_PRICE_INR || 149) })
const SB = () => process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE = () => process.env.SUPABASE_SERVICE_ROLE_KEY
export const configured = () => Boolean(SB() && SERVICE() && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)

export async function sb(path, { method = 'GET', body, prefer } = {}) {
  const r = await fetch(`${SB()}/rest/v1/${path}`, { method, headers: { apikey: SERVICE(), Authorization: `Bearer ${SERVICE()}`, 'Content-Type': 'application/json', ...(prefer ? { Prefer: prefer } : {}) }, body: body ? JSON.stringify(body) : undefined })
  const text = await r.text()
  let data = null; try { data = text ? JSON.parse(text) : null } catch { /* not json */ }
  return { ok: r.ok, status: r.status, data }
}
/** Checks the creator's Supabase access token and returns the user, or null. */
export async function userFromReq(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer /i, '')
  if (!token) return null
  const r = await fetch(`${SB()}/auth/v1/user`, { headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` } })
  return r.ok ? r.json() : null
}
export const isUuid = s => /^[0-9a-f-]{36}$/i.test(String(s || ''))
export const hmac = (secret, data) => crypto.createHmac('sha256', secret).update(data).digest('hex')
export const safeEqual = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y) }
/** Marks the payment and the surprise as paid (service role, so the database guard allows it). */
export async function markPaid(orderId, paymentId) {
  const p = await sb(`payments?order_id=eq.${encodeURIComponent(orderId)}&select=experience_id`)
  const expId = p.data?.[0]?.experience_id
  if (!expId) return false
  const now = new Date().toISOString()
  await sb(`payments?order_id=eq.${encodeURIComponent(orderId)}`, { method: 'PATCH', body: { status: 'paid', payment_id: paymentId, paid_at: now } })
  const e = await sb(`experiences?id=eq.${expId}`, { method: 'PATCH', body: { paid: true, paid_at: now } })
  return e.ok
}
