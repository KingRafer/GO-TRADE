/* GO TRADE — Configuration */
window.GT_CONFIG = {
  brand: {
    name: "GO TRADE",
    tagline: "INTELLIGENT TRADING SYSTEM",
    domain: "go-trade.app",
    supportEmail: "support@go-trade.app",
    year: 2026,
  },
  theme: {
    primary: "#10b981",
    accent: "#34d399",
    navy: "#0a0e17",
  },
  supabase: {
    url: "https://litvwayepniwpzoigcxb.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpdHZ3YXllcG5pd3B6b2lnY3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxMjA2ODQsImV4cCI6MjEwNzY5NjY4NH0.TeIxLiY8Z8GMeYffDUR_Y3qlkFBc8ozbUcmtCPYfsVw",
  },
  features: {
    realAuth: true,
    notifications: true,
    liveCharts: true,
    aiSignals: true,
    requireSupabaseInProd: false,
    activityLog: true,
    clientRateLimit: true,
  },
  security: {
    orderPerMinute: 30,
    authPerMinute: 10,
  },
  version: "9.1.1",
  build: "2026.11.10",
};
