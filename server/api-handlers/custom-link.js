import crypto from 'node:crypto'
import { sb, userFromReq, isUuid, hmac, safeEqual, isOwner } from '../../api/_shared.js'
const PRICE_PAISE = 5000
const reserved = new Set(['api','create','for','wish','dashboard','account','admin','s','pricing','help','support','lovora','meow'])
const bad = (res, status, error) => res.status(status).json({ error })
const validSlug = s => /^[a-z0-9][a-z0-9-]{2,23}$/.test(s) && !reserved.has(s)
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'GET') {
    const slug = String(req.query?.slug || '').toLowerCase()
    if (!validSlug(slug)) return bad(res, 400, 'Invalid custom link keyword.')
    const r = await sb(`custom_links?slug=eq.${encodeURIComponent(slug)}&select=experience_id`)
    if (!r.ok || !r.data?.[0]) return bad(res, 404, 'This custom link was not found.')
    return res.status(200).json({ experienceId: r.data[0].experience_id })
  }
  if (req.method !== 'POST') return bad(res, 405, 'POST only')
  const user = await userFromReq(req)
  if (!user) return bad(res, 401, 'Please sign in again.')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return bad(res, 500, 'Server setup is incomplete.')
  const b = req.body || {}, action = String(b.action || '')
  if (action === 'create-order') {
    const slug = String(b.slug || '').trim().toLowerCase(), expId = String(b.experienceId || '')
    if (!validSlug(slug)) return bad(res, 400, 'Use 3–24 lowercase letters, numbers or hyphens; choose a different keyword.')
    if (!isUuid(expId)) return bad(res, 400, 'Invalid surprise.')
    const owned = await sb(`experiences?id=eq.${expId}&owner_id=eq.${user.id}&select=id,paid,is_published`)
    if (!owned.ok || !owned.data?.[0]) return bad(res, 404, 'We could not find your saved surprise.')
    const owner = isOwner(user)
    if (!owner && !owned.data[0].paid && !owned.data[0].is_published) return bad(res, 402, 'Purchase the main surprise first; the custom keyword is an optional ₹50 add-on.')
    const already = await sb(`custom_links?experience_id=eq.${expId}&select=slug`)
    if (already.data?.length) return bad(res, 409, `This surprise already has its custom link (${already.data[0].slug}).`)
    const exists = await sb(`custom_links?slug=eq.${encodeURIComponent(slug)}&select=slug`)
    if (exists.data?.length) return bad(res, 409, 'That keyword is already taken. Try one of the suggestions.')
    if (owner) {
      const inserted = await sb('custom_links', { method: 'POST', body: { slug, experience_id: expId, owner_id: user.id, payment_id: `owner-${crypto.randomUUID()}` } })
      if (!inserted.ok) return bad(res, 500, 'Could not activate the custom link. Ensure migration 0008_custom_links.sql has been run.')
      const cur = await sb(`experiences?id=eq.${expId}&owner_id=eq.${user.id}&select=payload`)
      if (cur.ok && cur.data?.[0]) await sb(`experiences?id=eq.${expId}&owner_id=eq.${user.id}`, { method: 'PATCH', body: { payload: { ...(cur.data[0].payload || {}), customSlug: slug } } })
      return res.status(200).json({ ownerBypass: true, slug, url: `/s/${slug}` })
    }
    const key = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET
    if (!key || !secret) return bad(res, 503, 'Custom keyword checkout is not configured yet.')
    const orderRes = await fetch('https://api.razorpay.com/v1/orders', { method:'POST', headers:{ Authorization:'Basic '+Buffer.from(`${key}:${secret}`).toString('base64'), 'Content-Type':'application/json' }, body:JSON.stringify({ amount:PRICE_PAISE, currency:'INR', receipt:`slug_${Date.now()}`, notes:{ kind:'custom_link', slug, experience_id:expId, user_id:user.id } }) })
    const order = await orderRes.json().catch(()=>({}))
    if (!orderRes.ok || !order.id) return bad(res, 502, 'Could not start the ₹50 payment. Please try again.')
    const saved = await sb('custom_link_orders', { method:'POST', body:{ id:order.id, owner_id:user.id, experience_id:expId, slug, amount:PRICE_PAISE } })
    if (!saved.ok) return bad(res, 500, 'Could not save the custom link order. Run migration 0008_custom_links.sql.')
    return res.status(200).json({ orderId:order.id, amount:PRICE_PAISE, currency:'INR', keyId:key, email:user.email || '' })
  }
  if (action === 'verify') {
    const { orderId, paymentId, signature } = b
    if (!orderId || !paymentId || !signature || !safeEqual(hmac(process.env.RAZORPAY_KEY_SECRET || '', `${orderId}|${paymentId}`), signature)) return bad(res, 400, 'Payment could not be verified.')
    const got = await sb(`custom_link_orders?id=eq.${encodeURIComponent(orderId)}&owner_id=eq.${user.id}&select=*`)
    const order = got.data?.[0]
    if (!order) return bad(res, 404, 'Custom link order not found.')
    if (order.status !== 'paid') {
      const hasOne = await sb(`custom_links?experience_id=eq.${order.experience_id}&select=slug`)
      if (hasOne.data?.length) return bad(res, 409, 'This surprise already has a custom link. Contact support with your payment receipt.')
      const exists = await sb(`custom_links?slug=eq.${encodeURIComponent(order.slug)}&select=slug`)
      if (exists.data?.length) return bad(res, 409, 'That keyword was just taken. Contact support with your payment receipt.')
      const inserted = await sb('custom_links', { method:'POST', body:{ slug:order.slug, experience_id:order.experience_id, owner_id:user.id, payment_id:paymentId } })
      if (!inserted.ok) return bad(res, 500, 'Payment received, but we could not activate the keyword. Contact support with payment ID '+paymentId+'.')
      await sb(`custom_link_orders?id=eq.${encodeURIComponent(orderId)}`, { method:'PATCH', body:{ status:'paid', paid_at:new Date().toISOString() } })
      // The custom link replaces the long default link: remember it on the surprise so every screen shows the new link.
      const cur = await sb(`experiences?id=eq.${order.experience_id}&owner_id=eq.${user.id}&select=payload`)
      if (cur.ok && cur.data?.[0]) await sb(`experiences?id=eq.${order.experience_id}&owner_id=eq.${user.id}`, { method:'PATCH', body:{ payload:{ ...(cur.data[0].payload || {}), customSlug: order.slug } } })
    }
    return res.status(200).json({ url:`/s/${order.slug}`, slug:order.slug })
  }
  return bad(res, 400, 'Unknown action.')
}
