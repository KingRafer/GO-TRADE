# GO TRADE — Intelligent Trading System

**v8.0** · Member Workspace + Admin Center · Supabase Backend · White-label Ready

**International Edition (English UI)**

Premium AI trading platform with real-time signals, auto-trading packages, wallet, referral network, news, notifications, and a complete admin panel. Built with vanilla HTML/CSS/JS + Supabase — zero build step, easy to deploy and rebrand.

---

## Why this product has high commercial value

| Aspect | Value |
|--------|--------|
| **Ready to sell** | White-label: change logo, brand name, colors, domain in minutes |
| **Full features** | Member + Admin in one codebase |
| **Modern backend** | Supabase (Auth + Postgres + RLS) — scalable & secure |
| **Premium UI** | Dark/Light mode, smooth animations, mobile-responsive, PWA |
| **Zero build** | Deploy on any static host (Netlify, Vercel, Cloudflare Pages, Nginx) |
| **Documentation** | Setup, SQL schema, demo accounts, security notes |

---

## Member Workspace

- **Dashboard** — balance, status, active packages, performance chart, live market ticker
- **AI Trading Signals** — Buy/Sell, entry, target, SL, confidence meter
- **Auto-Trading Packages** — Starter / Growth / Pro (customizable ROI & duration)
- **Wallet** — balance, history, CSV export
- **Deposit** — QR + USDT (BEP20) address, status tracking
- **Withdrawal** — form + approval flow
- **Network Referral** — unique code, downline tracking, bonuses
- **Bonus Tracking** — referral & manual bonus history
- **Trade History** — transaction log
- **News** — admin-published feed
- **Notifications** — in-app + broadcast
- **Account Settings** — profile, avatar, password, 2FA toggle
- **Help Center** + **AI Assistant Widget**
- **Dark / Light mode** with saved preference

## Admin Center

- Real-time metrics overview
- Manage Users (verify, edit, bonus, delete)
- Manage Signals (CRUD + open/close)
- Deposit & Withdrawal approval
- Manage Packages & News
- Broadcast notifications
- System settings (deposit wallet address)
- Data reset (dev/demo)

---

## Quick Setup

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. SQL Editor → run the full contents of `supabase/schema.sql`
3. Authentication → Providers → Email → optionally disable *Confirm email* (for demo)
4. Copy **Project URL** + **anon key** into `config.js`

### 2. Demo accounts
| Role   | Email              | Password  |
|--------|--------------------|-----------|
| Member | demo@gotrade.io    | demo123   |
| Admin  | admin@gotrade.io   | admin123  |

After first register/login, set `role = admin` in Table Editor → `profiles` for the admin account.

### 3. Run locally
```bash
cd GO-TRADE
python3 -m http.server 8080
# open http://localhost:8080
```

> Do not open via `file://` — localStorage, CDN, and Auth require an HTTP server.

---

## White-label (rebrand in 5 minutes)

Edit `config.js`:

```js
window.GT_CONFIG = {
  brand: {
    name: "YOUR BRAND NAME",
    tagline: "YOUR TAGLINE",
    domain: "yourdomain.com",
    supportEmail: "support@yourdomain.com",
  },
  theme: {
    primary: "#16b884",
    accent: "#2fe0a4",
    navy: "#0a0c1f",
  },
};
```

Replace logos:
- `assets/logo-icon.png` (favicon + small icon)
- `assets/logo-full.jpg` (optional)

---

## Security (already applied)

1. **Privilege escalation** — signup role is always forced to `member`
2. **Wallet self-edit** — members cannot change `wallet_balance`, `role`, or `status` themselves (DB trigger)
3. **XSS** — `gtEscapeHtml` / `gtSafeUrl` helpers
4. **Input validation** — deposit / withdrawal / package amounts validated
5. **RLS** — Row Level Security on all critical tables

For production: enable HTTPS, review RLS, restrict CORS, enable email confirmation.

---

## Tech Stack

- **Frontend:** Vanilla HTML5, CSS3, ES modules-ready JS
- **Backend:** Supabase (Auth, Postgres, Realtime-ready, Storage)
- **Charts:** Native SVG
- **Icons:** Inline SVG system (`icons.js`)
- **PWA:** manifest.json install-ready

---

© 2026 GO TRADE Intelligence · Built for decisive moves.
