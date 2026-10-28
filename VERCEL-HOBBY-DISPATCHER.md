# Vercel Hobby API dispatcher

The API routes have been moved to `server/api-handlers/` and are dispatched by the single Vercel function `api/[...path].js`. Do not move the handler files back into the root of `api/`, or the Hobby function limit can be exceeded again. `api/_shared.js` remains a shared helper, not a route.

The public API URLs remain `/api/account`, `/api/ai-draft`, `/api/create-order`, `/api/custom-link`, `/api/og`, `/api/pay`, `/api/pricing`, `/api/publish`, `/api/razorpay-webhook`, `/api/scene-config`, `/api/season`, `/api/share`, `/api/tts`, and `/api/verify-payment`.
