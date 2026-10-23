import type { Occasion, Relation, ThemeName, Experience } from '../types'

/** The four occasions and six people Lovora supports. Everything (templates, videos, text) is keyed off these. */
export const CORE_OCCASIONS: Occasion[] = ['Birthday', 'Anniversary', 'Love letter', 'Special surprise']
export const RELATIONS: { id: Relation; emoji: string; noun: string }[] = [
  { id: 'Brother', emoji: '🧢', noun: 'bro' },
  { id: 'Sister', emoji: '🎀', noun: 'sis' },
  { id: 'Partner', emoji: '💞', noun: 'love' },
  { id: 'Mom', emoji: '💐', noun: 'Mom' },
  { id: 'Dad', emoji: '👔', noun: 'Dad' },
  { id: 'Friend', emoji: '🫶', noun: 'friend' },
]
export const occasionEmoji: Record<string, string> = { Birthday: '🎂', Anniversary: '💞', 'Love letter': '💌', 'Special surprise': '✨' }
export const occasionKey = (o?: string): Occasion => (CORE_OCCASIONS.includes(o as Occasion) ? (o as Occasion) : 'Special surprise')

type Kind = 'family' | 'partner' | 'friend'
const kindOf = (r: Relation): Kind => (r === 'Partner' ? 'partner' : r === 'Friend' ? 'friend' : 'family')

const greet: Record<Relation, string> = { Brother: 'Dear bro,', Sister: 'Dear sis,', Partner: 'My love,', Mom: 'Dear Mom,', Dad: 'Dear Dad,', Friend: 'Dear friend,' }
const closing: Record<Relation, string> = { Brother: 'Your sibling, always,', Sister: 'Your sibling, always,', Partner: 'Forever yours,', Mom: 'With all my love,', Dad: 'Your proud kid,', Friend: 'Your friend, always,' }
const relTheme: Record<Relation, ThemeName> = { Brother: 'Ocean Hearts', Sister: 'Sakura Garden', Partner: 'Royal Velvet', Mom: 'Rose Romance', Dad: 'Mocha Cream', Friend: 'Cotton Candy' }
const relCake: Record<Relation, string> = { Brother: 'chocolate', Sister: 'strawberry', Partner: 'red-velvet', Mom: 'floral', Dad: 'caramel', Friend: 'rainbow' }
const relFont: Record<Relation, string> = { Brother: 'sweet', Sister: 'handwritten', Partner: 'parisian', Mom: 'classic', Dad: 'classic', Friend: 'bubbly' }
const relBouquet: Record<Relation, string> = { Brother: 'sunflowers', Sister: 'peonies', Partner: 'roses', Mom: 'mixed', Dad: 'sunflowers', Friend: 'tulips' }
const relAnim: Record<Relation, string> = { Brother: 'rise', Sister: 'fade', Partner: 'shimmer', Mom: 'fade', Dad: 'rise', Friend: 'bounce' }

// opener (by occasion and kind), a middle line (by person), a closer (by occasion)
const opener: Record<Occasion, Record<Kind, string>> = {
  Birthday: { family: 'Happy birthday! Today is all about you, so let the cake be big and the day be bigger.', partner: 'Happy birthday, my love. Today I get to celebrate the person who makes life softer and brighter.', friend: 'Happy birthday! Today is all about you, so let the cake be big and the day be bigger.' },
  Anniversary: { family: 'Happy anniversary! Your story is one of my favourite ones to watch unfold.', partner: 'Happy anniversary, my love. Another year with you and I would still choose every single day again.', friend: 'Happy anniversary! Here is to everything we have been through, and everything still ahead.' },
  'Love letter': { family: 'I do not say it enough, so I wrote it down: I love you, and I am grateful for you.', partner: 'I wanted to say this properly, so I wrote it here: I love you, more than I know how to say out loud.', friend: 'Some feelings deserve more than a text, so here it is: I am so glad you are in my life.' },
  'Special surprise': { family: 'There is no special reason for this, except that you came to my mind and I wanted to make you smile.', partner: 'There is no special reason for this, except that you came to my mind and I wanted to make you smile.', friend: 'There is no special reason for this, except that you came to my mind and I wanted to make you smile.' },
}
const middle: Record<Relation, string> = {
  Brother: 'We fight, we laugh, we steal each other’s snacks, but nobody gets me like you do.',
  Sister: 'We fight, we laugh, we borrow each other’s things, but nobody gets me like you do.',
  Partner: 'Thank you for choosing me, again and again, and for the quiet moments that mean the most.',
  Mom: 'Everything good in me started with you. Thank you for your patience, your hugs and everything you never ask to be thanked for.',
  Dad: 'You taught me how to be strong and kind at the same time. Thank you for every lesson and every quiet way you showed you cared.',
  Friend: 'Thank you for the laughs, the honesty and for never letting me feel alone.',
}
const closer: Record<Occasion, string> = {
  Birthday: 'I hope this year gives you everything you deserve.',
  Anniversary: 'I am so proud of us, and I cannot wait for what comes next.',
  'Love letter': 'Keep this little world and open it whenever you need a reminder.',
  'Special surprise': 'Never forget how special you are.',
}
const wishes: Record<Occasion, Record<Kind, string[]>> = {
  Birthday: { family: ['May your year be full of good surprises.', 'I am always on your side.', 'Thanks for being you.'], partner: ['You are my favourite part of every day.', 'I love you more than yesterday.', 'Here is to another year of us.'], friend: ['May your year be as fun as you are.', 'Here is to more adventures together.', 'You make every room brighter.'] },
  Anniversary: { family: ['Your love is a story worth telling.', 'May every year be gentler and happier.', 'Thank you for showing us what love looks like.'], partner: ['Here is to every year we have, and every year ahead.', 'You are still my favourite hello.', 'Home is wherever you are.'], friend: ['Cheers to the years behind us.', 'Our story is my favourite.', 'Here is to many more.'] },
  'Love letter': { family: ['I am grateful for you.', 'You are loved more than words can say.', 'Thank you for always being there.'], partner: ['You are my favourite person.', 'I would choose you in every universe.', 'You make my heart feel at home.'], friend: ['I am lucky to call you my friend.', 'You make life better.', 'Thank you for always showing up.'] },
  'Special surprise': { family: ['You deserve something lovely today.', 'I am thinking of you.', 'Never forget how special you are.'], partner: ['You came to my mind, so I smiled.', 'You deserve something lovely today.', 'I love you, just because.'], friend: ['This is your sign to smile.', 'You deserve something lovely today.', 'Thanks for being my person.'] },
}
const titleFor = (o: Occasion, r: Relation): string => ({
  Birthday: { Brother: 'Happy Birthday, you legend', Sister: 'Happy Birthday, sis', Partner: 'Happy Birthday, my love', Mom: 'Happy Birthday, Mom', Dad: 'Happy Birthday, Dad', Friend: 'Happy Birthday, partner in crime' },
  Anniversary: { Brother: 'Happy Anniversary, bro', Sister: 'Happy Anniversary, sis', Partner: 'Happy Anniversary, my love', Mom: 'Happy Anniversary, Mom', Dad: 'Happy Anniversary, Dad', Friend: 'Happy Anniversary, my friend' },
  'Love letter': { Brother: 'A letter for my brother', Sister: 'A letter for my sister', Partner: 'A love letter, just for you', Mom: 'A letter for Mom', Dad: 'A letter for Dad', Friend: 'A letter for my friend' },
  'Special surprise': { Brother: 'A little something for you, bro', Sister: 'A little something for you, sis', Partner: 'A little something, just because', Mom: 'A little something for Mom', Dad: 'A little something for Dad', Friend: 'A little something, just because' },
} as Record<Occasion, Record<Relation, string>>)[o][r]
const secretFor = (o: Occasion, r: Relation) => o === 'Love letter' || r === 'Partner' ? 'The secret is simple: I would choose you in every universe.' : r === 'Mom' ? 'You found the secret: you are my hero, Mom.' : r === 'Dad' ? 'You found the secret: you are my hero, Dad.' : 'You found the secret: you are the best, and I mean it.'

export type OccasionContent = Pick<Experience, 'occasion' | 'relation' | 'title' | 'greeting' | 'message' | 'closing' | 'balloonWishes' | 'balloonCount' | 'secretMessage' | 'theme' | 'cakeStyle' | 'fontStyle' | 'bouquetStyle' | 'textAnim' | 'scenes' | 'revealText'>

export function messageFor(o: Occasion, r: Relation, short = false) {
  const k = kindOf(r)
  return short ? `${opener[o][k]} ${closer[o]}` : `${opener[o][k]} ${middle[r]} ${closer[o]}`
}
/** All the text and style choices for one occasion + person. The editor and the landing page templates both use this. */
export function contentFor(o: Occasion, r: Relation, scenes: Experience['scenes']): OccasionContent {
  const k = kindOf(r)
  const w = wishes[o][k]
  const sc = o === 'Love letter' && k === 'partner' ? ([...scenes.filter(s => s !== 'finale'), 'coupons', 'finale'] as Experience['scenes']) : [...scenes]
  return { occasion: o, relation: r, title: titleFor(o, r), greeting: greet[r], message: messageFor(o, r), closing: closing[r], balloonWishes: [...w, 'You make ordinary days brighter.', 'Thank you for being exactly you.'], balloonCount: 5, secretMessage: secretFor(o, r), theme: relTheme[r], cakeStyle: relCake[r], fontStyle: relFont[r], bouquetStyle: relBouquet[r], textAnim: relAnim[r], scenes: sc, revealText: undefined }
}
/** Suggestion chips shown under the editor fields, tuned to the chosen occasion. */
export function suggestFor(o: Occasion) {
  const t = ({
    Birthday: { title: ['A birthday wish made just for you', 'Something small, from my whole heart', 'Our little world, wrapped for you'], greeting: ['Happy Birthday, {name}! 🎂', 'Dear {name},', 'My dearest {name},'], wishes: ['May your year taste like cake and feel like home.', 'You deserve every good thing coming your way.', 'I wish you slow mornings and big laughs.', 'May every dream you hold find its way to you.'] },
    Anniversary: { title: ['Our story, so far', 'Another year, same love', 'To the one I chose'], greeting: ['Happy Anniversary, {name} ♡', 'My dearest {name},', 'Dear {name},'], wishes: ['Every year with you is my favourite one.', 'Here is to many more chapters.', 'You are my home.', 'Thank you for every little thing.'] },
    'Love letter': { title: ['Open this when you miss me', 'The words I never say enough', 'A letter, just for you'], greeting: ['My dearest {name},', 'To the one who owns my heart,', 'Dear {name},'], wishes: ['You are my favourite hello.', 'I am grateful for you every day.', 'You make my world softer.', 'Thank you for being you.'] },
    'Special surprise': { title: ['A little something, just because', 'Something small, from my whole heart', 'Thinking of you'], greeting: ['Hey you, {name} ♡', 'Dear {name},', 'Hi {name}!'], wishes: ['You deserve something lovely today.', 'I am thinking of you.', 'This is your sign to smile.', 'Never forget how special you are.'] },
  } as Record<string, { title: string[]; greeting: string[]; wishes: string[] }>)[o]
  return t
}
