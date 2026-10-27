import { useEffect, useState } from 'react'
export type Season = { slug: string; label: string; emoji: string; pill: string; h1a: string; h1b: string; lede: string; meta: string; rot: string[] }
/** Landing-page variants for festivals and days people search for. Served at /for/<slug>. */
export const SEASONS: Season[] = [
  { slug: 'rakhi', label: 'Rakhi', emoji: '🪢', pill: 'Rakhi surprises for brothers and sisters', h1a: 'A Rakhi gift', h1b: 'they will replay.', lede: 'Skip the plain forwarded image. Send your brother or sister a little interactive world with balloons, a wheel of wishes and your own words.', meta: 'Make an interactive Rakhi surprise for your brother or sister. One link, no app needed. Preview free.', rot: ['bhai', 'behna', 'brother', 'sister'] },
  { slug: 'diwali', label: 'Diwali', emoji: '🪔', pill: 'Diwali wishes, made magical', h1a: 'Light up their', h1b: 'Diwali.', lede: 'Sky lanterns, fireworks and a letter in your own words. A Diwali wish that feels like you were there.', meta: 'Send an interactive Diwali surprise with sky lanterns, fireworks and a personal letter. Preview free.', rot: ['family', 'best friend', 'partner', 'parents'] },
  { slug: 'eid', label: 'Eid', emoji: '🌙', pill: 'Eid Mubarak, beautifully', h1a: 'Eid Mubarak,', h1b: 'in a link.', lede: 'A crescent night, a heartfelt message and a fortune or two. Send Eid wishes people actually keep.', meta: 'Create an Eid Mubarak surprise with wishes, a letter and a fortune cookie. One link, preview free.', rot: ['family', 'friends', 'parents', 'partner'] },
  { slug: 'valentines-day', label: "Valentine's Day", emoji: '💘', pill: "A Valentine's Day they will never forget", h1a: 'Say it with', h1b: 'a little world.', lede: 'A wax-sealed letter, sky lanterns and open-when notes. Better than a card, and far more you.', meta: "Make an interactive Valentine's Day surprise with a wax-seal letter and open-when notes. Preview free.", rot: ['partner', 'crush', 'wife', 'husband'] },
  { slug: 'mothers-day', label: "Mother's Day", emoji: '💐', pill: "Mother's Day, from the heart", h1a: 'Tell her what', h1b: 'she means to you.', lede: 'Flowers she can unwrap, photos on a string and a letter read aloud in a soft voice.', meta: "Create a Mother's Day surprise with a bouquet, polaroid photos and a letter read aloud. Preview free.", rot: ['mom', 'maa', 'mother', 'grandma'] },
  { slug: 'fathers-day', label: "Father's Day", emoji: '👔', pill: "Father's Day, done right", h1a: "Dad's day,", h1b: 'a real surprise.', lede: 'Wishes, memories and a message he will keep. Show him he is seen.', meta: "Make a Father's Day surprise with wishes, photos and a personal message. Preview free.", rot: ['dad', 'papa', 'father', 'grandpa'] },
  { slug: 'friendship-day', label: 'Friendship Day', emoji: '🤝', pill: 'For the friend who gets you', h1a: 'Make your best friend', h1b: 'tear up and laugh.', lede: 'Inside jokes, a mystery box, a scratch card and a wheel of wishes. Friendship, gamified.', meta: 'Make a Friendship Day surprise with inside jokes, mystery boxes and a scratch card. Preview free.', rot: ['best friend', 'bestie', 'yaar', 'college gang'] },
  { slug: 'new-year', label: 'New Year', emoji: '🎆', pill: 'Start the year with a surprise', h1a: 'Welcome the year', h1b: 'with fireworks.', lede: 'Fireworks, a fortune cookie and a wish upon a star. Say hello to the new year with someone you love.', meta: 'Send a New Year surprise with fireworks, a fortune cookie and a wish upon a star. Preview free.', rot: ['friends', 'family', 'partner', 'team'] },
  { slug: 'holi', label: 'Holi', emoji: '🎨', pill: 'Happy Holi, in every colour', h1a: 'Splash them with', h1b: 'colour and love.', lede: 'Colour bursts, wishes that pop and a message in your own words. A Holi greeting that is more than a forwarded GIF.', meta: 'Create a Holi surprise with colour splashes, wishes and a personal message. Send it as one link.', rot: ['best friend', 'family', 'crush', 'neighbour', 'whole gang'] },
  { slug: 'dashain', label: 'Dashain', emoji: '🪁', pill: 'Dashain wishes, from far or near', h1a: 'Send tika,', h1b: 'jamara and blessings.', lede: 'Kites in the sky, a heartfelt message and a little surprise for the people you cannot be with this Dashain.', meta: 'Make a Dashain surprise with kites, blessings and a personal letter. Share it as one link, in Nepali or English.', rot: ['mom', 'dad', 'grandparents', 'brother', 'sister'] },
  { slug: 'tihar', label: 'Tihar', emoji: '🪔', pill: 'Tihar lights for the ones you love', h1a: 'Light a diya', h1b: 'for someone far away.', lede: 'Glowing diyas, sky lanterns and a Bhai Tika message. Tihar wishes with all the light of home.', meta: 'Create a Tihar and Bhai Tika surprise with diyas, lanterns and a personal message.', rot: ['brother', 'sister', 'family', 'friend', 'partner'] },
  { slug: 'christmas', label: 'Christmas', emoji: '🎄', pill: 'A Christmas worth opening', h1a: 'Wrap a wish', h1b: 'in falling snow.', lede: 'A snowy little world, a wish list of kind words and a letter under the tree. Christmas, one link away.', meta: 'Create a Christmas surprise with snowfall, wishes and a heartfelt letter. Share as one link.', rot: ['family', 'best friend', 'partner', 'mom', 'dad'] },
]
export const seasonFromPath = (path = typeof window !== 'undefined' ? window.location.pathname : '') => SEASONS.find(s => path === `/for/${s.slug}` || path === `/for/${s.slug}/`)

/** The season the owner switched on from the account panel (cached for the session so the page does not flash). */
export function useLiveSeason(): Season | undefined {
  const [slug, setSlug] = useState(() => { try { return sessionStorage.getItem('lovora-season') || '' } catch { return '' } })
  useEffect(() => {
    let dead = false
    const apply = (next: string) => {
      const valid = SEASONS.some(s => s.slug === next) ? next : ''
      setSlug(valid)
      try { sessionStorage.setItem('lovora-season', valid) } catch { /* private mode */ }
    }
    const refresh = () => { fetch('/api/season', { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(j => { if (!dead && j) apply(String(j.season || '')) }).catch(() => { /* offline: keep last known setting */ }) }
    const changed = (e: Event) => { const value = (e as CustomEvent<{ season?: string }>).detail?.season; if (typeof value === 'string') apply(value) }
    const storageChanged = (e: StorageEvent) => { if (e.key === 'lovora-season') apply(e.newValue || '') }
    refresh()
    window.addEventListener('lovora:season-config', changed)
    window.addEventListener('storage', storageChanged)
    return () => { dead = true; window.removeEventListener('lovora:season-config', changed); window.removeEventListener('storage', storageChanged) }
  }, [])
  return SEASONS.find(s => s.slug === slug)
}
