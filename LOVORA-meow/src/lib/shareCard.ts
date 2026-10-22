/** Draws a 1080x1920 story card (name + brand) and shares or downloads it as a PNG. */
export async function saveShareCard(name: string, sender: string, colors: string[]) {
  const W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d'); if (!x) return
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#1a0c35'); g.addColorStop(1, colors[0] || '#7a2a6a'); x.fillStyle = g; x.fillRect(0, 0, W, H)
  colors.slice(0, 5).forEach((col, i) => { const cx = 140 + i * 200, cy = 420 + (i % 2) * 120; x.fillStyle = col; x.globalAlpha = .9; x.beginPath(); x.ellipse(cx, cy, 80, 100, 0, 0, 6.3); x.fill(); x.globalAlpha = .4; x.strokeStyle = '#fff'; x.beginPath(); x.moveTo(cx, cy + 100); x.lineTo(cx, cy + 260); x.stroke() })
  x.globalAlpha = 1; x.textAlign = 'center'; x.fillStyle = '#ffd36e'; x.font = '700 40px DM Sans, sans-serif'; x.fillText('A BIRTHDAY SURPRISE FOR', W / 2, 920)
  x.fillStyle = '#fff'; x.font = '800 150px DM Sans, sans-serif'; x.fillText(name.slice(0, 14) || 'You', W / 2, 1080)
  x.font = '120px serif'; x.fillText('🎂', W / 2, 1300)
  x.fillStyle = '#fff'; x.font = '500 44px DM Sans, sans-serif'; if (sender) x.fillText(`from ${sender.slice(0, 24)}`, W / 2, 1430)
  x.fillStyle = '#ff8fc2'; x.font = '700 40px DM Sans, sans-serif'; x.fillText('Lovora Meow by Sisirey', W / 2, 1780)
  const blob: Blob | null = await new Promise(r => c.toBlob(r, 'image/png'))
  if (!blob) return
  const file = new File([blob], 'birthday-surprise.png', { type: 'image/png' })
  try { if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'Birthday surprise' }); return } } catch { /* cancelled */ }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}
