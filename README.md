# GO TRADE — Intelligent Trading System v9

Platform AI Trading lengkap: **live chart real-time (Binance)**, AI signals, auto-trading, wallet, referral, Admin Center, **login real (Supabase)**, dan notifikasi.

## Fitur Baru v9
- Login / Register real (Supabase Auth + local fallback)
- Session persistence
- Sistem notifikasi (local + siap Supabase)
- Schema SQL lengkap (profiles, signals, transactions, notifications)
- Demo accounts tetap berfungsi offline

## Demo Accounts
| Role   | Email               | Password |
|--------|---------------------|----------|
| Member | demo@go-trade.app   | demo123  |
| Admin  | admin@go-trade.app  | admin123 |

## Jalankan Lokal
```bash
cd go-trade-ai
python3 -m http.server 8080
# http://localhost:8080
```

## Setup Supabase (opsional tapi recommended)
1. Buat project di https://supabase.com
2. SQL Editor → jalankan isi `supabase/schema.sql`
3. Authentication → Providers → Email (boleh nonaktifkan Confirm email untuk demo)
4. Copy **Project URL** + **anon key** ke `js/config.js`

## Deploy ke Vercel (gratis, 1 menit)
```bash
npm i -g vercel
cd go-trade-ai
vercel login
vercel --yes
```
Atau push ke GitHub lalu import di https://vercel.com/new

## Deploy ke Netlify
1. https://app.netlify.com/drop
2. Drag folder project
3. Dapat URL langsung

## Struktur
```
├── index.html          # Landing + App shell
├── login.html
├── register.html
├── css/main.css
├── js/
│   ├── config.js       # Brand + Supabase keys
│   ├── auth.js         # Login/Register/Session
│   ├── data.js         # Market data + store
│   ├── charts.js       # Lightweight Charts
│   ├── app.js          # Core logic
│   └── views.js        # All pages
├── supabase/schema.sql
├── vercel.json
└── manifest.json
```

## White-label
Edit `js/config.js` → brand name, colors, Supabase keys.

---
© 2026 GO TRADE · Intelligent Trading System
