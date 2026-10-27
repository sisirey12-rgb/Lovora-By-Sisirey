# Lovora owner, QR, scene and pricing update

- Custom keyword setup moved to the main Share step in the creator/editor. Keyword input starts blank; suggestions are generated from recipient, sender and occasion data rather than pre-filling a hard-coded name.
- QR Studio now only handles the printable card. Its preview reserves explicit width and height, and its mobile layout separates preview, controls and the fixed action footer to prevent overlap. The QR uses the currently active share URL, including a custom keyword after activation.
- Envelope-letter scene now has a persistent “Skip this letter” control in every stage and cancels its pending opening timers before advancing. The global player navigation also remains available.
- Owner accounts configured through `OWNER_EMAILS` can activate custom keywords without checkout; normal visitors pay ₹50. The owner-specific path is enforced server-side and no “owner account, free” message is shown in the publishing flow. Existing owner bypasses remain in place for share links and gift codes.
- Pricing now follows one product tier: first completed purchase per account ₹149, subsequent completed purchases ₹299. The backend determines the tier using paid purchase history; the pricing endpoint is account-aware and is not cached publicly.

## Deployment notes

- Keep `OWNER_EMAILS` and `SUPABASE_SERVICE_ROLE_KEY` server-side only.
- Set `FIRST_PURCHASE_PRICE_INR=149` and `REPEAT_PURCHASE_PRICE_INR=299` in Vercel. Remove fixed NPR override variables if Nepal pricing should follow the same tier.
- Ensure `supabase/migrations/0008_custom_links.sql` has been applied.
- Dependencies were unavailable in this workspace after an installation timeout, so a complete production build could not be run here. API handler syntax checks passed; run `npm install` and `npm run build` before deploying.
