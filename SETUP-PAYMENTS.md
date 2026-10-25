# Paid sharing setup (Razorpay)

Previewing is free. A public share link needs a one-time payment per surprise: Rs 149 at launch, then Rs 299.

1. Supabase -> SQL editor: run `supabase/migrations/0005_payments.sql` (also 0004 if you have not yet).
   Existing published surprises are kept working (marked paid). From now on the database itself refuses to publish an unpaid surprise.
2. Razorpay Dashboard: create an account, copy the **Key Id** and **Key Secret** (use Test mode first).
3. Vercel -> Settings -> Environment Variables: add the values from `.env.example` (SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_*, PRICE_INR, REGULAR_PRICE_INR). Redeploy.
4. Razorpay -> Webhooks: URL `https://YOUR-SITE/api/razorpay-webhook`, events `payment.captured` and `order.paid`, secret = RAZORPAY_WEBHOOK_SECRET.
   (This unlocks the surprise even if the buyer closes the app right after paying.)
5. Test with Razorpay test mode (test UPI id `success@razorpay`, test card 4111 1111 1111 1111), then switch to Live keys.

Changing the price: edit `PRICE_INR` in Vercel and redeploy. The app reads it from `/api/pricing`, so the screen and the charge always match.
