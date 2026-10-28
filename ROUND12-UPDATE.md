# Lovora Round 12 update

Applied to the uploaded `Lovora-By-Sisirey-round11.zip` source.

## Changes
- Removed the public seasonal chooser from the landing page. The landing page now follows the owner-published season from `/api/season`; visitors do not pick the site's active season themselves.
- Custom keyword field starts blank rather than assuming a recipient/occasion slug. Suggested keywords are generated from the entered recipient and occasion.
- Custom links remain in the creator's share step, outside the QR modal. The QR card uses the current share URL, including the custom slug once active.
- QR modal grid now assigns explicit rows/columns and isolates the preview to prevent it covering controls on mobile.
- Added an always-available “Skip this scene” action after the envelope scene starts; it cancels opening timers. If the letter is the final scene, the player finishes/closes instead of clamping to the same scene forever.
- Owner custom-link creation bypasses the ₹50 checkout on the server. Regular users still use the ₹50 Razorpay flow. Owner alias rows use unique payment reference values.
- Removed explicit “free” wording from owner account labels; owner access is enforced server-side.
- Consolidated the 14 API handlers behind `api/[...path].js` to reduce the Vercel Hobby deployment's serverless function count. Existing `/api/<name>` endpoints are preserved through the dispatcher; handlers are in `server/api-handlers/`.
- First purchase remains ₹149 and later purchases remain ₹299 by the server pricing defaults (`PRICE_INR` and `REGULAR_PRICE_INR`/`REPEAT_PRICE_INR`).

## Deploy notes
- Keep the existing Vercel environment variables. Ensure `OWNER_EMAILS` contains the exact owner email and `SUPABASE_SERVICE_ROLE_KEY`, Supabase URL/anon key and payment secrets remain configured server-side.
- The custom link feature still requires migration `supabase/migrations/0008_custom_links.sql`.
- The season and scene studio features require `site_settings` migration `0006_site_settings.sql`.
- A complete `npm run build` could not be run in this environment because `npm install` timed out. JavaScript syntax checks and ZIP integrity checks were run; test the deployment and flows in Vercel before treating this as production-ready.
