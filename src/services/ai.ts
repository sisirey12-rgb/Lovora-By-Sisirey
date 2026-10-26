import { supabase } from './supabase/client'

export type Draft = { greeting: string; message: string; closing: string; wishes: string[]; vows: string[]; moments: string[]; mystery: string[]; prize: string; openWhen: { title: string; text: string }[] }
export type DraftInput = { occasion: string; relation?: string; recipient: string; sender: string; facts: string; tone: string; language: string }

/** Asks the server-side AI helper to write a first draft. The AI key never reaches the browser. */
export async function draftWithAI(input: DraftInput): Promise<Draft> {
  const { data } = await supabase!.auth.getSession(); const token = data.session?.access_token
  if (!token) throw new Error('Please sign in to use the AI helper.')
  const r = await fetch('/api/ai-draft', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(input) })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || 'The AI helper could not write this right now.')
  return (j.draft || j) as Draft
}
