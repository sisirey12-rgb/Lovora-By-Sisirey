# Owner-controlled landing season and pricing update

## Landing page
- Removed the public seasonal celebration chooser from the main landing page.
- Visitors no longer choose which seasonal campaign is active from that section.
- The public landing page uses the single season saved by the owner in Account → Website settings → Home page season.
- Choosing Normal restores the standard landing page.
- Seasonal landing routes also use the owner-published season, not the route slug.
- The owner setting is saved server-side through `/api/season`; the API enforces owner access. Visitors receive the published theme and seasonal effects.

## Prices
- Main surprise share link: ₹149 (server default `PRICE_INR=149`).
- Prepaid gift code: ₹299 (server default `GIFT_PRICE_INR=299`). The recipient uses the gift code for one share link without paying again.
- Nepal gift code uses `GIFT_PRICE_NPR` if set; otherwise it is converted from INR using `NPR_PER_INR`.
- Set `PRICE_INR=149` and `GIFT_PRICE_INR=299` in Vercel → Project → Settings → Environment Variables, then redeploy. Remove the obsolete `REGULAR_PRICE_INR` variable if present. Existing `PRICE_INR=99` settings override code defaults until updated.

## Deployment notes
- This update keeps the existing single API dispatcher in `api/[...path].js` for the Vercel Hobby function limit.
- JavaScript server-handler syntax and archive integrity should be checked before deployment. A full TypeScript production build could not be run in this workspace because dependency installation timed out; verify `npm run build` on Vercel after pushing.
