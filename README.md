# BS Degree Dating App: final checklist

## Website files (upload all 6 to the TOP LEVEL of your GitHub repo, Vercel redeploys automatically)
index.html   style.css   app.js   admin.html   admin.js   legal.html
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
