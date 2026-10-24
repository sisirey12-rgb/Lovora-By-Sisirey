import type { Experience } from '../../types'
import { localStorageAdapter } from './local'
import { supabase } from '../supabase/client'
import { friendlyError } from '../errors'
import { isDataUrl } from '../../lib/media'

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
const fromRow = (r: { payload: Experience; is_published: boolean; updated_at: string; paid?: boolean }): Experience => ({ ...r.payload, published: r.is_published, paid: r.paid ?? r.payload.paid, updatedAt: r.updated_at })

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
    const { data, error } = await client.from('experiences').select('payload,is_published,updated_at,paid').order('updated_at', { ascending: false })
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
  /** Moves embedded photos, videos and music into Supabase Storage and swaps them for short public URLs, so the saved surprise stays small. */
  async uploadMedia(item: Experience, onProgress?: (done: number, total: number) => void): Promise<Experience> {
    const { client, user } = await requireUser()
    const jobs: { get: () => string | undefined; set: (u: string) => void }[] = []
    const out: Experience = { ...item, memories: item.memories.map(m => ({ ...m })) }
    out.memories.forEach(m => jobs.push({ get: () => m.src, set: u => { m.src = u } }))
    jobs.push({ get: () => out.videoData, set: u => { out.videoData = u } }, { get: () => out.musicData, set: u => { out.musicData = u } })
    const todo = jobs.filter(j => isDataUrl(j.get())); let done = 0
    for (const j of todo) {
      const blob = await (await fetch(j.get()!)).blob()
      const ext = (blob.type.split('/')[1] || 'bin').replace('jpeg', 'jpg').replace(/[^a-z0-9]/gi, '')
      const path = `${user.id}/${item.id}/${crypto.randomUUID()}.${ext}`
      const { error } = await client.storage.from('surprise-media').upload(path, blob, { contentType: blob.type, upsert: false })
      if (error) throw new Error(friendlyError(error))
      j.set(client.storage.from('surprise-media').getPublicUrl(path).data.publicUrl)
      onProgress?.(++done, todo.length)
    }
    return out
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
