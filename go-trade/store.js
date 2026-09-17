/* ============================================================
   GO TRADE — Shared demo data store (frontend only)
   Everything here lives in localStorage on this browser only.
   This is what lets the member app and the admin app "talk" to
   each other in the demo: e.g. an admin approving a deposit
   updates the member's wallet balance.
   ============================================================ */

const GT_DEPOSITS_KEY = "gt_deposits_v1";
const GT_WITHDRAWALS_KEY = "gt_withdrawals_v1";
const GT_PACKAGES_KEY = "gt_packages_catalog_v1";
const GT_USER_PACKAGES_KEY = "gt_user_packages_v1";
const GT_BONUS_KEY = "gt_bonus_v1";
const GT_TRADES_KEY = "gt_trades_v1";
const GT_NOTIF_KEY = "gt_notifications_v1";
const GT_SEED_FLAG = "gt_seeded_v3";

function gtLoadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function gtSaveJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
function gtUid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function gtToday() {
  return new Date().toISOString().slice(0, 10);
}
function gtPlaceholderImage(label, colorA, colorB) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${colorA}"/><stop offset="1" stop-color="${colorB}"/></linearGradient></defs><rect width="640" height="320" fill="url(#g)"/><text x="50%" y="52%" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="2">${label}</text></svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

/* ---------- Packages catalog (admin-editable) ---------- */
const GT_DEFAULT_PACKAGES = [
  { id: "starter", name: "Starter Signal", minDeposit: 50, dailyRoi: 0.8, duration: 30, color: "#dff0ff", icon: "sparkles", description: "Cocok untuk member baru yang ingin mencoba sinyal AI dasar." },
  { id: "growth", name: "Growth Auto-Trade", minDeposit: 250, dailyRoi: 1.3, duration: 45, color: "#e3fbf1", icon: "trendUp", description: "Auto-trading harian dengan alokasi risiko menengah." },
  { id: "pro", name: "Pro Arbitrage", minDeposit: 1000, dailyRoi: 1.9, duration: 60, color: "#e5f7ec", icon: "package", description: "Untuk member berpengalaman yang mengejar hasil maksimal." },
];

function gtPackagesCatalog() {
  return gtLoadJSON(GT_PACKAGES_KEY, GT_DEFAULT_PACKAGES);
}
function gtSavePackagesCatalog(list) {
  gtSaveJSON(GT_PACKAGES_KEY, list);
}

/* ---------- Seed demo data (only once) ---------- */
function gtSeedStoreIfNeeded() {
  if (localStorage.getItem(GT_SEED_FLAG)) return;
  const email = "demo@gotrade.io";

  gtSaveJSON(GT_DEPOSITS_KEY, [
    { id: gtUid(), email, amount: 500, method: "USDT (BEP20)", note: "Top up awal", status: "approved", date: "2026-08-02" },
    { id: gtUid(), email, amount: 200, method: "USDT (BEP20)", note: "", status: "pending", date: "2026-09-10" },
  ]);

  gtSaveJSON(GT_WITHDRAWALS_KEY, [
    { id: gtUid(), email, amount: 80, address: "0xDEMO...4a5", note: "", status: "approved", date: "2026-08-20" },
  ]);

  gtSaveJSON(GT_USER_PACKAGES_KEY, [
    { id: gtUid(), email, packageId: "growth", packageName: "Growth Auto-Trade", amount: 500, dailyRoi: 1.3, startDate: "2026-08-02", status: "active" },
  ]);

  gtSaveJSON(GT_BONUS_KEY, [
    { id: gtUid(), email, type: "Referral bonus", amount: 25, note: "Ardi Setiawan bergabung", date: "2026-09-08" },
    { id: gtUid(), email, type: "Daily package reward", amount: 6.5, note: "Growth Auto-Trade", date: "2026-09-12" },
    { id: gtUid(), email, type: "Daily package reward", amount: 6.5, note: "Growth Auto-Trade", date: "2026-09-13" },
  ]);

  gtSaveJSON(GT_TRADES_KEY, [
    { id: gtUid(), email, pair: "BTC/USDT", type: "Long", amount: 120, pnl: "+4.8%", status: "Closed", date: "2026-09-11" },
    { id: gtUid(), email, pair: "ETH/USDT", type: "Long", amount: 80, pnl: "+2.1%", status: "Closed", date: "2026-09-12" },
    { id: gtUid(), email, pair: "BNB/USDT", type: "Short", amount: 60, pnl: "-1.2%", status: "Closed", date: "2026-09-12" },
    { id: gtUid(), email, pair: "SOL/USDT", type: "Long", amount: 100, pnl: "—", status: "Open", date: "2026-09-13" },
  ]);

  gtSaveJSON(GT_NOTIF_KEY, [
    { id: gtUid(), audience: "all", title: "Selamat datang di GO TRADE", body: "Jelajahi halaman Signal untuk sinyal trading terbaru dari tim kami, dan aktifkan paket auto-trading pertama Anda. Klik notifikasi ini untuk melihat detail lengkap beserta gambar.", image: gtPlaceholderImage("WELCOME", "#0f5c33", "#4ade80"), date: "2026-09-01", read: false },
    { id: gtUid(), audience: email, title: "Deposit disetujui", body: "Deposit sebesar $500 telah ditambahkan ke wallet Anda.", image: null, date: "2026-08-02", read: true },
  ]);

  gtSaveJSON(GT_SIGNALS_KEY, [
    { id: gtUid(), pair: "BTC/USDT", type: "Buy", timeframe: "H4", entry: "63,800", target: "66,200", stopLoss: "62,400", note: "Momentum bullish setelah breakout resistance mingguan. Perhatikan volume konfirmasi.", status: "active", createdBy: "admin@gotrade.io", date: "2026-09-13" },
    { id: gtUid(), pair: "ETH/USDT", type: "Sell", timeframe: "H1", entry: "3,180", target: "3,050", stopLoss: "3,250", note: "Rejection dari resistance kuat, RSI overbought di timeframe H1.", status: "active", createdBy: "admin@gotrade.io", date: "2026-09-12" },
    { id: gtUid(), pair: "SOL/USDT", type: "Buy", timeframe: "H4", entry: "138.5", target: "148.0", stopLoss: "133.0", note: "Sudah closed take-profit, contoh sinyal yang selesai.", status: "closed", createdBy: "admin@gotrade.io", date: "2026-09-08" },
  ]);

  gtSaveJSON(GT_NEWS_KEY, [
    {
      id: gtUid(),
      title: "GO TRADE luncurkan sinyal AI generasi baru",
      body: "Tim GO TRADE memperbarui mesin analisis sinyal dengan cakupan pair yang lebih luas dan waktu respons lebih cepat. Fitur Signal kini menampilkan level entry, target, dan stop-loss yang lebih presisi untuk membantu member membuat keputusan trading yang lebih baik.",
      image: gtPlaceholderImage("GO TRADE", "#0f5c33", "#16a34a"),
      date: "2026-09-10",
    },
    {
      id: gtUid(),
      title: "Paket Growth Auto-Trade kini tersedia",
      body: "Member sekarang dapat mengaktifkan paket Growth Auto-Trade dengan ROI harian simulasi 1.3%. Cek halaman Auto Trading untuk detail lengkap minimum deposit dan durasi paket.",
      image: gtPlaceholderImage("AUTO TRADE", "#052e17", "#22c55e"),
      date: "2026-09-05",
    },
  ]);

  localStorage.setItem(GT_SEED_FLAG, "1");
}

/* ---------- Deposits ---------- */
function gtAllDeposits() {
  return gtLoadJSON(GT_DEPOSITS_KEY, []);
}
function gtDepositsFor(email) {
  return gtAllDeposits().filter((d) => d.email.toLowerCase() === email.toLowerCase()).sort((a, b) => (a.date < b.date ? 1 : -1));
}
function gtAddDepositRequest({ email, amount, method, note }) {
  const list = gtAllDeposits();
  list.push({ id: gtUid(), email, amount: Number(amount), method, note: note || "", status: "pending", date: gtToday() });
  gtSaveJSON(GT_DEPOSITS_KEY, list);
}
function gtSetDepositStatus(id, status) {
  const list = gtAllDeposits();
  const item = list.find((d) => d.id === id);
  if (!item) return;
  item.status = status;
  gtSaveJSON(GT_DEPOSITS_KEY, list);
  if (status === "approved") {
    const user = gtFindUser(item.email);
    if (user) gtAdminUpdateUser(item.email, { walletBalance: Number((user.walletBalance + item.amount).toFixed(2)) });
    gtAddNotification({ audience: item.email, title: "Deposit disetujui", body: `Deposit sebesar $${item.amount} telah ditambahkan ke wallet Anda.` });
  } else if (status === "rejected") {
    gtAddNotification({ audience: item.email, title: "Deposit ditolak", body: `Deposit sebesar $${item.amount} ditolak oleh admin. Hubungi support jika ini keliru.` });
  }
}

/* ---------- Withdrawals ---------- */
function gtAllWithdrawals() {
  return gtLoadJSON(GT_WITHDRAWALS_KEY, []);
}
function gtWithdrawalsFor(email) {
  return gtAllWithdrawals().filter((w) => w.email.toLowerCase() === email.toLowerCase()).sort((a, b) => (a.date < b.date ? 1 : -1));
}
function gtAddWithdrawalRequest({ email, amount, address, note }) {
  const user = gtFindUser(email);
  if (!user || user.walletBalance < Number(amount)) return { error: "Saldo tidak mencukupi." };
  const list = gtAllWithdrawals();
  list.push({ id: gtUid(), email, amount: Number(amount), address, note: note || "", status: "pending", date: gtToday() });
  gtSaveJSON(GT_WITHDRAWALS_KEY, list);
  gtAdminUpdateUser(email, { walletBalance: Number((user.walletBalance - Number(amount)).toFixed(2)) });
  return { ok: true };
}
function gtSetWithdrawalStatus(id, status) {
  const list = gtAllWithdrawals();
  const item = list.find((w) => w.id === id);
  if (!item) return;
  item.status = status;
  gtSaveJSON(GT_WITHDRAWALS_KEY, list);
  if (status === "rejected") {
    const user = gtFindUser(item.email);
    if (user) gtAdminUpdateUser(item.email, { walletBalance: Number((user.walletBalance + item.amount).toFixed(2)) });
    gtAddNotification({ audience: item.email, title: "Penarikan ditolak", body: `Penarikan sebesar $${item.amount} ditolak. Dana telah dikembalikan ke wallet Anda.` });
  } else if (status === "approved") {
    gtAddNotification({ audience: item.email, title: "Penarikan berhasil", body: `Penarikan sebesar $${item.amount} telah diproses.` });
  }
}

/* ---------- User packages ---------- */
function gtAllUserPackages() {
  return gtLoadJSON(GT_USER_PACKAGES_KEY, []);
}
function gtUserPackagesFor(email) {
  return gtAllUserPackages().filter((p) => p.email.toLowerCase() === email.toLowerCase());
}
function gtActivatePackage({ email, packageId, amount }) {
  const pkg = gtPackagesCatalog().find((p) => p.id === packageId);
  const user = gtFindUser(email);
  if (!pkg || !user) return { error: "Paket tidak ditemukan." };
  if (Number(amount) < pkg.minDeposit) return { error: `Minimal aktivasi untuk paket ini adalah $${pkg.minDeposit}.` };
  if (user.walletBalance < Number(amount)) return { error: "Saldo wallet tidak mencukupi. Silakan deposit terlebih dahulu." };
  const list = gtAllUserPackages();
  list.push({ id: gtUid(), email, packageId, packageName: pkg.name, amount: Number(amount), dailyRoi: pkg.dailyRoi, startDate: gtToday(), status: "active" });
  gtSaveJSON(GT_USER_PACKAGES_KEY, list);
  gtAdminUpdateUser(email, { walletBalance: Number((user.walletBalance - Number(amount)).toFixed(2)) });
  gtAddNotification({ audience: email, title: "Paket diaktifkan", body: `${pkg.name} aktif dengan modal $${amount}.` });
  return { ok: true };
}

/* ---------- Bonuses ---------- */
function gtBonusesFor(email) {
  return gtLoadJSON(GT_BONUS_KEY, []).filter((b) => b.email.toLowerCase() === email.toLowerCase()).sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* ---------- Trades ---------- */
function gtTradesFor(email) {
  return gtLoadJSON(GT_TRADES_KEY, []).filter((t) => t.email.toLowerCase() === email.toLowerCase()).sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* ---------- Notifications ---------- */
function gtAllNotifications() {
  return gtLoadJSON(GT_NOTIF_KEY, []);
}
function gtNotificationsFor(email) {
  return gtAllNotifications()
    .filter((n) => n.audience === "all" || n.audience.toLowerCase() === email.toLowerCase())
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
function gtAddNotification({ audience, title, body, image }) {
  const list = gtAllNotifications();
  list.push({ id: gtUid(), audience, title, body, image: image || null, date: gtToday(), read: false });
  gtSaveJSON(GT_NOTIF_KEY, list);
}
function gtMarkNotificationRead(id) {
  const list = gtAllNotifications();
  const item = list.find((n) => n.id === id);
  if (item) {
    item.read = true;
    gtSaveJSON(GT_NOTIF_KEY, list);
  }
}
function gtMarkAllNotificationsRead(email) {
  const list = gtAllNotifications();
  list.forEach((n) => {
    if (n.audience === "all" || n.audience.toLowerCase() === email.toLowerCase()) n.read = true;
  });
  gtSaveJSON(GT_NOTIF_KEY, list);
}

/* ---------- Site settings (admin-editable) ---------- */
const GT_SETTINGS_KEY = "gt_settings_v1";
const GT_DEFAULT_SETTINGS = {
  siteName: "GO TRADE",
  tagline: "INTELLIGENT TRADING SYSTEM",
  depositAddress: "0x000000000000000000000000000000DEAD0000",
  minDeposit: 10,
  minWithdrawal: 20,
  supportEmail: "support@gotrade.io",
};
function gtSettings() {
  return { ...GT_DEFAULT_SETTINGS, ...gtLoadJSON(GT_SETTINGS_KEY, {}) };
}
function gtSaveSettings(patch) {
  gtSaveJSON(GT_SETTINGS_KEY, { ...gtSettings(), ...patch });
}

/* ---------- Trading signals (published by admin, read by members) ---------- */
const GT_SIGNALS_KEY = "gt_signals_v1";
function gtAllSignals() {
  return gtLoadJSON(GT_SIGNALS_KEY, []);
}
function gtPublishedSignals() {
  return gtAllSignals()
    .filter((s) => s.status !== "draft")
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
function gtAddSignal(sig) {
  const list = gtAllSignals();
  list.push({ id: gtUid(), date: gtToday(), status: "active", ...sig });
  gtSaveJSON(GT_SIGNALS_KEY, list);
}
function gtUpdateSignal(id, patch) {
  const list = gtAllSignals();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...patch };
  gtSaveJSON(GT_SIGNALS_KEY, list);
}
function gtDeleteSignal(id) {
  gtSaveJSON(GT_SIGNALS_KEY, gtAllSignals().filter((s) => s.id !== id));
}

/* ---------- News (published by admin, read by members) ---------- */
const GT_NEWS_KEY = "gt_news_v1";
function gtAllNews() {
  return gtLoadJSON(GT_NEWS_KEY, []).sort((a, b) => (a.date < b.date ? 1 : -1));
}
function gtAddNews(news) {
  const list = gtLoadJSON(GT_NEWS_KEY, []);
  list.push({ id: gtUid(), date: gtToday(), ...news });
  gtSaveJSON(GT_NEWS_KEY, list);
}
function gtUpdateNews(id, patch) {
  const list = gtLoadJSON(GT_NEWS_KEY, []);
  const idx = list.findIndex((n) => n.id === id);
  if (idx === -1) return;
  list[idx] = { ...list[idx], ...patch };
  gtSaveJSON(GT_NEWS_KEY, list);
}
function gtDeleteNews(id) {
  gtSaveJSON(GT_NEWS_KEY, gtLoadJSON(GT_NEWS_KEY, []).filter((n) => n.id !== id));
}

/* ---------- Manual bonus (admin grants bonus directly) ---------- */
function gtGiveManualBonus(email, amount, note) {
  const user = gtFindUser(email);
  if (!user) return { error: "Member tidak ditemukan." };
  const list = gtLoadJSON(GT_BONUS_KEY, []);
  list.push({ id: gtUid(), email, type: "Bonus manual admin", amount: Number(amount), note: note || "", date: gtToday() });
  gtSaveJSON(GT_BONUS_KEY, list);
  gtAdminUpdateUser(email, { walletBalance: Number((user.walletBalance + Number(amount)).toFixed(2)) });
  gtAddNotification({ audience: email, title: "Bonus diterima", body: `Anda menerima bonus sebesar $${amount} dari admin.${note ? " Catatan: " + note : ""}` });
  return { ok: true };
}

/* ---------- Delete helpers (admin cleanup) ---------- */
function gtDeleteDeposit(id) {
  gtSaveJSON(GT_DEPOSITS_KEY, gtAllDeposits().filter((d) => d.id !== id));
}
function gtDeleteWithdrawal(id) {
  gtSaveJSON(GT_WITHDRAWALS_KEY, gtAllWithdrawals().filter((w) => w.id !== id));
}
function gtDeleteNotification(id) {
  gtSaveJSON(GT_NOTIF_KEY, gtAllNotifications().filter((n) => n.id !== id));
}
function gtDeleteUser(email) {
  gtSaveUsers(gtLoadUsers().filter((u) => u.email.toLowerCase() !== email.toLowerCase()));
}

/* ---------- Admin helpers on users ---------- */
function gtAdminUpdateUser(email, patch) {
  const users = gtLoadUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return null;
  users[idx] = { ...users[idx], ...patch };
  gtSaveUsers(users);
  return users[idx];
}
function gtAllMembers() {
  return gtLoadUsers().filter((u) => u.role === "member");
}
function gtReferralsOf(referralCode) {
  if (!referralCode) return [];
  return gtLoadUsers().filter((u) => u.referredBy === referralCode);
}
