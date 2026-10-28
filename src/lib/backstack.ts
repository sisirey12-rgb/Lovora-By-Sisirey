import { useEffect, useRef } from 'react'

/**
 * Makes the phone's Back button (and the browser Back button) walk back ONE step at a time:
 * a preview closes, a sheet goes from step 2 to step 1, the editor goes from step 4 to step 3.
 * It never throws the whole project away unless you are already on the very first step.
 *
 * Every "layer" (a sheet, a preview, an editor step) adds one history entry while it is open.
 * Back closes the top layer. When a layer is closed from the screen instead (a Close button),
 * its history entry is removed quietly so the next Back press is not wasted.
 */
type Layer = { id: number; close: () => void }
const stack: Layer[] = []
const later: (() => void)[] = []
const listeners = new Set<() => void>()
let seq = 0, pendingGo = 0, wired = false, timer = 0

const flush = () => { window.clearTimeout(timer); pendingGo = 0; while (later.length) later.shift()?.() }
function wire() {
  if (wired || typeof window === 'undefined') return
  wired = true
  window.addEventListener('popstate', () => {
    if (pendingGo > 0) { pendingGo -= 1; if (pendingGo === 0) flush(); return }   // our own quiet removal, not the user
    const top = stack.pop()
    if (top) top.close()
    else listeners.forEach(f => f())
  })
}
/** Runs `fn` straight away, or right after a quiet history removal has finished (so URLs never go stale). */
const afterQuiet = (fn: () => void) => { if (pendingGo > 0) later.push(fn); else fn() }

export function pushLayer(close: () => void, url?: string): number {
  wire()
  const id = ++seq
  stack.push({ id, close })
  afterQuiet(() => window.history.pushState({ ...(window.history.state || {}), layer: id }, '', url || window.location.href))
  return id
}
/** A layer was closed from the screen: take its history entry (and any above it) away without calling close(). */
export function dropLayer(id: number) {
  const i = stack.findIndex(l => l.id === id)
  if (i < 0) return   // Back already closed it
  const n = stack.splice(i).length
  pendingGo += 1
  window.clearTimeout(timer); timer = window.setTimeout(flush, 500)   // safety net if the browser never reports the move
  window.history.go(-n)
}
/** Goes back exactly one layer (used by on-screen Back buttons so they behave like the phone's Back). Returns false if there is none. */
export function backOne(): boolean { if (!stack.length) return false; window.history.back(); return true }
export const layerDepth = () => stack.length
/** Called when Back is pressed and no layer was open (normal page-to-page navigation). */
export function onPlainBack(f: () => void) { wire(); listeners.add(f); return () => { listeners.delete(f) } }
/** URL changes made by the app go through here so they never collide with a pending quiet removal. */
export function navTo(url: string, replace = false) { afterQuiet(() => { if (replace) window.history.replaceState(window.history.state, '', url); else window.history.pushState({}, '', url) }) }

/** While `active` is true, the Back button calls `onBack` (which should close that layer) instead of leaving the page. */
export function useBackLayer(active: boolean, onBack: () => void, url?: string) {
  const cb = useRef(onBack); cb.current = onBack
  useEffect(() => {
    if (!active) return
    const id = pushLayer(() => cb.current(), url)
    return () => dropLayer(id)
  }, [active])
}
