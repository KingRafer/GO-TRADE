/* ============================================================
   GO TRADE â€” Authentication (Supabase Auth + profiles)
   ============================================================ */

function gtShowEnvWarning(message) {
  if (document.getElementById("gtEnvWarning")) return;
  const bar = document.createElement("div");
  bar.id = "gtEnvWarning";
  bar.style.cssText =
    "position:fixed;top:0;left:0;right:0;z-index:9999;background:#b91c1c;color:#fff;font:600 12px/1.5 sans-serif;padding:10px 16px;text-align:center;";
  bar.textContent = message;
  document.addEventListener("DOMContentLoaded", () => document.body.prepend(bar));
  if (document.body) document.body.prepend(bar);
}

function gtMapProfile(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    referralCode: row.referral_code,
    referredBy: row.referred_by,
    level: row.level,
    walletBalance: Number(row.wallet_balance || 0),
    verified: !!row.verified,
    joined: row.joined,
    status: row.status || "active",
    avatar: row.avatar || null,
  };
}

/* ---------- Auth ---------- */
async function gtLogin(email, password, role) {
  if (!window.sb) {
    return { error: "Supabase belum dikonfigurasi. Isi URL & anon key di config.js" };
  }
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message === "Invalid login credentials"
      ? "Email atau password salah."
      : error.message };
  }
  const profile = await gtFetchProfile(data.user.id);
  if (!profile) {
    await sb.auth.signOut();
    return { error: "Profil tidak ditemukan. Hubungi admin." };
  }
  // Role is optional: if provided, enforce match; otherwise accept any role from profile
  if (role && profile.role !== role) {
    await sb.auth.signOut();
    return {
      error: `Akun ini terdaftar sebagai ${profile.role === "admin" ? "Admin" : "Member"}, bukan ${role === "admin" ? "Admin" : "Member"}.`,
    };
  }
  if (profile.status === "suspended") {
    await sb.auth.signOut();
    return { error: "Akun Anda ditangguhkan. Hubungi support." };
  }
  return { user: profile };
}

async function gtRegister({ name, email, password, referralCode }) {
  if (!window.sb) {
    return { error: "Supabase belum dikonfigurasi. Isi URL & anon key di config.js" };
  }
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { name, role: "member", referred_by: referralCode || null },
    },
  });
  if (error) {
    if (/already/i.test(error.message)) return { error: "Email ini sudah terdaftar. Silakan login." };
    return { error: error.message };
  }
  // Trigger creates profile; patch referred_by if provided
  if (data.user && referralCode) {
    await sb.from("profiles").update({ referred_by: referralCode }).eq("id", data.user.id);
  }
  if (data.user && name) {
    await sb.from("profiles").update({ name }).eq("id", data.user.id);
  }
  return { user: { email, name, role: "member" }, needsConfirm: !data.session };
}

async function gtFetchProfile(userId) {
  if (!window.sb) return null;
  const { data, error } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return gtMapProfile(data);
}

async function gtFetchProfileByEmail(email) {
  if (!window.sb) return null;
  const { data, error } = await sb.from("profiles").select("*").eq("email", email).maybeSingle();
  if (error || !data) return null;
  return gtMapProfile(data);
}

async function gtSession() {
  if (!window.sb) return null;
  const { data } = await sb.auth.getSession();
  if (!data.session) return null;
  const profile = await gtFetchProfile(data.session.user.id);
  if (!profile) return null;
  return { email: profile.email, role: profile.role, id: profile.id };
}

async function gtCurrentUser() {
  if (!window.sb) return null;
  const { data } = await sb.auth.getUser();
  if (!data.user) return null;
  return gtFetchProfile(data.user.id);
}

async function gtUpdateCurrentUser(patch) {
  if (!window.sb) return null;
  const { data: auth } = await sb.auth.getUser();
  if (!auth.user) return null;
  // SECURITY: members may only update name & avatar â€” wallet/role/status/verified/level are admin-only
  const dbPatch = {};
  if (patch.name !== undefined) dbPatch.name = String(patch.name).slice(0, 120);
  if (patch.avatar !== undefined) dbPatch.avatar = patch.avatar;
  if (Object.keys(dbPatch).length === 0) return gtFetchProfile(auth.user.id);
  dbPatch.updated_at = new Date().toISOString();
  const { data, error } = await sb.from("profiles").update(dbPatch).eq("id", auth.user.id).select().single();
  if (error) {
    console.error("[GO TRADE] gtUpdateCurrentUser failed:", error.message);
    return null;
  }
  return gtMapProfile(data);
}

async function gtLogout() {
  try {
    if (window.sb) {
      const { data } = await sb.auth.getUser();
      const email = data?.user?.email;
      if (email) {
        if (typeof gtLogActivity === "function") {
          await gtLogActivity({
            action: "logout",
            actorEmail: email,
            target: email,
            detail: "Logout",
          });
        } else {
          await sb.from("activity_logs").insert({
            actor_email: email,
            action: "logout",
            target: email,
            detail: "Logout",
          });
        }
      }
      await sb.auth.signOut();
    }
  } catch (_) {
    if (window.sb) try { await sb.auth.signOut(); } catch (__) {}
  }
  window.location.href = "login.html";
}

async function gtRequireRole(role) {
  if (!window.gtSupabaseConfigured || !window.gtSupabaseConfigured()) {
    gtShowEnvWarning("âš  Supabase belum dikonfigurasi. Buka config.js dan isi supabase.url + anonKey.");
    return null;
  }
  const { data } = await sb.auth.getSession();
  if (!data.session) {
    window.location.href = "login.html";
    return null;
  }
  const user = await gtFetchProfile(data.session.user.id);
  if (!user || user.role !== role) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

/* Admin user helpers */
async function gtAllProfiles() {
  const { data, error } = await sb.from("profiles").select("*").order("joined", { ascending: false });
  if (error) return [];
  return (data || []).map(gtMapProfile);
}

async function gtAdminUpdateUser(email, patch) {
  if (!window.sb || !email) return;
  const dbPatch = {};
  if (patch.name !== undefined) dbPatch.name = String(patch.name).slice(0, 120);
  if (patch.walletBalance !== undefined) dbPatch.wallet_balance = Number(patch.walletBalance);
  if (patch.verified !== undefined) dbPatch.verified = !!patch.verified;
  if (patch.level !== undefined) dbPatch.level = Number(patch.level) || 1;
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.avatar !== undefined) dbPatch.avatar = patch.avatar;
  if (Object.keys(dbPatch).length === 0) return;
  dbPatch.updated_at = new Date().toISOString();
  const { error } = await sb.from("profiles").update(dbPatch).eq("email", email);
  if (error) console.error("[GO TRADE] gtAdminUpdateUser failed:", error.message);
  // Log meaningful admin account changes (skip pure wallet balance adjustments)
  const meaningful = ["verified", "status", "level", "name"].some((k) => patch[k] !== undefined);
  if (meaningful && typeof gtLogActivity === "function") {
    const parts = [];
    if (patch.verified !== undefined) parts.push(patch.verified ? "diverifikasi" : "unverifikasi");
    if (patch.status !== undefined) parts.push(`status=${patch.status}`);
    if (patch.level !== undefined) parts.push(`level=${patch.level}`);
    if (patch.name !== undefined) parts.push(`nama diperbarui`);
    await gtLogActivity({
      action: "user_updated",
      target: email,
      detail: parts.join(", ") || "Profil diperbarui",
      meta: patch,
    });
  }
}

async function gtAdminDeleteUser(email) {
  // Soft-delete via status; hard delete needs service role
  await sb.from("profiles").update({ status: "deleted" }).eq("email", email);
  if (typeof gtLogActivity === "function") {
    await gtLogActivity({
      action: "user_deleted",
      target: email,
      detail: `Akun ${email} dihapus (soft-delete)`,
    });
  }
}

async function gtFindUser(email) {
  return gtFetchProfileByEmail(email);
}

/* ---------- Theme (still local preference) ---------- */
const GT_THEME_KEY = "gt_theme_v1";

function gtGetTheme() {
  try {
    return localStorage.getItem(GT_THEME_KEY) || "light";
  } catch (e) {
    return "light";
  }
}
function gtApplyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll(".theme-toggle [data-theme-btn]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.themeBtn === theme);
  });
  if (typeof gtRenderIcons === "function") gtRenderIcons();
}
function gtSetTheme(theme) {
  try {
    localStorage.setItem(GT_THEME_KEY, theme);
  } catch (e) {}
  gtApplyTheme(theme);
}
function gtInitTheme() {
  gtApplyTheme(gtGetTheme());
}
function gtThemeToggleHTML(extraClass = "") {
  return `<div class="theme-toggle ${extraClass}"><button data-theme-btn="light" title="Mode terang"><span data-icon="sun" data-icon-size="14"></span></button><button data-theme-btn="dark" title="Mode gelap"><span data-icon="moon" data-icon-size="14"></span></button></div>`;
}
function gtBindThemeToggle(root = document) {
  gtApplyTheme(gtGetTheme());
  root.querySelectorAll("[data-theme-btn]").forEach((btn) => {
    btn.addEventListener("click", () => gtSetTheme(btn.dataset.themeBtn));
  });
}
gtInitTheme();

/* Password visibility toggle helper */
function gtBindPasswordToggles(root = document) {
  root.querySelectorAll("[data-toggle-password], [data-pass-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.togglePassword || btn.dataset.passToggle;
      const input = document.getElementById(id);
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.setAttribute("aria-label", show ? "Sembunyikan password" : "Tampilkan password");
      // Swap eye / eyeOff icon if present
      const icon = btn.querySelector("[data-icon]");
      if (icon) {
        icon.setAttribute("data-icon", show ? "eyeOff" : "eye");
        if (typeof gtRenderIcons === "function") gtRenderIcons(btn);
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => gtBindPasswordToggles());

/* ---------- XSS-safe HTML helpers ---------- */
function gtEscapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function gtSafeUrl(url) {
  if (!url) return "";
  const s = String(url).trim();
  if (/^(https?:|data:image\/)/i.test(s)) return s;
  return "";
}
