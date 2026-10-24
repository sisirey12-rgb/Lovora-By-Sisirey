import type { Occasion, Relation } from '../types'

/**
 * A "world" is the surrounding of one occasion + one person: the opening scene, the floating decoration and the small
 * wording. Hearts, bows and arrows belong to partners only; everybody else gets their own opening and their own look.
 */
export type OpenerKind = 'bow' | 'fistbump' | 'butterfly' | 'bloom' | 'trophy' | 'popper'
export const openerFor = (relation?: Relation): OpenerKind => {
  switch (relation) {
    case 'Brother': return 'fistbump'
    case 'Sister': return 'butterfly'
    case 'Mom': return 'bloom'
    case 'Dad': return 'trophy'
    case 'Friend': return 'popper'
    default: return 'bow'   // Partner, and older surprises that were made before people existed
  }
}
export const isPartnerWorld = (relation?: Relation) => openerFor(relation) === 'bow'

const occasionMotif: Record<Occasion, string[]> = {
  Birthday: ['🎈', '🎉', '✨', '🎊'],
  Anniversary: ['✨', '🥂', '🌿', '🕯️'],
  'Love letter': ['🌸', '💌', '🍃', '✨'],
  'Special surprise': ['⭐', '🎁', '💫', '✨'],
}
const relationMotif: Record<Relation, string[]> = {
  Brother: ['⚡', '🎮', '⚽'],
  Sister: ['🦋', '🌼', '✨'],
  Partner: ['💞', '💗', '✨'],
  Mom: ['🌷', '🌼', '🍃'],
  Dad: ['⭐', '🏆', '☕'],
  Friend: ['🎶', '🫶', '✨'],
}
/** The small mark used instead of a heart after a name. */
export const glyphFor = (relation?: Relation) => ({ Brother: '★', Sister: '✿', Partner: '♡', Mom: '❀', Dad: '★', Friend: '✦' } as Record<Relation, string>)[relation || 'Partner']
export const motifFor = (o: Occasion, r?: Relation): string[] => {
  const a = relationMotif[r || 'Partner'], b = occasionMotif[o]
  return Array.from({ length: 10 }, (_, i) => (i % 2 ? b[(i >> 1) % b.length] : a[(i >> 1) % a.length]))
}
export const worldClass = (o: Occasion, r?: Relation) => `world-${o.toLowerCase().replace(/\s+/g, '-')} world-rel-${(r || 'Partner').toLowerCase()}`

/** Opening-scene wording, by person, with a tweak per occasion. */
export const openerCopy: Record<Exclude<OpenerKind, 'bow'>, { hint: string; done: string; stages: string[] }> = {
  fistbump: { hint: 'Tap to bring the fists together', done: 'Boom. Respect.', stages: ['🤜', '🤛'] },
  butterfly: { hint: 'Tap to let the butterflies out', done: 'Look at them go.', stages: ['🐛', '🦋', '🦋'] },
  bloom: { hint: 'Tap to make it bloom', done: 'In full bloom.', stages: ['🌱', '🌷', '🌸', '💐'] },
  trophy: { hint: 'Tap to polish the trophy', done: 'Shining bright.', stages: ['🥉', '🥈', '🥇', '🏆'] },
  popper: { hint: 'Tap to load the party popper', done: 'Pop!', stages: ['🎈', '🎊', '🎉', '🎉'] },
}
export const openerLine = (o: Occasion) => ({ Birthday: 'a birthday surprise', Anniversary: 'an anniversary surprise', 'Love letter': 'a letter, just for you', 'Special surprise': 'a little surprise' } as Record<Occasion, string>)[o]
