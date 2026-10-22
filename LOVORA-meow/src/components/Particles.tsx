import { useMemo } from 'react'
export default function Particles({ count = 18 }: { count?: number }) {
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
    left: `${(i * 37 + 7) % 100}%`, delay: `${(i % 7) * -1.4}s`, duration: `${10 + (i % 6) * 2}s`,
    size: `${4 + (i % 4) * 2}px`, opacity: 0.22 + (i % 5) * 0.1,
  })), [count])
  return <div className="particles" aria-hidden="true">{particles.map((p, i) => <span key={i} style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, width: p.size, height: p.size, opacity: p.opacity }} />)}</div>
}
