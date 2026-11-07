import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { cert, getApps, initializeApp } from "npm:firebase-admin/app";
import { getMessaging } from "npm:firebase-admin/messaging";

const appOrigin = Deno.env.get("APP_ORIGIN") || "https://go-trade-tau.vercel.app";
const corsHeaders = {
  "Access-Control-Allow-Origin": appOrigin,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function reply(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!jwt) return reply({ error: "Unauthorized" }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const firebaseSecret = Deno.env.get("FIREBASE_SERVICE_ACCOUNT_JSON");
  if (!url || !anonKey || !serviceKey || !firebaseSecret) {
    return reply({ error: "Push sender belum dikonfigurasi di server." }, 503);
  }

  const callerClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await callerClient.auth.getUser(jwt);
  if (authError || !authData.user) return reply({ error: "Sesi tidak valid." }, 401);

  const adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: profile, error: roleError } = await adminClient
    .from("profiles").select("role").eq("id", authData.user.id).single();
  if (roleError || profile?.role !== "admin") return reply({ error: "Akses ditolak." }, 403);

  let payload: { user_id?: string; title?: string; body?: string; url?: string };
  try {
    payload = await req.json();
  } catch {
    return reply({ error: "Format permintaan tidak valid." }, 400);
  }

  const userId = payload.user_id || "";
  const title = (payload.title || "").trim();
  const body = (payload.body || "").trim();
  const target = payload.url || "/dashboard.html";
  if (!/^[0-9a-f-]{36}$/i.test(userId) || !title || !body || title.length > 80 || body.length > 240) {
    return reply({ error: "Data notifikasi tidak valid." }, 400);
  }
  if (!target.startsWith("/") || target.startsWith("//") || target.includes("\\")) {
    return reply({ error: "Tujuan notifikasi harus berupa path internal." }, 400);
  }

  const { data: rows, error: rowsError } = await adminClient
    .from("push_devices").select("token").eq("user_id", userId);
  if (rowsError) return reply({ error: "Gagal membaca perangkat terdaftar." }, 500);
  const tokens = [...new Set((rows || []).map((row) => row.token).filter(Boolean))];
  if (!tokens.length) return reply({ sent: 0, failed: 0, message: "Belum ada perangkat terdaftar." });

  let serviceAccount: Record<string, unknown>;
  try {
    serviceAccount = JSON.parse(firebaseSecret);
  } catch {
    return reply({ error: "Secret Firebase server tidak valid." }, 500);
  }
  const firebaseApp = getApps()[0] || initializeApp({ credential: cert(serviceAccount as never) });
  const messaging = getMessaging(firebaseApp);
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < tokens.length; i += 500) {
    const batch = tokens.slice(i, i + 500);
    const result = await messaging.sendEachForMulticast({
      tokens: batch,
      notification: { title, body },
      data: { url: target, tag: "go-trade-account-notice" },
      webpush: { fcmOptions: { link: new URL(target, appOrigin).toString() } },
    });
    sent += result.successCount;
    failed += result.failureCount;
    const invalidTokens = result.responses
      .map((item, index) => ({ item, token: batch[index] }))
      .filter(({ item }) => !item.success && [
        "messaging/registration-token-not-registered",
        "messaging/invalid-registration-token",
      ].includes(item.error?.code || ""))
      .map(({ token }) => token);
    if (invalidTokens.length) {
      await adminClient.from("push_devices").delete().in("token", invalidTokens);
    }
  }

  return reply({ sent, failed });
});
