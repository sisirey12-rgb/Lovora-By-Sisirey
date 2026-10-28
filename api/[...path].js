// One Vercel serverless function dispatches existing API handlers by path.
// Also handles Vercel rewrites where req.query.path reflects the original /s/:id URL.
import account from '../server/api-handlers/account.js'
import ai_draft from '../server/api-handlers/ai-draft.js'
import create_order from '../server/api-handlers/create-order.js'
import custom_link from '../server/api-handlers/custom-link.js'
import og from '../server/api-handlers/og.js'
import pay from '../server/api-handlers/pay.js'
import pricing from '../server/api-handlers/pricing.js'
import publish from '../server/api-handlers/publish.js'
import razorpay_webhook from '../server/api-handlers/razorpay-webhook.js'
import scene_config from '../server/api-handlers/scene-config.js'
import season from '../server/api-handlers/season.js'
import share from '../server/api-handlers/share.js'
import tts from '../server/api-handlers/tts.js'
import verify_payment from '../server/api-handlers/verify-payment.js'

const handlers = {
  account,
  'ai-draft': ai_draft,
  'create-order': create_order,
  'custom-link': custom_link,
  og,
  pay,
  pricing,
  publish,
  'razorpay-webhook': razorpay_webhook,
  'scene-config': scene_config,
  season,
  share,
  tts,
  'verify-payment': verify_payment
}
const decode = value => { try { return decodeURIComponent(String(value)) } catch { return String(value) } }

export default async function handler(req, res) {
  const raw = req.query?.path
  const rawParts = (Array.isArray(raw) ? raw : String(raw || '').split('/'))
    .map(x => decode(x).replace(/^\/+|\/+$/g, '')).filter(Boolean)
  const pathname = String(req.url || '').split('?')[0]
  const urlParts = pathname.split('/').filter(Boolean).map(decode)

  // Prefer a recognised handler name, not simply the first catch-all segment.
  // On some Vercel rewrite configurations `path` contains `s/<slug>` even though
  // the destination is `/api/share?id=<slug>`.
  let route = rawParts.find(part => Object.prototype.hasOwnProperty.call(handlers, part)) || ''
  if (!route) {
    const apiIndex = urlParts.indexOf('api')
    if (apiIndex >= 0) route = urlParts.slice(apiIndex + 1).find(part => Object.prototype.hasOwnProperty.call(handlers, part)) || ''
  }

  // Defensive fallback for the public /s/:id rewrite if Vercel exposes the
  // source path rather than the rewritten destination to the function.
  if (!route && (rawParts[0] === 's' || urlParts[0] === 's')) {
    route = 'share'
    if (!req.query?.id) {
      const slug = rawParts[0] === 's' ? rawParts[1] : urlParts[1]
      if (slug) req.query = { ...(req.query || {}), id: slug }
    }
  }

  if (!route) return res.status(404).json({ error: 'API endpoint not found.' })
  req.query = { ...(req.query || {}) }
  delete req.query.path
  try {
    return await handlers[route](req, res)
  } catch (error) {
    console.error(`API handler ${route} failed`, error)
    if (!res.headersSent) return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
