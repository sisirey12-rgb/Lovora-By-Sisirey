import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Flame } from 'lucide-react'
import { sfx } from '../../lib/sfx'
import { createCakeSim } from '../../lib/cakeSim'

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
  tiramisu: { sponge: ['#7a4e34', '#e6c9a0'], cream: '#fff4e2', frost: '#efd9b4', frost2: '#5a3524', deco: 'choco' },
  oreo: { sponge: ['#2b2326', '#8c8085'], cream: '#fffdfb', frost: '#f6f1ee', frost2: '#4a3e42', deco: 'crumb' },
  mango: { sponge: ['#f2a526', '#ffe08a'], cream: '#fff9e6', frost: '#ffd978', frost2: '#f08a1e', deco: 'gold' },
  lavender: { sponge: ['#a78bdc', '#e8dcff'], cream: '#fbf8ff', frost: '#e2d4fa', frost2: '#b99bf0', deco: 'pearls' },
  pistachio: { sponge: ['#8fbf7a', '#e3f2c9'], cream: '#fbfff4', frost: '#cfe8b3', frost2: '#f1a9c0', deco: 'flowers' },
  cherry: { sponge: ['#3d1a20', '#9c3a4a'], cream: '#fff3f1', frost: '#fbe3e1', frost2: '#c91f45', deco: 'hearts' },
  cotton: { sponge: ['#ffb3d9', '#bfe3ff'], cream: '#ffffff', frost: '#ffd9ee', frost2: '#a9d8ff', deco: 'pearls' },
  midnight: { sponge: ['#16152e', '#4a3f86'], cream: '#efe6c4', frost: '#232248', frost2: '#e5b85c', deco: 'gold', tiered: true },
  coconut: { sponge: ['#f4ead9', '#fffaf0'], cream: '#ffffff', frost: '#ffffff', frost2: '#e9dcc4', deco: 'pearls' },
  'rose-gold': { sponge: ['#e6a99b', '#ffe3d6'], cream: '#fff7f2', frost: '#f6cfc2', frost2: '#d9a066', deco: 'gold', tiered: true },
  floral: { sponge: ['#eba7c2', '#fff2e6'], cream: '#fffaf2', frost: '#ffe9ef', frost2: '#f4b5ca', deco: 'flowers' },
}

const hash = (s: string) => { let h = 7; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h }

/** The cake is baked live on a canvas: batter and cream pour from a nozzle, rosettes and decorations drop and bounce, candles light. */
export default function CakeAssembly({ style = 'strawberry', age, wished, onWish, buzz }: { style?: string; age?: number; wished: boolean; onWish: () => void; buzz?: (p: number | number[]) => void }) {
  const cfg = STYLES[style] || STYLES.strawberry
  const cv = useRef<HTMLCanvasElement>(null), bar = useRef<HTMLSpanElement>(null)
  const live = useRef({ wished, blowAt: 0, level: 0 })
  live.current.wished = wished
  const [caption, setCaption] = useState('Setting the stand…')
  const [ready, setReady] = useState(false), [blowing, setBlowing] = useState(false), [micOn, setMicOn] = useState(false)
  const micRef = useRef<{ stop: () => void }>()
  const digits = age && age >= 1 && age <= 99

  useEffect(() => {
    const el = cv.current; if (!el) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    return createCakeSim(el, cfg, {
      age, seed: hash(style), reduced: !!reduced, get: () => live.current,
      onUpdate: u => { setCaption(u.caption); if (u.ready) setReady(true); if (bar.current) bar.current.style.width = `${u.progress}%` },
    })
  }, [style, age, cfg])
  useEffect(() => () => micRef.current?.stop(), [])

  const blow = () => {
    if (!ready || wished || blowing) return
    live.current.blowAt = performance.now(); setBlowing(true); sfx.blow(); buzz?.([12, 40, 12, 40, 12])
    window.setTimeout(() => { onWish(); sfx.wish(); buzz?.([30, 40, 60]) }, 1000)
  }
  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctx(), an = ctx.createAnalyser(); an.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(an)
      const buf = new Uint8Array(an.fftSize); let raf = 0, hits = 0
      const stop = () => { cancelAnimationFrame(raf); stream.getTracks().forEach(tr => tr.stop()); void ctx.close(); setMicOn(false); live.current.level = 0 }
      micRef.current = { stop }; setMicOn(true)
      const loop = () => {
        an.getByteTimeDomainData(buf); let sum = 0
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v }
        const rms = Math.sqrt(sum / buf.length); live.current.level = Math.min(1, rms * 4)
        hits = rms > .16 ? hits + 1 : Math.max(0, hits - 1)
        if (hits > 10) { stop(); blow(); return }
        raf = requestAnimationFrame(loop)
      }
      loop()
    } catch { setMicOn(false) }
  }

  return <div className="cake-assembly">
    <button type="button" className={`cake-stage-btn ${ready ? 'ready' : ''} ${wished ? 'wished' : ''}`} disabled={!ready || wished} onClick={blow} aria-label="Birthday cake. When the candle is lit, tap to blow it out.">
      <canvas ref={cv} className="cake-canvas" role="img" aria-label="A birthday cake being baked and decorated" />
    </button>
    {wished && <div className="wish-flash" aria-hidden="true" />}
    {wished && <div className="wish-burst" aria-hidden="true"><b className="wish-ring" /><b className="wish-ring r2" />{Array.from({ length: 22 }, (_, k) => <i key={k} className={`wb wb-${k % 4}`} style={{ ['--x' as string]: `${(k * 53 % 100) - 50}px`, ['--d' as string]: `${(k % 9) * .16}s`, ['--s' as string]: `${.7 + (k % 5) * .18}`, ['--t' as string]: `${2.6 + (k % 4) * .5}s` } as CSSProperties}>{['✦', '♡', '✧', '★'][k % 4]}</i>)}{[0, 1, 2].map(k => <span key={k} className="wish-lantern" style={{ ['--lx' as string]: `${(k - 1) * 72}px`, ['--ld' as string]: `${k * .5}s` } as CSSProperties} />)}</div>}
    <p className="cake-caption" role="status" aria-live="polite">{wished ? 'Wish sent into the universe ✨' : blowing ? 'Whoooosh… 🌬️' : ready ? 'Make a wish… ✨' : caption}</p>
    <div className="cake-progress" aria-hidden="true"><span ref={bar} /></div>
    {ready && !wished && <p className="cake-tap-hint"><Flame size={14} /> Tap the cake to blow out the candle{digits ? 's' : ''}</p>}
    {ready && !wished && !blowing && <button type="button" className="text-btn mic-blow" onClick={micOn ? undefined : startMic}>🎤 {micOn ? 'Listening… blow into your mic!' : 'Or really blow into your phone'}</button>}
  </div>
}
