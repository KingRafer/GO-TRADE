/* GO TRADE — Supabase client */
(function () {
  const cfg = (window.GT_CONFIG && window.GT_CONFIG.supabase) || {};
  const url = cfg.url || "";
  const key = cfg.anonKey || "";

  window.gtSupabaseConfigured = function () {
    return url && key && !url.includes("YOUR_PROJECT") && !key.includes("YOUR_ANON");
  };

  if (!window.gtSupabaseConfigured()) {
    console.warn("[GO TRADE] Supabase belum dikonfigurasi. Isi config.js → supabase.url & anonKey");
    window.sb = null;
    return;
  }

  if (typeof supabase === "undefined" || !supabase.createClient) {
    console.error("[GO TRADE] Library @supabase/supabase-js belum dimuat. Pastikan script CDN ada di HTML.");
    window.sb = null;
    return;
  }

  window.sb = supabase.createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
})();
