# GO TRADE — Intelligent Trading Systems v10

Platform AI Trading lengkap dengan struktur multi-page profesional:

- **Landing & Marketing** (Beranda, Performance, Fitur, Paket, Testimoni, FAQ, About)
- **Auth** (Login / Register) — localStorage + demo accounts, siap Supabase
- **Member Portal** (Dashboard, Referral, Commission, Profile, …)
- **Admin Center** (Dashboard, Members, …)
- **Live Charts** Binance (Lightweight Charts)
- **AI Signal Feed** (mock + siap integrasi)
- **Dark / Light theme**

## Demo Credentials

| Role   | Email               | Password |
|--------|---------------------|----------|
| Member | demo@gotrade.io     | demo123  |
| Admin  | admin@gotrade.io    | admin123 |

## Struktur

```
/
├── index.html              → Landing page
├── login.html / register.html
├── performance.html, features.html, products.html, …
├── member/                 → Portal member
│   ├── dashboard.html
│   ├── referral.html, commission.html, profile.html
├── admin/                  → Panel admin
│   ├── index.html (login)
│   ├── dashboard.html, members.html
├── css/  js/  assets/  supabase/
```

## Jalankan Lokal

```bash
cd GO-TRADE
python3 -m http.server 8080
# buka http://localhost:8080
```

## Deploy

- **Vercel / Netlify**: push repo → auto deploy
- **Hostinger / shared hosting**: upload isi folder ke `public_html`

## Supabase (opsional)

1. Buat project Supabase
2. Jalankan `supabase/schema.sql` di SQL Editor
3. Isi `js/config.js` dengan URL + anon key
4. Auth Email provider → enable

## Catatan

- Data sinyal/PnL di landing & dashboard bersifat **simulasi/demo**.
- Bukan nasihat investasi. Trading berisiko.

---
© 2026 GO TRADE · Intelligent Trading Systems
