import { defaultCoupons } from '../data'

/** Creator tool: edit the coupons for the Coupon book scene (turn the scene on in the "Scenes" step). */
export default function CouponEditor({ value, onChange }: { value?: string[]; onChange: (v: string[]) => void }) {
  const list = value && value.length ? value : defaultCoupons
  const set = (i: number, t: string) => onChange(list.map((x, j) => (j === i ? t : x)))
  return <div className="note-card extras-card"><strong>🎟️ Coupon book</strong>
    <p className="muted">Little promises they can tap to redeem. Turn on the “Coupon book” scene in the Scenes step.</p>
    {list.map((c, i) => <div className="extras-row" key={i}><input value={c} maxLength={60} onChange={e => set(i, e.target.value)} aria-label={`Coupon ${i + 1}`} style={{ flex: 1 }} />
      <button type="button" className="icon-btn small" aria-label="Remove coupon" onClick={() => onChange(list.filter((_, j) => j !== i))}>×</button></div>)}
    {list.length < 6 && <button type="button" className="secondary-btn" onClick={() => onChange([...list, ''])}>+ Add a coupon</button>}
  </div>
}
