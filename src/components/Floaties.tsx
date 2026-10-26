import { useMemo, type CSSProperties, type ReactElement } from 'react'

export type FloatKind = 'heart' | 'star' | 'sparkle' | 'balloon' | 'flower' | 'leaf' | 'bolt' | 'bow' | 'moon' | 'confetti' | 'ring' | 'butterfly'
const PATHS: Record<FloatKind, ReactElement> = {
  heart: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />,
  star: <path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.8-6.3 3.8 1.7-7L2 9.2l7.1-.6z" />,
  sparkle: <path d="M12 1l2.2 8.8L23 12l-8.8 2.2L12 23l-2.2-8.8L1 12l8.8-2.2z" />,
  balloon: <><ellipse cx="12" cy="9" rx="6.5" ry="8" /><path d="M10.4 17.4l1.6 2.2 1.6-2.2z" /><path d="M12 19.6c-1.2 1.6 1.2 2.6 0 4.4" fill="none" stroke="currentColor" strokeWidth=".8" opacity=".7" /></>,
  flower: <><g>{[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="12" cy="6.2" rx="3.2" ry="4.6" transform={`rotate(${a} 12 12)`} />)}</g><circle cx="12" cy="12" r="2.6" fill="#fff" opacity=".85" /></>,
  leaf: <path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z" />,
  bolt: <path d="M13 2L4 14h6l-1 8 9-12h-6z" />,
  bow: <><path d="M12 12L2.5 6v12z" /><path d="M12 12l9.5-6v12z" /><circle cx="12" cy="12" r="2.4" /></>,
  moon: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" />,
  confetti: <rect x="8" y="3" width="8" height="18" rx="2.5" />,
  ring: <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2.6" />,
  butterfly: <path d="M12 12C8 3 2 4 3 9c.6 3 5 4 9 3zM12 12c4-9 10-8 9-3-.6 3-5 4-9 3zM12 12c-4 1-7 5-5 8 2 2 5-2 5-8zM12 12c4 1 7 5 5 8-2 2-5-2-5-8z" />,
}
const MAP: [RegExp, FloatKind][] = [[/[❤💕💖💗💘💞💝🩷🧡💛💚💙💜]/u, 'heart'], [/[⭐🌟]/u, 'star'], [/[✨💫]/u, 'sparkle'], [/🎈/u, 'balloon'], [/[🌸🌷🌹💐🌼🌻]/u, 'flower'], [/[🌿🍃🍀]/u, 'leaf'], [/⚡/u, 'bolt'], [/🎀/u, 'bow'], [/[🌙🌜]/u, 'moon'], [/[🎉🎊]/u, 'confetti'], [/🦋/u, 'butterfly'], [/[⚽🎮🏀🎧🏆]/u, 'ring']]
/** Turns the old emoji motifs into drawn shapes, so nothing on the site looks like a pasted emoji. */
export const kindOf = (e: string): FloatKind => MAP.find(([r]) => r.test(e))?.[1] ?? 'sparkle'

/** Soft drawn shapes drifting up (or falling) behind content. Pure CSS motion, tinted from the colours you pass in. */
export default function Floaties({ kinds, colors, count = 12, fall = false, size = [14, 30], className = '' }: { kinds: FloatKind[]; colors: string[]; count?: number; fall?: boolean; size?: [number, number]; className?: string }) {
  const items = useMemo(() => Array.from({ length: count }, (_, i) => ({
    k: kinds[i % kinds.length], c: colors[(i * 3) % colors.length], left: (i * 37 + 7) % 94, delay: -((i * 1.9) % 14), dur: 12 + (i % 5) * 2.6, w: size[0] + ((i * 7) % (size[1] - size[0] + 1)), rot: ((i % 2 ? 1 : -1) * (30 + (i % 4) * 22)), sway: (i % 2 ? 1 : -1) * (14 + (i % 3) * 10),
  })), [kinds, colors, count, size])
  return <div className={`floaties ${fall ? 'fall' : ''} ${className}`} aria-hidden="true">{items.map((p, i) =>
    <i key={i} className="fl" style={{ left: `${p.left}%`, width: p.w, color: p.c, animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`, ['--rot' as string]: `${p.rot}deg`, ['--sway' as string]: p.sway } as CSSProperties}>
      <svg viewBox="0 0 24 24" fill="currentColor">{PATHS[p.k]}</svg></i>)}</div>
}

/** One drawn shape, for places that need a single icon (like the gift burst). */
export function Shape({ kind, color = 'currentColor', size = 34 }: { kind: FloatKind; color?: string; size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ color, overflow: 'visible', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,.3))' }} aria-hidden="true">{PATHS[kind]}</svg>
}
