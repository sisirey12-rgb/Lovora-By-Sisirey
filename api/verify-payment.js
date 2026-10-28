import { sb, userFromReq, hmac, safeEqual, markPaid, configured } from './_shared.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (!configured()) return res.status(503).json({ error: 'Payments are not set up yet.' })
  const user = await userFromReq(req)
  if (!user) return res.status(401).json({ error: 'Please sign in again.' })
  const { orderId, paymentId, signature } = req.body || {}
  if (!orderId || !paymentId || !signature) return res.status(400).json({ error: 'Missing payment details.' })
  if (!safeEqual(hmac(process.env.RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`), signature)) return res.status(400).json({ error: 'Payment could not be verified.' })
  const own = await sb(`payments?order_id=eq.${encodeURIComponent(orderId)}&owner_id=eq.${user.id}&select=order_id`)
  if (!own.data?.length) return res.status(404).json({ error: 'Payment not found for this account.' })
  const ok = await markPaid(orderId, paymentId)
  if (!ok) return res.status(500).json({ error: 'Paid, but we could not unlock your surprise. Contact support with your payment id: ' + paymentId })
  res.status(200).json({ paid: true })
}
