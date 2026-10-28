import { priceFor, sb, userFromReq, isUuid, configured, isOwner } from './_shared.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  const user = await userFromReq(req)
  if (!user) return res.status(401).json({ error: 'Please sign in again.' })
  const id = String(req.body?.experienceId || '')
  if (!isUuid(id)) return res.status(400).json({ error: 'Invalid surprise.' })
  const look = await sb(`experiences?id=eq.${id}&owner_id=eq.${user.id}&select=id,paid`)
  if (!look.ok) {
    console.error('experience lookup failed', look.status, look.data)
    const msg = look.status === 401 || look.status === 403 || !process.env.SUPABASE_SERVICE_ROLE_KEY
      ? 'Server setup missing: add SUPABASE_SERVICE_ROLE_KEY in Vercel > Environment Variables and redeploy.'
      : 'Database setup missing: run supabase/migrations/0005_payments.sql in the Supabase SQL editor (the "paid" column is not there yet).'
    return res.status(500).json({ error: msg })
  }
  const row = look.data?.[0]
  if (!row) return res.status(404).json({ error: 'We could not find this surprise on your account yet. Tap Preview once so it is saved, then try again.' })
  if (row.paid) return res.status(200).json({ alreadyPaid: true })
  // Owner bypass: emails in OWNER_EMAILS (comma separated, set in Vercel) never pay. Checked on the server from the signed-in email.
  if (isOwner(user)) {
    let w = await sb(`experiences?id=eq.${id}`, { method: 'PATCH', body: { paid: true, paid_at: new Date().toISOString() } })
    if (!w.ok) w = await sb(`experiences?id=eq.${id}`, { method: 'PATCH', body: { paid: true } })
    if (!w.ok) { console.error('owner bypass failed', w.status, w.data); return res.status(500).json({ error: 'Could not unlock your surprise. Check the server logs.' }) }
    return res.status(200).json({ alreadyPaid: true })
  }
  if (!configured()) return res.status(503).json({ error: 'Payments are not set up yet. Please try again later.' })
  const { amount } = await priceFor(user.id)   // the server decides the price (first purchase vs later ones), never the browser
  const key = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET
  const rz = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64'), 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: amount * 100, currency: 'INR', receipt: `lm_${id}`.slice(0, 40), notes: { experience_id: id, user_id: user.id } }),
  })
  const order = await rz.json()
  if (!rz.ok) { console.error('razorpay order failed', order); return res.status(502).json({ error: 'Could not start the payment. Please try again.' }) }
  const saved = await sb('payments', { method: 'POST', body: { owner_id: user.id, experience_id: id, order_id: order.id, amount } })
  if (!saved.ok) { console.error('payment row failed', saved.data); return res.status(500).json({ error: 'Could not start the payment. Please try again.' }) }
  res.status(200).json({ orderId: order.id, amount: order.amount, currency: 'INR', keyId: key, email: user.email || '' })
}
