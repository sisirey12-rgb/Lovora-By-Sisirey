// One Vercel serverless function dispatches the existing API handlers by path.
// This keeps all API endpoints available on the Hobby plan without exceeding its function cap.
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
  'account': account,
  'ai-draft': ai_draft,
  'create-order': create_order,
  'custom-link': custom_link,
  'og': og,
  'pay': pay,
  'pricing': pricing,
  'publish': publish,
  'razorpay-webhook': razorpay_webhook,
  'scene-config': scene_config,
  'season': season,
  'share': share,
  'tts': tts,
  'verify-payment': verify_payment
}

export default async function handler(req, res) {
  // Vercel may expose the catch-all segment as req.query.path, while some
  // rewrite/deployment combinations leave it unset. Fall back to the URL path.
  const raw = req.query?.path
  let route = Array.isArray(raw) ? String(raw[0] || '') : String(raw || '')
  if (!route) {
    const pathname = String(req.url || '').split('?')[0]
    route = pathname.replace(/^\/api\//, '').replace(/\/$/, '').split('/')[0] || ''
  }
  // Handle a possible encoded segment without allowing arbitrary paths.
  try { route = decodeURIComponent(route) } catch { /* keep original route */ }
  const target = handlers[route]
  if (!target) return res.status(404).json({ error: 'API endpoint not found.' })
  // Preserve Vercel's parsed query parameters for the original handler.
  req.query = { ...(req.query || {}) }
  delete req.query.path
  try { return await target(req, res) }
  catch (error) { console.error(`API handler ${route} failed`, error); if (!res.headersSent) return res.status(500).json({ error: 'Something went wrong. Please try again.' }) }
}
