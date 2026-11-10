# GO TRADE — Production readiness

## Yang sudah disiapkan di repo (bisa dipakai sekarang)

| Area | Apa yang ada | Cara aktifkan |
|------|----------------|---------------|
| **Frontend** | Terminal + workspace lengkap | Deploy static / Vercel |
| **Auth** | Supabase Auth + local fallback | Isi `js/config.js` → supabase url/anon key |
| **Database** | `supabase/schema.sql` lengkap | SQL Editor Supabase → jalankan schema |
| **RLS** | Policy member/admin, protect wallet/role | Termasuk di schema |
| **Activity log** | Tabel + `js/security.js` → local + Supabase | Otomatis setelah schema + login Supabase |
| **Client rate limit** | Order/auth soft limit di browser | `GT_CONFIG.security` |
| **Error tracking (dasar)** | `window.onerror` + localStorage ring buffer | Otomatis lewat `security.js` |
| **Security headers** | nosniff, frame deny, referrer, XSS | `vercel.json` |
| **Static cache CDN** | Cache-Control assets/css/js | Vercel edge otomatis + headers |
| **Health endpoint** | `GET /api/health` | Setelah deploy Vercel (serverless) |
| **CI** | `.github/workflows/ci.yml` | Push ke GitHub; optional `VERCEL_TOKEN` secret |

### Checklist setup cepat
1. Supabase project → jalankan `supabase/schema.sql`
2. Auth → Email provider on; production: **enable confirm email**
3. Copy Project URL + anon key ke `js/config.js`
4. Deploy ke Vercel (Git integration atau CLI)
5. (Opsional) GitHub Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

---

## Yang **belum** bisa / belum ada di repo — dan kenapa

| Area | Kenapa belum di repo ini |
|------|---------------------------|
| **API Backend trading** | Order/wallet/ROI masih di browser (paper). Backend butuh server Node/Go + secrets exchange; tidak cukup static host. |
| **Cloud compute (workers)** | ROI harian, job settlement, bot butuh cron/worker (Cloud Run, Fly, Supabase Edge Functions berbayar/konfigurasi akun). |
| **Rate limiting server-side** | Client limit bisa di-bypass. Butuh API gateway / Supabase Edge / Cloudflare WAF di akun Anda. |
| **Redis / cache data trading** | Perlu managed Redis (Upstash, dll) + kode server yang membacanya. |
| **Load balancer + autoscaling app** | Hanya relevan setelah ada **banyak instance backend**. Static+BaaS diskalakan Vercel/Supabase, bukan LB custom. |
| **Sentry / Datadog** | Butuh DSN/akun pihak ketiga; hook sudah disiapkan di `gtTrackError` (`// if (window.Sentry)`). |
| **Multi-region HA / failover** | Setting infrastruktur cloud (Supabase PITR, multi-region Vercel) di dashboard provider, bukan file kode saja. |
| **Backup & recovery formal** | Aktifkan **Point-in-Time Recovery** di Supabase Pro; dokumentasikan RPO/RTO di runbook tim Anda. |
| **CI deploy otomatis penuh** | Workflow ada, tapi token Vercel harus Anda pasang di GitHub Secrets (keamanan: token tidak boleh di-commit). |

---

## Rekomendasi fase berikutnya (di luar file static)

1. **Supabase Edge Functions** atau API kecil: deposit approve, wallet credit (hanya service role).
2. **Cloudflare** di depan domain: WAF, rate limit, cache HTML.
3. **Sentry** browser SDK 5 baris di `index.html`.
4. Matikan local auth fallback saat `location.hostname` production (`requireSupabaseInProd: true`).

