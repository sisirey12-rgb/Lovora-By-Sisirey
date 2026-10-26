import { supabase } from './supabase/client'

export type AccountInfo = { owner: boolean; email: string; paid: number; total: number; ownerConfigured: boolean; serviceKey: boolean }
/** Asks the server who this account is (owner or not). The server decides; the browser only displays it. */
export async function fetchAccount(): Promise<AccountInfo | null> {
  try {
    if (!supabase) return null
    const { data } = await supabase.auth.getSession(); const t = data.session?.access_token
    if (!t) return null
    const r = await fetch('/api/account', { headers: { Authorization: `Bearer ${t}` } })
    return r.ok ? await r.json() as AccountInfo : null
  } catch { return null }
}
