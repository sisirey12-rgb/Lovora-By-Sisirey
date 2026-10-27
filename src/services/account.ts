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

export type AiCheck = { keySet: boolean; keyLooksRight: boolean; keyLength: number; model: string; ok: boolean; status: number; message: string; ms?: number }
/** Owner only: asks the server to test the Groq key and model and say what is wrong. */
export async function checkAi(): Promise<AiCheck | { error: string }> {
  try {
    if (!supabase) return { error: 'Sign-in is not configured.' }
    const { data } = await supabase.auth.getSession(); const t = data.session?.access_token
    if (!t) return { error: 'Please sign in again.' }
    const r = await fetch('/api/ai-draft', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` }, body: JSON.stringify({ check: true }) })
    const j = await r.json().catch(() => ({}))
    return r.ok ? j as AiCheck : { error: j.error || `The server answered HTTP ${r.status}.` }
  } catch { return { error: 'Could not reach the server.' } }
}
