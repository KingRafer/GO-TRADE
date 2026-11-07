/* ============================================================
   GO TRADE — Configuration (v8.0)
   White-label ready. Change brand, colors, and Supabase keys.
   Dashboard → Settings → API to get url & anonKey.
   ============================================================ */
globalThis.GT_CONFIG = {
  brand: {
    name: "GO TRADE",
    tagline: "INTELLIGENT TRADING SYSTEM",
    shortName: "GO TRADE",
    domain: "go-trade-tau.vercel.app",
    supportEmail: "support@go-trade-tau.vercel.app",
    year: 2026,
  },
  theme: {
    primary: "#16b884",
    primaryDark: "#0f5c33",
    accent: "#2fe0a4",
    navy: "#0a0c1f",
  },
  /* === SUPABASE — required === */
  supabase: {
    url: "https://litvwayepniwpzoigcxb.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpdHZ3YXllcG5pd3B6b2lnY3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMjA2ODQsImV4cCI6MjEwNzY5NjY4NH0.TeIxLiY8Z8GMeYffDUR_Y3qlkFBc8ozbUcmtCPYfsVw",
  },
  /* Firebase Web App identifiers + VAPID public key. Fill after Firebase setup. */
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    messagingSenderId: "",
    appId: "",
    vapidKey: "",
  },
  features: {
    aiWidget: true,
    darkMode: true,
    referral: true,
    news: true,
    signals: true,
    packages: true,
    exportCsv: true,
    liveTicker: true,
    achievements: true,
  },
  version: "8.0.0",
  build: "2026.10.16",
};
