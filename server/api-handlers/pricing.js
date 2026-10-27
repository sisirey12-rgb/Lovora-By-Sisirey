import { price, configured, nprAmount, providers } from './_shared.js'
export default function handler(_req, res) {
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600')
  const pv = providers()
  res.status(200).json({ ...price(), currency: 'INR', npr: nprAmount(), paymentsReady: configured(), providers: pv })
}
