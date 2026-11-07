# GO-TRADE — Integrations setup

This guide covers account, notification, reliability, and observability integrations only. It does not enable deposits, withdrawals, investment products, automated trading, or execution of financial orders.

## Current architecture

- Supabase: authentication, Postgres, Storage, Realtime, and Edge Functions.
- Vercel: static hosting, deployment previews, Web Analytics, and Speed Insights.
- Firebase Cloud Messaging (FCM): optional web push delivery.
- Resend: optional transactional email provider for Supabase Auth and approved account-security notices.

## 1. Vercel Analytics and Speed Insights

1. Open the GO-TRADE project in Vercel.
2. Enable **Analytics** and **Speed Insights** in the project dashboard.
3. Deploy the site again.
4. Visit the production or preview site and inspect the Analytics/Speed Insights dashboards after traffic arrives.

The static site can use Vercel's injected analytics script. Do not add a third-party tracking pixel or collect passwords, account contents, or private profile data as analytics events.

## 2. Resend for Supabase Auth email

1. Create a Resend account and verify a domain you control.
2. In Supabase Dashboard, open **Project Settings → Authentication → SMTP Settings**.
3. Configure the Resend SMTP credentials and a verified sender address.
4. In **Authentication → URL Configuration**, set the production Site URL and allowed redirect URLs.
5. Test signup confirmation and password recovery using a test account.

Never put a Resend API key in `config.js`, HTML, or browser JavaScript. If custom account-security email is later required, send it only from a Supabase Edge Function and keep its key in Supabase Function Secrets.

## 3. Firebase Cloud Messaging (web push)

Required Firebase values:
- Firebase Web App config: `apiKey`, `authDomain`, `projectId`, `messagingSenderId`, `appId`
- Firebase Cloud Messaging Web Push VAPID public key
- Firebase service account credentials for server-side sending (private key must remain server-side)

Setup:
1. Create a Firebase project and register a Web App.
2. Enable Cloud Messaging and generate a Web Push key pair.
3. Add the Firebase Web App config and VAPID public key to the client-side public configuration only. These are public identifiers, not server secrets.
4. Keep service-account JSON/private key exclusively in Supabase Function Secrets.
5. Implement authenticated device registration and per-user token ownership before sending any push messages.
6. Ask users for notification permission only after they explicitly choose **Enable notifications**.
7. Test foreground and background notifications on HTTPS. Browser push support varies by browser and device.

Do not paste a service-account JSON, private key, Resend API key, Supabase service-role key, or any password into GitHub or chat.

## 4. Supabase security, storage, and realtime

- Keep Row Level Security enabled on every user-data table.
- Use the anon/publishable key in the browser only; never expose the service-role key.
- Use Storage policies so users can access only files they own, unless an admin workflow explicitly requires broader access.
- Subscribe to Realtime only for the signed-in user's authorized records.
- Keep sensitive mutations in server-side functions with authorization and atomic database operations.
- Backups must be enabled and periodically restore-tested from Supabase Dashboard. Backup availability and retention depend on the Supabase plan.

## 5. Required secrets (server-side only)

| Secret | Where it belongs | Purpose |
|---|---|---|
| `RESEND_API_KEY` | Supabase Function Secrets | Custom transactional email |
| Firebase service-account credentials | Supabase Function Secrets | FCM message sending |
| Supabase service-role key | Supabase server environment only | Privileged server operations; never frontend |
| FCM VAPID public key | Public client config | Browser push registration |

## 6. Go-live checklist

- [ ] Vercel Analytics enabled in the Vercel dashboard.
- [ ] Speed Insights enabled in the Vercel dashboard.
- [ ] Resend domain verified and Supabase Auth SMTP tested.
- [ ] Firebase Web App created and push permission flow tested on HTTPS.
- [ ] Device-token table and RLS reviewed before enabling push delivery.
- [ ] Edge Functions validate the caller and enforce per-user authorization.
- [ ] Supabase backups enabled and restore test completed.
- [ ] No secret keys appear in Git history or browser bundles.
- [ ] Member/admin access tested with separate accounts.

**Important:** Do not apply the preliminary `supabase/security_hardening_migration.sql` to a live database until its policies have been reconciled with the actual schema and all existing application flows have been tested. It is a review starting point, not a certified production migration.
