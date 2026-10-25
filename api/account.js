import { userFromReq, sb } from './_shared.js'

/** Account details for the signed-in creator: is this an owner account, and how many surprises are paid. */
export default async function handler(req, res) {
  const user = await userFromReq(req)
  if (!user) return res.status(401).json({ error: 'Please sign in again.' })
  const owners = String(process.env.OWNER_EMAILS || '').toLowerCase().split(/[,\s;]+/).filter(Boolean)
  const owner = !!user.email && owners.includes(String(user.email).toLowerCase())
  let paid = 0, total = 0
  try {
    const r = await sb(`experiences?owner_id=eq.${user.id}&select=id,paid`)
    if (r.ok && Array.isArray(r.data)) { total = r.data.length; paid = r.data.filter(x => x.paid).length }
  } catch { /* service key not set: just report owner status */ }
  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json({ owner, paid, total })
}
