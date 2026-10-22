import type { Experience } from '../../types'
import { localStorageAdapter } from './local'
import { supabase } from '../supabase/client'
import { friendlyError } from '../errors'

const need = () => {
  if (!supabase) throw new Error('Sharing is not available right now. Please try again in a little while.')
  return supabase
}
async function requireUser() {
  const client = need()
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) throw new Error('Please sign in to save and share your surprise.')
  return { client, user: data.user }
}
const fromRow = (r: { payload: Experience; is_published: boolean; updated_at: string }): Experience => ({ ...r.payload, published: r.is_published, updatedAt: r.updated_at })

/**
 * Local copies are an on-device cache and work without an account.
 * Signed-in creators additionally save to the `experiences` table, which is what makes /s/:id links work on other devices.
 */
export const storage = {
  list: () => localStorageAdapter.list(),
  getLocal: (id: string) => localStorageAdapter.get(id),
  /** Saves on this device only. Keeps the current published flag so editing a live surprise does not silently unpublish it. */
  saveDraft: (item: Experience) => localStorageAdapter.save(item),
  removeLocal: (id: string) => localStorageAdapter.remove(id),
  duplicate: (item: Experience) => localStorageAdapter.duplicate(item),

  async listCloud(): Promise<Experience[]> {
    const { client } = await requireUser()
    const { data, error } = await client.from('experiences').select('payload,is_published,updated_at').order('updated_at', { ascending: false })
    if (error) throw new Error(friendlyError(error))
    return (data || []).filter(r => r.payload).map(r => fromRow(r as never))
  },
  /** Create or update the creator's own row. `published` decides whether the public link works. */
  async saveCloud(item: Experience, published = item.published): Promise<Experience> {
    const { client, user } = await requireUser()
    const now = new Date().toISOString()
    const saved: Experience = { ...item, published, updatedAt: now }
    const { error } = await client.from('experiences').upsert({ id: saved.id, owner_id: user.id, payload: saved, is_published: published, updated_at: now })
    if (error) throw new Error(friendlyError(error))
    return saved
  },
  publish(item: Experience) { return storage.saveCloud(item, true) },
  unpublish(item: Experience) { return storage.saveCloud(item, false) },
  async removeCloud(id: string) {
    const { client } = await requireUser()
    const { error } = await client.from('experiences').delete().eq('id', id)
    if (error) throw new Error(friendlyError(error))
  },
  /** Public read through the security-barrier view: only rows with is_published = true are visible. */
  async getPublic(id: string): Promise<Experience | undefined> {
    if (!supabase) return undefined
    const { data, error } = await supabase.from('published_experiences').select('payload').eq('id', id).maybeSingle()
    if (error) throw new Error(friendlyError(error))
    return (data?.payload as Experience | undefined) ?? undefined
  },
}
