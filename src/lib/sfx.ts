/**
 * Sound effects. Each effect first tries a hosted file (drop mp3s into /public/media/effects/ or point VITE_SFX_BASE at
 * your backend / Supabase Storage bucket); if the file is missing or blocked it falls back to a synthesized sound,
 * so the app is never silent and never needs a licence.
 *   blow.mp3, wish.mp3, pop-1..4.mp3, tap-boom.mp3, firecracker.mp3, type-tick.mp3, bow-release.mp3
 */
const BASE = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SFX_BASE || '/media/effects').replace(/\/$/, '')
let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = true
let packMul = 1, packVol = 1
const missing = new Set<string>()
const cache = new Map<string, HTMLAudioElement>()

const ac = () => {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!C) return null
    ctx = new C(); master = ctx.createGain(); master.gain.value = .9; master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => { /* needs gesture */ })
  return ctx
}
const noiseBuf = (c: AudioContext, sec: number) => { const b = c.createBuffer(1, Math.floor(c.sampleRate * sec), c.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b }
function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = .2, slideTo?: number) {
  const c = ac(); if (!c || !master) return
  const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + start
  freq *= packMul; if (slideTo) slideTo *= packMul; vol *= packVol
  o.type = type; o.frequency.setValueAtTime(freq, t); if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + .05)
}
function noise(start: number, dur: number, vol: number, filter: BiquadFilterType, f0: number, f1?: number, q = 1) {
  const c = ac(); if (!c || !master) return
  const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + start
  s.buffer = noiseBuf(c, dur + .05); fl.type = filter; fl.Q.value = q; fl.frequency.setValueAtTime(f0, t); if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur)
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(.04, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  s.connect(fl); fl.connect(g); g.connect(master); s.start(t); s.stop(t + dur + .05)
}
/** Plays hosted file if it exists, otherwise runs the synth fallback. */
function play(name: string, fallback: () => void, vol = .8) {
  if (!enabled) return
  if (missing.has(name)) { fallback(); return }
  let el = cache.get(name)
  if (!el) { el = new Audio(`${BASE}/${name}.mp3`); el.preload = 'auto'; el.addEventListener('error', () => missing.add(name)); cache.set(name, el) }
  const node = el.cloneNode(true) as HTMLAudioElement; node.volume = vol
  node.play().catch(() => { missing.add(name); fallback() })
  window.setTimeout(() => { try { node.pause() } catch { /* ignore */ } }, 3500)
}
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

export const sfx = {
  setEnabled(v: boolean) { enabled = v },
  /** each occasion has its own sound colour: Birthday bright, Anniversary warm, Love letter soft, Special sparkly */
  setPack(occasion: string) { const p: Record<string, [number, number]> = { Birthday: [1, 1], Anniversary: [.89, 1], 'Love letter': [.8, .75], 'Special surprise': [1.15, .95] }; [packMul, packVol] = p[occasion] || [1, 1] },
  unlock() { ac() },
  /** soft whoosh of breath → flame flutter */
  blow() { play('blow', () => { noise(0, 1.1, .5, 'bandpass', 700, 2400, .7); noise(.05, .9, .25, 'highpass', 3000); for (let i = 0; i < 5; i++) tone(180 - i * 12, i * .09, .08, 'triangle', .05) }) },
  /** twinkling ascending wish shimmer */
  wish() { play('wish', () => { [784, 988, 1175, 1568, 1976, 2349].forEach((f, i) => { tone(f, .25 + i * .11, .9, 'sine', .11); tone(f * 2, .27 + i * .11, .5, 'triangle', .035) }); noise(.2, 1.4, .06, 'highpass', 6000) }) },
  pop(variant = 0) {
    const v = variant % 4
    play(`pop-${v + 1}`, () => {
      if (v === 0) { noise(0, .12, .7, 'lowpass', 2600, 300); tone(240, 0, .1, 'sine', .3, 70) }
      else if (v === 1) { noise(0, .08, .5, 'highpass', 2000); [1200, 1600, 2100].forEach((f, i) => tone(f, i * .04, .22, 'sine', .12)) }
      else if (v === 2) { tone(520, 0, .18, 'triangle', .25, 140); noise(0, .1, .4, 'bandpass', 1400, 600) ; tone(880, .08, .25, 'sine', .08) }
      else { noise(0, .16, .6, 'lowpass', 1800, 200); tone(130, 0, .22, 'sine', .35, 50); [1500, 2000].forEach((f, i) => tone(f, .05 + i * .05, .2, 'sine', .08)) }
    }, .6)
  },
  tick() { play('type-tick', () => { tone(1900 + Math.random() * 300, 0, .03, 'square', .025) }, .3) },
  release() { play('bow-release', () => { noise(0, .18, .35, 'bandpass', 900, 3000, 2); tone(320, 0, .12, 'triangle', .2, 90) }) },
  boom(kind: 'firework' | 'crackers' | 'confetti' | 'love' | 'stars' = 'firework') {
    if (kind === 'crackers') return play('firecracker', () => { for (let i = 0; i < 9; i++) { noise(i * .07 + Math.random() * .03, .05, .6, 'highpass', 2500) } })
    if (kind === 'confetti') return play('tap-boom', () => { noise(0, .16, .55, 'bandpass', 900, 300); tone(160, 0, .18, 'sine', .3, 60); noise(.1, .5, .12, 'highpass', 5000) })
    if (kind === 'love') return play('tap-boom', () => { tone(523, 0, .35, 'sine', .15); tone(784, .12, .45, 'sine', .15); tone(1047, .24, .6, 'sine', .12) })
    if (kind === 'stars') return play('tap-boom', () => { [1568, 2093, 2637].forEach((f, i) => tone(f, i * .06, .4, 'sine', .08)); noise(0, .4, .06, 'highpass', 7000) })
    play('tap-boom', () => { tone(95, 0, .5, 'sine', .5, 38); noise(0, .45, .55, 'lowpass', 1800, 120); noise(.12, .7, .1, 'highpass', 4500) })
  },
  /** drum roll that builds while the gift shakes */
  drumroll() { play('drumroll', () => { for (let i = 0; i < 22; i++) { const t = i * .035; noise(t, .05, .12 + i * .015, 'bandpass', 220 + i * 14, undefined, 1.2); tone(110 + i * 3, t, .05, 'triangle', .05 + i * .004) } }, .7) },
  /** quick rising whoosh */
  whoosh() { play('whoosh', () => { noise(0, .5, .3, 'bandpass', 300, 4200, .8); tone(220, 0, .45, 'sine', .08, 880) }, .6) },
  /** lid pops off with a spring */
  lid() { play('lid', () => { tone(180, 0, .16, 'triangle', .3, 520); noise(0, .1, .35, 'highpass', 2500); tone(900, .1, .3, 'sine', .08) }) },
  /** bright magical chime, rising */
  chime() { play('chime', () => { [1047, 1319, 1568, 2093].forEach((f, i) => { tone(f, i * .08, 1, 'sine', .1); tone(f * 2, i * .08 + .02, .6, 'triangle', .03) }) }, .7) },
  /** happy fanfare */
  fanfare() { play('fanfare', () => { [[523, 0], [659, .12], [784, .24], [1047, .4], [784, .6], [1047, .72]].forEach(([f, t]) => { tone(f, t, .3, 'square', .06); tone(f / 2, t, .3, 'triangle', .09) }); noise(.4, .8, .08, 'highpass', 5000) }) },
  /** tiny sparkle for hovers and taps */
  sparkle() { play('sparkle', () => { [2400, 3100, 3800].forEach((f, i) => tone(f + Math.random() * 200, i * .04, .18, 'sine', .05)) }, .5) },
  /** soft whoosh + page turn between scenes */
  next() { play('next', () => { noise(0, .22, .18, 'bandpass', 800, 2600, 1); tone(660, .05, .16, 'sine', .06, 990) }, .5) },
  any() { return pick(['firework', 'crackers', 'confetti', 'love', 'stars'] as const) },
}
