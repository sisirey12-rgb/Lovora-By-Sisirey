import { createCakeSim, CAKE_TOTAL } from '../src/lib/cakeSim.ts'
const calls: Record<string, number> = {}
const ctx: any = new Proxy({}, { get: (t: any, p: string) => (p in t ? t[p] : (p.startsWith('create') ? () => ({ addColorStop() {} }) : (..._a: any[]) => { calls[p] = (calls[p] || 0) + 1 })), set: (t: any, p: string, v: any) => { t[p] = v; return true } })
const cv: any = { getContext: () => ctx, width: 0, height: 0 }
let pend: any = null
;(globalThis as any).requestAnimationFrame = (cb: any) => { pend = cb; return 1 }
;(globalThis as any).cancelAnimationFrame = () => { pend = null }
let state = { wished: false, blowAt: 0, level: 0 }, ups: any[] = []
const stop = createCakeSim(cv, { sponge: ['#f2a3bd', '#ffd7e2'], cream: '#fff3f6', frost: '#ffc2d6', frost2: '#ff9fbd', deco: process.argv[2] || 'berries' }, { age: Number(process.argv[3]) || undefined, seed: 7, reduced: false, get: () => state, onUpdate: u => ups.push(u) })
let now = 1000
for (let i = 0; i < 1000; i++) { now += 16; if (i === 800) state.blowAt = now; if (i === 860) state.wished = true; pend && pend(now) }
stop()
const caps = [...new Set(ups.map(u => u.caption))]
console.log('total', CAKE_TOTAL.toFixed(2), 'updates', ups.length, 'ready', ups.some(u => u.ready), 'captions', caps.length, JSON.stringify(caps))
console.log('draw calls', Object.keys(calls).length, 'fills', calls.fill, 'arcs', calls.arc)
