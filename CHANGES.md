# Round 10

- **Create sheet no longer covers the share step.** Opening a preview left the create sheet marked as open, so it came back on top (at "Who is it for?") over the share page. It is now closed when a preview starts, and never shown over a share or wish page.
- **Gift code on the last share step** (`RedeemBox.tsx`): "I have a gift code" is now on the final share-link step of the editor and on the "ready to send" screen. A valid code unlocks the link and creates it straight away. A code from `/?gift=CODE` is prefilled.
- **AI writer (Groq)**: reads the key and model with spaces and quotes stripped, uses `max_completion_tokens` 6000 and `reasoning_effort: low` for gpt-oss models (reasoning used to eat the token limit and cut the JSON off), retries without JSON mode if the model rejects it, and shows the real reason to the owner. New **Test the AI connection** button in Account > Website settings (owner only).
- **Seasons, fully themed** (`seasonTheme.ts`, `SeasonFX.tsx`, `seasons.css`): 12 seasons (new: Holi, Dashain, Tihar, Christmas). Each one recolours the whole landing page and nav, has its own effect (rising lanterns and fireworks, falling petals or snow, twinkling stars, drifting kites, colour splashes, hearts), its own banner with suggested scenes, ribbon words, phone stickers, and pre-selects a fitting occasion and person. Switch the season in Account > Website settings (owner only).
- **Landing**: price card and Gift a surprise card side by side (stacked on phones), with the FAQ underneath. FAQ now covers gift codes, payments and languages.

# Round 9

**Countdown teaser** (`Teaser.tsx`): opening the link before the reveal date now shows a shaking gift, a live ticking countdown, the date, a hint from the sender (new field "Countdown teaser" in the editor, step 4), tappable "guess what is inside" emoji and a "Remind me" button.

**Gift a surprise**: buy a prepaid gift code, send it on WhatsApp, and the receiver enters it in the payment window (or opens the link `/?gift=CODE`) to share for free. Buttons: landing page band and the account panel. New table `gift_codes`.

**Owner bypass everywhere**: owner emails (`OWNER_EMAILS`) never pay: share links unlock free (`/api/publish`, `/api/create-order`), eSewa/Khalti start also unlocks free, and gift codes are created free.

**eSewa and Khalti** (NPR): one new function `api/pay.js` (the project now uses 12 of the 12 functions Vercel's free plan allows). The payment window shows only the methods that are configured. Run `supabase/migrations/0007_gifts_nepal.sql`.
Vercel variables: `ESEWA_SECRET_KEY` + `ESEWA_PRODUCT_CODE` (or `ESEWA_MODE=test` for the sandbox), `KHALTI_SECRET_KEY` (and `KHALTI_MODE=test` for the sandbox), `PRICE_NPR` or `NPR_PER_INR` (default 1.6), optional `SITE_URL`.

**Printable QR studio** (`QrStudio.tsx`, `lib/giftCard.ts`): 5 designs, 3 sizes (A6 card, gift tag with a hole, round sticker), rounded QR with an emoji badge, your own line, optional reveal date and sender, Download, Print at real paper size, Share.

**Build fix**: removed an unused variable in `ThemePicker.tsx` and an unused constant in `LandingNew.tsx` that would have stopped `npm run build` (the project uses `noUnusedLocals`).

# Round 8

- Quick-start step 2 now has a **Reveal date** (Today, Tomorrow, In a week, or pick a date) right under the first field, for every occasion (Turning age on birthdays). It is saved with the surprise and unlocks the share link at midnight on that day. Your own previews always open now.
- Step 2 is calmer: one clear line of instructions, one "details" box (the hint chips and long tips are gone), one AI button, one photo button. "Create and preview" and Back now stay pinned at the bottom so they are never cropped.
- The reveal date was removed from the AI sheet, as asked.

# Round 7

- Landing: ONE creator card (occasion, person, story preview, start) replaces the two separate selectors. Starting it opens the quick-start sheet with the person already chosen.
- Fixed the story path that stayed invisible after changing the occasion.
- AI sheet rebuilt: fixed header and footer (nothing cropped), 3 clear steps, fewer fields on screen (words and tone under "More options"), and a **reveal date** (Today, Tomorrow, In a week, or pick a date) that is applied with the draft.

# Round 6

**AI writer**: up to 3 free prompts (about them, a memory, what to say), plus "words to include". Languages: English, Hinglish, Hindi, Nepali, Roman Nepali, Nepali + English. The draft now also fills the new scenes (petals, stars, parcel, bottle, award, recipe, meter, reasons).

**Scenes**: new Award ceremony, Recipe for happiness, Love-o-meter and Reasons card flip, each with editor fields (step 4) and sensible defaults per person. `flowFor` gives every occasion and person its own mix. Shared effects for all scenes (staggered entrances, shimmer, glitter layer) are in `src/scenefx.css`.

**Cropping fix**: the bow stage, cake and wish effects no longer clip their animations (`scenefx.css`).

**Landing**: confetti and glowing phone, interactive "your story, your way" builder, languages showcase, 12-scene library.

# Round 4

**Share link and owner fix**
- New `api/publish.js`: the SERVER creates the share link. Owner accounts (emails in `OWNER_EMAILS`) get it free; everyone else needs a paid surprise (otherwise the pay window opens). The pay window no longer opens for owners.
- `api/account.js` now reports the owner email and whether `OWNER_EMAILS` / `SUPABASE_SERVICE_ROLE_KEY` are set, so the account panel can say why an account is not recognised.
- Account panel: **Website settings** (embed code, home-page season, site theme, owner email) are visible to the owner only.
- Payment window rewritten with big text: "PAYMENT NEEDED", a huge price, a big error box and a big "Payment received" screen.

**AI writer** now uses Groq (`GROQ_API_KEY`, optional `GROQ_MODEL`). Remove `ANTHROPIC_API_KEY`.

**Landing page and palette** redesigned (`LandingNew.tsx`, `landing2.css`, new palette in `fresh.css`: warm cream, tomato, mango, teal; light is the default).

**Preview vs draft animation**: Preview / "Create and preview" now plays a new "Creating your surprise" animation (`CreatingOverlay.tsx`). Save still plays the original "Saving your draft" animation.

**New scenes** (`scenes/NewScenes.tsx`): Rose petals, Shooting stars, Pass the parcel, Message in a bottle. Every occasion and person has a different flow (`flowFor` in `lib/occasionContent.ts`), and every scene now arrives with its own transition.

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

## Calmer landing, per-person worlds, lighter editor
- Landing: removed the phone/camera mock-up, birthday cake, marquee and card grid. Four occasion tiles (each with its own backdrop) lead straight to the occasion → person picker.
- Every occasion and person has its own world: opening scene, floating decoration and wording. Hearts, bow and arrow are for Partner only; Brother = fist bump, Sister = butterflies, Mom = bloom, Dad = trophy, Friend = party popper (`src/lib/worlds.ts`, `scenes/RelationOpener.tsx`, `WorldAmbient.tsx`).
- Anniversary wording is now written separately for brother, sister, mom, dad and friend (`occasionContent.ts`).
- Editor: 6 short steps (Who, Words, Look, Moments, Preview, Share). Optional things sit in closed sections. The scene-flow step is gone; the story is chosen by occasion + person.
- Preview fix: the waiting screen timers restarted on every editor re-render, so the preview never opened. The waiting screen is removed and preview opens directly.

## Round 2
- New PNG logo (cat-ear heart) used for the header, footer, favicon, app icons, manifest and share picture. "@sisirey" removed; "Sisirey" is yellow everywhere.
- Landing page: phone demo that plays link → gift → balloons → cake → letter → finale, "everything inside" cards, three-step guide.
- Every create button leads to the occasion + person picker; the editor no longer asks for them again.
- Preview now opens after the "saving your draft" animation. The quick sheet leads with a "Customise it" button.
- Story order fixed (balloons, cake, photos, moments, video, letter, finale); balloon pop in every occasion and person; coupon book removed.
- Balloon wishes, greetings and message lines are written per person and occasion, with tap-to-use suggestions.
- Reveal title now measures the screen and fits it, so it is no longer cropped on Android. The developer credit no longer floats over the finale buttons.

## Round 3
- **Home-page season switch**: the API now reports the real reason instead of always saying "run SQL 006" (missing `SUPABASE_SERVICE_ROLE_KEY`, anon key used by mistake, stale schema cache, wrong URL). It also upserts with `on_conflict=key`. `0006_site_settings.sql` now grants `service_role` and runs `notify pgrst, 'reload schema'`; if the table already exists, just run those last two lines in the Supabase SQL editor.
- **Landing page**: new calmer layout (hero with the phone demo, at-a-glance strip, occasion cards, three steps, feature grid with icons, pricing beside the FAQ). Styles are in `src/round3.css`; no new dependencies.
- **Auto creator** (`StartSheet.tsx`): venue, party date/time, reveal date, memory date and song-line inputs removed. Only one detail per occasion is left (age, together since, nickname, what we are celebrating). A "Customise it myself" button on both steps opens the full editor with the chosen template.
- **AI writing guide** (`AiGuide.tsx`, used in the auto creator and the Write-with-AI sheet): tap-to-start prompts per person, a progress hint, a short how-to with a weak vs strong example. The server prompt now asks for plain, first-person wording without greeting-card phrases.
- **Theme pickers**: the site picker is a small popover of colour dots (Dark / Light). The editor's theme step is a row of swatches with the chosen name below.
- **Read it to me**: sentence-by-sentence speech with natural pauses, the best-ranked voice on the device (neural/natural first, robotic ones last), softer pitch and rate, emoji and ellipses cleaned up. Optional studio voice: set `OPENAI_API_KEY` in Vercel and `/api/tts` is used automatically; without it nothing changes for visitors.

## Round 3b
- **Preview flow**: the end of every preview now shows "Customise it" and "Get the share link". In the editor, Finish and "Get the share link" jump straight to the last (share) step instead of dropping back where you were; "Customise it" goes to the words step. The auto-creator leads with "Customise it" after the preview, and offers a quiet "customise everything first" link before it.
- **Backgrounds**: there used to be two stacked layers with different colours per occasion and per person. Now there is one soft wash tinted from the chosen theme, and one set of drifting shapes (3 kinds, 7 pieces). Landing occasion cards use one colour family.
- **Finale bouquet**: the fixed full-screen conic "rays" with a hard mask are replaced by one soft glow in the theme colour, contained behind the bouquet.

## Round 3c
- **First interaction** (everyone except partners): rebuilt. Three taps charge a glowing ring in the theme colours, with orbiting shapes that speed up, a shockwave and a burst of drawn shapes on each tap, a screen flash and a stamp word (BOOM, FLY, BLOOM, CHAMPION, POP) on the last one. Sound and haptics on every tap.
- **Hold to reveal**: long-press no longer selects the button or opens the browser menu. Text selection, the touch callout and image dragging are off inside a surprise, the wax seal captures the pointer so sliding a finger does not cancel the hold, and it shakes and glows as it charges.

## Round 3d
- **Second moment (the big-words intro)**: new `IntroStage.tsx` replaces the letter-drop. A curtain of light parts, the title rises word by word out of a mask with a shine sweeping across it, an underline draws itself, shapes in the theme colours orbit, and the "Open your surprise" button only appears after about 3 seconds. The full-screen effect for the chosen entrance (fireworks, galaxy, petals…) still plays behind it.

## Gift card and seasonal commerce polish (2026-10-28)
- Fixed the printable QR-card studio layout on narrow screens: the preview stays inside its column, controls scroll independently, and the action row respects mobile safe areas.
- Added an optional ₹50 personalised keyword link flow in the QR studio, with recipient/occasion suggestions, Razorpay checkout, a server-side alias table, and public link resolution. Apply Supabase migration `0008_custom_links.sql` before using it in production.
- Added a seasonal discovery grid to the landing page and season-aware recipient choices; Rakhi offers distinct Brother · Bhai and Sister · Behna options.
- New gift codes use `LOVORA-XXX-XXX`; previously issued `LM-XXXX-XXXX` codes remain redeemable.
- Removed the owner-account aside from the share-link success toast.

## Scene Studio wiring (2026-10-28)
- Added owner-only Scene Studio controls under Account → Website settings: live effects toggle, animation preset, intensity, selected scene list, and explicit scene reordering.
- Added `/api/scene-config`: public read, server-side owner authentication for writes, input validation, and persistence in `site_settings` under `scene_config`.
- Wired the live configuration into landing animations and the actual surprise player transitions. Public pages fetch the saved configuration; visitor clients cannot write it.
- Connected seasonal landing choices to new surprise creation via `seasonKey`. Seasonal surprises now merge their curated scene sequence into the actual player and apply season-specific visual palettes.
- Added responsive styling for Scene Studio and animation presets. Full production build could not be run in this environment because dependencies were unavailable; edited TS/TSX files passed TypeScript transpile syntax checks.
