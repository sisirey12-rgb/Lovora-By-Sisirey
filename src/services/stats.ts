import { supabase } from './supabase/client'
import { friendlyError } from './errors'

export type Stats = { opens: number; viewers: number; avg_seconds: number; completed: number; replays: number; last_opened: string | null; total: number; mobile: number; reach: number[]; recent: { opened_at: string; seconds: number; device: string }[] }
const viewerId = () => { try { let v = localStorage.getItem('lm-viewer'); if (!v) { v = crypto.randomUUID(); localStorage.setItem('lm-viewer', v) } return v } catch { return crypto.randomUUID() } }

/** A visitor opened a published surprise. Returns the view id (or '' if tracking is unavailable). */
export async function trackOpen(id: string): Promise<string> {
  if (!supabase) return ''
  const device = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
  const { data, error } = await supabase.rpc('track_view', { p_id: id, p_viewer: viewerId(), p_device: device })
  return error || typeof data !== 'string' ? '' : data
}
export async function pingView(view: string, s: { seconds: number; furthest: number; total: number; replays: number }) {
  if (!supabase || !view) return
  await supabase.rpc('update_view', { p_view: view, p_seconds: s.seconds, p_furthest: s.furthest, p_total: s.total, p_replays: s.replays })
}
/** Creator-only summary. */
export async function getStats(id: string): Promise<Stats> {
  if (!supabase) throw new Error('Stats are not available right now.')
  const { data, error } = await supabase.rpc('get_stats', { p_id: id })
  if (error) throw new Error(error.message.includes('forbidden') ? 'Only the creator can see these stats.' : friendlyError(error))
  return data as Stats
}
