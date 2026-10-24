import { price, configured } from './_shared.js'
export default function handler(_req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  res.status(200).json({ ...price(), currency: 'INR', paymentsReady: configured() })
}
