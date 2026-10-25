/** Printable gift card (1200x1700) with a QR code that opens the surprise. Needs the `qrcode` package. */
export async function saveGiftCard(url: string, recipient: string, sender: string, occasion: string) {
  const QR = await import('qrcode')
  const qr = document.createElement('canvas'); await QR.toCanvas(qr, url, { width: 640, margin: 1, color: { dark: '#2a1038', light: '#ffffff' } })
  const W = 1200, H = 1700, c = document.createElement('canvas'); c.width = W; c.height = H
  const x = c.getContext('2d'); if (!x) return
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#fff3f8'); g.addColorStop(1, '#ffe0ef'); x.fillStyle = g; x.fillRect(0, 0, W, H)
  x.strokeStyle = '#e0679a'; x.lineWidth = 6; x.setLineDash([22, 16]); x.strokeRect(50, 50, W - 100, H - 100); x.setLineDash([])
  x.textAlign = 'center'; x.fillStyle = '#e0679a'; x.font = '700 40px DM Sans, sans-serif'; x.fillText('A LITTLE SURPRISE FOR', W / 2, 220)
  x.fillStyle = '#2a1038'; let s = 150; do { x.font = `800 ${s}px DM Sans, sans-serif`; s -= 6 } while (x.measureText(recipient || 'You').width > W - 200 && s > 50); x.fillText(recipient || 'You', W / 2, 390)
  x.font = '120px serif'; x.fillText(({ Birthday: '🎂', Anniversary: '💞', 'Love letter': '💌' } as Record<string, string>)[occasion] || '✨', W / 2, 560)
  x.fillStyle = '#fff'; x.shadowColor = 'rgba(120,40,90,.25)'; x.shadowBlur = 40; x.beginPath(); x.roundRect(230, 640, 740, 740, 40); x.fill(); x.shadowBlur = 0; x.drawImage(qr, 280, 690, 640, 640)
  x.fillStyle = '#2a1038'; x.font = '700 48px DM Sans, sans-serif'; x.fillText('Scan with your camera to open', W / 2, 1470)
  if (sender) { x.fillStyle = '#8a6f93'; x.font = '500 42px DM Sans, sans-serif'; x.fillText(`with love, ${sender.slice(0, 28)}`, W / 2, 1550) }
  x.fillStyle = '#e0679a'; x.font = '700 32px DM Sans, sans-serif'; x.fillText('Lovora Meow by Sisirey', W / 2, 1625)
  const blob: Blob | null = await new Promise(r => c.toBlob(r, 'image/png')); if (!blob) return
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'gift-card.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}
