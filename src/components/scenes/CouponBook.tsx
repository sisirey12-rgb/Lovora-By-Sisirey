import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { defaultCoupons } from '../../data'
import { sfx } from '../../lib/sfx'

/** Tap a coupon to redeem it: it gets a heart stamp and a little buzz. */
export default function CouponBook({ coupons, colors, buzz, onDone }: { coupons?: string[]; colors: string[]; buzz: (p: number | number[]) => void; onDone: () => void }) {
  const list = (coupons || []).map(c => c.trim()).filter(Boolean)
  const items = list.length ? list : defaultCoupons
  const [used, setUsed] = useState<number[]>([])
  const redeem = (i: number) => { if (used.includes(i)) return; setUsed(u => [...u, i]); buzz([20, 30, 20]); try { sfx.pop(i % 3) } catch { /* sound unavailable */ } }
  return <div className="cpn-book">
    <p className="eyebrow">JUST FOR YOU</p><h1>Your coupon <em>book.</em></h1>
    <p className="muted">Tap a coupon to redeem it · {used.length}/{items.length}</p>
    <div className="cpn-grid">{items.map((c, i) => <button type="button" key={i} className={`cpn ${used.includes(i) ? 'used' : ''}`} onClick={() => redeem(i)} style={{ ['--c' as string]: colors[i % colors.length] || '#ff8fc2' } as React.CSSProperties} aria-pressed={used.includes(i)}>
      <span className="cpn-n">COUPON {String(i + 1).padStart(2, '0')}</span><strong>{c}</strong><small>{used.includes(i) ? 'Redeemed ♡' : 'Tap to redeem'}</small>{used.includes(i) && <i className="cpn-stamp">♡</i>}</button>)}</div>
    <button className="primary-btn" onClick={onDone}>Continue <ArrowRight size={17} /></button>
  </div>
}
