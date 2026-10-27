# Vercel Hobby serverless function limit fix

Vercel Hobby allows at most 12 serverless functions per deployment. This project previously exposed 14 API files under `/api`, so Vercel rejected deployment after the Vite build succeeded.

## What changed

- The only file in `/api` is now `[...path].js`, a catch-all dispatcher (one Vercel function).
- Original endpoint handlers are under `server/api-handlers/`, which Vercel does not treat as individual routes.
- The dispatcher preserves these public endpoints:
  - `/api/account`
  - `/api/ai-draft`
  - `/api/create-order`
  - `/api/custom-link`
  - `/api/og`
  - `/api/pay`
  - `/api/pricing`
  - `/api/publish`
  - `/api/razorpay-webhook`
  - `/api/scene-config`
  - `/api/season`
  - `/api/share`
  - `/api/tts`
  - `/api/verify-payment`
- Existing handler logic and its server-side secrets remain in the server-side handler files; no secrets were added to client code.

## Deploy

1. Replace the repository contents with this archive, or copy the changes into the existing repository.
2. Commit and push to `main` so Vercel builds the new commit (not the old `dd3fe54`).
3. Keep existing Vercel environment variables configured.
4. Confirm the deployment shows **Ready** and test payment creation/verification, custom links, sharing previews, owner-only season publishing, scene settings, AI helper, and TTS.

The TypeScript/Vite production build could not be rerun in this environment because dependency installation timed out. JavaScript syntax checks passed for the dispatcher and all handlers. Run `npm install` and `npm run build` before merging if you have a local development environment available.
