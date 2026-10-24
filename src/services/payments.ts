import type { Experience } from '../types'
import { PRICING } from '../config'
import { supabase } from './supabase/client'
import { storage } from './storage'

/** Previewing is free. A public share link needs a payment. Surprises that were already live count as paid. */
export const isPaid = (e: { paid?: boolean; published?: boolean }) => !!(e.paid || e.published)

export type Price = { amount: number; regular: number }
let priceCache: Price | undefined
export async function getPrice(): Promise<Price> {
  if (priceCache) return priceCache
  try {
    const r = await fetch('/api/pricing'); const j = await r.json()
    if (r.ok && j.amount) return (priceCache = { amount: j.amount, regular: j.regular || PRICING.regular })
  } catch { /* use the fallback */ }
  return { amount: PRICING.amount, regular: PRICING.regular }
}

type RzResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
declare global { interface Window { Razorpay?: new (o: Record<string, unknown>) => { open: () => void; on: (e: string, cb: () => void) => void } } }
const loadCheckout = () => new Promise<void>((ok, bad) => {
  if (window.Razorpay) return ok()
  const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'
  s.onload = () => ok(); s.onerror = () => bad(new Error('Could not open the payment window. Check your connection and try again.'))
  document.head.appendChild(s)
})
async function call(path: string, body: unknown) {
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
