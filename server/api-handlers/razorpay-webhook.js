// Backup path: if the buyer closes the app right after paying, Razorpay still tells us and we unlock the surprise.
// In Razorpay Dashboard -> Webhooks: URL https://YOUR-SITE/api/razorpay-webhook, event "payment.captured" (and "order.paid"), secret = RAZORPAY_WEBHOOK_SECRET.
import { hmac, safeEqual, markPaid } from '../../api/_shared.js'
export const config = { api: { bodyParser: false } }

const raw = req => new Promise((ok, bad) => { const c = []; req.on('data', d => c.push(d)); req.on('end', () => ok(Buffer.concat(c).toString('utf8'))); req.on('error', bad) })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  const body = await raw(req)
  if (!secret || !safeEqual(hmac(secret, body), String(req.headers['x-razorpay-signature'] || ''))) return res.status(400).json({ error: 'bad signature' })
  let evt; try { evt = JSON.parse(body) } catch { return res.status(400).end() }
  const pay = evt?.payload?.payment?.entity
  if ((evt.event === 'payment.captured' || evt.event === 'order.paid') && (pay?.order_id || evt?.payload?.order?.entity?.id)) {
    await markPaid(pay?.order_id || evt.payload.order.entity.id, pay?.id || '')
  }
  res.status(200).json({ ok: true })
}
