/** Shrinks a photo in the browser so it is a few hundred KB instead of several MB. Videos are passed through untouched. */
export async function compressImage(file: File, maxSide = 1280, quality = 0.72): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => bad(new Error('Image could not be read.')); i.src = url })
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
    const c = document.createElement('canvas'); c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale)
    const ctx = c.getContext('2d'); if (!ctx) throw new Error('Image could not be processed.')
    ctx.drawImage(img, 0, 0, c.width, c.height)
    return c.toDataURL('image/jpeg', quality)
  } finally { URL.revokeObjectURL(url) }
}
export const readAsDataUrl = (file: Blob) => new Promise<string>((ok, bad) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => bad(new Error('This file could not be read.')); r.readAsDataURL(file) })
export const isDataUrl = (s?: string) => !!s && s.startsWith('data:')
export const approxBytes = (dataUrl: string) => Math.round(dataUrl.length * 0.75)
