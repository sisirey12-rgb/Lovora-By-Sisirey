import type { Experience, Occasion, Relation, ThemeName } from '../types'
import { defaultScenes } from '../data'
import { CORE_OCCASIONS, RELATIONS, contentFor, occasionEmoji } from './occasionContent'

export type Template = { id: string; occasion: Occasion; relation: Relation; title: string; emoji: string; blurb: string; theme: ThemeName; patch: Partial<Experience> }
const relBlurb: Record<Relation, string> = { Brother: 'Teasing outside, caring inside', Sister: 'Warm, playful and real', Partner: 'Romantic and a little dramatic', Mom: 'Grateful, warm and full of love', Dad: 'Proud, steady and sincere', Friend: 'Loud, funny and full of inside jokes' }
const occBlurb: Record<Occasion, string> = { Birthday: 'Cake, balloons and a big wish', Anniversary: 'Your story, counted and told', 'Love letter': 'Words first, everything else follows', 'Special surprise': 'Playful, quick and unexpected' }
/** 4 occasions x 6 people = 24 ready-made templates. */
export const templates: Template[] = CORE_OCCASIONS.flatMap(o => RELATIONS.filter(r => o !== 'Love letter' || r.id === 'Partner').map(r => {
  const c = contentFor(o, r.id, defaultScenes)
  return { id: `${o}-${r.id}`.toLowerCase().replace(/\s+/g, '-'), occasion: o, relation: r.id, title: `${o} · ${r.id}`, emoji: r.emoji, blurb: `${occBlurb[o]} · ${relBlurb[r.id]}`, theme: c.theme, patch: c }
}))
export const findTemplate = (o: Occasion, r: Relation) => templates.find(t => t.occasion === o && t.relation === r)!
export const emojiFor = (o: string) => occasionEmoji[o] || '✨'

export const fromTemplate = (t: Template): Experience => ({
  id: crypto.randomUUID(), occasion: t.occasion, relation: t.relation, recipient: '', sender: '', title: 'A little surprise for you', greeting: '', message: '', closing: 'With all my love,',
  theme: t.theme, memories: [], scenes: [...defaultScenes], published: false, updatedAt: new Date().toISOString(), ...t.patch,
})
