import crypto from 'node:crypto'
import { price, sb, userFromReq, isUuid, isOwner, hmac, safeEqual, nprAmount, providers } from './_shared.js'

/**
 * One function for: eSewa + Khalti payments, "Gift a surprise" vouchers and redeeming them
 * (Vercel's free plan allows 12 functions, so these all live here, chosen with `action`).
 *
 * Owner accounts (OWNER_EMAILS) bypass every payment: shares unlock free and gift codes are created free.
 *
 * Environment (Vercel):  ESEWA_SECRET_KEY, ESEWA_PRODUCT_CODE (live), ESEWA_MODE=test (sandbox, no keys needed)
 *                        KHALTI_SECRET_KEY, KHALTI_MODE=test (sandbox)   PRICE_NPR or NPR_PER_INR   SITE_URL (optional)
 */
const ALPHA = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const makeCode = () => { const b = crypto.randomBytes(8); let s = ''; for (let i = 0; i < 8; i++) s += ALPHA[b[i] % ALPHA.length]; return `LM-${s.slice(0, 4)}-${s.slice(4)}` }
const origin = req => process.env.SITE_URL || `https://${req.headers['x-forwarded-host'] || req.headers.host}`
const bad = (res, code, error) => res.status(code).json({ error })
const esewaTest = () => process.env.ESEWA_MODE === 'test' || !process.env.ESEWA_SECRET_KEY
const esewaSecret = () => process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q'
const esewaCode = () => process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST'
const khaltiBase = () => process.env.KHALTI_MODE === 'test' ? 'https://dev.khalti.com/api/v2' : 'https://khalti.com/api/v2'

async function newGiftCode(userId, source, ref) {
  for (let i = 0; i < 5; i++) {
    const code = makeCode()
    const w = await sb('gift_codes', { method: 'POST', body: { code, created_by: userId, source, payment_ref: ref || null } })
    if (w.ok) return code
  }
  return null
}
async function unlockExperience(id) {
  const now = new Date().toISOString()
  let w = await sb(`experiences?id=eq.${id}`, { method: 'PATCH', body: { paid: true, paid_at: now } })
  if (!w.ok) w = await sb(`experiences?id=eq.${id}`, { method: 'PATCH', body: { paid: true } })
  return w.ok
}
/** Marks an intent paid exactly once and delivers what was bought. Safe to call twice. */
async function fulfil(intent, ref) {
  const now = new Date().toISOString()
  const claim = await sb(`payment_intents?id=eq.${encodeURIComponent(intent.id)}&status=neq.paid`, { method: 'PATCH', prefer: 'return=representation', body: { status: 'paid', paid_at: now, ref: ref || null } })
  if (!claim.ok) return { ok: false }
  if (!claim.data?.length) return { ok: true, again: true }   // already fulfilled
  if (intent.kind === 'share') return { ok: await unlockExperience(intent.experience_id) }
  const code = await newGiftCode(intent.owner_id, 'paid', `${intent.provider}:${intent.id}`)
  if (!code) return { ok: false }
  await sb(`payment_intents?id=eq.${encodeURIComponent(intent.id)}`, { method: 'PATCH', body: { ref: code } })
  return { ok: true, code }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const action = String(req.query?.action || req.body?.action || '')

  /* ---- the browser comes back here from eSewa / Khalti ---- */
  if (action === 'return') {
    const site = origin(req), provider = String(req.query.provider || ''), id = String(req.query.i || '')
    const fail = (why) => res.redirect(302, `${site}/?payment=failed&why=${encodeURIComponent(why)}`)
    try {
      const got = await sb(`payment_intents?id=eq.${encodeURIComponent(id)}&select=*`)
      const intent = got.data?.[0]
      if (!intent || intent.provider !== provider) return fail('unknown')
      let ref = ''
      if (provider === 'esewa') {
        let d; try { d = JSON.parse(Buffer.from(String(req.query.data || ''), 'base64').toString('utf8')) } catch { return fail('bad-response') }
        const names = String(d.signed_field_names || '').split(',').filter(Boolean)
        const msg = names.map(n => `${n}=${d[n]}`).join(',')
        const sig = crypto.createHmac('sha256', esewaSecret()).update(msg).digest('base64')
        const total = Number(String(d.total_amount).replace(/,/g, ''))
        if (!names.length || !safeEqual(sig, d.signature || '')) return fail('signature')
        if (d.status !== 'COMPLETE' || d.transaction_uuid !== intent.id || total !== intent.amount) return fail('not-complete')
        ref = d.transaction_code || ''
      } else if (provider === 'khalti') {
        const r = await fetch(`${khaltiBase()}/epayment/lookup/`, { method: 'POST', headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ pidx: intent.pidx || String(req.query.pidx || '') }) })
        const j = await r.json().catch(() => ({}))
        if (!r.ok || j.status !== 'Completed' || Number(j.total_amount) !== intent.amount * 100) return fail('not-complete')
        ref = j.transaction_id || ''
      } else return fail('provider')
      const done = await fulfil(intent, ref)
      if (!done.ok) return fail('unlock')
      return res.redirect(302, intent.kind === 'share' ? `${site}/?paid=${intent.experience_id}` : `${site}/?gift_intent=${encodeURIComponent(intent.id)}`)
    } catch (e) { console.error('pay return failed', e); return fail('error') }
  }

  if (req.method !== 'POST') return bad(res, 405, 'POST only')
  const user = await userFromReq(req)
  if (!user) return bad(res, 401, 'Please sign in again.')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return bad(res, 500, 'Server setup missing: add SUPABASE_SERVICE_ROLE_KEY in Vercel and redeploy.')
  const owner = isOwner(user), b = req.body || {}

  /* ---- start an eSewa or Khalti payment (share link or gift) ---- */
  if (action === 'start') {
    const provider = String(b.provider || ''), kind = b.kind === 'gift' ? 'gift' : 'share'
    if (!['esewa', 'khalti'].includes(provider)) return bad(res, 400, 'Choose eSewa or Khalti.')
    let expId = null
    if (kind === 'share') {
      expId = String(b.experienceId || '')
      if (!isUuid(expId)) return bad(res, 400, 'Invalid surprise.')
      const look = await sb(`experiences?id=eq.${expId}&owner_id=eq.${user.id}&select=id,paid`)
      if (!look.ok) return bad(res, 500, 'Database setup missing: run the SQL files in supabase/migrations.')
      if (!look.data?.[0]) return bad(res, 404, 'We could not find this surprise on your account yet. Preview it once so it is saved, then try again.')
      if (look.data[0].paid) return res.status(200).json({ alreadyPaid: true })
    }
    if (owner) {   // owner bypass: no payment at all
      if (kind === 'share') { await unlockExperience(expId); return res.status(200).json({ alreadyPaid: true, owner: true }) }
      const code = await newGiftCode(user.id, 'owner'); return code ? res.status(200).json({ code, owner: true }) : bad(res, 500, 'Could not create the gift code. Did you run 0007_gifts_nepal.sql?')
    }
    if (!providers()[provider]) return bad(res, 503, `${provider === 'esewa' ? 'eSewa' : 'Khalti'} is not set up yet.`)
    const amount = nprAmount(), id = crypto.randomUUID(), site = origin(req)
    const saved = await sb('payment_intents', { method: 'POST', body: { id, owner_id: user.id, provider, kind, experience_id: expId, amount } })
    if (!saved.ok) { console.error('intent failed', saved.status, saved.data); return bad(res, 500, 'Could not start the payment. Did you run 0007_gifts_nepal.sql in Supabase?') }
    const back = `${site}/api/pay?action=return&provider=${provider}&i=${id}`
    if (provider === 'esewa') {
      const total = String(amount), code = esewaCode()
      const signature = crypto.createHmac('sha256', esewaSecret()).update(`total_amount=${total},transaction_uuid=${id},product_code=${code}`).digest('base64')
      return res.status(200).json({ provider, url: esewaTest() ? 'https://rc-epay.esewa.com.np/api/epay/main/v2/form' : 'https://epay.esewa.com.np/api/epay/main/v2/form',
        fields: { amount: total, tax_amount: '0', total_amount: total, transaction_uuid: id, product_code: code, product_service_charge: '0', product_delivery_charge: '0', success_url: back, failure_url: `${site}/?payment=failed&why=cancelled`, signed_field_names: 'total_amount,transaction_uuid,product_code', signature } })
    }
    const r = await fetch(`${khaltiBase()}/epayment/initiate/`, { method: 'POST', headers: { Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ return_url: back, website_url: site, amount: amount * 100, purchase_order_id: id, purchase_order_name: kind === 'gift' ? 'Lovora Meow gift' : 'Lovora Meow share link' }) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok || !j.payment_url) { console.error('khalti initiate failed', r.status, j); return bad(res, 502, 'Could not start Khalti. Please try again.') }
    await sb(`payment_intents?id=eq.${id}`, { method: 'PATCH', body: { pidx: j.pidx } })
    return res.status(200).json({ provider, url: j.payment_url })
  }

  /* ---- buy a gift with Razorpay (INR) ---- */
  if (action === 'gift-order') {
    if (owner) { const code = await newGiftCode(user.id, 'owner'); return code ? res.status(200).json({ code, owner: true }) : bad(res, 500, 'Could not create the gift code. Did you run 0007_gifts_nepal.sql?') }
    if (!providers().razorpay) return bad(res, 503, 'Card and UPI payments are not set up yet.')
    const { amount } = price(), key = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET
    const rz = await fetch('https://api.razorpay.com/v1/orders', { method: 'POST', headers: { Authorization: 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64'), 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: amount * 100, currency: 'INR', receipt: `gift_${Date.now()}`, notes: { kind: 'gift', user_id: user.id } }) })
    const order = await rz.json()
    if (!rz.ok) { console.error('razorpay gift order failed', order); return bad(res, 502, 'Could not start the payment. Please try again.') }
    const saved = await sb('payment_intents', { method: 'POST', body: { id: order.id, owner_id: user.id, provider: 'razorpay', kind: 'gift', amount } })
    if (!saved.ok) return bad(res, 500, 'Could not start the payment. Did you run 0007_gifts_nepal.sql in Supabase?')
    return res.status(200).json({ orderId: order.id, amount: order.amount, currency: 'INR', keyId: key, email: user.email || '' })
  }
  if (action === 'gift-verify') {
    const { orderId, paymentId, signature } = b
    if (!orderId || !paymentId || !signature) return bad(res, 400, 'Missing payment details.')
    if (!safeEqual(hmac(process.env.RAZORPAY_KEY_SECRET || '', `${orderId}|${paymentId}`), signature)) return bad(res, 400, 'Payment could not be verified.')
    const got = await sb(`payment_intents?id=eq.${encodeURIComponent(orderId)}&owner_id=eq.${user.id}&select=*`)
    const intent = got.data?.[0]
    if (!intent) return bad(res, 404, 'Payment not found for this account.')
    const done = await fulfil(intent, paymentId)
    if (!done.ok) return bad(res, 500, 'Paid, but the gift code could not be created. Contact support with payment id ' + paymentId)
    const again = done.code || (await sb(`payment_intents?id=eq.${encodeURIComponent(orderId)}&select=ref`)).data?.[0]?.ref
    return res.status(200).json({ code: again })
  }

  /* ---- after eSewa / Khalti returns a gift buyer to the site ---- */
  if (action === 'gift-fetch') {
    const got = await sb(`payment_intents?id=eq.${encodeURIComponent(String(b.intent || ''))}&owner_id=eq.${user.id}&select=status,ref`)
    const r = got.data?.[0]
    if (!r || r.status !== 'paid' || !r.ref) return bad(res, 404, 'That gift is not ready yet.')
    return res.status(200).json({ code: r.ref })
  }
  if (action === 'gift-list') {
    const g = await sb(`gift_codes?created_by=eq.${user.id}&select=code,source,created_at,redeemed_at&order=created_at.desc&limit=30`)
    return res.status(200).json({ codes: g.data || [] })
  }

  /* ---- redeem a gift code on a surprise ---- */
  if (action === 'redeem') {
    const code = String(b.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
    const expId = String(b.experienceId || '')
    if (code.length < 8 || !isUuid(expId)) return bad(res, 400, 'Enter the full gift code, like LM-ABCD-EFGH.')
    const norm = `LM-${code.replace(/^LM/, '').slice(0, 4)}-${code.replace(/^LM/, '').slice(4, 8)}`
    const look = await sb(`experiences?id=eq.${expId}&owner_id=eq.${user.id}&select=id,paid`)
    if (!look.data?.[0]) return bad(res, 404, 'Save your surprise first (preview it once), then use the code.')
    if (look.data[0].paid) return res.status(200).json({ alreadyPaid: true })
    const claim = await sb(`gift_codes?code=eq.${norm}&redeemed_at=is.null`, { method: 'PATCH', prefer: 'return=representation', body: { redeemed_by: user.id, redeemed_for: expId, redeemed_at: new Date().toISOString() } })
    if (!claim.ok) return bad(res, 500, 'Could not check the code. Please try again.')
    if (!claim.data?.length) return bad(res, 404, 'That code is not valid, or it has already been used.')
    if (!(await unlockExperience(expId))) return bad(res, 500, 'Code accepted, but the surprise could not be unlocked. Contact support with code ' + norm)
    return res.status(200).json({ paid: true })
  }
  return bad(res, 400, 'Unknown action.')
}
