/* ============================================================
   GO TRADE — Authentication (Supabase Auth + profiles)
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

function gtMapProfilee(row) {
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
    return { error: "Supabase is not configured. Set URL & anon key in config.js" };
  }
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: error.message === "Invalid login credentials"
      ? "Incorrect email or password."
      : error.message };
  }
  const profile = await gtFetchProfilee(data.user.id);
  if (!profile) {
    await sb.auth.signOut();
    return { error: "Profile not found. Contact admin." };
  }
  if (role && profile.role !== role) {
    await sb.auth.signOut();
    return {
      error: `This account is registered as ${profile.role === "admin" ? "Admin" : "Member"}, not ${role === "admin" ? "Admin" : "Member"}.`,
    };
  }
  if (profile.status === "suspended") {
    await sb.auth.signOut();
    return { error: "Your account is suspended. Contact support." };
  }
  return { user: profile };
}

async function gtRegister({ name, email, password, referralCode }) {
  if (!window.sb) {
    return { error: "Supabase is not configured. Set URL & anon key in config.js" };
  }
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { name, role: "member", referred_by: referralCode || null },
    },
  });
  if (error) {
    if (/already/i.test(error.message)) return { error: "This email is already registered. Please sign in." };
    return { error: error.message };
  }
  return { user: data.user, message: "Account created successfully. Redirecting to login..." };
}

async function gtFetchProfilee(userId) {
  if (!window.sb) return null;
  const { data, error } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return gtMapProfilee(data);
}

async function gtFetchProfileByEmail(email) {
  if (!window.sb) return null;
  const { data, error } = await sb.from("profiles").select("*").eq("email", email).maybeSingle();
  if (error || !data) return null;
  return gtMapProfilee(data);
}

async function gtGetSessionUser() {
  if (!window.sb) return null;
  const { data: { session } } = await sb.auth.getSession();
  if (!session?.user) return null;
  return gtFetchProfilee(session.user.id);
}

async function gtRequireAuth(expectedRole) {
  const user = await gtGetSessionUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  if (expectedRole && user.role !== expectedRole) {
    window.location.href = user.role === "admin" ? "admin.html" : "dashboard.html";
    return null;
  }
  return user;
}

/* Backward-compatible role guard used by the dedicated admin entry point. */
async function gtRequireRole(role) {
  return gtRequireAuth(role);
}

async function gtLogout() {
  if (window.sb) await sb.auth.signOut();
  window.location.href = "login.html";
}

/* Theme */
const GT_THEME_KEY = "gt-theme";
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
  return `<div class="theme-toggle ${extraClass}"><button data-theme-btn="light" title="Light mode"><span data-icon="sun" data-icon-size="14"></span></button><button data-theme-btn="dark" title="Dark mode"><span data-icon="moon" data-icon-size="14"></span></button></div>`;
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
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
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
