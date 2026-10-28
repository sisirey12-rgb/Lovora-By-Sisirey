import { price, configured, nprAmount, providers, priceFor, userFromReq, isOwner } from '../../api/_shared.js'

/** Public list (first and repeat price). With a signed-in token it also says what THIS account pays now: the first purchase is the launch price, every later one the repeat price. */
export default async function handler(req, res) {
  const base = { ...price(), currency: 'INR', npr: nprAmount('first'), nprRepeat: nprAmount('repeat'), paymentsReady: configured(), providers: providers(), repeatBuyer: false }
  res.setHeader('Vary', 'Authorization')
  const user = req.headers.authorization ? await userFromReq(req) : null
  if (user && !isOwner(user)) {
    const p = await priceFor(user.id)
    res.setHeader('Cache-Control', 'private, no-store')
    return res.status(200).json({ ...base, amount: p.amount, npr: p.npr, repeatBuyer: p.repeatBuyer })
  }
  res.setHeader('Cache-Control', user ? 'private, no-store' : 'public, s-maxage=300, stale-while-revalidate=600')
  res.status(200).json(base)
}
