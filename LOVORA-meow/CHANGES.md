# LOVORA MEOW upgrade — what changed

**Status: NOT built, NOT run, NOT tested.** Only a TypeScript *syntax* scan was done (no errors). Run `npm install && npm run build` first and fix anything it reports.

## Files added
- `src/lib/audioManager.ts` — one shared controller for music + pop sound (items 1 and 4)
- `src/components/scenes/BowScene.tsx` — bow, string, arrow physics (5)
- `src/components/scenes/EnvelopeLetter.tsx` — envelope + letter (2)
- `src/components/scenes/CatVideoScene.tsx` — separate cat-video scene (3)
- `src/components/scenes/CakeAssembly.tsx` — machine-made cake (6)
- `src/components/scenes/BalloonTree.tsx` — growing tree + heart balloons (7)
- `src/components/ui/Select.tsx`, `Toggle.tsx`, `DatePicker.tsx`, `ConfirmDialog.tsx` — themed controls (8)
- `src/components/AuthModal.tsx`, `src/services/auth.tsx`, `src/services/errors.ts` — sign in / sign up / reset (10)
- `src/pages/Landing.tsx`, `src/pages/Dashboard.tsx` — landing moved out of App; new creator dashboard
- `src/upgrade.css`, `src/vite-env.d.ts`

## Files rewritten
`App.tsx`, `main.tsx`, `Editor.tsx`, `ScenePlayer.tsx`, `BouquetArtwork.tsx`, `services/storage/index.ts`, `services/supabase/client.ts`, `lib/supabase.js`, `data.ts`, `types.ts`

## Bug fixed
`vite.config.ts` had `plugins: [react]` (missing `()`), which breaks the build.

## Per request
1. Pop sound: single element, hard stop at 2 s, next pop cuts the previous one, blocked outside the balloon scene (so never in the letter scene).
2. Envelope: seal drops, flap rotates open in 3D, letter slides up out of the pocket, then unfolds and types.
3. Cat video: new scene `catvideo` after the letter, 19:6 card. Card + balloons animate in, video plays afterwards; on end, balloons lift the card away and the story moves on. Old saved experiences get the scene inserted automatically after the letter.
4. Music starts when the arrow actually hits the heart (with the split reveal). Autoplay is blocked until a gesture, so playback is retried on the first tap/key. Music pauses when the video plays and resumes from the saved timestamp.
5. Bow: vertical bow bent toward the target, saturating drag tension, damped-spring release, gravity + drag in flight, aim-assist. The reveal only fires on a real hit; misses reset.
6. Cake: 10 timed stages (machine, conveyor, 3 sponge layers, cream, frosting, rosettes, decorations, candle, flame), 8 style configs. "Skip assembly" button included.
7. Bouquet: layered petals, leaves with veins, filler, paper folds, bow ribbon, staggered bloom. Tree: branches draw themselves, then heart balloons inflate, rise, sway. Colours come from `themePalettes` in `data.ts`.
8. Custom Select, Toggle, DatePicker (also used for memory dates), confirm dialog.
9. Creator step 5 no longer has any music/video notes or pickers. Playback always uses `/media/music/celebration.mp3` and `/media/birthday-videos/birthday-cat.mp4`, whatever a saved payload says.
10. Auth + cloud: sign in/up/reset, session-aware nav, dashboard merging account + device copies, save / publish / unpublish / delete / copy link, friendly error messages. Public links read the existing `published_experiences` view.

## Still needs configuration
- `.env.local` / Vercel env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (the zip only contains placeholders).
- Run `supabase/migrations/0001_experiences.sql` if the tables do not exist yet.
- Supabase → Authentication: enable Email provider; decide on "Confirm email"; add your site URL and redirect URLs.
- Memory photos/videos are still base64 inside the row (8 MB cap per save). Real storage buckets would be better for many large files.
- The 19:6 card crops the video with `object-fit: cover`.
