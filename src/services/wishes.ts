import { supabase } from './supabase/client'
import { friendlyError } from './errors'
import type { Wish } from '../components/WishJar'

/** Friends add a wish to a published surprise's jar (no account needed). */
export async function submitWish(id: string, name: string, text: string) {
  if (!supabase) throw new Error('Wishes are not available right now.')
  const { error } = await supabase.rpc('submit_wish', { p_id: id, p_name: name, p_text: text })
  if (!error) return
  const m = error.message || ''
  if (m.includes('not_found')) throw new Error('This surprise is not open for wishes yet.')
  if (m.includes('full')) throw new Error('The wish jar is full! 🫙')
  if (m.includes('empty')) throw new Error('Write a little wish first ♡')
  throw new Error(friendlyError(error))
}
export async function getWishes(id: string): Promise<Wish[]> {
  if (!supabase) return []
  const { data, error } = await supabase.rpc('get_wishes', { p_id: id })
  if (error || !Array.isArray(data)) return []
  return (data as { name: string; wish_text: string }[]).map(r => ({ name: r.name, text: r.wish_text }))
}
