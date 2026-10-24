import type { Experience } from '../../types'
const KEY = 'lovora-meow-experiences-v1'
const strip = (x: Experience): Experience => ({ ...x, memories: x.memories.map(m => m.src.startsWith('data:') ? { ...m, src: '' } : m), videoData: x.videoData?.startsWith('data:') ? undefined : x.videoData, musicData: undefined })
/** localStorage holds about 5 MB. If it is full, large embedded media is dropped from older drafts first, then from this one. The cloud copy keeps the real files. */
function write(all: Experience[]) {
  try { localStorage.setItem(KEY, JSON.stringify(all)); return } catch { /* quota */ }
  const slim = all.map((x, i) => (i === 0 ? x : strip(x)))
  try { localStorage.setItem(KEY, JSON.stringify(slim)); return } catch { /* still full */ }
  localStorage.setItem(KEY, JSON.stringify(all.map(strip)))
}
function readAll(): Experience[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') as Experience[] } catch { return [] }
}
export const localStorageAdapter = {
  list: () => readAll(),
  get: (id: string) => readAll().find(item => item.id === id),
  save: (item: Experience) => {
    const all = readAll(); const index = all.findIndex(x => x.id === item.id)
    if (index >= 0) all[index] = item; else all.unshift(item)
    write(all)
    return item
  },
  remove: (id: string) => write(readAll().filter(x => x.id !== id)),
  duplicate: (item: Experience) => {
    const copy = { ...item, id: crypto.randomUUID(), title: `${item.title} (copy)`, published: false, updatedAt: new Date().toISOString() }
    localStorageAdapter.save(copy); return copy
  },
}
