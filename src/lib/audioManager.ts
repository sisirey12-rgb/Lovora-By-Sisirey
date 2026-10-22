import { hostedMusic, hostedPopSound } from '../data'

/**
 * One shared audio controller for the whole player.
 *  - celebration music: a single <audio>, never recreated, so pause/resume keeps the exact timestamp
 *  - balloon pop: a single <audio>, cut off immediately by the next pop, hard-capped at 2 s, silent during the letter scene
 *  - autoplay: browsers need a user gesture, so we prime the elements on the first interaction
 */
const POP_MAX_MS = 2000
class AudioManager {
  private music: HTMLAudioElement | null = null
  private pop: HTMLAudioElement | null = null
  private popTimer: number | undefined
  private primed = false
  private musicWanted = false      // music should be playing (celebration has started and sound is on)
  private musicEnabled = true      // user's sound toggle
  private pausedByVideo = false
  private resumeAt = 0
  private popBlocked = false
  private listener: (() => void) | null = null

  private ensure() {
    if (!this.music) { this.music = new Audio(hostedMusic); this.music.loop = true; this.music.preload = 'auto'; this.music.volume = .8 }
    if (!this.pop) { this.pop = new Audio(hostedPopSound); this.pop.preload = 'auto'; this.pop.volume = .55 }
  }
  /** Call from any user gesture. Unlocks playback on iOS/Chrome, then starts music if it was already requested. */
  unlock() {
    this.ensure()
    if (!this.primed) {
      this.primed = true
      for (const el of (this.musicWanted ? [this.pop!] : [this.pop!, this.music!])) {
        const prevMuted = el.muted; el.muted = true
        el.play().then(() => { el.pause(); el.currentTime = 0; el.muted = prevMuted }).catch(() => { el.muted = prevMuted; this.primed = false })
      }
    }
    if (this.musicWanted && !this.pausedByVideo) void this.tryPlayMusic()
  }
  /** Install one-shot gesture listeners so a blocked autoplay starts on the very next tap/key. */
  armGestureUnlock() {
    if (this.listener) return
    this.listener = () => this.unlock()
    for (const ev of ['pointerdown', 'touchend', 'keydown', 'click']) window.addEventListener(ev, this.listener, { passive: true })
  }
  disarm() {
    if (!this.listener) return
    for (const ev of ['pointerdown', 'touchend', 'keydown', 'click']) window.removeEventListener(ev, this.listener)
    this.listener = null
  }
  private async tryPlayMusic() {
    this.ensure()
    if (!this.musicEnabled || this.pausedByVideo) return
    try { await this.music!.play() } catch { /* blocked: the armed gesture listener retries on the next interaction */ }
  }
  /** Start (or continue) the celebration soundtrack. Never rewinds. */
  startMusic() { this.musicWanted = true; this.armGestureUnlock(); void this.tryPlayMusic() }
  private an: AnalyserNode | null = null
  /** Beat/volume analyser for the soundtrack (created once, only when something asks for it). */
  getAnalyser(): AnalyserNode | null {
    try {
      if (this.an) return this.an
      this.ensure()
      const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new C(), src = ctx.createMediaElementSource(this.music!), an = ctx.createAnalyser()
      an.fftSize = 256; src.connect(an); an.connect(ctx.destination); void ctx.resume(); this.an = an; return an
    } catch { return null }
  }
  get musicStarted() { return this.musicWanted }
  setMusicEnabled(on: boolean) {
    this.musicEnabled = on
    if (!on) this.music?.pause()
    else if (this.musicWanted && !this.pausedByVideo) void this.tryPlayMusic()
  }
  /** Pause for the cat video and remember exactly where we were. */
  pauseForVideo() {
    if (!this.music || !this.musicWanted || this.pausedByVideo) return
    this.resumeAt = this.music.currentTime
    this.pausedByVideo = true
    this.music.pause()
  }
  /** Resume from the saved timestamp (not from 0). */
  resumeAfterVideo() {
    if (!this.pausedByVideo || !this.music) return
    this.pausedByVideo = false
    if (Math.abs(this.music.currentTime - this.resumeAt) > .25) { try { this.music.currentTime = this.resumeAt } catch { /* metadata not ready */ } }
    void this.tryPlayMusic()
  }
  /** Pop sound: stops the previous pop at once, plays max 2 s, never during the letter scene. */
  setPopBlocked(blocked: boolean) { this.popBlocked = blocked; if (blocked) this.stopPop() }
  playPop() {
    if (this.popBlocked) return
    this.ensure()
    this.stopPop()
    const el = this.pop!
    try { el.currentTime = 0 } catch { /* ignore */ }
    void el.play().catch(() => { /* blocked or missing file: stay silent */ })
    this.popTimer = window.setTimeout(() => this.stopPop(), POP_MAX_MS)
  }
  stopPop() {
    window.clearTimeout(this.popTimer)
    if (this.pop) { this.pop.pause(); try { this.pop.currentTime = 0 } catch { /* ignore */ } }
  }
  /** Full teardown when the player closes. */
  reset() {
    this.stopPop(); this.disarm()
    if (this.music) { this.music.pause(); try { this.music.currentTime = 0 } catch { /* ignore */ } }
    this.musicWanted = false; this.pausedByVideo = false; this.resumeAt = 0; this.popBlocked = false
  }
}
export const audio = new AudioManager()
