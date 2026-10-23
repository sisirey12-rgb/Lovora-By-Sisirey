import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Draws effects (confetti, balloons, fireworks) over the WHOLE screen, behind the scene's text.
 * Scenes carry transforms and clipping, which turn `position: fixed` into "relative to the scene box" and crop effects to a
 * narrow strip. This portals the layer straight into the player root, so it always fills the full viewport.
 */
export default function FullScreenFX({ children, front = false }: { children: ReactNode; front?: boolean }) {
  const [host, setHost] = useState<Element | null>(null)
  useEffect(() => { setHost(document.querySelector('.player')) }, [])
  if (!host) return null
  return createPortal(
    <div className="fsfx" aria-hidden="true" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100dvh', zIndex: front ? 5 : -1, pointerEvents: 'none', overflow: 'hidden' }}>{children}</div>,
    host,
  )
}
