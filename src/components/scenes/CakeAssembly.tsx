import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Flame, SkipForward } from 'lucide-react'
import { sfx } from '../../lib/sfx'

type Deco = 'berries' | 'choco' | 'gold' | 'crumb' | 'hearts' | 'pearls' | 'blueberries' | 'flowers'
type Cfg = { sponge: [string, string]; cream: string; frost: string; frost2: string; deco: Deco; tiered?: boolean; heart?: boolean }
const STYLES: Record<string, Cfg> = {
  strawberry: { sponge: ['#f2a3bd', '#ffd7e2'], cream: '#fff3f6', frost: '#ffc2d6', frost2: '#ff9fbd', deco: 'berries' },
  chocolate: { sponge: ['#4f2227', '#8a4b4d'], cream: '#d7a98e', frost: '#4a2025', frost2: '#2f1217', deco: 'choco' },
  'vanilla-gold': { sponge: ['#dcae4d', '#fff0b8'], cream: '#fffaf0', frost: '#fff2c9', frost2: '#e6b85e', deco: 'gold' },
  'red-velvet': { sponge: ['#7e1632', '#d34c67'], cream: '#fff6f2', frost: '#fff0ec', frost2: '#ffd9d4', deco: 'crumb' },
  'heart-cake': { sponge: ['#d9558c', '#ffb6d2'], cream: '#fff0f6', frost: '#ffc6dc', frost2: '#ff8fba', deco: 'hearts', heart: true },
  tiered: { sponge: ['#eba3c1', '#fff0f5'], cream: '#ffffff', frost: '#fff5f8', frost2: '#f5b5cd', deco: 'pearls', tiered: true },
  blueberry: { sponge: ['#5e76c8', '#c9d5ff'], cream: '#f4f7ff', frost: '#dfe7ff', frost2: '#9db3f5', deco: 'blueberries' },
  matcha: { sponge: ['#6d9a52', '#c9e6a8'], cream: '#f6fff0', frost: '#dff0cc', frost2: '#a9cf86', deco: 'pearls' },
  lemon: { sponge: ['#e8c33c', '#fff3a8'], cream: '#fffde8', frost: '#fff6b8', frost2: '#f2d65c', deco: 'gold' },
  rainbow: { sponge: ['#8f6bff', '#ffb3d9'], cream: '#fff7ff', frost: '#e9dcff', frost2: '#ff9ccc', deco: 'hearts' },
  galaxy: { sponge: ['#2b2f7a', '#7a6cf0'], cream: '#d8d2ff', frost: '#3a3a96', frost2: '#8c7dff', deco: 'pearls' },
  caramel: { sponge: ['#b9762f', '#f0c27a'], cream: '#fff0d6', frost: '#e2a65a', frost2: '#8a5524', deco: 'choco' },
  floral: { sponge: ['#eba7c2', '#fff2e6'], cream: '#fffaf2', frost: '#ffe9ef', frost2: '#f4b5ca', deco: 'flowers' },
}
const CAPTIONS = ['Warming up the cake machine…', 'Conveyor brings the plate…', 'Baking the first sponge…', 'Spreading cream, stacking layer two…', 'Spreading cream, stacking layer three…', 'Coating with frosting…', 'Piping the rosettes…', 'Adding the decorations…', 'Placing the candle…', 'Lighting the flame — make a wish ✨']
const SCHEDULE = [0, 650, 1450, 2350, 3250, 4150, 5000, 6200, 7100, 7900]
const CX = 160, PLATE_Y = 246, LAYER_H = 42, CREAM_H = 6

/** Batter / cream pouring out of the nozzle: a stretching stream, falling blobs and a splat where it lands. */
function Stream({ c, to, d }: { c: string; to: number; d: number }) {
  const h = Math.max(10, to - 62)
  return <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ delay: d, duration: 1.15, times: [0, .08, .86, 1] }}>
    <motion.rect x={CX - 3.5} y={62} width={7} height={h} rx={3.5} fill={c} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: d, duration: .22, ease: 'easeIn' }} style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }} />
    <rect x={CX - 1.5} y={62} width={1.8} height={h} rx={1} fill="#fff" opacity=".45" />
    {[0, 1, 2].map(i => <circle key={i} className="drip" cx={CX} cy={62} r={4.6 - i} fill={c} style={{ ['--fall' as string]: `${h}px`, animationDelay: `${d + i * .13}s` } as CSSProperties} />)}
    <motion.ellipse cx={CX} cy={to} rx={10} ry={3} fill={c} initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: [0, 2.2, 1.4], opacity: [0, 1, 0] }} transition={{ delay: d + .2, duration: .5 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
  </motion.g>
}

function DecoShape({ type, x, y, i }: { type: Deco; x: number; y: number; i: number }) {
  const r = 5 + (i % 3)
  switch (type) {
    case 'berries': return <g transform={`translate(${x} ${y})`}><path d="M0 -9 C8 -9 10 0 0 9 C-10 0 -8 -9 0 -9Z" fill="#e0304f" /><path d="M-5 -9 L0 -13 L5 -9 L0 -7Z" fill="#3f8a4c" /><circle cx="-2" cy="-2" r=".9" fill="#ffd9a0" /><circle cx="2" cy="1" r=".9" fill="#ffd9a0" /></g>
    case 'choco': return <g transform={`translate(${x} ${y}) rotate(${i * 37 % 60 - 30})`}><rect x="-6" y="-3" width="12" height="6" rx="2" fill="#3b1a1e" /><rect x="-6" y="-3" width="12" height="2" rx="1" fill="#7b4a46" /></g>
    case 'gold': return i % 2 ? <path transform={`translate(${x} ${y})`} d="M0 -8 L2.4 -2.5 8 -2.4 3.6 1.4 5 7 0 3.8 -5 7 -3.6 1.4 -8 -2.4 -2.4 -2.5Z" fill="#f1c24f" stroke="#fff3b8" strokeWidth=".8" /> : <circle cx={x} cy={y} r={r - 1} fill="#f1c24f" stroke="#fff3b8" strokeWidth=".8" />
    case 'crumb': return i % 2 ? <path transform={`translate(${x} ${y})`} d="M0 5 C-5 1 -9 -2 -6 -6 C-4 -9 -1 -8 0 -5 C1 -8 4 -9 6 -6 C9 -2 5 1 0 5Z" fill="#fff6f2" stroke="#e9a3ad" strokeWidth=".8" /> : <circle cx={x} cy={y} r="3.2" fill="#b3223f" />
    case 'hearts': return <path transform={`translate(${x} ${y}) scale(${.85 + (i % 3) * .15})`} d="M0 6 C-5 2 -9 -1 -6 -5 C-4 -8 -1 -7 0 -4 C1 -7 4 -8 6 -5 C9 -1 5 2 0 6Z" fill={i % 2 ? '#ff5f9f' : '#ffd0e4'} stroke="#fff" strokeWidth=".6" />
    case 'pearls': return <g><circle cx={x} cy={y} r={r - 1} fill="#fffaf5" stroke="#e7c9d6" strokeWidth=".8" /><circle cx={x - 1.5} cy={y - 1.5} r="1.4" fill="#fff" /></g>
    case 'blueberries': return <g><circle cx={x} cy={y} r={r + 1} fill="#3a4aa8" /><circle cx={x - 1.5} cy={y - 2} r="1.6" fill="#8fa1ee" /><path d={`M${x - 2} ${y + 1} l2 -2 2 2 -2 1Z`} fill="#1f2a74" /></g>
    default: return <g transform={`translate(${x} ${y})`}>{[0, 72, 144, 216, 288].map(a => <ellipse key={a} cx="0" cy="-4.2" rx="2.8" ry="4" transform={`rotate(${a})`} fill={i % 2 ? '#ff9cc0' : '#ffd6e6'} />)}<circle r="2" fill="#ffd45e" /></g>
  }
}

export default function CakeAssembly({ style = 'strawberry', age, wished, onWish, buzz }: { style?: string; age?: number; wished: boolean; onWish: () => void; buzz?: (p: number | number[]) => void }) {
  const cfg = STYLES[style] || STYLES.strawberry
  const digits = age && age >= 1 && age <= 99 ? String(Math.round(age)).split('') : null
  const uid = useId().replace(/:/g, '')
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const [stage, setStage] = useState(reduced ? 9 : 0)
  const [blowing, setBlowing] = useState(false)
  const buzzRef = useRef(buzz); buzzRef.current = buzz   // keep the assembly timeline independent of parent re-renders
  useEffect(() => {
    if (reduced) return
    const t = SCHEDULE.map((ms, i) => window.setTimeout(() => { setStage(i); if (i >= 2 && i <= 5) buzzRef.current?.(10) }, ms))
    return () => t.forEach(window.clearTimeout)
  }, [reduced])
  const widths = cfg.tiered ? [222, 170, 120] : [214, 162, 112]
  const layers = useMemo(() => widths.map((w, i) => ({ w, top: PLATE_Y - (i + 1) * LAYER_H - i * CREAM_H })), [cfg.tiered]) // eslint-disable-line react-hooks/exhaustive-deps
  const topY = layers[2].top
  const rimPts = useMemo(() => Array.from({ length: 11 }, (_, i) => { const a = Math.PI * (.08 + .84 * i / 10); const rx = widths[2] / 2 - 10; return { x: CX - Math.cos(a) * rx, y: topY + 3 + Math.sin(a) * 8 } }), [topY, cfg.tiered]) // eslint-disable-line react-hooks/exhaustive-deps
  const heartTop = (w: number, y: number) => { const k = w / 64; return <path transform={`translate(${CX} ${y}) scale(${k} ${k * .62})`} d="M0 12 C-7 5 -36 -4 -32 -17 C-29 -28 -9 -28 0 -14 C9 -28 29 -28 32 -17 C36 -4 7 5 0 12Z" fill={cfg.frost} /> }
  const spongeGrad = `sp-${uid}`, frostGrad = `fr-${uid}`
  const show = (n: number) => stage >= n
  const dropStyle: CSSProperties = { transformBox: 'fill-box', transformOrigin: '50% 100%' } // squash pivot at the base
  const dropAnim = (_top: number, d = 0) => ({ initial: { scaleY: 0, scaleX: .55 }, animate: { scaleY: [0, 1.16, .86, 1.07, .97, 1.01, 1], scaleX: [.55, .9, 1.12, .96, 1.03, .99, 1] }, transition: { duration: 1.05, delay: d + .25, times: [0, .3, .48, .64, .78, .9, 1], ease: 'easeOut' as const } })
  const sp = cfg.sponge[1]
  const streams = stage === 2 ? [{ c: sp, to: layers[0].top + 4, d: 0 }] : stage === 3 ? [{ c: cfg.cream, to: layers[0].top - CREAM_H, d: 0 }, { c: sp, to: layers[1].top + 4, d: .55 }] : stage === 4 ? [{ c: cfg.cream, to: layers[1].top - CREAM_H, d: 0 }, { c: sp, to: layers[2].top + 4, d: .55 }] : []
  const carriageX = stage <= 1 ? -96 : stage === 6 ? undefined : 0
  const sweepX = stage === 6 ? [-70, 70, -70, 0] : carriageX
  const ready = stage >= 9
  const [micOn, setMicOn] = useState(false)
  const [level, setLevel] = useState(0)
  const micRef = useRef<{ stop: () => void }>()
  useEffect(() => () => micRef.current?.stop(), [])
  const blow = () => { if (!ready || wished || blowing) return; setBlowing(true); sfx.blow(); buzz?.([12, 40, 12, 40, 12]); window.setTimeout(() => { onWish(); sfx.wish(); buzz?.([30, 40, 60]) }, 1000) }
  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx(); const an = ctx.createAnalyser(); an.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(an)
      const buf = new Uint8Array(an.fftSize); let raf = 0, hits = 0
      const stop = () => { cancelAnimationFrame(raf); stream.getTracks().forEach(tr => tr.stop()); void ctx.close(); setMicOn(false); setLevel(0) }
      micRef.current = { stop }; setMicOn(true)
      const loop = () => {
        an.getByteTimeDomainData(buf); let sum = 0
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v }
        const rms = Math.sqrt(sum / buf.length); setLevel(Math.min(1, rms * 4))
        hits = rms > .16 ? hits + 1 : Math.max(0, hits - 1)
        if (hits > 10) { stop(); blow(); return }
        raf = requestAnimationFrame(loop)
      }
      loop()
    } catch { setMicOn(false) }
  }
  return <div className={`cake-assembly ${blowing ? 'is-blowing' : ''}`} style={{ ['--blow' as string]: level } as CSSProperties}>

    {ready && !wished && <div className="cake-fx" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 9) * .35}s`, background: [cfg.frost2, cfg.sponge[1], '#ffd36e', '#ffffff'][i % 4] }} />)}</div>}
    <button type="button" className={`cake-stage-btn ${ready ? 'ready' : ''} ${wished ? 'wished' : ''}`} onClick={blow} disabled={!ready || wished || blowing} aria-label={ready ? 'Tap the candle to make a wish' : 'The cake is being assembled'}>
      <svg viewBox="0 0 320 290" className="cake-svg" role="img" aria-label="A birthday cake being assembled by a machine">
        <defs>
          <linearGradient id={spongeGrad} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={cfg.sponge[0]} /><stop offset=".5" stopColor={cfg.sponge[1]} /><stop offset="1" stopColor={cfg.sponge[0]} /></linearGradient>
          <linearGradient id={frostGrad} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={cfg.frost2} /><stop offset=".5" stopColor={cfg.frost} /><stop offset="1" stopColor={cfg.frost2} /></linearGradient>
          <linearGradient id={`sh-${uid}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#000" stopOpacity=".26" /><stop offset=".18" stopColor="#000" stopOpacity="0" /><stop offset=".34" stopColor="#fff" stopOpacity=".26" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".34" /></linearGradient>
          <linearGradient id={`gold-${uid}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#b8862b" /><stop offset=".35" stopColor="#ffe9a6" /><stop offset=".6" stopColor="#e9bd5a" /><stop offset="1" stopColor="#a87722" /></linearGradient>
          <radialGradient id={`glow-${uid}`} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffd98a" stopOpacity=".55" /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient>
          <pattern id={`st-${uid}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="4" height="8" fill="#fff" /><rect x="4" width="4" height="8" fill="#a68dff" /></pattern>
        </defs>
        {/* machine frame */}
        <motion.g initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}>
          <rect x="10" y="22" width="12" height="236" rx="5" className="mc-post" /><rect x="298" y="22" width="12" height="236" rx="5" className="mc-post" />
          <rect x="6" y="14" width="308" height="16" rx="8" className="mc-rail" />
          {[28, 44, 60].map(y => <circle key={y} cx={16} cy={y + 30} r="2" className="mc-rivet" />)}
          <circle cx="288" cy="22" r="3" className={`mc-light ${stage >= 1 && !ready ? 'busy' : ''}`} /><circle cx="274" cy="22" r="3" className={`mc-light g ${ready ? 'busy' : ''}`} />
        </motion.g>
        {/* conveyor belt + plate */}
        <g><rect x="24" y="258" width="272" height="14" rx="7" className="mc-belt" /><rect x="30" y="262" width="260" height="3" rx="1.5" className={`mc-belt-lines ${stage >= 1 && stage < 3 ? 'moving' : ''}`} /><circle cx="36" cy="265" r="8" className="mc-wheel" /><circle cx="284" cy="265" r="8" className="mc-wheel" /></g>
        <motion.g initial={{ x: -230 }} animate={{ x: show(1) ? 0 : -230 }} transition={{ type: 'spring', stiffness: 60, damping: 15 }}>
          <ellipse cx={CX} cy={PLATE_Y + 8} rx="124" ry="13" fill="#0003" /><ellipse cx={CX} cy={PLATE_Y + 6} rx="118" ry="13" fill={`url(#gold-${uid})`} /><ellipse cx={CX} cy={PLATE_Y + 6} rx="112" ry="12" fill="#ecd2e3" /><ellipse cx={CX} cy={PLATE_Y + 3} rx="112" ry="11" fill="url(#plate)" stroke="#fff" strokeOpacity=".5" />
          <defs><linearGradient id="plate" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff7fb" /><stop offset="1" stopColor="#d3adc8" /></linearGradient></defs>
        </motion.g>
        {/* sponge layers + cream */}
        {show(2) && <motion.g key="l1" style={dropStyle} {...dropAnim(layers[0].top)}><rect x={CX - layers[0].w / 2} y={layers[0].top} width={layers[0].w} height={LAYER_H} rx="9" fill={`url(#${spongeGrad})`} /><rect x={CX - layers[0].w / 2} y={layers[0].top} width={layers[0].w} height={LAYER_H} rx="9" fill={`url(#sh-${uid})`} /><rect x={CX - layers[0].w / 2} y={layers[0].top + LAYER_H - 11} width={layers[0].w} height="6" fill={`url(#gold-${uid})`} opacity=".95" />{Array.from({ length: 9 }, (_, k) => <circle key={k} cx={CX - layers[0].w / 2 + 14 + k * ((layers[0].w - 28) / 8)} cy={layers[0].top + LAYER_H - 17} r="2.2" fill="#fffaf5" stroke="#e2c6d2" strokeWidth=".6" />)}<rect x={CX - layers[0].w / 2 + 6} y={layers[0].top + 6} width={layers[0].w - 12} height="3" rx="1.5" fill="#fff" opacity=".22" /></motion.g>}
        {show(3) && <><motion.rect key="c1" x={CX - layers[0].w / 2 + 3} y={layers[0].top - CREAM_H} width={layers[0].w - 6} height={CREAM_H + 1} rx="3" fill={cfg.cream} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: .6, ease: 'easeOut' }} style={{ transformBox: 'fill-box', transformOrigin: '0% 50%' }} />
          <motion.g key="l2" style={dropStyle} {...dropAnim(layers[1].top, .55)}><rect x={CX - layers[1].w / 2} y={layers[1].top} width={layers[1].w} height={LAYER_H} rx="9" fill={`url(#${spongeGrad})`} /><rect x={CX - layers[1].w / 2} y={layers[1].top} width={layers[1].w} height={LAYER_H} rx="9" fill={`url(#sh-${uid})`} /><rect x={CX - layers[1].w / 2} y={layers[1].top + LAYER_H - 11} width={layers[1].w} height="6" fill={`url(#gold-${uid})`} opacity=".95" />{Array.from({ length: 9 }, (_, k) => <circle key={k} cx={CX - layers[1].w / 2 + 14 + k * ((layers[1].w - 28) / 8)} cy={layers[1].top + LAYER_H - 17} r="2.2" fill="#fffaf5" stroke="#e2c6d2" strokeWidth=".6" />)}<rect x={CX - layers[1].w / 2 + 6} y={layers[1].top + 6} width={layers[1].w - 12} height="3" rx="1.5" fill="#fff" opacity=".22" /></motion.g></>}
        {show(4) && <><motion.rect key="c2" x={CX - layers[1].w / 2 + 3} y={layers[1].top - CREAM_H} width={layers[1].w - 6} height={CREAM_H + 1} rx="3" fill={cfg.cream} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: .6, ease: 'easeOut' }} style={{ transformBox: 'fill-box', transformOrigin: '100% 50%' }} />
          <motion.g key="l3" style={dropStyle} {...dropAnim(layers[2].top, .55)}><rect x={CX - layers[2].w / 2} y={layers[2].top} width={layers[2].w} height={LAYER_H} rx="9" fill={`url(#${spongeGrad})`} /><rect x={CX - layers[2].w / 2} y={layers[2].top} width={layers[2].w} height={LAYER_H} rx="9" fill={`url(#sh-${uid})`} /><rect x={CX - layers[2].w / 2} y={layers[2].top + LAYER_H - 11} width={layers[2].w} height="6" fill={`url(#gold-${uid})`} opacity=".95" />{Array.from({ length: 9 }, (_, k) => <circle key={k} cx={CX - layers[2].w / 2 + 14 + k * ((layers[2].w - 28) / 8)} cy={layers[2].top + LAYER_H - 17} r="2.2" fill="#fffaf5" stroke="#e2c6d2" strokeWidth=".6" />)}<rect x={CX - layers[2].w / 2 + 6} y={layers[2].top + 6} width={layers[2].w - 12} height="3" rx="1.5" fill="#fff" opacity=".22" /></motion.g></>}
        {/* frosting coat + drips */}
        {show(5) && <motion.g key="frost" initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ duration: 1, ease: 'easeOut' }} style={{ transformBox: 'fill-box', transformOrigin: '50% 0%' }}>
          {layers.map((l, i) => <g key={i}>
            {cfg.heart && i === 2 ? heartTop(l.w, l.top) : <ellipse cx={CX} cy={l.top + 1} rx={l.w / 2} ry="9" fill={`url(#${frostGrad})`} />}
            <path d={`M${CX - l.w / 2} ${l.top + 2} ${Array.from({ length: 8 }, (_, k) => { const x0 = CX - l.w / 2 + (l.w / 8) * k, x1 = x0 + l.w / 8; const dr = 7 + ((k * 7 + i * 3) % 5) * 4; return `L${x0 + 2} ${l.top + 2} Q${x0 + 2} ${l.top + dr + 6} ${(x0 + x1) / 2} ${l.top + dr + 6} Q${x1 - 2} ${l.top + dr + 6} ${x1 - 2} ${l.top + 2}` }).join(' ')} L${CX + l.w / 2} ${l.top + 2} L${CX + l.w / 2} ${l.top - 4} L${CX - l.w / 2} ${l.top - 4}Z`} fill={`url(#${frostGrad})`} opacity={i === 2 || cfg.tiered ? 1 : .0} />
          </g>)}
        </motion.g>}
        {/* piped rosettes on the rim + base beads */}
        {show(6) && rimPts.map((p, i) => <motion.g key={`r${i}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * .1, type: 'spring', stiffness: 260, damping: 14 }} style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}><circle cx={p.x} cy={p.y} r="5.5" fill={cfg.frost} stroke={cfg.frost2} strokeWidth="1.2" /><path d={`M${p.x - 3} ${p.y} Q${p.x} ${p.y - 4} ${p.x + 3} ${p.y}`} stroke={cfg.frost2} strokeWidth="1" fill="none" /></motion.g>)}
        {show(6) && layers.slice(0, 2).map((l, i) => <motion.g key={`b${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .4 + i * .3 }}>{Array.from({ length: 12 }, (_, k) => <circle key={k} cx={CX - l.w / 2 + 12 + k * ((l.w - 24) / 11)} cy={l.top + LAYER_H - 4} r="2.4" fill={cfg.frost} stroke={cfg.frost2} strokeWidth=".7" />)}</motion.g>)}
        {/* decorations */}
        {show(7) && rimPts.filter((_, i) => i % 2 === 0).map((p, i) => <motion.g key={`d${i}`} initial={{ scale: 0, y: -26, opacity: 0 }} animate={{ scale: 1, y: -7, opacity: 1 }} transition={{ delay: i * .14, type: 'spring', stiffness: 220, damping: 12 }} style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}><DecoShape type={cfg.deco} x={p.x} y={p.y} i={i} /></motion.g>)}
        {show(7) && layers.slice(0, 2).map((l, i) => [0, 1, 2, 3].map(k => <motion.g key={`s${i}${k}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: .5 + k * .1 + i * .2, type: 'spring' }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}><DecoShape type={cfg.deco} x={CX - l.w / 2 + 28 + k * ((l.w - 56) / 3)} y={l.top + 22} i={k + i} /></motion.g>))}
        {/* candle */}
        {show(8) && !digits && <motion.g key="candle" initial={{ y: 34, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 13 }}>
          <rect x={CX - 5} y={topY - 46} width="10" height="46" rx="3" fill={`url(#st-${uid})`} stroke="#fff" strokeOpacity=".6" /><rect x={CX - 5} y={topY - 46} width="10" height="5" rx="2.5" fill="#fff" opacity=".7" /><path d={`M${CX} ${topY - 46} L${CX} ${topY - 51}`} stroke="#3a2a30" strokeWidth="1.6" />
        </motion.g>}
        {show(9) && !wished && !digits && <motion.g className={`cake-flame ${blowing ? 'blowing' : ''}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }} style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
          <circle cx={CX} cy={topY - 64} r="34" fill={`url(#glow-${uid})`} className="flame-glow" /><ellipse cx={CX} cy={topY - 64} rx="14" ry="18" fill="#ffd27a" opacity=".22" /><path d={`M${CX} ${topY - 79} C${CX + 8} ${topY - 68} ${CX + 7} ${topY - 56} ${CX} ${topY - 52} C${CX - 7} ${topY - 56} ${CX - 8} ${topY - 68} ${CX} ${topY - 79}Z`} fill="#ffb93d" /><path d={`M${CX} ${topY - 71} C${CX + 4} ${topY - 65} ${CX + 3} ${topY - 58} ${CX} ${topY - 55} C${CX - 3} ${topY - 58} ${CX - 4} ${topY - 65} ${CX} ${topY - 71}Z`} fill="#fff4c2" />
        </motion.g>}
        {digits && show(8) && <motion.g key="numcandles" initial={{ y: 34, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 13 }}>
          {digits.map((dg, i) => { const nx = CX + (i - (digits.length - 1) / 2) * 42; return <g key={i}>
            <text x={nx} y={topY - 2} textAnchor="middle" fontSize="64" fontWeight="800" fontFamily="Fredoka, sans-serif" fill={`url(#st-${uid})`} stroke="#fff" strokeOpacity=".75" strokeWidth="2.6" paintOrder="stroke">{dg}</text>
            <path d={`M${nx} ${topY - 56} L${nx} ${topY - 62}`} stroke="#3a2a30" strokeWidth="1.6" />
            {show(9) && !wished && <motion.g className={`cake-flame ${blowing ? 'blowing' : ''}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 10, delay: i * .12 }} style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
              <circle cx={nx} cy={topY - 72} r="24" fill={`url(#glow-${uid})`} className="flame-glow" /><path d={`M${nx} ${topY - 86} C${nx + 6} ${topY - 77} ${nx + 5} ${topY - 67} ${nx} ${topY - 63} C${nx - 5} ${topY - 67} ${nx - 6} ${topY - 77} ${nx} ${topY - 86}Z`} fill="#ffb93d" /><path d={`M${nx} ${topY - 80} C${nx + 3} ${topY - 75} ${nx + 2.5} ${topY - 69} ${nx} ${topY - 66} C${nx - 2.5} ${topY - 69} ${nx - 3} ${topY - 75} ${nx} ${topY - 80}Z`} fill="#fff3b8" /></motion.g>}
          </g> })}
        </motion.g>}
        {wished && <g className="cake-smoke"><path d={`M${CX} ${topY - 52} q10 -12 0 -22 q-10 -10 0 -22`} fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".5" /><path d={`M${CX} ${topY - 52} q-12 -10 -2 -24 q8 -10 -2 -20`} fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity=".4" /><path d={`M${CX} ${topY - 52} q-6 -10 0 -18 q6 -8 0 -16`} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".7" /></g>}
        {/* carriage + nozzle (drawn last so it sits in front of the gantry) */}
        <motion.g animate={{ x: sweepX }} transition={stage === 6 ? { duration: 3.4, ease: 'easeInOut' } : { type: 'spring', stiffness: 70, damping: 14 }}>
          <rect x={CX - 20} y="26" width="40" height="14" rx="5" className="mc-carriage" />
          <rect x={CX - 3} y="38" width="6" height={stage >= 2 && stage <= 5 ? 14 : 6} rx="2" className="mc-piston" />
          {stage >= 2 && stage <= 6 && <path d={`M${CX - 9} 40 L${CX + 9} 40 L${CX + 3} 62 L${CX - 3} 62Z`} className="mc-nozzle" />}
          {streams.map((s, i) => <Stream key={`${stage}-${i}`} {...s} />)}
        </motion.g>
      </svg>
    </button>
    {wished && <div className="wish-flash" aria-hidden="true" />}
    {wished && <div className="wish-burst" aria-hidden="true"><b className="wish-ring" /><b className="wish-ring r2" />{Array.from({ length: 22 }, (_, k) => <i key={k} className={`wb wb-${k % 4}`} style={{ ['--x' as string]: `${(k * 53 % 100) - 50}px`, ['--d' as string]: `${(k % 9) * .16}s`, ['--s' as string]: `${.7 + (k % 5) * .18}`, ['--t' as string]: `${2.6 + (k % 4) * .5}s` } as CSSProperties}>{['✦', '♡', '✧', '★'][k % 4]}</i>)}{[0, 1, 2].map(k => <span key={k} className="wish-lantern" style={{ ['--lx' as string]: `${(k - 1) * 72}px`, ['--ld' as string]: `${k * .5}s` } as CSSProperties} />)}</div>}
    <p className="cake-caption" role="status" aria-live="polite">{wished ? 'Wish sent into the universe ✨' : blowing ? 'Whoooosh… 🌬️' : CAPTIONS[Math.min(stage, 9)]}</p>
    <div className="cake-progress" aria-hidden="true"><span style={{ width: `${Math.min(100, (stage + 1) / 10 * 100)}%` }} /></div>
    {!ready && <button type="button" className="text-btn cake-skip" onClick={() => setStage(9)}>Skip assembly <SkipForward size={13} /></button>}
    {ready && !wished && <p className="cake-tap-hint"><Flame size={14} /> Tap the cake to blow out the candle</p>}
    {ready && !wished && !blowing && <button type="button" className="text-btn mic-blow" onClick={micOn ? undefined : startMic}>🎤 {micOn ? "Listening… blow into your mic!" : "Or really blow into your phone"}</button>}
  </div>
}
