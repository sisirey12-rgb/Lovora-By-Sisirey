import { userFromReq, sb, isOwner, ownerEmails } from './_shared.js'

/** Account details for the signed-in creator: is this an owner account, and how many surprises are paid. */
export default async function handler(req, res) {
  const user = await userFromReq(req)
  if (!user) return res.status(401).json({ error: 'Please sign in again.' })
  const owner = isOwner(user)
  let paid = 0, total = 0
  try {
    const r = await sb(`experiences?owner_id=eq.${user.id}&select=id,paid`)
    if (r.ok && Array.isArray(r.data)) { total = r.data.length; paid = r.data.filter(x => x.paid).length }
  } catch { /* service key not set: just report owner status */ }
  res.setHeader('Cache-Control', 'no-store')
  // ownerConfigured lets the account panel explain WHY an owner is not recognised (the env var is empty) without ever listing the owner emails.
  res.status(200).json({ owner, email: user.email || '', paid, total, ownerConfigured: ownerEmails().length > 0, serviceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) })
}
