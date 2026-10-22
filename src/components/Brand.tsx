import { Cat, Sparkles } from 'lucide-react'
import { BRAND } from '../config'
export default function Brand({ small = false }: { small?: boolean }) {
  return <a className={`brand ${small ? 'brand-small' : ''}`} href="/" aria-label={`${BRAND.name} home`}>
    <span className="brand-mark"><Cat size={small ? 18 : 22} strokeWidth={2} /><Sparkles className="brand-spark" size={12} /></span>
    <span><strong>LOVORA <i>MEOW</i></strong><small>by {BRAND.by}</small></span>
  </a>
}
