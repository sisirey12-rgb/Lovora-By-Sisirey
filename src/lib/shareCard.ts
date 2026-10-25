const TITLE: Record<string, string> = { Birthday: 'A BIRTHDAY SURPRISE FOR', Anniversary: 'AN ANNIVERSARY SURPRISE FOR', 'Love letter': 'A LOVE LETTER FOR', 'Special surprise': 'A SPECIAL SURPRISE FOR' }
const EMOJI: Record<string, string> = { Birthday: '🎂', Anniversary: '💞', 'Love letter': '💌', 'Special surprise': '✨' }
const fit = (x: CanvasRenderingContext2D, t: string, max: number, size: number, weight = 800) => { let s = size; do { x.font = `${weight} ${s}px DM Sans, sans-serif`; s -= 4 } while (x.measureText(t).width > max && s > 44) }

/** Draws a 1080x1920 story card for the finale ("Opened by ...") and shares or downloads it as a PNG. */
export async function saveShareCard(name: string, sender: string, colors: string[], occasion = 'Birthday') {
  const W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d'); if (!x) return
  const c0 = colors[0] || '#ff8fc2', c1 = colors[1] || '#a68bff'
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#12082a'); g.addColorStop(.55, '#2a1050'); g.addColorStop(1, '#4a1450'); x.fillStyle = g; x.fillRect(0, 0, W, H)
  for (let i = 0; i < 26; i++) { const r = 40 + (i * 37) % 150, px = (i * 211) % W, py = (i * 397) % H; const rg = x.createRadialGradient(px, py, 0, px, py, r); rg.addColorStop(0, (i % 2 ? c0 : c1) + '55'); rg.addColorStop(1, 'transparent'); x.fillStyle = rg; x.fillRect(px - r, py - r, r * 2, r * 2) }
  for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(255,255,255,${.2 + (i % 5) * .12})`; x.beginPath(); x.arc((i * 149) % W, (i * 271) % H, 1.5 + (i % 3), 0, 6.3); x.fill() }
  colors.slice(0, 5).forEach((col, i) => { const cx = 150 + i * 195, cy = 360 + (i % 2) * 110; x.strokeStyle = 'rgba(255,255,255,.35)'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, cy + 100); x.quadraticCurveTo(cx + (i % 2 ? 30 : -30), cy + 260, W / 2, 620); x.stroke(); const bg = x.createRadialGradient(cx - 25, cy - 30, 8, cx, cy, 105); bg.addColorStop(0, '#fff'); bg.addColorStop(.25, col); bg.addColorStop(1, col + 'aa'); x.fillStyle = bg; x.beginPath(); x.ellipse(cx, cy, 80, 100, 0, 0, 6.3); x.fill() })
  x.textAlign = 'center'; x.fillStyle = '#ffd36e'; x.font = '700 38px DM Sans, sans-serif'; x.fillText(TITLE[occasion] || TITLE.Birthday, W / 2, 900)
  x.fillStyle = '#fff'; fit(x, name || 'You', W - 160, 170); x.shadowColor = c0; x.shadowBlur = 40; x.fillText(name || 'You', W / 2, 1090); x.shadowBlur = 0
  x.font = '150px serif'; x.fillText(EMOJI[occasion] || '✨', W / 2, 1320)
  x.fillStyle = '#fff'; x.font = '500 46px DM Sans, sans-serif'; if (sender) x.fillText(`from ${sender.slice(0, 24)}`, W / 2, 1450)
  x.fillStyle = 'rgba(255,255,255,.1)'; x.beginPath(); x.roundRect(160, 1560, W - 320, 130, 65); x.fill()
  x.fillStyle = '#fff'; x.font = '700 40px DM Sans, sans-serif'; x.fillText('Make one for someone you love', W / 2, 1640)
  x.fillStyle = '#ff8fc2'; x.font = '700 36px DM Sans, sans-serif'; x.fillText('Lovora Meow by Sisirey', W / 2, 1800)
  const blob: Blob | null = await new Promise(r => c.toBlob(r, 'image/png'))
  if (!blob) return
  const file = new File([blob], 'my-surprise.png', { type: 'image/png' })
  try { if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'I just opened a surprise' }); return } } catch { /* cancelled */ }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}
