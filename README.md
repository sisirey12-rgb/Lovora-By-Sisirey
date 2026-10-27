# LOVORA MEOW — Interactive Surprise Studio

A mobile-first, interactive digital-surprise creator built with React, Vite, TypeScript, Tailwind CSS, Framer Motion, and optional Supabase cloud publishing.

## What works in the free local MVP

- Premium responsive landing page, original cat-inspired brand mark, dark/light theme toggle.
- Eight-step creator: occasion, personalization, ten visual themes, image/video memories, user-provided audio, scene selection/reordering, interactive preview, publishing setup.
- Interactive story player with a floating heart, magical intro, animated cake and wish, five poppable balloons with personalized messages, personal letter, photo/video gallery, and finale with confetti.
- Optional browser vibration with an on/off setting. It gracefully does nothing when unsupported.
- Local draft save, dashboard, edit, duplicate, delete, and preview.
- Supabase publishing adapter and starter RLS migration.
- Reduced-motion support, keyboard-focus styles, touch-friendly controls, safe-area padding, accessible scene labels, file-size checks.

## Important MVP limits

**Local drafts are stored only in the current browser on the current device.** They are not accessible to recipients and are not a public share link. LocalStorage has practical browser quotas; this MVP limits uploaded image/video/audio files to 8 MB each, but large base64 media can still exceed browser storage limits. If a save fails, remove large media or use cloud storage in a later iteration.

Real public publishing requires Supabase credentials, the migration, and authentication. The initial frontend includes the publish adapter but does not yet include a sign-in UI. Therefore, without adding an auth flow, publishing will correctly return a sign-in-required message instead of pretending a public link exists. Public routes only load rows marked as published from the `published_experiences` view.

## Requirements

- Node.js 20+ recommended
- npm
- Git
- Optional Supabase project for cloud publishing

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. The app works in local demo mode without environment variables.

## Typecheck and production build

```bash
npm run typecheck
npm run build
npm run preview
```

## GitHub

1. Create a new empty repository on GitHub.
2. Unzip this project and open a terminal in the `lovora-meow` directory.
3. Run:

```bash
git init
git add .
git commit -m "Build LOVORA MEOW MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Replace the remote URL with your repository's URL. Do not commit `.env` files.

## Deploy to Vercel

1. In Vercel, choose **Add New → Project** and import the GitHub repository.
2. Framework preset: **Vite** (usually auto-detected).
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Deploy. The included `vercel.json` rewrites `/s/:id`, `/create`, and `/dashboard` to the SPA entry point.

No environment variables are required for the local demo or first deployment.

## Optional Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**, paste and run `supabase/migrations/0001_experiences.sql`.
3. In Project Settings → API, copy the Project URL and **anon/public** key.
4. Copy `.env.example` to `.env.local` and set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

5. Restart Vite or redeploy Vercel after adding the same variables in Project Settings → Environment Variables.
6. Enable an authentication provider under Supabase Authentication.
7. For optional personalised share keywords (₹50 each), run `supabase/migrations/0008_custom_links.sql` after migrations `0001`–`0007`. Configure the server-only `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET` in Vercel. Never put these in `VITE_*` variables or client code. Custom keyword checkout requires Razorpay and a surprise that has already been purchased/published.
8. Add a sign-in/sign-up flow before enabling public publishing for creators. The included `storage.publish()` requires a signed-in Supabase user; the MVP intentionally does not invent a user identity or bypass ownership.
9. Test with two browser profiles: an owner can manage owned rows; an anonymous visitor can query only the published view. Do not grant public SELECT on `experiences`.

Only use the public anon key in the browser. **Never expose the Supabase service-role key in `VITE_*` variables or client code.**

## Privacy and storage

- Local drafts and uploaded media are saved in browser LocalStorage as JSON/base64. Anyone with access to the same unlocked browser profile may be able to access them.
- Clearing browser storage removes local drafts.
- Cloud-published experiences are public to anyone who has the link. Do not publish sensitive content or private photos.
- The SQL migration enables RLS and keeps unpublished rows unavailable to anonymous visitors.
- File validation is client-side for usability, not a malware scanner. Only upload media you have permission to share.
- Sound is not autoplayed. The music upload is stored with the draft, but the current player does not automatically start it; users must explicitly enable audio in a future audio-manager enhancement. No commercial tracks or external assets are bundled.

## Architecture

- `src/services/storage/local.ts` — LocalStorage adapter for private device drafts.
- `src/services/storage/index.ts` — storage facade and Supabase publish/read adapter.
- `src/services/supabase/client.ts` — optional client initialized only when public credentials are configured.
- `src/components/Editor.tsx` — multi-step experience creator.
- `src/components/ScenePlayer.tsx` — interactive story scenes.
- `supabase/migrations/0001_experiences.sql` — RLS schema and public published view.

## Troubleshooting

- **Blank page:** check the browser console and ensure dependencies installed successfully.
- **Vercel `/s/...` gives 404:** confirm `vercel.json` was deployed and Vercel output is `dist`.
- **LocalStorage quota exceeded:** remove large media files or clear old drafts; cloud media storage is not included in this MVP.
- **Publishing says sign-in required:** expected until a Supabase auth UI is added and the user is signed in.
- **A public experience is unavailable:** the ID must exist in Supabase and have `is_published = true`; local drafts cannot be opened by other devices.

## License and originality

This project uses original interface code and CSS illustrations. It does not copy the reference site's source code or bundle copyrighted music, photographs, or third-party visual assets. Add a license file before redistributing if you need to specify reuse terms.


## Accounts and sharing (added in the upgrade)

Sign in / sign up is built in and uses the Supabase project from `.env.local`. See `CHANGES.md` for the configuration checklist (env vars, migration, email provider, redirect URLs).

## Lovora Meow by Sisirey: design notes
- Handles in footer: edit `src/config.ts` (Instagram, Telegram, WhatsApp number).
- Social preview image: replace `public/og-image.png` (1200x630). Set `VITE_SITE_URL` (auto on Vercel).
- Workflow (sign-in, Supabase publish, editor steps) is unchanged from the original.

- Cake baker: `node --experimental-strip-types scripts/test-cake-sim.mts hearts 21` runs the cake simulation headless.
- Live wishes: run `supabase/migrations/0002_wishes.sql` in Supabase once.
- Creator stats: run `supabase/migrations/0003_stats.sql` once in Supabase.
- Templates live in `src/lib/templates.ts`.

## Google sign-in setup
1. Google Cloud Console > APIs & Services > Credentials > Create OAuth client ID (Web). Add the authorised redirect URI shown in Supabase (Authentication > Providers > Google), like `https://<project>.supabase.co/auth/v1/callback`.
2. Supabase > Authentication > Providers > Google: switch on, paste the Client ID and Client secret.
3. Supabase > Authentication > URL Configuration: set Site URL to your Vercel URL and add it (and `http://localhost:5173`) to Redirect URLs.

## Google popup showing your site and logo (instead of supabase.co)
- Add `VITE_GOOGLE_CLIENT_ID` (same Web client ID you pasted into Supabase) in Vercel and redeploy. The app then uses Google's own button and `signInWithIdToken`, so the popup says "Sign in to lovorameow-sisirey.vercel.app".
- Google Cloud > OAuth consent screen > Branding: App name "Lovora Meow", upload the logo (120x120 PNG), set Application home page to your site, add your domain under Authorized domains.
- Google Cloud > Credentials > your Web client > Authorised JavaScript origins: add `https://lovorameow-sisirey.vercel.app` (and `http://localhost:5173`).
- Supabase > Providers > Google: if sign-in says "nonce" error, switch on "Skip nonce checks".

## New in this version
- Every occasion has its own scene set: Birthday (balloons, cake, wheel of wishes), Anniversary (star constellation, typed vows), Love letter (wax seal, sky lanterns), Special surprise (mystery boxes, scratch card). Each occasion also has its own background decoration and an editor banner showing the story.
- Site themes: the palette button in the top bar (7 looks, saved per visitor).
- Account centre: profile, all surprises with status, plan and security, settings. `/api/account` tells the app if the signed-in email is in `OWNER_EMAILS`.
- Run `npm install` once (adds `lenis`).

## AI helper, candles and open-when letters
- AI helper: add `ANTHROPIC_API_KEY` in Vercel (server-only) and redeploy. Creators tap "Write it with AI" on the Words step. Limit: `AI_HOURLY_LIMIT` per user (default 10, owners 200). Optional `ANTHROPIC_MODEL`.
- Blow the candles: Birthday, partner anniversary and some Special surprise flows. Uses the microphone with a tap fallback.
- Open-when envelopes: Anniversary, Love letter and partner Special surprise. Notes come from the editor or the AI helper.

## More scenes and growth features
- Optional scenes (Editor > Add more scenes): wish upon a star, calendar flip, snow globe, postcard, fortune cookie, song line, invitation + RSVP.
- Nickname, inside jokes, "guess who sent it" (sender hidden until the finale), and a Story order panel (move or hide scenes).
- Seasonal landing pages at `/for/rakhi`, `/for/diwali`, `/for/eid`, `/for/valentines-day`, `/for/mothers-day`, `/for/fathers-day`, `/for/friendship-day`, `/for/new-year` (edit `src/lib/seasons.ts`; update the domain in `public/sitemap.xml` and `public/robots.txt`).
- Creator badges and an embed button snippet in the account panel (`public/embed.js`).

## Switch the home page season (one click)
Run `supabase/migrations/0006_site_settings.sql` once. Then sign in with an `OWNER_EMAILS` account > account panel > Settings > "Home page season" and tap a festival (or Normal). Visitors see it within about a minute, no redeploy. `ACTIVE_SEASON` in Vercel is only a fallback.

## Start flow
Landing > tap an occasion card > type their name, pick who they are to you (the template and look are chosen automatically) > fill up to 5 optional key details (reveal date, age, dates, place, nickname...) > Create and preview > then the share link with the launch price. Floating decorations are drawn shapes (`components/Floaties.tsx`), not emojis.

## Owner Scene Studio (live seasonal effects and scene player)

Sign in with an email listed in the server-side `OWNER_EMAILS` variable, open **Account → Website settings → Scene Studio**, choose an animation preset and effect intensity, select the scenes, arrange the selected order with the arrow controls, then choose **Publish live scene settings**. Visitors load the published configuration from `/api/scene-config`; only owner-authorized sessions can write it. The settings use the existing `site_settings` table created by `supabase/migrations/0006_site_settings.sql`, so ensure that migration has been run and `SUPABASE_SERVICE_ROLE_KEY` is set on the server.

Season landing pages pass their season into the surprise creation flow. The player then includes that season's curated scenes and palette, while preserving creator content. The owner's optional global order changes the ordering of available scenes; it does not delete creator data. Public config reads are briefly cached, so visitors may need to refresh or wait up to roughly a minute after publishing.
