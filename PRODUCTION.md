# GO TRADE — Production readiness

## Yang sudah disiapkan di repo

| Area | Apa yang ada | Cara aktifkan |
|------|----------------|---------------|
| Frontend | Terminal + workspace | Deploy static / Vercel |
| Auth | Supabase Auth + local fallback | Isi js/config.js supabase |
| Database | supabase/schema.sql | SQL Editor Supabase |
| RLS | Policy member/admin, protect wallet/role | Termasuk di schema |
| Activity log | Tabel + js/security.js | Otomatis setelah schema |
| Client rate limit | Order per menit | GT_CONFIG.security |
| Error tracking dasar | window.onerror + localStorage | security.js |
| Security headers | nosniff, frame deny | vercel.json |
| Health | GET /api/health | Setelah deploy Vercel |
| CI | .github/workflows/ci.yml | Push ke GitHub |

### Checklist setup
1. Supabase SQL Editor → jalankan supabase/schema.sql
2. Auth Email provider on
3. Copy URL + anon key ke js/config.js
4. Deploy Vercel (Git integration)

## Belum di repo (butuh akun cloud)
- API backend trading nyata
- Cloud compute / cron ROI
- Rate limit server-side / WAF
- Redis cache
- Load balancer
- Sentry/Datadog (hook sudah di gtTrackError)
- Multi-region HA
- Backup PITR Supabase (aktifkan di dashboard)
