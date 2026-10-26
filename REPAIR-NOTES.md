# Lovora repair notes

## Changes in this repair pass

- Preview final-scene **Get the share link** now opens the editor directly at step 6 (Share), rather than attempting to publish immediately or returning to the home page.
- When a creator reaches **Finish** at the end of a full preview, the editor opens at step 6 (Share).
- **Customise it** returns to editor step 2 (Words).
- The saved experience is carried into the editor when moving from preview to Share.
- Theme picker uses clean labelled palette cards with three clear color swatches, and choosing a skin updates the site skin and light/dark mode together.
- Added a **Write it with AI** entry point on step 1 after the reveal-date controls; it remains available on step 2 as well.
- AI endpoint now gives clearer messages for Groq rate limits, invalid API keys, and unavailable model IDs. Server-side Supabase auth verification fails closed if configuration is missing.
- AI service helper accepts both the direct response shape used by `/api/ai-draft` and a wrapped `draft` shape.

## Required Vercel configuration for AI

Set these in Vercel → Project → Settings → Environment Variables, then redeploy:

- `GROQ_API_KEY` — secret Groq API key (server only; never use a `VITE_` prefix)
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase publishable/anon key
- Optional: `GROQ_MODEL` — a model currently available to your Groq account
- Optional: `AI_HOURLY_LIMIT` — positive integer, default 10 for non-owner accounts
- Optional: `OWNER_EMAILS` — comma-separated email addresses for free owner sharing / owner AI allowance

The owner check uses the signed-in Supabase user's email. It does not create an owner account by itself: sign in with the matching email and configure `OWNER_EMAILS` in Vercel.

## Required Vercel configuration for share links

Cloud sharing and payments also require the Supabase service-role key and Razorpay server credentials described in `SETUP-PAYMENTS.md`. Do not expose service-role or Razorpay secret keys in client-side variables.

## Testing status

The archive was inspected and source edits were applied. A production build could not be run in this environment because `npm install` timed out before dependencies were installed. Please run `npm install` and `npm run build` locally or in your development environment before deploying. Live share/payment and Groq calls also need testing against your own Vercel environment variables.
