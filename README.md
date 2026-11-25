# BS Degree Dating App: final checklist

## Website files (upload all 6 to the TOP LEVEL of your GitHub repo, Vercel redeploys automatically)
index.html   style.css   app.js   admin.html   admin.js   legal.html  (functions/ and ai.sql are NOT uploaded to GitHub)
(site.zip contains the same 6 files)

Admin page:  YOUR-SITE/admin.html   (sign in with Google as an admin)

## SQL files: run each ONCE in Supabase > SQL Editor, in this order
1. schema.sql
2. schema_payments_patch.sql
3. fix_auth_trigger.sql
4. fix_grants.sql
5. admin_upgrade.sql
6. deleted_accounts.sql
7. photos.sql
8. ai.sql   (new: AI usage limit table)
Do not re-run schema.sql ("already exists" error is harmless but means nothing changed).

## Keys already filled in
Supabase URL + publishable key (app.js, admin.js), Web3Forms key (app.js).

## Still to set up (only for automatic payments)
functions/create-order.ts      -> Edge Function "create-order"   (Verify JWT ON)
functions/razorpay-webhook.ts  -> Edge Function "razorpay-webhook" (Verify JWT OFF)
Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET
Razorpay webhook URL: https://rmywttlijzpmfwsamjlu.supabase.co/functions/v1/razorpay-webhook  (event: payment.captured)

## Supabase settings
Authentication > Providers > Google: enabled with your Client ID + Secret
Authentication > URL Configuration: Site URL + Redirect URLs = https://iitm-bs-degree-dating-app.vercel.app and https://iitm-bs-degree-dating-app.vercel.app/**

## AI features (Gemini) - setup
1. Get a free key at https://aistudio.google.com/apikey
2. Supabase > Edge Functions > New function "ai-chat", paste functions/ai-chat.ts, keep Verify JWT ON
3. Supabase > Edge Functions > Secrets: add GEMINI_API_KEY = your key
   (optional) GEMINI_MODEL (default gemini-2.5-flash), AI_DAILY_LIMIT (default 30/user/day, Premium gets 3x)
4. Run ai.sql once in SQL Editor
5. Upload the 6 website files again. Never put the Gemini key in app.js
Switch to a paid model later: change GEMINI_MODEL / GEMINI_API_KEY secrets only. No code change.

## Premium price is now Rs 79 / 30 days
Also change the amount in your Edge Function functions/create-order.ts to 7900 (paise) and redeploy it, otherwise Razorpay will still charge the old price.
The Gemini key goes ONLY in Supabase > Edge Functions > Secrets (GEMINI_API_KEY). Never paste it into any website file or chat.
Ads are removed for now. Events: a "coming soon" card shows at the top of the home screen (EVENTS in app.js).
