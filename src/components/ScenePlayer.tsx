import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Heart, Volume2, VolumeX, RotateCcw, Download, Share2, Sparkles, X } from 'lucide-react'
import type { Experience, SceneId } from '../types'
import { sceneLabels, bouquetStyles, themePalettes, fontById, suggestions, revealFor, toTitleCase, videoFor } from '../data'
import { sfx } from '../lib/sfx'
import TapFX from './TapFX'
import MemoryGallery from './MemoryGallery'
import GiftIntro from './GiftIntro'
import Timeline from './Timeline'
import IntroStage from './IntroStage'
import { introFor } from '../data'
import { WishStar, CalendarFlip, SnowGlobe, Postcard, Fortune, LyricReveal, InviteCard } from './scenes/MoreScenes'
import { effectiveFlow } from '../lib/flow'
import { PetalFall, ShootingStars, Parcel, Bottle } from './scenes/NewScenes'
import { Trophy, Recipe, Meter, Reasons } from './scenes/PersonScenes'
import { Candles, OpenWhen, Polaroids, SpinWheel, StarSky, Vows, Lanterns, WaxSeal, MysteryBoxes, ScratchCard } from './scenes/OccasionScenes'
import OccasionDeco from './OccasionDeco'
import BirthdayReveal from './BirthdayReveal'
import WishJar from './WishJar'
import DevCredit from './DevCredit'
import { CounterScene, MomentsScene } from './scenes/ExtraScenes'
import { momentsTitle } from '../lib/occasionContent'
import Fireworks from './Fireworks'
import FullScreenFX from './FullScreenFX'
import ThankYou from './ThankYou'
import Teaser from './Teaser'
import { addReminder } from '../lib/reminder'
import { getWishes } from '../services/wishes'
import { trackOpen, pingView } from '../services/stats'
import type { Wish } from './WishJar'
import { saveShareCard } from '../lib/shareCard'
import ReactionCapture from './ReactionCapture'
import { audio } from '../lib/audioManager'
import WorldAmbient from './WorldAmbient'
import RelationOpener from './scenes/RelationOpener'
import { glyphFor, isPartnerWorld } from '../lib/worlds'
import { occasionKey } from '../lib/occasionContent'
import BouquetArtwork from './BouquetArtwork'
import BowScene from './scenes/BowScene'
import CakeAssembly from './scenes/CakeAssembly'
import BalloonTree from './scenes/BalloonTree'
import EnvelopeLetter from './scenes/EnvelopeLetter'
import CatVideoScene from './scenes/CatVideoScene'
import VoiceNote from './VoiceNote'
import { DEFAULT_SCENE_STUDIO, fetchSceneStudio, type SceneStudioConfig } from '../lib/sceneStudio'
import { SEASON_THEME } from '../lib/seasonTheme'

type Props = { experience: Experience; onClose: () => void; preview?: boolean; onFinish?: () => void; previewActions?: { onEdit: () => void; onShare: () => void } }
const known = Object.keys(sceneLabels) as SceneId[]
const defaultWishes = suggestions.wishes.slice(0, 5)
const hapticsAllowed = () => true   // haptics are always on
/** Each scene arrives with its own motion, so the story never feels like the same slide repeating. */
const TRANS = [
  { initial: { opacity: 0, y: 26, scale: .98 }, exit: { opacity: 0, y: -16, scale: .99 } },
  { initial: { opacity: 0, x: 60 }, exit: { opacity: 0, x: -60 } },
  { initial: { opacity: 0, scale: .86 }, exit: { opacity: 0, scale: 1.08 } },
  { initial: { opacity: 0, rotate: -3, y: 24 }, exit: { opacity: 0, rotate: 3, y: -18 } },
  { initial: { opacity: 0, filter: 'blur(14px)', scale: 1.04 }, exit: { opacity: 0, filter: 'blur(10px)' } },
  { initial: { opacity: 0, x: -60 }, exit: { opacity: 0, x: 60 } },
]

export default function ScenePlayer({ experience: rawExperience, onClose, preview = false, onFinish, previewActions }: Props) {
  const [studio, setStudio] = useState<SceneStudioConfig>(DEFAULT_SCENE_STUDIO)
  useEffect(() => { let alive = true; void fetchSceneStudio().then(v => { if (alive) setStudio(v) }); const changed = (e: Event) => { const d = (e as CustomEvent<SceneStudioConfig>).detail; if (d) setStudio({ ...DEFAULT_SCENE_STUDIO, ...d }) }; window.addEventListener('lovora:scene-config', changed); return () => { alive = false; window.removeEventListener('lovora:scene-config', changed) } }, [])
  const [senderOut, setSenderOut] = useState(false)   // "guess who sent it": the sender stays secret until the finale
  const experience = useMemo(() => {
    let e = rawExperience
    if (e.extras?.nickname?.trim()) e = { ...e, recipient: e.extras.nickname.trim() }
    if (e.extras?.anonymous && !senderOut) e = { ...e, sender: 'someone who adores you' }
    return e
  }, [rawExperience, senderOut])
  const photoCount = experience.memories.length
  const scenes = useMemo(() => {
    // the story order is set by occasion + person (older surprises are brought into line); no coupon book any more
    const base = effectiveFlow(experience)
    const seasonal = experience.seasonKey && SEASON_THEME[experience.seasonKey] ? SEASON_THEME[experience.seasonKey].scenes : []
    const story = [...new Set([...seasonal, ...base])] as SceneId[]
    const s = story.filter(x => known.includes(x) && x !== 'coupons').filter(x => x === 'counter' ? !!experience.togetherSince : x === 'moments' ? (experience.moments || []).some(t => t.trim()) : x === 'openwhen' ? (experience.openWhen || []).some(o => o.note.trim()) : (x === 'memories' || x === 'timeline' || x === 'polaroids') ? photoCount > 0 : true)
    const usable = s.length ? s : (['heart'] as SceneId[])
    if (!studio.playerOrderEnabled || !studio.playerOrder.length) return usable
    const rank = new Map<SceneId, number>()
    studio.playerOrder.forEach((id, i) => rank.set(id, i))
    return usable.map((id, i) => ({ id, i })).sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999) || a.i - b.i).map(x => x.id)
  }, [experience.scenes, experience.v, experience.occasion, experience.relation, experience.togetherSince, experience.moments, experience.openWhen, experience.extraScenes, experience.sceneOrder, experience.seasonKey, photoCount, studio.playerOrderEnabled, studio.playerOrder])
  const [index, setIndex] = useState(0)
  const [opened, setOpened] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {   // soundtrack bass -> --beat (0..1) on the player root; balloon glow in CSS follows it
    if (!opened) return
    const an = audio.getAnalyser(), bins = an ? new Uint8Array(an.frequencyBinCount) : null
    let raf = 0, beat = 0, avg = 0
    const loop = (t: number) => {
      let target = .35 + Math.sin(t / 480) * .12      // gentle idle pulse when the beat can't be read
      if (an && bins) { an.getByteFrequencyData(bins); const e = (bins[0] + bins[1] + bins[2]) / 3; if (e > 8) { avg = avg * .95 + e * .05; target = Math.min(1, Math.max(0, (e - avg * .8) / (avg * .7 + 20))) } }
      beat = Math.max(target, beat * .88)
      rootRef.current?.style.setProperty('--beat', beat.toFixed(3))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf)
  }, [opened])
  const viewId = useRef(''), startedAt = useRef(0), furthest = useRef(0), replays = useRef(0)
  useEffect(() => { furthest.current = Math.max(furthest.current, index) }, [index])
  useEffect(() => {   // creator stats: count the open, then ping watch time / furthest scene / replays
    if (!opened || preview || !experience.published) return
    let alive = true; startedAt.current = Date.now()
    void trackOpen(experience.id).then(id => { if (alive && id) viewId.current = id })
    const send = () => { if (viewId.current) void pingView(viewId.current, { seconds: Math.round((Date.now() - startedAt.current) / 1000), furthest: furthest.current, total: experience.scenes.length, replays: replays.current }) }
    const t = window.setInterval(send, 8000), vis = () => { if (document.visibilityState === 'hidden') send() }
    document.addEventListener('visibilitychange', vis)
    return () => { alive = false; window.clearInterval(t); document.removeEventListener('visibilitychange', vis); send() }
  }, [opened, preview, experience.id, experience.published, experience.scenes.length])
  const [liveWishes, setLiveWishes] = useState<Wish[]>([])
  useEffect(() => {   // wishes friends added through /wish/:id; refreshed while the surprise is open
    if (!experience.published) return
    let alive = true; const load = () => { void getWishes(experience.id).then(w => { if (alive) setLiveWishes(w) }) }
    load(); const t = window.setInterval(load, 20000); return () => { alive = false; window.clearInterval(t) }
  }, [experience.id, experience.published])
  const [popped, setPopped] = useState<number[]>([])
  const [wish, setWish] = useState(false)
  const [heartOpen, setHeartOpen] = useState(false)
  const [revealPlaying, setRevealPlaying] = useState(false)
  const [thanksOpen, setThanksOpen] = useState(false)
  const [heartCovered, setHeartCovered] = useState(false)   // black halves have closed: bow scene is removed so it can't show through when they split
  const [soundOn, setSoundOn] = useState(true)
  const [, setMemoryIndex] = useState(0)
  const [bouquetOpen, setBouquetOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const scene = scenes[Math.min(index, scenes.length - 1)]
  useEffect(() => { if (scene === 'finale') setSenderOut(true) }, [scene])
  const palette = themePalettes[experience.theme] || themePalettes['Rose Romance']
  const unlockAt = experience.targetDate ? new Date(`${experience.targetDate}T00:00:00`).getTime() : 0
  const locked = Boolean(!preview && experience.published && unlockAt && now < unlockAt)
  const countdown = Math.max(0, unlockAt - now)
  const balloonCount = Math.max(3, Math.min(10, experience.balloonCount || 5))
  const letterText = experience.message || 'Some people make the world feel a little softer just by being in it. You are one of those people. I hope this little surprise reminds you how loved and appreciated you are.'
  const lenRef = useRef(scenes.length); lenRef.current = scenes.length
  const hitTimer = useRef(0)

  // Stable helpers: scene components keep long-running timelines, so these must not change between renders.
  const next = useCallback(() => { sfx.next(); setIndex(i => Math.min(i + 1, lenRef.current - 1)) }, [])
  const previous = useCallback(() => setIndex(i => Math.max(i - 1, 0)), [])
  const buzzScale = ({ 'Love letter': .55, Anniversary: .8, 'Special surprise': 1.1 } as Record<string, number>)[experience.occasion] ?? 1
  const buzz = useCallback((pattern: number | number[]) => { try { if (navigator.vibrate && hapticsAllowed()) navigator.vibrate(Array.isArray(pattern) ? pattern.map(n => Math.round(n * buzzScale)) : Math.round(pattern * buzzScale)) } catch { /* unsupported */ } }, [buzzScale])
  useEffect(() => { sfx.setPack(experience.occasion) }, [experience.occasion])
  useEffect(() => { document.documentElement.classList.remove('calm', 'big-text') }, [])
  const unlockAudio = useCallback(() => { audio.unlock(); sfx.unlock() }, [])

  // countdown ticks only while the lock screen is visible (no per-second re-render of the animated scenes)
  useEffect(() => { if (!locked) return; const t = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(t) }, [locked])
  // audio: unlock on first interaction, tidy up when the player closes
  useEffect(() => { audio.armGestureUnlock(); return () => { window.clearTimeout(hitTimer.current); audio.reset(); try { navigator.vibrate?.(0) } catch { /* ignore */ } } }, [])
  useEffect(() => { audio.setPopBlocked(scene === 'letter'); if (scene !== 'balloons') audio.stopPop() }, [scene])
  useEffect(() => { audio.setMusicEnabled(soundOn); sfx.setEnabled(soundOn) }, [soundOn])
  useEffect(() => { sfx.setEnabled(true); return () => sfx.setEnabled(true) }, [])
  // the soundtrack starts at the arrow hit; if the heart scene is skipped or absent it starts as soon as the story moves on (never during the cat video)
  useEffect(() => { if (scene !== 'heart' && scene !== 'video') audio.startMusic() }, [scene])

  const onHit = useCallback(() => {
    setHeartOpen(true); setHeartCovered(false); setRevealPlaying(true)   // BirthdayReveal plays, then calls onRevealDone -> next scene
    audio.startMusic()                      // synchronised with the split-screen birthday reveal
    buzz([35, 45, 80])
  }, [buzz])
  const onRevealDone = useCallback(() => { setRevealPlaying(false); next() }, [next])
  useEffect(() => { if (scene !== 'heart') setRevealPlaying(false) }, [scene])
  const onWish = useCallback(() => { setWish(true); buzz([20, 35, 20]) }, [buzz])
  const onPop = useCallback((i: number, variant = 0) => { setPopped(p => (p.includes(i) ? p : [...p, i])); buzz([24, 30, 12]); sfx.pop(variant) }, [buzz])
  const share = async () => {
    const url = experience.published ? `${window.location.origin}/s/${experience.id}` : window.location.href
    try { if (navigator.share) await navigator.share({ title: experience.title, text: `A little surprise for ${experience.recipient}`, url }); else await navigator.clipboard.writeText(url) } catch { /* user cancelled */ }
  }
  const replay = () => { replays.current += 1; window.clearTimeout(hitTimer.current); setIndex(0); setPopped([]); setWish(false); setHeartOpen(false); setRevealPlaying(false); setHeartCovered(false); setBouquetOpen(false); setBouquetPhase(0); setMemoryIndex(0); setThanksOpen(false) }
  const font = fontById(experience.fontStyle)
  const fontVars = { ['--lv-display' as string]: font.display, ['--lv-script' as string]: font.script, ['--lv-body' as string]: font.body } as React.CSSProperties
  const themeClass = `theme-${experience.theme.toLowerCase().replaceAll(' ', '-')}`
  const seasonVisual = experience.seasonKey ? SEASON_THEME[experience.seasonKey] : undefined
  const playerStyle = { ...fontVars, ['--lv-fx-intensity' as string]: String(studio.enabled ? studio.intensity / 100 : 0), ...(seasonVisual ? { ['--accent' as string]: seasonVisual.colors.accent, ['--accent2' as string]: seasonVisual.colors.accent2, ['--teal' as string]: seasonVisual.colors.teal, ['--lv-season-tint' as string]: seasonVisual.colors.tint } : {}) } as React.CSSProperties
  const transitions = studio.preset === 'cinematic' ? [{ initial: { opacity: 0, scale: .82, filter: 'blur(18px)' }, exit: { opacity: 0, scale: 1.12, filter: 'blur(12px)' } }] : studio.preset === 'playful' ? [{ initial: { opacity: 0, y: 35, rotate: -4, scale: .88 }, exit: { opacity: 0, y: -24, rotate: 4, scale: .92 } }] : studio.preset === 'gentle' ? [{ initial: { opacity: 0, y: 10 }, exit: { opacity: 0 } }] : TRANS
  const confetti = useMemo(() => Array.from({ length: 36 }, (_, i) => i), [])
  const greeting = experience.greeting || `Dear ${experience.recipient || 'you'},`
  const revealTitle = revealFor(experience)   // editable big words (defaults per occasion)
  const useBow = isPartnerWorld(experience.relation), glyph = glyphFor(experience.relation)
  const heartLight = useBow && scene === 'heart' && !heartCovered && !(heartOpen && !revealPlaying)   // cream bow-game look until the black halves close
  const [bouquetPhase, setBouquetPhase] = useState<0 | 1 | 2>(0)
  const openBouquet = () => { if (bouquetPhase) return; setBouquetPhase(1); buzz([15, 25, 15]); sfx.boom('stars'); window.setTimeout(() => { setBouquetPhase(2); setBouquetOpen(true); buzz([20, 30, 20, 30, 60]); sfx.boom('love') }, 1100) }
  const bouquetTitle = bouquetStyles.find(b => b.id === experience.bouquetStyle)?.title

  if (locked) return <Teaser experience={experience} themeClass={themeClass} countdown={countdown} />

  if (!opened) return <div className={`player ${themeClass} lv-fx-${studio.preset}`} style={playerStyle}><GiftIntro recipient={experience.recipient} secret={experience.secretMessage} colors={palette.balloons} onOpen={() => { audio.unlock(); setOpened(true) }} /></div>
  return <div ref={rootRef} data-occ={experience.occasion} data-season={experience.seasonKey || ''} className={`player ta-host ta-${experience.textAnim || 'rise'} ${themeClass} lv-fx-${studio.preset} ${heartLight ? 'hs-on' : ''} ${useBow ? '' : 'no-hearts'}`} style={playerStyle} role="dialog" aria-modal="true" aria-label="Interactive surprise"><OccasionDeco occasion={experience.occasion} colors={palette.balloons} />
    <TapFX active={scene === 'finale' || scene === 'memories'} colors={palette.balloons} buzz={buzz} />
    <div className="player-top">
      <button className={`icon-btn ${heartLight ? 'hs-back' : ''}`} onClick={onClose} aria-label="Close experience">{heartLight ? <><ArrowLeft size={18} /> Back</> : <X />}</button>
      {scene === 'heart' && !heartOpen && preview && <span className="hs-preview" role="note">👁 PREVIEW MODE</span>}
      <div className="player-progress">{scenes.map((s, i) => <button key={s} onClick={() => setIndex(i)} className={i === index ? 'active' : ''} aria-label={`Go to ${sceneLabels[s]}`} />)}</div>
      <button className="icon-btn" onClick={() => void saveShareCard(experience.recipient, experience.sender, palette.balloons, experience.occasion)} aria-label="Save share card"><Download /></button>
      <button className="icon-btn" onClick={() => { audio.unlock(); setSoundOn(v => !v) }} aria-label={soundOn ? 'Mute sound' : 'Turn sound on'}>{soundOn ? <Volume2 /> : <VolumeX />}</button>
    </div>
    <WorldAmbient occasion={occasionKey(experience.occasion)} relation={experience.relation} colors={palette.balloons} />
    <AnimatePresence mode="wait">
      <motion.section key={scene} className={`scene scene-${scene}`} initial={transitions[index % transitions.length].initial} animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0, filter: 'blur(0px)' }} exit={transitions[index % transitions.length].exit} transition={{ duration: studio.preset === 'gentle' ? .65 : studio.preset === 'cinematic' ? .58 : .38, ease: 'easeOut' }} aria-live="polite">
        {scene === 'heart' && <div className="scene-content cupid-scene">
          {(!heartOpen || (revealPlaying && !heartCovered)) && (useBow ? <BowScene onHit={onHit} buzz={buzz} onGesture={unlockAudio} /> : <RelationOpener relation={experience.relation} occasion={occasionKey(experience.occasion)} onHit={onHit} buzz={buzz} onGesture={unlockAudio} colors={palette.balloons} />)}
          {heartOpen && !revealPlaying && <><p className="eyebrow">MADE JUST FOR YOU</p><h1>{toTitleCase(revealTitle)}</h1><h2>{experience.recipient || 'Beautiful human'} <span>{glyph}</span></h2></>}
        </div>}
        {scene === 'heart' && revealPlaying && <BirthdayReveal title={revealTitle} name={experience.recipient || 'Beautiful human'} display={font.display} script={font.script} accent={palette.balloons[0]} onCovered={() => setHeartCovered(true)} onDone={onRevealDone} />}

        {scene === 'intro' && <IntroStage text={`${toTitleCase(revealTitle)}${experience.recipient ? ', ' + experience.recipient : ''}!`} subtitle={experience.title} colors={palette.balloons} style={introFor(experience)} onNext={next} />}

        {scene === 'cake' && <div className="scene-content"><p className="eyebrow">MAKE A WISH</p>
          <CakeAssembly style={experience.cakeStyle || 'strawberry'} age={experience.age} wished={wish} onWish={onWish} buzz={buzz} />
          <h1>{wish ? 'Wish sent into the universe ✨' : 'A wish, just for you'}</h1><p className="muted">{wish ? 'May the sweetest things find you.' : 'When the candle is lit, tap the cake, blow it out and make a wish.'}</p>
          {wish && <button className="primary-btn" onClick={next}>Keep going <ArrowRight size={17} /></button>}</div>}

        {scene === 'balloons' && <div className="scene-content wide balloon-scene no-select"><p className="eyebrow">LITTLE WISHES, JUST FOR YOU</p><h1>A little <em>wish tree.</em></h1>
          <p className="muted">Pop each balloon to release a wish · {popped.length}/{balloonCount}</p>
          {popped.length === 0 && <p className="pop-instruction" role="note"><span>👆</span> Tap the big glowing balloons to pop them — each one hides a wish for you.</p>}
          <BalloonTree palette={palette} count={balloonCount} popped={popped} onPop={onPop} round={!useBow} glyph={glyph} />
          {popped.length > 0 && <div className="wish-stack">{popped.map((i, k) => <motion.div key={i} className={`wish-card ${k === popped.length - 1 ? 'latest' : ''}`} initial={{ opacity: 0, scale: .7, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 230, damping: 17 }}><span>WISH {String(i + 1).padStart(2, '0')}</span><p>{experience.balloonWishes?.[i] || defaultWishes[i % defaultWishes.length]}</p></motion.div>)}</div>}
          {popped.length >= balloonCount && <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="all-wishes-note"><span>♡</span><strong>Every wish, just for you.</strong><p>Keep these little reminders close, today and always.</p><button className="primary-btn" onClick={next}>Open your letter <ArrowRight size={17} /></button></motion.div>}
        </div>}

        {scene === 'letter' && <div className="scene-content"><EnvelopeLetter recipient={experience.recipient} greeting={greeting} text={letterText} closing={experience.closing} sender={experience.sender} buzz={buzz} onDone={next} />{experience.voiceData && <VoiceNote src={experience.voiceData} />}</div>}

        {scene === 'video' && <div className="scene-content wide"><CatVideoScene palette={palette.balloons} onDone={next} buzz={buzz} src={videoFor(experience)} custom={!!experience.videoData} /></div>}

        {scene === 'memories' && <div className="scene-content wide"><p className="eyebrow">OUR LITTLE TIME CAPSULE</p><h1>Little moments, <em>big feelings.</em></h1>{experience.memories.length ? <MemoryGallery memories={experience.memories} colors={palette.balloons} buzz={buzz} />
          : <div className="empty-memory"><span>♡</span><p>Some memories are kept in the heart.</p><small>Add photos or videos in the creator to make this part yours.</small></div>}<button className="primary-btn" onClick={next}>One last thing <ArrowRight size={17} /></button></div>}

        {scene === 'timeline' && <div className="scene-content wide"><p className="eyebrow">THE STORY SO FAR</p><h1>Our little <em>timeline.</em></h1>{experience.memories.length ? <Timeline memories={experience.memories} buzz={buzz} onDone={next} /> : <p className="muted">Add photos with dates to build your timeline.</p>}</div>}
        {scene === 'wishstar' && <WishStar exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'calendar' && <CalendarFlip exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'snowglobe' && <SnowGlobe exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'postcard' && <Postcard exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'fortune' && <Fortune exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'lyric' && <LyricReveal exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'invite' && <InviteCard exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'candles' && <Candles exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'openwhen' && <OpenWhen exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'polaroids' && <Polaroids exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'spinwheel' && <SpinWheel exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'starsky' && <StarSky exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'vows' && <Vows exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'lanterns' && <Lanterns exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'waxseal' && <WaxSeal exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'mystery' && <MysteryBoxes exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'scratch' && <ScratchCard exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'petalfall' && <PetalFall exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'shootingstars' && <ShootingStars exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'parcel' && <Parcel exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'trophy' && <Trophy exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'recipe' && <Recipe exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'meter' && <Meter exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'reasons' && <Reasons exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'bottle' && <Bottle exp={experience} colors={palette.balloons} onDone={next} buzz={buzz} />}
        {scene === 'counter' && <CounterScene since={experience.togetherSince || ''} onDone={next} />}
        {scene === 'moments' && <MomentsScene title={momentsTitle(experience.relation)} items={experience.moments || []} onDone={next} buzz={buzz} />}
        {scene === 'wishjar' && <div className="scene-content"><p className="eyebrow">MADE WITH LOVE BY YOUR PEOPLE</p><h1>Your <em>wish jar.</em></h1><WishJar colors={palette.balloons} wishes={[...(experience.jarWishes || []).filter(w => w.text.trim()), ...liveWishes].length ? [...(experience.jarWishes || []).filter(w => w.text.trim()), ...liveWishes] : (experience.balloonWishes || []).filter(Boolean).map(text => ({ name: '', text }))} /></div>}
        {scene === 'finale' && <div className="scene-content finale-content"><FullScreenFX><Fireworks colors={palette.balloons} /></FullScreenFX><FullScreenFX><div className="confetti" aria-hidden="true">{confetti.map(i => <i key={i} style={{ left: `${(i * 29) % 100}%`, animationDelay: `${(i % 9) * .14}s`, transform: `rotate(${i * 17}deg)` }} />)}</div></FullScreenFX><div className="final-fireworks" aria-hidden="true"><i /><i /><i /></div><Sparkles className="final-spark" size={38} /><p className="eyebrow">A SCRAPBOOK OF MOMENTS</p>
          <div className="scrapbook" aria-label="Scrapbook of moments">
            <div className="scrap-photos">{experience.memories.filter(m => m.kind === 'image').slice(0, 4).map((m, i) => <figure key={m.id} className={`scrap-photo sp-${i}`}><span className="tape" /><img src={m.src} alt={m.caption || 'A cherished memory'} /><figcaption>{m.caption || '♡'}</figcaption></figure>)}{experience.memories.filter(m => m.kind === 'image').length === 0 && <figure className="scrap-photo sp-0 empty"><span className="tape" /><div>♡</div><figcaption>moments kept in the heart</figcaption></figure>}</div>
            <article className="scrap-letter"><span className="tape" /><small>{greeting}</small><p>{(letterText.length > 150 ? letterText.slice(0, 147).trimEnd() + '…' : letterText)}</p><em>{experience.closing || 'With love,'} {experience.sender}</em></article>
            <div className="scrap-wishes">{Array.from({ length: Math.min(3, balloonCount) }, (_, i) => <span key={i} className={`sticker st-${i}`}>{experience.balloonWishes?.[i] || defaultWishes[i % defaultWishes.length]}</span>)}</div>
          </div><h1>{revealTitle}</h1><h2>{experience.recipient || 'Beautiful human'} <span>{glyph}</span></h2><p className="scene-copy">{experience.message || 'May life keep surprising you with beautiful reasons to smile.'}</p>
          {(experience.extras?.jokes || []).filter(j => j.trim()).length > 0 && <div className="joke-row">{(experience.extras?.jokes || []).filter(j => j.trim()).slice(0, 4).map((j, i) => <span key={i}>{j}</span>)}</div>}
          <div className={`bouquet-reveal phase-${bouquetPhase} ${bouquetOpen ? 'opened' : ''}`}><button className={`bouquet-button bouquet-button-${experience.bouquetStyle || 'roses'}`} onClick={openBouquet} aria-label="Reveal your flower bouquet"><span className="bq-rays" aria-hidden="true" /><BouquetArtwork style={experience.bouquetStyle || 'roses'} opened={bouquetOpen} label={`${bouquetTitle || 'Flower'} bouquet`} />{bouquetPhase > 0 && <span className="bq-petal-rain" aria-hidden="true">{Array.from({ length: 18 }, (_, k) => <i key={k} style={{ ['--x' as string]: `${(k * 37) % 100}%`, ['--d' as string]: `${(k % 7) * .18}s`, ['--c' as string]: palette.balloons[k % palette.balloons.length] } as React.CSSProperties} />)}</span>}<small>{bouquetPhase === 2 ? `${bouquetTitle || 'A little bouquet'} — picked just for you ♡` : bouquetPhase === 1 ? 'Unwrapping…' : 'Tap to unwrap your flowers'}</small></button></div>
          <p className="tapfx-hint no-tapfx">✨ Tap anywhere else for fireworks, firecrackers, hearts &amp; confetti</p>
          {preview && previewActions && <div className="preview-end" role="group" aria-label="What next?"><p><b>That is what they will see.</b><span>Happy with it, or want to change something?</span></p><div><button type="button" className="secondary-btn" onClick={previewActions.onEdit}>✏️ Customise it</button><button type="button" className="primary-btn" onClick={previewActions.onShare}>Get the share link <ArrowRight size={16} /></button></div></div>}
          <div className="final-actions"><button className="primary-btn" onClick={replay}><RotateCcw size={16} /> Replay</button><button className="secondary-btn" onClick={share}><Share2 size={16} /> Share</button></div>
          <div className="final-actions"><button className="secondary-btn" onClick={() => void saveShareCard(experience.recipient, experience.sender, palette.balloons, experience.occasion)}><Download size={16} /> Story card</button><ReactionCapture sender={experience.sender} /></div>
          {!preview && <a className="secondary-btn make-one" href={`/?ref=${encodeURIComponent(experience.id)}`} target="_blank" rel="noreferrer">💝 Make one for someone you love</a>}
          {!preview && <button className="primary-btn thanks-btn" onClick={() => setThanksOpen(true)}>Send a thank-you 💌</button>}
          <button className="secondary-btn" onClick={() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); const pad = (n: number) => String(n).padStart(2, '0'); addReminder(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, `💌 Make a new surprise for ${experience.recipient || 'someone you love'}`, window.location.origin) }}>🔔 Remind me next year</button>
          <DevCredit />
          {thanksOpen && <ThankYou sender={experience.sender} recipient={experience.recipient} occasion={experience.occasion} whatsapp={experience.replyWhatsApp} instagram={experience.replyInstagram} url={experience.published ? `${window.location.origin}/s/${experience.id}` : undefined} onClose={() => setThanksOpen(false)} />}</div>}
      </motion.section>
    </AnimatePresence>
    <div className="player-bottom"><button className="text-btn" onClick={previous} disabled={index === 0}><ArrowLeft size={16} /> Back</button><span>{index + 1} / {scenes.length} · {sceneLabels[scene]}</span>{index < scenes.length - 1 ? <button className="text-btn" onClick={next}>Next <ArrowRight size={16} /></button> : <button className="text-btn" onClick={onFinish || onClose}>Finish <Heart size={16} /></button>}</div>
    
  </div>
}
