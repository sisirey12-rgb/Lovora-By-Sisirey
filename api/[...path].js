// Single Vercel serverless entry point for all API routes. Keeping handlers outside /api
// prevents Vercel Hobby from counting each endpoint as a separate function.
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

const routes = {
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
  'verify-payment': verify_payment,
}

export default async function handler(req, res) {
  const pathParts = req.query?.path
  let route = Array.isArray(pathParts) ? pathParts.join('/') : String(pathParts || '')
  if (!route) {
    const pathname = new URL(req.url || '/', 'http://localhost').pathname
    route = pathname.replace(/^\/api\/?/, '').replace(/\/$/, '')
  }
  // Only one-segment API names are supported; reject unknown routes instead of guessing.
  const name = route.split('/')[0]
  const endpoint = routes[name]
  if (!endpoint || route.includes('/')) return res.status(404).json({ error: 'API route not found.' })
  try { return await endpoint(req, res) }
  catch (error) {
    console.error(`API route ${name} failed`, error)
    if (res.headersSent) return
    return res.status(500).json({ error: 'Unexpected server error.' })
  }
}
