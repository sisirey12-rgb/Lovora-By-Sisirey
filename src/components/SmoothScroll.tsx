import { useEffect } from 'react'

/** Lenis smooth scrolling for the page. Skipped for reduced motion, and inside the player/modals (marked data-lenis-prevent). */
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0, stop = false
    let lenis: { raf: (t: number) => void; destroy: () => void } | undefined
    import('lenis').then(({ default: Lenis }) => {
      if (stop) return
      lenis = new Lenis({ duration: 1.1, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, prevent: (node: HTMLElement) => !!node.closest?.('.player,.quick-backdrop,.paywall-backdrop,[data-lenis-prevent],textarea,select') })
      const loop = (t: number) => { lenis?.raf(t); raf = requestAnimationFrame(loop) }
      raf = requestAnimationFrame(loop)
    }).catch(() => { /* lenis not installed: normal scrolling */ })
    return () => { stop = true; cancelAnimationFrame(raf); lenis?.destroy() }
  }, [])
  return null
}
