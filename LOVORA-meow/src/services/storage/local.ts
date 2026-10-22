import type { Experience } from '../../types'
const KEY = 'lovora-meow-experiences-v1'
function readAll(): Experience[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') as Experience[] } catch { return [] }
}
export const localStorageAdapter = {
  list: () => readAll(),
  get: (id: string) => readAll().find(item => item.id === id),
  save: (item: Experience) => {
    const all = readAll(); const index = all.findIndex(x => x.id === item.id)
    if (index >= 0) all[index] = item; else all.unshift(item)
    localStorage.setItem(KEY, JSON.stringify(all))
    return item
  },
  remove: (id: string) => localStorage.setItem(KEY, JSON.stringify(readAll().filter(x => x.id !== id))),
  duplicate: (item: Experience) => {
    const copy = { ...item, id: crypto.randomUUID(), title: `${item.title} (copy)`, published: false, updatedAt: new Date().toISOString() }
    localStorageAdapter.save(copy); return copy
  },
}
