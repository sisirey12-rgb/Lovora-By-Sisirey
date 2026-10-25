import { BRAND } from '../config'
export default function Brand({ small = false }: { small?: boolean }) {
  return <a className={`brand ${small ? 'brand-small' : ''}`} href="/" aria-label={`${BRAND.name} home`}>
    <img className="brand-logo" src="/logo.png" alt="" width={small ? 32 : 42} height={small ? 32 : 42} />
    <span><strong>LOVORA <i>MEOW</i></strong><small>by <b className="by-yellow">{BRAND.by}</b></small></span>
  </a>
}
