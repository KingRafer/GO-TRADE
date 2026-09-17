/* ============================================================
   GO TRADE — Demo authentication (frontend only, no backend)
   Data is stored in this browser's localStorage. Nothing here
   is sent to any server. Passwords are stored in plain text
   only because this is a static demo — never do this in a
   real product.
   ============================================================ */

/* Detect environments where localStorage won't reliably persist
   (opened directly as a file, or storage blocked/full by the
   browser) and show a visible warning instead of a silent,
   confusing "can't log in" loop. */
function gtStorageWorks() {
  try {
    localStorage.setItem("__gt_test__", "1");
    localStorage.removeItem("__gt_test__");
    return true;
  } catch (e) {
    return false;
  }
}
function gtShowEnvWarning(message) {
  if (document.getElementById("gtEnvWarning")) return;
  const bar = document.createElement("div");
  bar.id = "gtEnvWarning";
  bar.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:9999;background:#b91c1c;color:#fff;font:600 12px/1.5 sans-serif;padding:10px 16px;text-align:center;";
  bar.textContent = message;
  document.addEventListener("DOMContentLoaded", () => document.body.prepend(bar));
  if (document.body) document.body.prepend(bar);
}
(function checkEnvironment() {
  if (location.protocol === "file:") {
    gtShowEnvWarning("⚠ Halaman ini dibuka langsung dari file (file://). Login/registrasi memerlukan localStorage yang sering diblokir pada mode ini di HP. Jalankan lewat local server atau upload ke hosting web (lihat README).");
  } else if (!gtStorageWorks()) {
    gtShowEnvWarning("⚠ Browser ini memblokir penyimpanan lokal (localStorage), misalnya karena mode privat/incognito. Login tidak akan tersimpan — coba mode browser biasa.");
  }
})();

const GT_USERS_KEY = "gt_users_v1";
const GT_SESSION_KEY = "gt_session_v1";

const GT_DEFAULT_USERS = [
  {
    name: "Rafi Pratama",
    email: "demo@gotrade.io",
    password: "demo123",
    role: "member",
    referralCode: "GOTRADE-DEMO1",
    referredBy: null,
    level: 1,
    walletBalance: 1250.5,
    verified: true,
    joined: "2026-08-01",
    status: "active",
  },
  {
    name: "Admin GO TRADE",
    email: "admin@gotrade.io",
    password: "admin123",
    role: "admin",
    referralCode: "GOTRADE-ADMIN",
    referredBy: null,
    level: "Admin",
    walletBalance: 0,
    verified: true,
    joined: "2026-01-01",
    status: "active",
  },
];

function gtLoadUsers() {
  let raw;
  try {
    raw = localStorage.getItem(GT_USERS_KEY);
  } catch (e) {
    return JSON.parse(JSON.stringify(GT_DEFAULT_USERS));
  }
  if (!raw) {
    try {
      localStorage.setItem(GT_USERS_KEY, JSON.stringify(GT_DEFAULT_USERS));
    } catch (e) {}
    return JSON.parse(JSON.stringify(GT_DEFAULT_USERS));
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    try {
      localStorage.setItem(GT_USERS_KEY, JSON.stringify(GT_DEFAULT_USERS));
    } catch (e2) {}
    return JSON.parse(JSON.stringify(GT_DEFAULT_USERS));
  }
}

function gtSaveUsers(users) {
  try {
    localStorage.setItem(GT_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    gtShowEnvWarning("⚠ Gagal menyimpan data — penyimpanan lokal browser ini penuh atau diblokir.");
  }
}

function gtFindUser(email) {
  return gtLoadUsers().find((u) => u.email.toLowerCase() === String(email).toLowerCase());
}

function gtLogin(email, password, role) {
  const user = gtFindUser(email);
  if (!user) return { error: "Akun tidak ditemukan. Periksa kembali email Anda." };
  if (user.password !== password) return { error: "Password salah. Silakan coba lagi." };
  if (user.role !== role) return { error: `Akun ini terdaftar sebagai ${user.role === "admin" ? "Admin" : "Member"}, bukan ${role === "admin" ? "Admin" : "Member"}.` };
  try {
    localStorage.setItem(GT_SESSION_KEY, JSON.stringify({ email: user.email, role: user.role }));
  } catch (e) {
    return { error: "Browser ini memblokir penyimpanan lokal, jadi sesi login tidak bisa disimpan. Coba browser/mode lain." };
  }
  return { user };
}

function gtRegister({ name, email, password, referralCode }) {
  const users = gtLoadUsers();
  if (gtFindUser(email)) return { error: "Email ini sudah terdaftar. Silakan login." };
  const code = "GT-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  const newUser = {
    name,
    email,
    password,
    role: "member",
    referralCode: code,
    referredBy: referralCode || null,
    level: 1,
    walletBalance: 0,
    verified: false,
    joined: new Date().toISOString().slice(0, 10),
    status: "active",
  };
  users.push(newUser);
  gtSaveUsers(users);
  return { user: newUser };
}

function gtSession() {
  try {
    return JSON.parse(localStorage.getItem(GT_SESSION_KEY) || "null");
  } catch (e) {
    return null;
  }
}

function gtCurrentUser() {
  const s = gtSession();
  if (!s) return null;
  return gtFindUser(s.email) || null;
}

function gtUpdateCurrentUser(patch) {
  const s = gtSession();
  if (!s) return null;
  const users = gtLoadUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === s.email.toLowerCase());
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...patch };
  gtSaveUsers(users);
  return users[idx];
}

function gtLogout() {
  localStorage.removeItem(GT_SESSION_KEY);
  window.location.href = "login.html";
}

/* Call at the top of a protected page. Redirects if not authorized. */
function gtRequireRole(role) {
  const s = gtSession();
  if (!s || s.role !== role) {
    window.location.href = "login.html";
    return null;
  }
  const user = gtCurrentUser();
  if (!user) {
    window.location.href = "login.html";
    return null;
  }
  return user;
}

function gtResetDemoData() {
  localStorage.removeItem(GT_USERS_KEY);
  localStorage.removeItem(GT_SESSION_KEY);
  localStorage.removeItem("gt_deposits_v1");
  localStorage.removeItem("gt_withdrawals_v1");
  localStorage.removeItem("gt_user_packages_v1");
  localStorage.removeItem("gt_packages_catalog_v1");
  localStorage.removeItem("gt_bonus_v1");
  localStorage.removeItem("gt_trades_v1");
  localStorage.removeItem("gt_notifications_v1");
  localStorage.removeItem("gt_signals_v1");
  localStorage.removeItem("gt_news_v1");
  localStorage.removeItem("gt_settings_v1");
  localStorage.removeItem("gt_seeded_v1");
  localStorage.removeItem("gt_seeded_v2");
  localStorage.removeItem("gt_seeded_v3");
}

/* ---------- Light / dark theme ---------- */
const GT_THEME_KEY = "gt_theme_v1";

function gtGetTheme() {
  return localStorage.getItem(GT_THEME_KEY) || "light";
}
function gtApplyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll(".theme-toggle [data-theme-btn]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.themeBtn === theme);
  });
  if (typeof gtRenderIcons === "function") gtRenderIcons();
}
function gtSetTheme(theme) {
  localStorage.setItem(GT_THEME_KEY, theme);
  gtApplyTheme(theme);
}
function gtInitTheme() {
  gtApplyTheme(gtGetTheme());
}
/* Renders a two-button light/dark switch (sun | moon). */
function gtThemeToggleHTML(extraClass = "") {
  return `<div class="theme-toggle ${extraClass}"><button data-theme-btn="light" title="Mode terang"><span data-icon="sun" data-icon-size="14"></span></button><button data-theme-btn="dark" title="Mode gelap"><span data-icon="moon" data-icon-size="14"></span></button></div>`;
}
function gtBindThemeToggle(root = document) {
  gtApplyTheme(gtGetTheme());
  root.querySelectorAll("[data-theme-btn]").forEach((btn) => {
    btn.addEventListener("click", () => gtSetTheme(btn.dataset.themeBtn));
  });
}
// Apply saved theme immediately on every page load (before first paint where possible).
gtInitTheme();

/* ---------- Show/hide password ---------- */
function gtTogglePasswordVisibility(btn) {
  const input = document.getElementById(btn.dataset.passToggle);
  if (!input) return;
  const showing = input.type === "text";
  input.type = showing ? "password" : "text";
  const icon = btn.querySelector("[data-icon]");
  if (icon) {
    icon.dataset.icon = showing ? "eye" : "eyeOff";
    if (typeof gtRenderIcons === "function") gtRenderIcons(btn);
  }
}
function gtBindPasswordToggles(root = document) {
  root.querySelectorAll("[data-pass-toggle]").forEach((btn) => btn.addEventListener("click", () => gtTogglePasswordVisibility(btn)));
}

/* ---------- Image upload -> base64 preview (bound once, works for any dynamic form) ---------- */
document.addEventListener("change", (event) => {
  const input = event.target.closest("[data-image-input]");
  if (!input || !input.files || !input.files[0]) return;
  const file = input.files[0];
  if (!file.type.startsWith("image/")) {
    alert("File harus berupa gambar.");
    input.value = "";
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    alert("Ukuran gambar maksimal 3MB untuk demo ini.");
    input.value = "";
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    const preview = document.getElementById(input.dataset.imageInput);
    if (preview) {
      preview.src = reader.result;
      preview.style.display = "";
    }
    if (input.dataset.hideOnUpload) {
      const fallback = document.getElementById(input.dataset.hideOnUpload);
      if (fallback) fallback.style.display = "none";
    }
  };
  reader.readAsDataURL(file);
});
