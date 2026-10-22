import type { Occasion, ThemeName, SceneId } from './types'
export const occasions: { name: Occasion; icon: string; desc: string }[] = [
  { name: 'Birthday', icon: '🎂', desc: 'A wish wrapped in magic' },
  { name: 'Anniversary', icon: '💞', desc: 'Celebrate your story' },
  { name: 'Friendship', icon: '🫶', desc: 'For your favourite human' },
  { name: 'Love letter', icon: '💌', desc: 'Say what matters' },
  { name: 'Special surprise', icon: '✨', desc: 'Just because they matter' },
  { name: 'Memory collection', icon: '📸', desc: 'A little world of moments' },
]
export const themes: { name: ThemeName; colors: string; description: string }[] = [
  { name: 'Rose Romance', colors: 'linear-gradient(135deg,#ff9db7,#5e285e)', description: 'Blush, roses & tender glow' },
  { name: 'Midnight Galaxy', colors: 'linear-gradient(135deg,#131b51,#a35cff)', description: 'Cosmic and dreamy' },
  { name: 'Peach Dream', colors: 'linear-gradient(135deg,#ffd0b5,#f37f9c)', description: 'Warm peach softness' },
  { name: 'Golden Celebration', colors: 'linear-gradient(135deg,#482a63,#e6b85e)', description: 'A little golden sparkle' },
  { name: 'Lavender Night', colors: 'linear-gradient(135deg,#bba7ff,#38225f)', description: 'Soft violet evening' },
  { name: 'Sakura Garden', colors: 'linear-gradient(135deg,#ffd0e3,#b54d87)', description: 'Cherry blossom magic' },
  { name: 'Ocean Hearts', colors: 'linear-gradient(135deg,#8fe4e8,#245d91)', description: 'Blue skies and deep feelings' },
  { name: 'Pastel Wonderland', colors: 'linear-gradient(135deg,#ffe2f2,#b8d8ff)', description: 'Candy-coloured daydream' },
  { name: 'Neon Fantasy', colors: 'linear-gradient(135deg,#18122f,#ff4fc8)', description: 'Electric after-dark energy' },
  { name: 'Meow Magic', colors: 'linear-gradient(135deg,#f4a5d7,#a68bff)', description: 'A little cat-inspired charm' },
  { name: 'Sunset Glow', colors: 'linear-gradient(135deg,#ff9a5c,#c2307a)', description: 'Warm orange-to-berry skies' },
  { name: 'Emerald Garden', colors: 'linear-gradient(135deg,#7be0a8,#1c5c4a)', description: 'Fresh, leafy and calm' },
  { name: 'Cotton Candy', colors: 'linear-gradient(135deg,#ffc2e8,#a8d8ff)', description: 'Sugary pink and sky blue' },
  { name: 'Royal Velvet', colors: 'linear-gradient(135deg,#7b2cbf,#240046)', description: 'Deep purple and gold' },
  { name: 'Aurora Sky', colors: 'linear-gradient(135deg,#5ef2c8,#4a5bd6)', description: 'Northern lights shimmer' },
  { name: 'Mocha Cream', colors: 'linear-gradient(135deg,#e8c9a8,#7a4a38)', description: 'Cosy coffee and cream' },
]
export const defaultScenes: SceneId[] = ['heart','intro','cake','balloons','letter','video','memories','timeline','wishjar','finale']
export const sceneLabels: Record<SceneId, string> = { heart: 'Floating heart', intro: 'Magical intro', cake: 'Birthday cake', balloons: 'Pop the balloons', letter: 'Personal letter', video: 'Cat video surprise', memories: 'Photo memories', timeline: 'Memory timeline', wishjar: 'Wish jar', finale: 'Grand finale' }


export const messageTemplates = [
  { category: 'Birthday', title: 'Warm birthday wish', text: 'Happy birthday, {name}! I hope this new chapter brings you peace, big laughter, little adventures, and all the love you give so freely to everyone around you. You deserve beautiful things, today and always.' },
  { category: 'Funny', title: 'Funny & chaotic', text: 'Happy birthday, {name}! You are officially older, not necessarily wiser, and still my favourite kind of chaos. May your cake be huge, your responsibilities be tiny, and your photos look good from every angle.' },
  { category: 'Emotional', title: 'From the heart', text: 'Dear {name}, some people make life feel softer simply by being in it. You have been that kind of person for me. Thank you for the little things, the honest moments, and the memories I will always carry. I hope you feel as loved as you make others feel.' },
  { category: 'Best friend', title: 'Best-friend energy', text: 'To my favourite human, {name}: thank you for every laugh that turned into tears, every random plan, every late conversation, and every time you just understood. Life is better with you in it. More memories, more madness, always.' },
  { category: 'Romantic', title: 'Soft romantic note', text: 'My {name}, if I could give you one thing, it would be the chance to see yourself through my eyes. You would understand why the smallest moments with you mean so much, and why choosing you feels like the easiest thing in the world.' },
  { category: 'Short caption', title: 'Short & sweet', text: 'You make ordinary days feel a little magical, {name}. This little universe is just a reminder that you matter. Always. ♡' },
] as const

// Add your licensed/owned media to public/media and update these paths.
// One owner-hosted soundtrack and one owner-hosted birthday video.
export const hostedMusic = '/media/music/celebration.mp3'
export const hostedBirthdayVideo = '/media/birthday-videos/birthday-cat.mp4'
export const hostedPopSound = '/media/effects/balloon-pop.mp3'

export const cakeStyles = [
  { id: 'matcha', title: 'Matcha garden', emoji: '🍵' },
  { id: 'lemon', title: 'Lemon sunshine', emoji: '🍋' },
  { id: 'rainbow', title: 'Rainbow dream', emoji: '🌈' },
  { id: 'galaxy', title: 'Galaxy night', emoji: '🌌' },
  { id: 'caramel', title: 'Salted caramel', emoji: '🍮' },
  { id: 'strawberry', title: 'Strawberry blush', emoji: '🍓' },
  { id: 'chocolate', title: 'Chocolate ganache', emoji: '🍫' },
  { id: 'vanilla-gold', title: 'Vanilla gold', emoji: '✨' },
  { id: 'red-velvet', title: 'Red velvet luxe', emoji: '❤️' },
  { id: 'heart-cake', title: 'Heart-shaped cake', emoji: '💗' },
  { id: 'tiered', title: 'Three-tier celebration', emoji: '🎂' },
  { id: 'blueberry', title: 'Blueberry cloud', emoji: '🫐' },
  { id: 'floral', title: 'Floral garden cake', emoji: '🌸' },
] as const
export const bouquetStyles = [
  { id: 'roses', title: 'Velvet red roses', emoji: '🌹', flowers: '🌹🌹🌹' },
  { id: 'tulips', title: 'Spring tulip wrap', emoji: '🌷', flowers: '🌷🌷🌷' },
  { id: 'mixed', title: 'Wildflower hand-tie', emoji: '💐', flowers: '🌼🌸🌷' },
  { id: 'sunflowers', title: 'Sunshine bouquet', emoji: '🌻', flowers: '🌻🌻🌼' },
  { id: 'orchids', title: 'Orchid elegance', emoji: '🪻', flowers: '🪻🌸🪻' },
  { id: 'peonies', title: 'Pink peonies', emoji: '🌸', flowers: '🌸🌸🌸' },
  { id: 'wildflowers', title: 'Meadow wildflowers', emoji: '💐', flowers: '🌼🪻🌸' },
  { id: 'heart', title: 'Heart-shaped bouquet', emoji: '💝', flowers: '💗🌹💗' },
  { id: 'bubbly', title: 'Bubbly bold', display: "'Fredoka', sans-serif", script: "'Lobster', cursive", body: "'DM Sans', sans-serif" },
  { id: 'cursive', title: 'Neat cursive', display: "'Caveat', cursive", script: "'Caveat', cursive", body: "'Caveat', cursive" },
] as const
export const textAnims = [
  { id: 'rise', title: 'Rise up' }, { id: 'fade', title: 'Soft fade' }, { id: 'typewriter', title: 'Typewriter' },
  { id: 'glow', title: 'Glow pulse' }, { id: 'bounce', title: 'Bounce' }, { id: 'shimmer', title: 'Shimmer' }, { id: 'none', title: 'No animation' },
]

/** Theme palettes drive every balloon, the tree and the video-card balloons so they always match the selected theme. */
export interface ThemePalette { balloons: string[]; branch: string; trunk: string; glow: string }
export const themePalettes: Record<ThemeName, ThemePalette> = {
  'Rose Romance': { balloons: ['#ff7aa8', '#e23d78', '#ffb3cc', '#c42a63', '#ff9fbf'], branch: '#c58aa5', trunk: '#8a5470', glow: '#ff6ea4' },
  'Midnight Galaxy': { balloons: ['#7a6bff', '#a35cff', '#5ac8ff', '#c9a8ff', '#4a55d6'], branch: '#8a86c8', trunk: '#4d4b8c', glow: '#8c7bff' },
  'Peach Dream': { balloons: ['#ffb08a', '#f37f9c', '#ffd0b5', '#ff9a8d', '#e86f8c'], branch: '#d39a86', trunk: '#9a6256', glow: '#ff9b7e' },
  'Golden Celebration': { balloons: ['#f0c15a', '#ffe08a', '#d98a3d', '#fff1c4', '#b8742a'], branch: '#cfa76a', trunk: '#7f5a3a', glow: '#e6b85e' },
  'Lavender Night': { balloons: ['#b9a2ff', '#8d6ee8', '#d9ccff', '#7a5ad0', '#a98bf5'], branch: '#a596d6', trunk: '#5d4a93', glow: '#ae87ff' },
  'Sakura Garden': { balloons: ['#ffb7d5', '#ff8fbf', '#ffd9ea', '#e06aa0', '#ffa3c8'], branch: '#c99aae', trunk: '#8a5a6c', glow: '#ff8fc1' },
  'Ocean Hearts': { balloons: ['#6fd8e6', '#3b9bd6', '#a6efee', '#2b73b8', '#59c1d9'], branch: '#7fb3c4', trunk: '#3e6f8a', glow: '#4fc5e0' },
  'Pastel Wonderland': { balloons: ['#ffc2e2', '#b8d8ff', '#e0c8ff', '#c6f0d8', '#ffe2b8'], branch: '#c9b1cf', trunk: '#8f7a9c', glow: '#ffcaec' },
  'Neon Fantasy': { balloons: ['#ff4fc8', '#7a5cff', '#3df0ff', '#ff8a3d', '#b6ff3d'], branch: '#b08ad8', trunk: '#5a3f8a', glow: '#ff32c7' },
  'Sunset Glow': { balloons: ['#ff9a5c', '#ff5e7e', '#ffc46b', '#c2307a', '#ff7f50'], branch: '#d9946a', trunk: '#8a4a3a', glow: '#ff7a4d' },
  'Emerald Garden': { balloons: ['#4fd69a', '#2fa37c', '#a8f0c6', '#1f7a62', '#7be0a8'], branch: '#7fb89a', trunk: '#3f6b57', glow: '#3de0a0' },
  'Cotton Candy': { balloons: ['#ffa8dc', '#9fd0ff', '#ffd1ef', '#7db8ff', '#ff8fd0'], branch: '#c8b4e0', trunk: '#8f78b0', glow: '#ff9fd8' },
  'Royal Velvet': { balloons: ['#9d4edd', '#c77dff', '#ffd166', '#7b2cbf', '#e0aaff'], branch: '#a88bd0', trunk: '#4a2a6e', glow: '#b565ff' },
  'Aurora Sky': { balloons: ['#5ef2c8', '#4a8bff', '#a78bfa', '#38d6e0', '#7ee8a8'], branch: '#8ad0c8', trunk: '#3f6a8a', glow: '#4af0d0' },
  'Mocha Cream': { balloons: ['#e8c9a8', '#c99a74', '#f5e1c8', '#a8704f', '#d9b08c'], branch: '#c9a888', trunk: '#7a4a38', glow: '#e0b088' },
  'Meow Magic': { balloons: ['#f4a5d7', '#a68bff', '#ffd0ea', '#8f6ee0', '#ff9fd0'], branch: '#c3a0d6', trunk: '#7c5a98', glow: '#ff99da' },
}
/** Experiences created before the cat-video scene existed get it right after the letter (schema v2 and up manage it themselves). */
export const SCHEMA_VERSION = 2
export function normalizeScenes(scenes: SceneId[], v?: number): SceneId[] {
  if ((v ?? 1) >= SCHEMA_VERSION || scenes.includes('video')) return scenes
  const i = scenes.indexOf('letter'); if (i < 0) return scenes
  const out = [...scenes]; out.splice(i + 1, 0, 'video'); return out
}

/** Love-letter font pairings. `display` = headings, `script` = handwritten accents, `body` = letter text. */
export const loveFonts = [
  { id: 'classic', title: 'Classic romance', display: "'Playfair Display', serif", script: "'Great Vibes', cursive", body: "'Playfair Display', serif" },
  { id: 'vows', title: 'Wedding vows', display: "'Cormorant Garamond', serif", script: "'Allura', cursive", body: "'Cormorant Garamond', serif" },
  { id: 'handwritten', title: 'Handwritten note', display: "'Dancing Script', cursive", script: "'Dancing Script', cursive", body: "'Dancing Script', cursive" },
  { id: 'parisian', title: 'Parisian love', display: "'Parisienne', cursive", script: "'Parisienne', cursive", body: "'Cormorant Garamond', serif" },
  { id: 'sweet', title: 'Sweet & playful', display: "'Pacifico', cursive", script: "'Satisfy', cursive", body: "'DM Sans', sans-serif" },
  { id: 'whisper', title: 'Soft whisper', display: "'Sacramento', cursive", script: "'Sacramento', cursive", body: "'Cormorant Garamond', serif" },
] as const
export const fontById = (id?: string) => loveFonts.find(f => f.id === id) || loveFonts[0]

/** Tap-to-fill suggestions shown under each field in the creator. {name} is replaced with the recipient. */
export const suggestions = {
  title: ['A birthday wish made just for you', 'Something small, from my whole heart', 'For my favourite person', 'Our little world, wrapped for you', 'Open this when you miss me'],
  greeting: ['Happy Birthday, {name}! 🎂', 'Hey you, {name} ♡', 'Dear {name},', 'To the one who owns my heart,', 'My dearest {name},'],
  instruction: ['Touch the heart when the countdown ends ♡', 'Pull the arrow back and let love fly', 'Come closer… your surprise is ready', 'Tap anywhere to begin the magic ✨'],
  closing: ['With all my love,', 'Forever yours,', 'Always and then some,', 'Yours, completely,', 'Love, your favourite human'],
  caption: ['The day I knew', 'Our favourite chaos', 'Just us ♡', 'Remember this?', 'Pure happiness'],
  wishes: [
    'You make ordinary days brighter.', 'I hope you never forget how loved you are.', 'May every dream you hold find its way to you.', 'Thank you for being exactly you.',
    'Here is to more memories together.', 'May your year taste like cake and feel like home.', 'You are my favourite hello and my hardest goodbye.', 'Never stop shining — the world needs your light.',
    'I wish you slow mornings and big laughs.', 'You deserve every good thing coming your way.', 'Every day with you is a gift.', 'May your heart stay as kind as it is today.',
  ],
  letter: [
    'Some people make the world feel softer just by being in it. You are one of them.',
    'I never say it enough, so let me say it here: thank you for being you, and for being mine.',
    'If I could gift you one thing, it would be a way to see yourself through my eyes.',
    'Every memory with you is my favourite one — and somehow we keep making new ones.',
  ],
}
