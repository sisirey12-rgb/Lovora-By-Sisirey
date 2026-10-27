// Helpers shared by the payment functions. Files starting with "_" are not exposed as routes by Vercel.
// Server-only environment variables (Vercel -> Settings -> Environment Variables):
//   SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
//   PRICE_INR (default 149, the launch price) and REGULAR_PRICE_INR (default 299, shown crossed out)
import crypto from 'node:crypto'

export const price = () => ({ amount: Number(process.env.PRICE_INR || 149), regular: Number(process.env.REGULAR_PRICE_INR || 299) })
const SB = () => process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE = () => process.env.SUPABASE_SERVICE_ROLE_KEY
/** Nepal price in NPR. Set PRICE_NPR, or the INR price is converted with NPR_PER_INR (default 1.6). */
export const nprAmount = () => Number(process.env.PRICE_NPR) || Math.max(1, Math.round(price().amount * Number(process.env.NPR_PER_INR || 1.6)))
/** Which payment methods are switched on (by which secrets exist in Vercel). */
export const providers = () => ({
  razorpay: Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
  esewa: Boolean(process.env.ESEWA_SECRET_KEY || process.env.ESEWA_MODE === 'test'),
  khalti: Boolean(process.env.KHALTI_SECRET_KEY),
})
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
  const url = SB(), anon = process.env.VITE_SUPABASE_ANON_KEY
  if (!token || !url || !anon) return null
  try {
    const r = await fetch(`${url}/auth/v1/user`, { headers: { apikey: anon, Authorization: `Bearer ${token}` } })
    return r.ok ? r.json() : null
  } catch (e) { console.error('Supabase auth verification failed', e); return null }
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

/** Owner accounts (comma, space or semicolon separated emails in OWNER_EMAILS). Never pay for share links; see the website settings. */
export const ownerEmails = () => String(process.env.OWNER_EMAILS || process.env.VITE_OWNER_EMAILS || '').toLowerCase().split(/[,\s;]+/).filter(Boolean)
export const isOwner = user => !!user?.email && ownerEmails().includes(String(user.email).trim().toLowerCase())
