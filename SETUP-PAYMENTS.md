# Paid sharing setup (Razorpay)

Previewing is free. The first paid purchase on an account (share link or gift code) costs ₹149; every later paid purchase on the same account costs ₹299.

1. Supabase -> SQL editor: run `supabase/migrations/0005_payments.sql` (also 0004 if you have not yet).
   Existing published surprises are kept working (marked paid). From now on the database itself refuses to publish an unpaid surprise.
2. Razorpay Dashboard: create an account, copy the **Key Id** and **Key Secret** (use Test mode first).
3. Vercel -> Settings -> Environment Variables: add the values from `.env.example` (SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_*, FIRST_PURCHASE_PRICE_INR, REPEAT_PURCHASE_PRICE_INR). Redeploy.
4. Razorpay -> Webhooks: URL `https://YOUR-SITE/api/razorpay-webhook`, events `payment.captured` and `order.paid`, secret = RAZORPAY_WEBHOOK_SECRET.
   (This unlocks the surprise even if the buyer closes the app right after paying.)
5. Test with Razorpay test mode (test UPI id `success@razorpay`, test card 4111 1111 1111 1111), then switch to Live keys.

Pricing: set `FIRST_PURCHASE_PRICE_INR=149` and `REPEAT_PURCHASE_PRICE_INR=299` in Vercel, then redeploy. The first paid purchase is one tier across both share links and gift codes; every subsequent paid purchase uses the repeat tier. The app reads it from `/api/pricing`, so the screen and the charge always match.
