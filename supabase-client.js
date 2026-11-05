/* GO TRADE — Supabase client */
(function () {
  const cfg = (window.GT_CONFIG && window.GT_CONFIG.supabase) || {};
  const url = cfg.url || "";
  const key = cfg.anonKey || "";

  window.gtSupabaseClient = null;

  if (!url || !key) {
    console.warn("[GO TRADE] Supabase url/anonKey missing in config.js");
    return;
  }

  if (typeof window.supabase === "undefined" || !window.supabase.createClient) {
    console.error("[GO TRADE] Library @supabase/supabase-js not loaded. Ensure the CDN script is in the HTML.");
    return;
  }

  try {
    window.gtSupabaseClient = window.supabase.createClient(url, key);
  } catch (err) {
    console.error("[GO TRADE] Failed to init Supabase client", err);
  }
})();
