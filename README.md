# GO TRADE — Intelligent Trading System

**v8.0** · Member Workspace + Admin Center · Supabase Backend · White-label Ready

Platform trading cerdas dengan sinyal AI, auto-trading packages, wallet, referral network, news, notifikasi, dan panel administrasi lengkap. Dibangun dengan vanilla HTML/CSS/JS + Supabase — tanpa build step, mudah di-deploy dan di-rebrand.

---

## Mengapa produk ini bernilai jual tinggi?

| Aspek | Nilai |
|-------|--------|
| **Siap jual** | White-label: ganti logo, nama brand, warna, domain dalam hitungan menit |
| **Fitur lengkap** | Member + Admin dalam satu codebase |
| **Backend modern** | Supabase (Auth + Postgres + RLS) — scalable & secure |
| **UI premium** | Dark/Light mode, animasi halus, mobile-responsive, PWA |
| **Tanpa build** | Buka dengan static host (Netlify, Vercel, Cloudflare Pages, Nginx) |
| **Dokumentasi** | Setup, schema SQL, demo accounts, security notes |

---

## Fitur Lengkap

### Member Workspace
- **Dashboard** — saldo, status, paket aktif, chart performa, market ticker live
- **AI Trading Signals** — Buy/Sell, entry, target, SL, confidence meter
- **Auto-Trading Packages** — Starter / Growth / Pro (ROI & durasi customizable)
- **Wallet** — saldo, riwayat, export CSV
- **Deposit** — QR + alamat USDT (BEP20), status tracking
- **Withdrawal** — form + approval flow
- **Network Referral** — kode unik, tracking downline, bonus
- **Bonus Tracking** — riwayat bonus referral & manual
- **Trade History** — log transaksi
- **News** — feed berita dari admin
- **Notifications** — in-app + broadcast
- **Account Settings** — profil, avatar, password, 2FA toggle
- **Help Center** + **AI Assistant Widget** (canned responses cerdas)
- **Dark / Light mode** dengan preferensi tersimpan

### Admin Center
- Overview metrik real-time
- Manage Users (verify, edit, bonus, hapus)
- Manage Signals (CRUD + buka/tutup)
- Deposit & Withdrawal approval
- Manage Packages & News
- Broadcast notification
- System settings (alamat wallet deposit)
- Reset data (dev/demo)

---

## Setup Cepat

### 1. Supabase
1. Buat project di [supabase.com](https://supabase.com)
2. SQL Editor → jalankan seluruh isi `supabase/schema.sql`
3. Authentication → Providers → Email → nonaktifkan *Confirm email* (untuk demo)
4. Copy **Project URL** + **anon key** ke `config.js`

### 2. Akun demo
| Peran  | Email              | Password  |
|--------|--------------------|-----------|
| Member | demo@gotrade.io    | demo123   |
| Admin  | admin@gotrade.io   | admin123  |

Setelah register/login pertama, set `role = admin` di Table Editor → `profiles` untuk akun admin.

### 3. Jalankan lokal
```bash
cd GO-TRADE-main
python3 -m http.server 8080
# buka http://localhost:8080
```

> Jangan buka via `file://` — localStorage, CDN, dan Auth membutuhkan HTTP server.

---

## White-label (rebrand dalam 5 menit)

Edit `config.js`:

```js
window.GT_CONFIG = {
  brand: {
    name: "NAMA BRAND ANDA",
    tagline: "TAGLINE ANDA",
    domain: "domainanda.com",
    supportEmail: "support@domainanda.com",
  },
  theme: {
    primary: "#16b884",   // ganti warna utama
    accent: "#2fe0a4",
    navy: "#0a0c1f",
  },
};
```

Ganti logo:
- `assets/logo-icon.png` (favicon + icon kecil)
- `assets/logo-full.jpg` (opsional)

---

## Struktur Project

```
├── index.html          Landing page (pricing, testimonials, CTA)
├── login.html / register.html
├── dashboard.html      Member shell
├── admin.html          Admin shell
├── config.js           Brand + Supabase keys + feature flags
├── supabase-client.js  Client init
├── auth.js / store.js  Auth & data layer (Supabase + cache)
├── app.js / admin.js   View logic
├── icons.js / ai-widget.js
├── style.css           Design system + dark mode + v8 polish
├── manifest.json       PWA
├── supabase/schema.sql Schema + RLS + security triggers
└── assets/
```

---

## Keamanan (sudah diterapkan)

1. **Privilege escalation** — role signup selalu dipaksa `member`
2. **Wallet self-edit** — member tidak bisa mengubah `wallet_balance`, `role`, `status` sendiri (DB trigger)
3. **XSS** — helper `gtEscapeHtml` / `gtSafeUrl`
4. **Input validation** — deposit / withdrawal / package amount divalidasi
5. **RLS** — Row Level Security di semua tabel kritis

Untuk produksi: aktifkan HTTPS, review RLS, batasi CORS, aktifkan email confirmation.

---

## Tech Stack

- **Frontend:** Vanilla HTML5, CSS3, ES modules-ready JS
- **Backend:** Supabase (Auth, Postgres, Realtime-ready, Storage)
- **Charts:** SVG native (ringan, tanpa dependency berat)
- **Icons:** Inline SVG system (`icons.js`)
- **PWA:** manifest.json siap install

---

## Changelog v8.0

- Premium UI polish (toast variants, confidence meter, empty states, micro-animations)
- AI Assistant lebih cerdas + typing indicator
- Landing page: pricing cards + testimonials
- Signal cards dengan confidence bar
- Version & feature flags diperluas
- Dokumentasi komersial siap jual

---

© 2026 GO TRADE Intelligence · Built for decisive moves.
