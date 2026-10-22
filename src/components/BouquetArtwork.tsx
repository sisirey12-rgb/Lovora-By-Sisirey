import { useId, type ReactNode } from 'react'

type Props = { style?: string; compact?: boolean; opened?: boolean; label?: string }
type Kind = 'rose' | 'peony' | 'tulip' | 'sunflower' | 'orchid' | 'wild' | 'heart'
type Pal = { petals: [string, string, string]; center: string; paper: string; tissue: string; ribbon: string; leaf: string }

const PAL: Record<string, Pal> = {
  roses: { petals: ['#f08aa6', '#d83d68', '#a91f50'], center: '#f8d5a0', paper: '#f3d9c9', tissue: '#fbe9ee', ribbon: '#9b315e', leaf: '#47785b' },
  tulips: { petals: ['#ffb4d0', '#ed6c9e', '#c94579'], center: '#f7d9a4', paper: '#f5e5b8', tissue: '#fff4f8', ribbon: '#c65b86', leaf: '#4e805d' },
  sunflowers: { petals: ['#ffe18a', '#f4b62e', '#d78a20'], center: '#59382d', paper: '#e4d4b4', tissue: '#fff3d1', ribbon: '#936a43', leaf: '#4f7950' },
  orchids: { petals: ['#e7c9ff', '#b68be8', '#8860bd'], center: '#f3c65d', paper: '#eadcf4', tissue: '#f6eefc', ribbon: '#8061a9', leaf: '#39796e' },
  peonies: { petals: ['#ffc2d5', '#ed83ad', '#d95788'], center: '#f5c56e', paper: '#f7e2e9', tissue: '#fff0f5', ribbon: '#c65b86', leaf: '#4b805b' },
  wildflowers: { petals: ['#f8d6e7', '#f2a4c6', '#d8a7ef'], center: '#f6cb67', paper: '#d8e8cf', tissue: '#f4faee', ribbon: '#6d8c67', leaf: '#477d5a' },
  mixed: { petals: ['#ffb6c8', '#f6ce73', '#c9a6f7'], center: '#f5d49a', paper: '#e8d8c8', tissue: '#fdf1e6', ribbon: '#a85c7c', leaf: '#47785b' },
  heart: { petals: ['#ffabc9', '#ec669d', '#bf3877'], center: '#ffe2ee', paper: '#f8d8e6', tissue: '#fff0f6', ribbon: '#9c3e70', leaf: '#47785b' },
}
/** Fan layout (x, y, scale, rotation) shared by every style so the bouquet always reads as a hand-tied cluster. */
const FAN = [
  { x: 42, y: 66, s: .78, r: -14 }, { x: 76, y: 43, s: .9, r: -7 }, { x: 111, y: 31, s: 1.02, r: 1 }, { x: 147, y: 44, s: .92, r: 8 },
  { x: 179, y: 67, s: .78, r: 15 }, { x: 93, y: 71, s: .78, r: -3 }, { x: 129, y: 73, s: .72, r: 6 },
]
const KIND: Record<string, Kind[]> = {
  roses: Array(7).fill('rose'), peonies: Array(7).fill('peony'), tulips: Array(7).fill('tulip'), sunflowers: Array(5).fill('sunflower'),
  orchids: Array(7).fill('orchid'), wildflowers: Array(7).fill('wild'), heart: Array(6).fill('heart'),
  mixed: ['rose', 'wild', 'peony', 'orchid', 'tulip', 'rose', 'wild'],
}
const LEAVES = [
  { x: 60, y: 112, r: 200, s: 1.05 }, { x: 160, y: 110, r: -20, s: 1.05 }, { x: 88, y: 100, r: 235, s: .9 }, { x: 134, y: 100, r: -55, s: .9 },
  { x: 40, y: 94, r: 188, s: .78 }, { x: 182, y: 94, r: -8, s: .78 }, { x: 106, y: 96, r: -92, s: .8 },
]
const WRAP: Record<string, string> = {
  tulips: 'M42 108 Q110 139 178 107 L148 190 Q110 207 72 190Z',
  sunflowers: 'M43 112 L177 112 L143 192 Q110 204 77 192Z',
  orchids: 'M53 111 Q110 128 167 111 L151 187 Q110 202 69 187Z',
}
const WRAP_DEFAULT = 'M50 112 Q110 134 170 111 L145 190 Q110 204 75 190Z'

const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16)
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + (amt > 0 ? (255 - c) * amt : c * amt))))
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join('')}`
}
const ring = (n: number, rx: number, ry: number, cy: number, fill: string, rot = 0, edge = '#ffffff', key = '') =>
  Array.from({ length: n }, (_, i) => <ellipse key={`${key}${i}`} cx={0} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot + i * 360 / n})`} fill={fill} stroke={edge} strokeOpacity=".32" strokeWidth=".7" />)

/** One bloom, drawn around (0,0). The outer wrapper (position) lives in <Bloom>; this inner shape is what animates open. */
function Shape({ kind, c, pal }: { kind: Kind; c: string; pal: Pal }): ReactNode {
  const l = shade(c, .38), d = shade(c, -.28), dd = shade(c, -.5)
  switch (kind) {
    case 'rose': return <>
      {ring(5, 9.5, 12.5, -12, l, 0, d, 'a')}{ring(5, 8, 10.5, -9, c, 36, d, 'b')}{ring(4, 6.2, 8, -6, shade(c, -.12), 18, dd, 'c')}
      <circle r="7" fill={d} /><path d="M-5 1 C-4 -6 5 -6 5 -1 C5 3 -1 4 -2 0 C-2 -2 2 -2 2 0" fill="none" stroke={l} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M-13 -13 Q-5 -20 4 -17" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.6" strokeLinecap="round" />
    </>
    case 'peony': return <>
      {ring(8, 8.5, 11.5, -12, l, 0, d, 'a')}{ring(8, 7, 9.5, -9, c, 22, d, 'b')}{ring(6, 5.5, 7.5, -6, shade(c, -.14), 10, dd, 'c')}
      <circle r="4.6" fill={pal.center} />{Array.from({ length: 9 }, (_, i) => <circle key={i} cx={Math.cos(i * 2.4) * 3.3} cy={Math.sin(i * 2.4) * 3.3} r=".9" fill="#c98a2c" />)}
    </>
    case 'tulip': return <>
      <path d="M-15 7 C-23 -14 -13 -28 -3 -23 C0 -14 -2 -2 -5 9Z" fill={d} stroke="#ffffff40" strokeWidth=".8" />
      <path d="M15 7 C23 -14 13 -28 3 -23 C0 -14 2 -2 5 9Z" fill={d} stroke="#ffffff40" strokeWidth=".8" />
      <path d="M-11 9 C-18 -12 -6 -30 0 -33 C6 -30 18 -12 11 9 Q0 16 -11 9Z" fill={c} stroke="#ffffff55" strokeWidth="1" />
      <path d="M0 -29 Q3 -10 0 10" fill="none" stroke={l} strokeWidth="1.4" strokeOpacity=".8" /><path d="M-6 -22 Q-8 -8 -6 5M6 -22 Q8 -8 6 5" fill="none" stroke={l} strokeOpacity=".45" strokeWidth="1" />
    </>
    case 'sunflower': return <>
      {ring(14, 4.8, 13, -17, shade(c, -.14), 0, d, 'a')}{ring(14, 4.8, 12, -16, c, 12.9, d, 'b')}
      <circle r="12.5" fill="#6b4224" /><circle r="11" fill="#3d2418" />
      {Array.from({ length: 26 }, (_, i) => { const a = i * 2.4, r = 1.7 * Math.sqrt(i + 1) * 1.28; return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r="1" fill={i % 3 ? '#7a5236' : '#241510'} /> })}
    </>
    case 'orchid': return <>
      <ellipse cx="0" cy="-12" rx="8" ry="16" fill={l} stroke={d} strokeOpacity=".4" strokeWidth=".8" />
      <ellipse cx="-13" cy="1" rx="10" ry="15" transform="rotate(-48 -13 1)" fill={c} stroke={d} strokeOpacity=".4" strokeWidth=".8" />
      <ellipse cx="13" cy="1" rx="10" ry="15" transform="rotate(48 13 1)" fill={c} stroke={d} strokeOpacity=".4" strokeWidth=".8" />
      <ellipse cx="-8" cy="11" rx="9" ry="12" transform="rotate(26 -8 11)" fill={shade(c, .15)} /><ellipse cx="8" cy="11" rx="9" ry="12" transform="rotate(-26 8 11)" fill={shade(c, .15)} />
      <path d="M-6 4 Q0 -3 6 4 L4 14 Q0 19 -4 14Z" fill={pal.center} stroke={dd} strokeOpacity=".5" strokeWidth=".7" />
      <circle cx="-1.5" cy="8" r=".9" fill={d} /><circle cx="1.8" cy="10.5" r=".9" fill={d} /><circle cy="3" r="2.4" fill="#fff0bd" />
    </>
    case 'wild': return <>
      {ring(10, 3, 10.5, -10, '#fffafc', 0, d, 'a')}{ring(10, 2.6, 8.5, -8, l, 18, d, 'b')}
      <circle r="5.2" fill={pal.center} /><circle r="2.8" fill="#fff1b8" />
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={Math.cos(i * 1.05) * 3.4} cy={Math.sin(i * 1.05) * 3.4} r=".7" fill="#d99a2d" />)}
    </>
    default: return <>
      <path d="M0 16 C-5 10 -22 -1 -18 -14 C-15 -23 -3 -21 0 -12 C4 -22 16 -23 19 -13 C23 -2 7 11 0 16Z" fill={d} stroke="#fff8f4" strokeOpacity=".5" strokeWidth="1.2" />
      <path d="M0 11 C-4 7 -15 0 -12 -9 C-10 -15 -2 -14 0 -8 C3 -15 11 -15 13 -8 C16 0 5 7 0 11Z" fill={c} /><path d="M0 6 C-3 3 -8 -1 -6 -5 C-5 -8 -1 -7 0 -4 C2 -8 6 -8 7 -5 C8 -1 3 3 0 6Z" fill={l} />
      <path d="M-9 -12 Q-4 -17 2 -13" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1.8" strokeLinecap="round" />
    </>
  }
}
function Bloom({ i, x, y, s, r, kind, c, pal, shadow }: { i: number; x: number; y: number; s: number; r: number; kind: Kind; c: string; pal: Pal; shadow: string }) {
  return <g className="bq-flower" transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} filter={`url(#${shadow})`} style={{ ['--i' as string]: i } as React.CSSProperties}>
    <g><Shape kind={kind} c={c} pal={pal} /></g>
  </g>
}
function Leaf({ x, y, r, s, color }: { x: number; y: number; r: number; s: number; color: string }) {
  return <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M0 0 C7 -11 23 -12 33 0 C23 11 7 11 0 0Z" fill={color} stroke="#d6ebc9" strokeOpacity=".3" strokeWidth=".8" />
    <path d="M2 0 L30 0" stroke={shade(color, .35)} strokeWidth="1" strokeLinecap="round" /><path d="M10 0 L17 -5M10 0 L17 5M19 0 L25 -4M19 0 L25 4" stroke={shade(color, .3)} strokeOpacity=".7" strokeWidth=".8" fill="none" strokeLinecap="round" />
  </g>
}

export default function BouquetArtwork({ style = 'roses', compact = false, opened = false, label = 'A hand-arranged bouquet of flowers' }: Props) {
  const p = PAL[style] || PAL.roses
  const uid = useId().replace(/:/g, '')
  const kinds = KIND[style] || KIND.roses
  const blooms = kinds.map((kind, i) => {
    const slot = style === 'sunflowers' ? [FAN[0], FAN[1], FAN[2], FAN[3], FAN[4]][i] : FAN[i]
    const c = style === 'sunflowers' ? p.petals[1] : style === 'mixed' ? p.petals[i % 3] : p.petals[(i % 3 === 2 ? 1 : i % 3)]
    return { ...slot, kind, c: style === 'wildflowers' ? p.petals[(i + 1) % 3] : c }
  })
  return <svg className={`bouquet-artwork ${compact ? 'compact' : ''} ${opened ? 'is-opened' : ''}`} viewBox="0 0 220 220" role="img" aria-label={label} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`paper-${uid}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={p.paper} /><stop offset=".5" stopColor="#fff6ed" /><stop offset="1" stopColor={p.paper} /></linearGradient>
      <linearGradient id={`back-${uid}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={p.paper} stopOpacity=".75" /><stop offset="1" stopColor="#8c5b6b" stopOpacity=".7" /></linearGradient>
      <linearGradient id={`tissue-${uid}`} x1="0" y1="0" x2="0" y2="1"><stop stopColor={p.tissue} /><stop offset="1" stopColor={shade(p.tissue, -.12)} /></linearGradient>
      <linearGradient id={`ribbon-${uid}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={p.ribbon} /><stop offset=".55" stopColor="#f5b3cf" /><stop offset="1" stopColor={p.ribbon} /></linearGradient>
      <filter id={`shadow-${uid}`} x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="1.7" floodColor="#3a1c31" floodOpacity=".26" /></filter>
    </defs>
    <ellipse cx="110" cy="201" rx="66" ry="8" fill="#120a19" opacity=".2" />
    {/* stems */}
    <g stroke={p.leaf} strokeLinecap="round" fill="none">
      <path d="M111 74 Q104 126 100 176" strokeWidth="3" /><path d="M76 78 Q93 125 106 176" strokeWidth="2.7" /><path d="M147 80 Q124 127 113 176" strokeWidth="3" />
      <path d="M44 99 Q81 130 109 178" strokeWidth="2.2" /><path d="M176 101 Q142 135 115 178" strokeWidth="2.4" /><path d="M93 100 Q99 137 109 177" strokeWidth="2.3" />
    </g>
    {/* leaves + baby's-breath filler behind the blooms */}
    {LEAVES.map((lf, i) => <Leaf key={i} {...lf} color={i % 2 ? shade(p.leaf, .12) : p.leaf} />)}
    <g stroke="#e9f2e0" strokeWidth=".9" fill="none" strokeLinecap="round" opacity=".9">
      {[[58, 78, 46, 52], [168, 82, 182, 56], [128, 64, 140, 30], [86, 62, 78, 28]].map(([x1, y1, x2, y2], i) => <g key={i}><path d={`M${x1} ${y1} Q${(x1 + x2) / 2 + 4} ${(y1 + y2) / 2} ${x2} ${y2}`} />{[0, .35, .7, 1].map((t, k) => <circle key={k} cx={x2 + (x1 - x2) * t * .25 + (k % 2 ? 3 : -3)} cy={y2 + (y1 - y2) * t * .25} r="2" fill="#fffaf5" stroke="none" />)}</g>)}
    </g>
    {/* back paper */}
    <g className="bq-paper-back"><path d="M32 95 L111 128 L188 94 L152 186 L76 186Z" fill={`url(#back-${uid})`} stroke="#ffffff70" strokeWidth="1.1" /><path d="M34 95 L82 113 L77 186Z" fill={p.paper} opacity=".72" /><path d="M188 94 L141 116 L152 186Z" fill="#fffaf4" opacity=".65" /></g>
    {blooms.map((b, i) => <Bloom key={i} i={i} x={b.x} y={b.y} s={b.s} r={b.r} kind={b.kind} c={b.c} pal={p} shadow={`shadow-${uid}`} />)}
    {/* tissue layer peeking from the wrap */}
    <path d="M44 113 Q78 128 110 124 Q142 128 176 112 L160 150 Q110 146 60 150Z" fill={`url(#tissue-${uid})`} stroke="#ffffff90" strokeWidth="1" opacity=".96" />
    <path d="M60 120 L66 140M84 124 L88 144M110 125 L110 146M136 124 L132 144M160 120 L154 140" stroke={shade(p.tissue, -.2)} strokeOpacity=".5" strokeWidth=".9" fill="none" />
    {/* front wrapping paper */}
    <g className={`bq-paper-front wrap-${style}`}>
      <path d={WRAP[style] || WRAP_DEFAULT} fill={`url(#paper-${uid})`} stroke="#fff8f1" strokeWidth="1.3" transform="translate(0 6)" />
      <path d="M50 118 Q78 143 110 143 L75 196Z" fill="#ffffff50" /><path d="M170 117 Q143 142 110 143 L145 196Z" fill="#a66b8050" />
      <path d="M110 143 L110 203M92 140 L84 198M128 140 L136 198" stroke="#8c5b6b" strokeOpacity=".22" strokeWidth="1" fill="none" />
      <path d="M57 125 Q109 150 163 125" fill="none" stroke="#ffffffb0" strokeWidth="1.4" /><path d="M79 194 Q110 202 141 194" fill="none" stroke="#ffffff80" strokeWidth="1.2" />
      {[72, 88, 104, 120, 136, 150].map((x, i) => <path key={i} transform={`translate(${x} ${178 + (i % 2) * 5}) scale(.5)`} d="M0 6 C-5 2 -9 -1 -6 -5 C-4 -8 -1 -7 0 -4 C1 -7 4 -8 6 -5 C9 -1 5 2 0 6Z" fill={p.ribbon} opacity=".28" />)}
    </g>
    {/* ribbon band + bow */}
    <g className="bq-ribbon">
      <path d="M72 158 Q110 172 148 158 L146 168 Q110 182 74 168Z" fill={`url(#ribbon-${uid})`} stroke="#ffffff70" strokeWidth=".8" />
      <path d="M103 163 C78 142 70 163 94 172 L108 167Z" fill={`url(#ribbon-${uid})`} stroke="#ffffff70" /><path d="M117 163 C142 142 150 163 126 172 L112 167Z" fill={`url(#ribbon-${uid})`} stroke="#ffffff70" />
      <path d="M95 160 Q86 154 82 160M125 160 Q134 154 138 160" fill="none" stroke="#ffffff90" strokeWidth=".9" />
      <path d="M104 168 L90 192 L109 184 L113 171Z" fill={p.ribbon} /><path d="M116 168 L132 192 L113 184 L109 171Z" fill={shade(p.ribbon, -.15)} />
      <ellipse cx="110" cy="166" rx="7.5" ry="6.5" fill={p.ribbon} stroke="#ffffff8a" strokeWidth="1" /><path d="M106 164 Q110 161 114 164" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1" />
    </g>
    {opened && <g className="bq-sparkles" fill="#ffe5a5"><path d="M28 60 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3Z" /><path d="M190 43 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2Z" /><circle cx="183" cy="81" r="2.5" /><circle cx="37" cy="125" r="2" /><circle cx="110" cy="12" r="2.2" /></g>}
  </svg>
}
