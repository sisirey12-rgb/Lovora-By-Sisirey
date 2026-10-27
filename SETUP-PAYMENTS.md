# Paid sharing setup

Previewing is free. The first completed purchase on an account costs **₹149**; each subsequent completed surprise purchase costs **₹299**. The same current tier applies to a prepaid gift code. The server determines the amount from completed payment history; do not calculate or trust prices submitted by the browser.

1. Supabase → SQL editor: run `supabase/migrations/0005_payments.sql` (and earlier migrations if they have not been run). Run `supabase/migrations/0008_custom_links.sql` for custom keywords.
2. Razorpay Dashboard: copy the Key ID and Key Secret (test mode first).
3. Vercel → Settings → Environment Variables: set `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `FIRST_PURCHASE_PRICE_INR=149`, and `REPEAT_PURCHASE_PRICE_INR=299`. Keep `OWNER_EMAILS` server-only.
4. Razorpay → Webhooks: URL `https://YOUR-SITE/api/razorpay-webhook`, events `payment.captured` and `order.paid`, secret matching `RAZORPAY_WEBHOOK_SECRET`.
5. Test checkout with Razorpay test mode before switching to live keys.

## Pricing variables

- `FIRST_PURCHASE_PRICE_INR=149` — first completed purchase per customer account.
- `REPEAT_PURCHASE_PRICE_INR=299` — every later completed purchase on that account.
- `NPR_PER_INR` defaults to `1.6` for converting the same tier to NPR. Remove fixed `PRICE_NPR` or `GIFT_PRICE_NPR` overrides if the same tier should apply in Nepal.
- `OWNER_EMAILS` is a comma-separated list of owner email addresses. Owner-only bypasses are enforced server-side and are not announced in the customer-facing publishing flow.

Changing environment variables requires a new Vercel deployment.
