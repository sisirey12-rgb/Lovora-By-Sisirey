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
/** Anniversary reads differently for every person: a sibling's, parents' or a friend's story is not a partner's. */
const annOpen: Record<Relation, string> = {
  Brother: 'Happy anniversary, bro! Watching you build a life with the people you love is one of my favourite things.',
  Sister: 'Happy anniversary, sis! Watching you build your own happy story is one of my favourite things.',
  Partner: 'Happy anniversary, my love. Another year with you and I would still choose every single day again.',
  Mom: 'Happy anniversary! Watching your love grow through every year taught me what a real home feels like.',
  Dad: 'Happy anniversary! Watching you and Mom stand by each other through every year taught me what love looks like.',
  Friend: 'Happy anniversary! Here is to everything we have been through, and everything still ahead.',
}
const annMid: Record<Relation, string> = {
  Brother: 'You have always been someone I look up to, tease and trust, and I love seeing that same warmth in your home today.',
  Sister: 'You have always been my person to laugh, argue and share secrets with, and I love seeing that same warmth in your home today.',
  Partner: middle.Partner,
  Mom: 'Thank you for the patience, the laughter and the quiet teamwork that built our family. You two are my favourite love story.',
  Dad: 'Thank you for showing me, without making a speech of it, what showing up for each other means. You two are my favourite love story.',
  Friend: middle.Friend,
}
const annClose: Record<Relation, string> = {
  Brother: 'I am so proud of you both, and I cannot wait for what comes next.',
  Sister: 'I am so proud of you both, and I cannot wait for what comes next.',
  Partner: 'I am so proud of us, and I cannot wait for what comes next.',
  Mom: 'Here is to many more years together.',
  Dad: 'Here is to many more years together.',
  Friend: 'Here is to many more years of us.',
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
const annWishes: Record<Relation, string[]> = {
  Brother: ['May your home always be full of laughter.', 'Wishing you many more happy years together.', 'I am always on your side, both of you.'],
  Sister: ['May your home always be full of laughter.', 'Wishing you many more happy years together.', 'I am always on your side, both of you.'],
  Partner: wishes.Anniversary.partner,
  Mom: ['Your love is the reason our home feels like home.', 'Thank you for showing us what love looks like.', 'Here is to many more years together.'],
  Dad: ['Your love is the reason our home feels like home.', 'Thank you for showing us what love looks like.', 'Here is to many more years together.'],
  Friend: wishes.Anniversary.friend,
}
const titleFor = (o: Occasion, r: Relation): string => ({
  Birthday: { Brother: 'Happy Birthday, you legend', Sister: 'Happy Birthday, sis', Partner: 'Happy Birthday, my love', Mom: 'Happy Birthday, Mom', Dad: 'Happy Birthday, Dad', Friend: 'Happy Birthday, partner in crime' },
  Anniversary: { Brother: 'Happy Anniversary, bro', Sister: 'Happy Anniversary, sis', Partner: 'Happy Anniversary, my love', Mom: 'Happy Anniversary, Mom & Dad', Dad: 'Happy Anniversary, Mom & Dad', Friend: 'Happy Anniversary, my friend' },
  'Love letter': { Brother: 'A letter for my brother', Sister: 'A letter for my sister', Partner: 'A love letter, just for you', Mom: 'A letter for Mom', Dad: 'A letter for Dad', Friend: 'A letter for my friend' },
  'Special surprise': { Brother: 'A little something for you, bro', Sister: 'A little something for you, sis', Partner: 'A little something, just because', Mom: 'A little something for Mom', Dad: 'A little something for Dad', Friend: 'A little something, just because' },
} as Record<Occasion, Record<Relation, string>>)[o][r]
const secretFor = (o: Occasion, r: Relation) => o === 'Love letter' || r === 'Partner' ? 'The secret is simple: I would choose you in every universe.' : r === 'Mom' ? 'You found the secret: you are my hero, Mom.' : r === 'Dad' ? 'You found the secret: you are my hero, Dad.' : 'You found the secret: you are the best, and I mean it.'

type RM<T> = Record<Relation, T>
const themeMx: Record<Occasion, RM<ThemeName>> = {
  Birthday: { Brother: 'Ocean Hearts', Sister: 'Peach Dream', Partner: 'Rose Romance', Mom: 'Sakura Garden', Dad: 'Golden Celebration', Friend: 'Cotton Candy' },
  Anniversary: { Brother: 'Aurora Sky', Sister: 'Lavender Night', Partner: 'Royal Velvet', Mom: 'Rose Romance', Dad: 'Mocha Cream', Friend: 'Sunset Glow' },
  'Love letter': { Brother: 'Midnight Galaxy', Sister: 'Sakura Garden', Partner: 'Rose Romance', Mom: 'Peach Dream', Dad: 'Emerald Garden', Friend: 'Lavender Night' },
  'Special surprise': { Brother: 'Neon Fantasy', Sister: 'Pastel Wonderland', Partner: 'Meow Magic', Mom: 'Emerald Garden', Dad: 'Ocean Hearts', Friend: 'Sunset Glow' },
}
const cakeMx: Record<Occasion, RM<string>> = {
  Birthday: relCake,
  Anniversary: { Brother: 'chocolate', Sister: 'blueberry', Partner: 'tiered', Mom: 'floral', Dad: 'vanilla-gold', Friend: 'heart-cake' },
  'Love letter': { Brother: 'caramel', Sister: 'strawberry', Partner: 'heart-cake', Mom: 'red-velvet', Dad: 'chocolate', Friend: 'vanilla-gold' },
  'Special surprise': { Brother: 'galaxy', Sister: 'lemon', Partner: 'red-velvet', Mom: 'matcha', Dad: 'caramel', Friend: 'rainbow' },
}
const fontOcc: Partial<Record<Occasion, string>> = { 'Love letter': 'parisian', Anniversary: 'vows', 'Special surprise': 'bubbly' }
/** The scene order is different for every occasion and person, so no two surprises play the same story. */
const flows: Record<Occasion, RM<Experience['scenes']>> = {
  Birthday: {
    Brother: ['heart', 'intro', 'balloons', 'cake', 'video', 'letter', 'moments', 'wishjar', 'finale'],
    Sister: ['heart', 'intro', 'cake', 'balloons', 'letter', 'memories', 'video', 'moments', 'wishjar', 'finale'],
    Partner: ['heart', 'intro', 'letter', 'cake', 'coupons', 'memories', 'timeline', 'moments', 'video', 'finale'],
    Mom: ['heart', 'intro', 'letter', 'moments', 'memories', 'timeline', 'cake', 'balloons', 'video', 'finale'],
    Dad: ['heart', 'intro', 'cake', 'moments', 'letter', 'memories', 'balloons', 'video', 'finale'],
    Friend: ['heart', 'intro', 'balloons', 'cake', 'wishjar', 'memories', 'video', 'moments', 'finale'],
  },
  Anniversary: {
    Brother: ['heart', 'intro', 'timeline', 'memories', 'moments', 'video', 'letter', 'finale'],
    Sister: ['heart', 'intro', 'timeline', 'memories', 'moments', 'video', 'letter', 'finale'],
    Partner: ['heart', 'intro', 'counter', 'timeline', 'memories', 'letter', 'moments', 'coupons', 'video', 'cake', 'finale'],
    Mom: ['heart', 'intro', 'counter', 'timeline', 'memories', 'moments', 'letter', 'video', 'wishjar', 'finale'],
    Dad: ['heart', 'intro', 'counter', 'timeline', 'memories', 'moments', 'letter', 'video', 'wishjar', 'finale'],
    Friend: ['heart', 'intro', 'counter', 'timeline', 'memories', 'moments', 'video', 'wishjar', 'finale'],
  },
  'Love letter': {
    Brother: ['heart', 'intro', 'letter', 'moments', 'memories', 'video', 'wishjar', 'finale'],
    Sister: ['heart', 'intro', 'letter', 'moments', 'memories', 'video', 'wishjar', 'finale'],
    Partner: ['heart', 'intro', 'letter', 'moments', 'memories', 'coupons', 'timeline', 'video', 'finale'],
    Mom: ['heart', 'intro', 'letter', 'moments', 'memories', 'video', 'finale'],
    Dad: ['heart', 'intro', 'letter', 'moments', 'video', 'memories', 'finale'],
    Friend: ['heart', 'intro', 'letter', 'moments', 'memories', 'wishjar', 'video', 'finale'],
  },
  'Special surprise': {
    Brother: ['heart', 'intro', 'balloons', 'video', 'cake', 'moments', 'finale'],
    Sister: ['heart', 'intro', 'balloons', 'video', 'cake', 'moments', 'finale'],
    Partner: ['heart', 'intro', 'balloons', 'video', 'coupons', 'letter', 'memories', 'finale'],
    Mom: ['heart', 'intro', 'balloons', 'letter', 'video', 'moments', 'finale'],
    Dad: ['heart', 'intro', 'balloons', 'letter', 'video', 'moments', 'finale'],
    Friend: ['heart', 'intro', 'balloons', 'wishjar', 'video', 'moments', 'finale'],
  },
}
export const flowFor = (o: Occasion, r: Relation): Experience['scenes'] => [...flows[o][r]]
export type Lang = 'English' | 'Hinglish'
const hGreet: Record<Relation, string> = { Brother: 'Mere bhai,', Sister: 'Meri pyaari behna,', Partner: 'Meri jaan,', Mom: 'Meri pyaari Maa,', Dad: 'Mere Papa,', Friend: 'Mere yaar,' }
const hClosing: Record<Relation, string> = { Brother: 'Tera bhai/behna, hamesha,', Sister: 'Tera bhai/behna, hamesha,', Partner: 'Hamesha tera/teri,', Mom: 'Dher saara pyaar ke saath,', Dad: 'Aapka bachcha,', Friend: 'Tera yaar, hamesha,' }
const hOpener: Record<Occasion, Record<Kind, string>> = {
  Birthday: { family: 'Janamdin mubarak! Aaj ka din sirf tumhara hai, toh cake bada hoga aur masti usse bhi badi.', partner: 'Janamdin mubarak meri jaan. Aaj main usse celebrate kar raha/rahi hoon jisse meri duniya khoobsurat hai.', friend: 'Janamdin mubarak yaar! Aaj ka din sirf tumhara hai, cake bada aur masti usse bhi badi.' },
  Anniversary: { family: 'Anniversary mubarak! Aapki kahani dekhna mujhe bahut pasand hai.', partner: 'Anniversary mubarak meri jaan. Ek aur saal saath, aur main phir bhi har din tumhe hi chunta/chunti.', friend: 'Anniversary mubarak! Jo beeta uska shukriya, aur jo aane wala hai uska intezaar.' },
  'Love letter': { family: 'Main kehta/kehti kam hoon, isliye likh diya: I love you, aur main tumhara/tumhari shukraguzar hoon.', partner: 'Ye baat dil se kehni thi, isliye likh di: I love you, jitna main bol bhi nahi sakta/sakti.', friend: 'Kuch baatein text se zyada deserve karti hain: yaar, tu mere life mein hai, bas yahi kaafi hai.' },
  'Special surprise': { family: 'Koi khaas wajah nahi hai, bas tumhari yaad aayi aur socha ki muskaan bhej doon.', partner: 'Koi khaas wajah nahi hai, bas tumhari yaad aayi aur socha ki muskaan bhej doon.', friend: 'Koi khaas wajah nahi hai, bas tumhari yaad aayi aur socha ki muskaan bhej doon.' },
}
const hMiddle: Record<Relation, string> = {
  Brother: 'Hum ladte hain, hasste hain, snacks chheente hain, par tumhare jaisa mujhe koi nahi samajhta.',
  Sister: 'Hum ladte hain, hasste hain, cheezein udate hain, par tumhare jaisa mujhe koi nahi samajhta.',
  Partner: 'Mujhe baar baar chunne ke liye shukriya, aur un chhote pal ke liye jo sabse zyada matter karte hain.',
  Mom: 'Mujhme jo bhi achha hai woh aapse shuru hua. Aapke sabr, pyaar aur har un baat ke liye shukriya jiska aap kabhi hisaab nahi maangti.',
  Dad: 'Aapne mujhe mazboot aur nek dono banna sikhaya. Har seekh aur har chuppi hui parwah ke liye shukriya.',
  Friend: 'Hasi, sachchai aur mujhe kabhi akela na chhodne ke liye shukriya.',
}
const hCloser: Record<Occasion, string> = { Birthday: 'Ye saal tumhe woh sab de jo tum deserve karte ho.', Anniversary: 'Mujhe humpe garv hai, aur aage ka intezaar hai.', 'Love letter': 'Ye chhoti si duniya sambhal ke rakhna, jab mann ho khol lena.', 'Special surprise': 'Hamesha yaad rakhna ki tum kitne khaas ho.' }

const momentsBase: Record<Relation, { title: string; items: string[] }> = {
  Mom: { title: 'Things I learned from you', items: ['How to stay kind even on hard days', 'That a warm meal can fix almost anything', 'How to keep going and still smile', 'That love shows up in small, daily ways'] },
  Dad: { title: 'Things you taught me', items: ['To keep my word', 'To stay calm when things get loud', 'That hard work and kindness can go together', 'That showing up matters most'] },
  Partner: { title: 'Reasons I love you', items: ['Your laugh makes every day lighter', 'You listen like it matters, because it does', 'You make home feel like a person', 'Being with you feels easy and exciting at once'] },
  Friend: { title: 'Why you are my person', items: ['You show up without being asked', 'Silence with you is never awkward', 'You are honest and kind together', 'Every memory is better with you in it'] },
  Brother: { title: 'Why you are the best', items: ['You always have my back', 'You make me laugh at the worst times', 'You push me to be better', 'No one else gets our stories'] },
  Sister: { title: 'Why you are the best', items: ['You always have my back', 'You make me laugh at the worst times', 'You push me to be better', 'No one else gets our stories'] },
}
export const momentsTitle = (r?: Relation) => momentsBase[r || 'Friend'].title

export type OccasionContent = Pick<Experience, 'occasion' | 'relation' | 'title' | 'greeting' | 'message' | 'closing' | 'balloonWishes' | 'balloonCount' | 'secretMessage' | 'theme' | 'cakeStyle' | 'fontStyle' | 'bouquetStyle' | 'textAnim' | 'scenes' | 'revealText' | 'moments' | 'language'>

export function messageFor(o: Occasion, r: Relation, short = false, lang: Lang = 'English') {
  const k = kindOf(r), h = lang === 'Hinglish'
  const ann = o === 'Anniversary' && !h   // anniversary has its own wording for every person (Hinglish keeps the shared text)
  const op = ann ? annOpen[r] : (h ? hOpener : opener)[o][k], mi = ann ? annMid[r] : (h ? hMiddle : middle)[r], cl = ann ? annClose[r] : (h ? hCloser : closer)[o]
  return short ? `${op} ${cl}` : `${op} ${mi} ${cl}`
}
/** All the text and style choices for one occasion + person. The editor and the landing page templates both use this. */
export function contentFor(o: Occasion, r: Relation, _scenes?: Experience['scenes'], lang: Lang = 'English'): OccasionContent {
  const k = kindOf(r), h = lang === 'Hinglish'
  const w = o === 'Anniversary' ? annWishes[r] : wishes[o][k]
  const sc = flowFor(o, r)
  return { occasion: o, relation: r, title: titleFor(o, r), greeting: (h ? hGreet : greet)[r], message: messageFor(o, r, false, lang), closing: (h ? hClosing : closing)[r], moments: [...momentsBase[r].items], language: lang, balloonWishes: [...w, 'You make ordinary days brighter.', 'Thank you for being exactly you.'], balloonCount: 5, secretMessage: secretFor(o, r), theme: themeMx[o][r], cakeStyle: cakeMx[o][r], fontStyle: fontOcc[o] && r !== 'Dad' ? fontOcc[o]! : relFont[r], bouquetStyle: relBouquet[r], textAnim: relAnim[r], scenes: sc, revealText: undefined }
}
/** Suggestion chips shown under the editor fields, tuned to the chosen occasion. */
export function suggestFor(o: Occasion, r?: Relation) {
  const t = ({
    Birthday: { title: ['A birthday wish made just for you', 'Something small, from my whole heart', 'Our little world, wrapped for you'], greeting: ['Happy Birthday, {name}! 🎂', 'Dear {name},', 'My dearest {name},'], wishes: ['May your year taste like cake and feel like home.', 'You deserve every good thing coming your way.', 'I wish you slow mornings and big laughs.', 'May every dream you hold find its way to you.'] },
    Anniversary: { title: ['Our story, so far', 'Another year, same love', 'To the one I chose'], greeting: ['Happy Anniversary, {name} ♡', 'My dearest {name},', 'Dear {name},'], wishes: ['Every year with you is my favourite one.', 'Here is to many more chapters.', 'You are my home.', 'Thank you for every little thing.'] },
    'Love letter': { title: ['Open this when you miss me', 'The words I never say enough', 'A letter, just for you'], greeting: ['My dearest {name},', 'To the one who owns my heart,', 'Dear {name},'], wishes: ['You are my favourite hello.', 'I am grateful for you every day.', 'You make my world softer.', 'Thank you for being you.'] },
    'Special surprise': { title: ['A little something, just because', 'Something small, from my whole heart', 'Thinking of you'], greeting: ['Hey you, {name} ♡', 'Dear {name},', 'Hi {name}!'], wishes: ['You deserve something lovely today.', 'I am thinking of you.', 'This is your sign to smile.', 'Never forget how special you are.'] },
  } as Record<string, { title: string[]; greeting: string[]; wishes: string[] }>)[o]
  if (!r || r === 'Partner') return t
  // no hearts or couple wording for family and friends
  const soft = (xs: string[]) => xs.map(x => x.replace('♡', '✦').replace('To the one who owns my heart,', 'To someone who means the world to me,'))
  const title = o === 'Anniversary' ? ({ Brother: ['Cheers to your story', 'Happy anniversary, you two', 'So proud of you both'], Sister: ['Cheers to your story', 'Happy anniversary, you two', 'So proud of you both'], Mom: ['To my favourite love story', 'Happy anniversary, Mom & Dad', 'Thank you for showing us'], Dad: ['To my favourite love story', 'Happy anniversary, Mom & Dad', 'Thank you for showing us'], Friend: ['Cheers to the years', 'Our story, so far', 'Here is to many more'] } as Record<string, string[]>)[r] : t.title
  return { ...t, title, greeting: soft(t.greeting), wishes: o === 'Anniversary' ? annWishes[r] : t.wishes }
}
