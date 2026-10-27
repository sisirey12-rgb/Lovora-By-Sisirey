import type { Experience } from '../types'
import { PRICING } from '../config'
import { supabase } from './supabase/client'
import { storage } from './storage'

/** Previewing is free. A public share link needs a payment. Surprises that were already live count as paid. */
export const isPaid = (e: { paid?: boolean; published?: boolean }) => !!(e.paid || e.published)

export type Providers = { razorpay: boolean; esewa: boolean; khalti: boolean }
export type Price = { amount: number; regular: number; giftAmount: number; npr?: number; giftNpr?: number; providers?: Providers }
export async function getPrice(): Promise<Price> {
  try {
    const { data } = supabase ? await supabase.auth.getSession() : { data: { session: null } }
    const token = data.session?.access_token
    const r = await fetch('/api/pricing', { headers: token ? { Authorization: `Bearer ${token}` } : {} }); const j = await r.json()
    if (r.ok && j.amount) return { amount: j.amount, regular: j.regular || PRICING.regular, giftAmount: j.giftAmount || j.amount, npr: j.npr, giftNpr: j.giftNpr, providers: j.providers }
  } catch { /* use the fallback */ }
  return { amount: PRICING.amount, regular: PRICING.regular, giftAmount: PRICING.giftAmount }
}

type RzResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
declare global { interface Window { Razorpay?: new (o: Record<string, unknown>) => { open: () => void; on: (e: string, cb: () => void) => void } } }
const loadCheckout = () => new Promise<void>((ok, bad) => {
  if (window.Razorpay) return ok()
  const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'
  s.onload = () => ok(); s.onerror = () => bad(new Error('Could not open the payment window. Check your connection and try again.'))
  document.head.appendChild(s)
})
export async function call(path: string, body: unknown) {
  const { data } = await supabase!.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Please sign in again.')
  const r = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || 'The payment could not be completed. Please try again.')
  return j
}

/** Saves the surprise to the account, opens the payment window, confirms with the server and returns the unlocked surprise (null if the buyer closed the window). */
export async function payForShare(item: Experience, onStatus?: (s: string) => void): Promise<Experience | null> {
  onStatus?.('Saving your surprise…')
  const withMedia = await storage.uploadMedia(item)
  await storage.saveCloud(withMedia, false)
  onStatus?.('Starting payment…')
  const o = await call('/api/create-order', { experienceId: item.id })
  if (o.alreadyPaid) return { ...withMedia, paid: true }
  await loadCheckout()
  return new Promise((resolve, reject) => {
    const rz = new window.Razorpay!({
      key: o.keyId, order_id: o.orderId, amount: o.amount, currency: 'INR', name: 'Lovora Meow', description: 'Make your surprise shareable', prefill: { email: o.email }, theme: { color: '#d56fa8' },
      handler: async (resp: RzResponse) => {
        try { onStatus?.('Confirming payment…'); await call('/api/verify-payment', { orderId: resp.razorpay_order_id, paymentId: resp.razorpay_payment_id, signature: resp.razorpay_signature }); resolve({ ...withMedia, paid: true }) } catch (e) { reject(e) }
      },
      modal: { ondismiss: () => resolve(null) },
    })
    rz.on('payment.failed', () => reject(new Error('The payment did not go through. You have not been charged. Please try again.')))
    rz.open()
  })
}

export type ShareResult = { ok: true; item: Experience; owner: boolean } | { ok: false; needsPayment: true }
/**
 * Creates the public share link. The surprise is saved privately first, then the SERVER decides:
 * owner accounts get the link free, everyone else needs a paid surprise (otherwise `needsPayment` comes back and the pay window opens).
 */
export async function publishShare(item: Experience, onStatus?: (s: string) => void): Promise<ShareResult> {
  onStatus?.('Saving your surprise…')
  const withMedia = await storage.uploadMedia(item, (d, t) => onStatus?.(`Uploading media ${d} of ${t}…`))
  try { await storage.saveCloud(withMedia, !!item.published) } catch { await storage.saveCloud(withMedia, false) }   // a live surprise stays live while it is edited
  onStatus?.('Creating your link…')
  const { data } = await supabase!.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Please sign in again.')
  const r = await fetch('/api/publish', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ experienceId: item.id }) })
  const j = await r.json().catch(() => ({}))
  if (r.status === 402 || j.needsPayment) return { ok: false, needsPayment: true }
  if (!r.ok) throw new Error(j.error || 'Could not create the link. Please try again.')
  return { ok: true, owner: !!j.owner, item: { ...withMedia, published: true, paid: true, updatedAt: new Date().toISOString() } }
}

/* ===== eSewa, Khalti and gift vouchers ===== */
export type PayProvider = 'razorpay' | 'esewa' | 'khalti'
const PENDING = 'lovora-pay-pending'

/** Hands the browser to eSewa (a signed form post) or Khalti (a redirect). The page leaves, and comes back at /?paid=<id> or /?gift_intent=<id>. */
async function goRedirect(provider: 'esewa' | 'khalti', kind: 'share' | 'gift', experienceId?: string): Promise<{ alreadyPaid?: boolean; code?: string; owner?: boolean } | 'left'> {
  const o = await call('/api/pay', { action: 'start', provider, kind, experienceId })
  if (o.alreadyPaid || o.code) return { alreadyPaid: o.alreadyPaid, code: o.code, owner: o.owner }
  if (experienceId) { try { localStorage.setItem(PENDING, experienceId) } catch { /* private mode */ } }
  if (o.provider === 'khalti') { window.location.href = o.url; return 'left' }
  const f = document.createElement('form'); f.method = 'POST'; f.action = o.url
  Object.entries(o.fields as Record<string, string>).forEach(([k, v]) => { const i = document.createElement('input'); i.type = 'hidden'; i.name = k; i.value = v; f.appendChild(i) })
  document.body.appendChild(f); f.submit(); return 'left'
}
/** Pay for a share link with eSewa or Khalti. Resolves to the unlocked surprise only if the server said it was already free (owner); otherwise the page navigates away. */
export async function payForShareRedirect(provider: 'esewa' | 'khalti', item: Experience, onStatus?: (s: string) => void): Promise<Experience | null> {
  onStatus?.('Saving your surprise…')
  const withMedia = await storage.uploadMedia(item)
  await storage.saveCloud(withMedia, false)
  onStatus?.(`Taking you to ${provider === 'esewa' ? 'eSewa' : 'Khalti'}…`)
  const r = await goRedirect(provider, 'share', item.id)
  return r === 'left' ? null : { ...withMedia, paid: true }
}
export const pendingPaid = () => { try { return localStorage.getItem(PENDING) } catch { return null } }
export const clearPending = () => { try { localStorage.removeItem(PENDING) } catch { /* ignore */ } }

/** Buy a gift voucher. Resolves with the code (owner accounts get one instantly, free). For eSewa and Khalti the page navigates away. */
export async function buyGift(provider: PayProvider, onStatus?: (s: string) => void): Promise<string | null> {
  onStatus?.('Starting…')
  if (provider !== 'razorpay') {
    const r = await goRedirect(provider, 'gift')
    return r === 'left' ? null : r.code || null
  }
  const o = await call('/api/pay', { action: 'gift-order' })
  if (o.code) return o.code
  await loadCheckout()
  return new Promise((resolve, reject) => {
    const rz = new window.Razorpay!({
      key: o.keyId, order_id: o.orderId, amount: o.amount, currency: 'INR', name: 'Lovora Meow', description: 'Gift a surprise', prefill: { email: o.email }, theme: { color: '#ff5a3c' },
      handler: async (resp: RzResponse) => {
        try { onStatus?.('Creating the gift code…'); const v = await call('/api/pay', { action: 'gift-verify', orderId: resp.razorpay_order_id, paymentId: resp.razorpay_payment_id, signature: resp.razorpay_signature }); resolve(v.code as string) } catch (e) { reject(e) }
      },
      modal: { ondismiss: () => resolve(null) },
    })
    rz.on('payment.failed', () => reject(new Error('The payment did not go through. You have not been charged.')))
    rz.open()
  })
}
export const fetchGiftIntent = async (intent: string): Promise<string | null> => { try { return (await call('/api/pay', { action: 'gift-fetch', intent })).code as string } catch { return null } }
export type GiftRow = { code: string; source: string; created_at: string; redeemed_at: string | null }
export const listGifts = async (): Promise<GiftRow[]> => { try { return (await call('/api/pay', { action: 'gift-list' })).codes as GiftRow[] } catch { return [] } }
/** Uses a gift code on a surprise. Returns the unlocked surprise. */
export async function redeemGift(code: string, item: Experience, onStatus?: (s: string) => void): Promise<Experience> {
  onStatus?.('Saving your surprise…')
  const withMedia = await storage.uploadMedia(item)
  await storage.saveCloud(withMedia, false)
  onStatus?.('Checking the code…')
  await call('/api/pay', { action: 'redeem', code, experienceId: item.id })
  return { ...withMedia, paid: true }
}
export const savedGiftCode = () => { try { return localStorage.getItem('lovora-gift') || '' } catch { return '' } }
export const saveGiftCode = (c: string) => { try { c ? localStorage.setItem('lovora-gift', c) : localStorage.removeItem('lovora-gift') } catch { /* ignore */ } }
