/** Printable QR gift cards. Needs the `qrcode` package. Draws rounded QR dots, a centre badge, five designs and three print sizes. */
export type CardDesign = 'rose' | 'mango' | 'night' | 'mint' | 'mono'
export type CardFormat = 'card' | 'tag' | 'sticker'
export type CardOptions = { url: string; recipient: string; sender: string; occasion: string; design: CardDesign; format: CardFormat; line: string; revealDate?: string; showSender: boolean; showDate: boolean }

export const DESIGNS: Record<CardDesign, { name: string; bg: [string, string]; ink: string; accent: string; qr: string; soft: string }> = {
  rose: { name: 'Rose', bg: ['#fff3f8', '#ffd9ea'], ink: '#2a1038', accent: '#e0679a', qr: '#2a1038', soft: '#8a6f93' },
  mango: { name: 'Mango', bg: ['#fff8ee', '#ffe2b8'], ink: '#2b1a12', accent: '#ff5a3c', qr: '#2b1a12', soft: '#8a6a55' },
  night: { name: 'Midnight', bg: ['#2a1250', '#12081f'], ink: '#fff3e6', accent: '#ffc857', qr: '#1a0b2e', soft: '#cdb8ea' },
  mint: { name: 'Mint', bg: ['#effcf8', '#bdeedd'], ink: '#06302b', accent: '#0fb5a4', qr: '#06302b', soft: '#4d8077' },
  mono: { name: 'Minimal', bg: ['#ffffff', '#f1f1f1'], ink: '#111111', accent: '#111111', qr: '#111111', soft: '#666666' },
}
export const FORMATS: Record<CardFormat, { name: string; w: number; h: number; mm: [number, number]; hint: string }> = {
  card: { name: 'Gift card', w: 1200, h: 1700, mm: [105, 148], hint: 'A6, tuck it into a real gift' },
  tag: { name: 'Gift tag', w: 900, h: 1400, mm: [60, 93], hint: 'With a hole for string' },
  sticker: { name: 'Sticker', w: 1200, h: 1200, mm: [70, 70], hint: 'Round, for boxes and bags' },
}
const EMOJI: Record<string, string> = { Birthday: '🎂', Anniversary: '💞', 'Love letter': '💌' }
const FONT = 'DM Sans, system-ui, sans-serif'

type Mods = { size: number; get: (r: number, c: number) => number }
function roundRect(x: CanvasRenderingContext2D, px: number, py: number, w: number, h: number, r: number) { x.beginPath(); x.roundRect(px, py, w, h, r); x.fill() }

/** Draws the QR with rounded modules, rounded finder eyes and a badge in the middle (error correction H keeps it scannable). */
async function drawQr(x: CanvasRenderingContext2D, url: string, px: number, py: number, size: number, dark: string, badge: string, badgeBg: string) {
  const QR = await import('qrcode')
  const m = (QR.create(url, { errorCorrectionLevel: 'H' }).modules as unknown) as Mods
  const quiet = 2, n = m.size, cell = size / (n + quiet * 2), o = px + quiet * cell, oy = py + quiet * cell
  x.fillStyle = '#ffffff'; roundRect(x, px, py, size, size, cell * 2.2)
  x.shadowBlur = 0; x.shadowColor = 'transparent'   // the soft shadow belongs to the white panel only: shadows on every dot would blur the code
  const inEye = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)
  const mid = n / 2, hole = n * 0.11   // centre badge area
  x.fillStyle = dark
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (!m.get(r, c) || inEye(r, c)) continue
    if (Math.abs(r + .5 - mid) < hole && Math.abs(c + .5 - mid) < hole) continue
    roundRect(x, o + c * cell + cell * .06, oy + r * cell + cell * .06, cell * .88, cell * .88, cell * .3)
  }
  const eye = (r0: number, c0: number) => {
    const ex = o + c0 * cell, ey = oy + r0 * cell
    x.fillStyle = dark; roundRect(x, ex, ey, cell * 7, cell * 7, cell * 2)
    x.fillStyle = '#ffffff'; roundRect(x, ex + cell, ey + cell, cell * 5, cell * 5, cell * 1.4)
    x.fillStyle = dark; roundRect(x, ex + cell * 2, ey + cell * 2, cell * 3, cell * 3, cell * .9)
  }
  eye(0, 0); eye(0, n - 7); eye(n - 7, 0)
  const cx = px + size / 2, cy = py + size / 2, br = cell * hole * 2 * .62
  x.fillStyle = badgeBg; x.beginPath(); x.arc(cx, cy, br, 0, Math.PI * 2); x.fill()
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `${br * 1.15}px serif`; x.fillStyle = '#000'; x.fillText(badge, cx, cy + br * .06); x.textBaseline = 'alphabetic'
}
function fit(x: CanvasRenderingContext2D, text: string, weight: number, start: number, maxW: number, min = 40) { let s = start; do { x.font = `${weight} ${s}px ${FONT}`; s -= 4 } while (x.measureText(text).width > maxW && s > min); }
function sparkle(x: CanvasRenderingContext2D, cx: number, cy: number, r: number) { x.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .3 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr) } x.closePath(); x.fill() }
const prettyDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })

export async function renderGiftCard(o: CardOptions): Promise<HTMLCanvasElement> {
  try { await document.fonts?.ready } catch { /* fonts are optional */ }
  const D = DESIGNS[o.design], F = FORMATS[o.format], W = F.w, H = F.h
  const c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d'); if (!x) return c
  const isRound = o.format === 'sticker'
  x.save()
  if (isRound) { x.beginPath(); x.arc(W / 2, H / 2, W / 2 - 6, 0, Math.PI * 2); x.clip() }
  const g = x.createLinearGradient(0, 0, W * .6, H); g.addColorStop(0, D.bg[0]); g.addColorStop(1, D.bg[1]); x.fillStyle = g; x.fillRect(0, 0, W, H)
  // a scatter of sparkles in the accent colour
  x.fillStyle = D.accent; x.globalAlpha = .16
  const spots = [[.12, .1, 40], [.88, .14, 56], [.08, .52, 34], [.93, .6, 44], [.15, .9, 52], [.84, .9, 38], [.5, .05, 28]]
  spots.forEach(([a, b, r]) => sparkle(x, W * a, H * b, r * (W / 1200)))
  x.globalAlpha = 1
  x.textAlign = 'center'
  const emoji = EMOJI[o.occasion] || '✨'
  const name = (o.recipient || 'You').trim()
  const small = o.line.trim() || 'Scan to open your surprise'
  const dateLine = o.showDate && o.revealDate ? `Opens ${prettyDate(o.revealDate)}` : ''
  const from = o.showSender && o.sender ? `with love, ${o.sender.slice(0, 26)}` : ''
  if (o.format === 'card') {
    x.strokeStyle = D.accent; x.lineWidth = 6; x.setLineDash([22, 16]); x.strokeRect(50, 50, W - 100, H - 100); x.setLineDash([])
    x.fillStyle = D.accent; x.font = `800 38px ${FONT}`; x.fillText('A LITTLE SURPRISE FOR', W / 2, 200)
    x.fillStyle = D.ink; fit(x, name, 800, 150, W - 200, 60); x.fillText(name, W / 2, 360)
    x.font = '110px serif'; x.fillText(emoji, W / 2, 520)
    x.shadowColor = 'rgba(0,0,0,.22)'; x.shadowBlur = 40; await drawQr(x, o.url, 220, 600, 760, D.qr, emoji, '#fff'); x.shadowBlur = 0
    x.fillStyle = D.ink; fit(x, small, 800, 54, W - 200, 34); x.fillText(small, W / 2, 1450)
    let y = 1520
    if (dateLine) { x.fillStyle = D.accent; x.font = `800 42px ${FONT}`; x.fillText(dateLine, W / 2, y); y += 66 }
    if (from) { x.fillStyle = D.soft; x.font = `500 40px ${FONT}`; x.fillText(from, W / 2, y); y += 60 }
    x.fillStyle = D.accent; x.font = `800 30px ${FONT}`; x.fillText('LOVORA MEOW BY SISIREY', W / 2, H - 70)
  } else if (o.format === 'tag') {
    x.strokeStyle = D.accent; x.lineWidth = 5; x.beginPath(); x.roundRect(30, 30, W - 60, H - 60, 50); x.stroke()
    x.fillStyle = D.bg[0]; x.beginPath(); x.arc(W / 2, 120, 34, 0, Math.PI * 2); x.fill(); x.strokeStyle = D.accent; x.lineWidth = 6; x.stroke()
    x.fillStyle = D.accent; x.font = `800 30px ${FONT}`; x.fillText('FOR', W / 2, 270)
    x.fillStyle = D.ink; fit(x, name, 800, 120, W - 160, 50); x.fillText(name, W / 2, 390)
    x.shadowColor = 'rgba(0,0,0,.2)'; x.shadowBlur = 30; await drawQr(x, o.url, 130, 450, 640, D.qr, emoji, '#fff'); x.shadowBlur = 0
    x.fillStyle = D.ink; fit(x, small, 800, 46, W - 140, 28); x.fillText(small, W / 2, 1180)
    let y = 1240
    if (dateLine) { x.fillStyle = D.accent; x.font = `800 36px ${FONT}`; x.fillText(dateLine, W / 2, y); y += 54 }
    if (from) { x.fillStyle = D.soft; x.font = `500 34px ${FONT}`; x.fillText(from, W / 2, y) }
  } else {
    x.strokeStyle = D.accent; x.lineWidth = 8; x.beginPath(); x.arc(W / 2, H / 2, W / 2 - 40, 0, Math.PI * 2); x.stroke()
    x.fillStyle = D.accent; x.font = `800 34px ${FONT}`; x.fillText(`FOR ${name.toUpperCase().slice(0, 18)}`, W / 2, 170)
    x.shadowColor = 'rgba(0,0,0,.2)'; x.shadowBlur = 30; await drawQr(x, o.url, 270, 235, 660, D.qr, emoji, '#fff'); x.shadowBlur = 0
    x.fillStyle = D.ink; fit(x, small, 800, 46, 700, 28); x.fillText(small, W / 2, 1010)
    x.fillStyle = D.soft; x.font = `700 34px ${FONT}`; x.fillText(dateLine || (from || 'Lovora Meow'), W / 2, 1075)
  }
  x.restore()
  return c
}

export const downloadCanvas = async (c: HTMLCanvasElement, name = 'gift-card.png') => {
  const blob: Blob | null = await new Promise(r => c.toBlob(r, 'image/png')); if (!blob) return
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}
/** Opens the print dialog with the card at its real paper size. */
export function printCanvas(c: HTMLCanvasElement, format: CardFormat) {
  const [w, h] = FORMATS[format].mm
  const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0'
  document.body.appendChild(f)
  const d = f.contentWindow?.document; if (!d) { f.remove(); return false }
  d.open(); d.write(`<!doctype html><html><head><title>Lovora gift card</title><style>@page{size:${w}mm ${h}mm;margin:0}html,body{margin:0;padding:0}img{display:block;width:${w}mm;height:${h}mm}</style></head><body><img src="${c.toDataURL('image/png')}"></body></html>`); d.close()
  const img = d.querySelector('img')
  const go = () => { try { f.contentWindow?.focus(); f.contentWindow?.print() } finally { window.setTimeout(() => f.remove(), 60000) } }
  if (img && !img.complete) img.onload = go; else go()
  return true
}
