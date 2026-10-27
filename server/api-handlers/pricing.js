import { price, priceForUser, configured, nprAmount, nprGiftAmount, providers, userFromReq } from './_shared.js'
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store')
  const user = await userFromReq(req)
  const pv = providers()
  const p = user ? await priceForUser(user) : price()
  const amount = p.amount
  res.status(200).json({ ...p, amount, regular: p.repeatAmount, giftAmount: amount, currency: 'INR', npr: nprAmount(amount), giftNpr: nprGiftAmount(amount), paymentsReady: configured(), providers: pv })
}
