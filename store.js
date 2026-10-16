/* ============================================================
   GO TRADE — Data Store (Supabase)
   Async loaders + in-memory cache so views can read synchronously
   after await gtEnsureStore().
   ============================================================ */

function gtUid() {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
function gtToday() {
  return new Date().toISOString().slice(0, 10);
}
function gtPlaceholderImage(label, colorA, colorB) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${colorA}"/><stop offset="1" stop-color="${colorB}"/></linearGradient></defs><rect width="640" height="320" fill="url(#g)"/><text x="50%" y="52%" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="middle">${String(label).replace(/[<>&]/g, "")}</text></svg>`;
  return "data:image/svg+xml;base64," + btoa(svg);
}

/* ---------- In-memory cache ---------- */
const _gtCache = {
  ready: false,
  packages: [],
  deposits: [],
  withdrawals: [],
  userPackages: [],
  bonuses: [],
  trades: [],
  signals: [],
  news: [],
  notifications: [],
  settings: { depositAddress: "0xYOUR_WALLET_ADDRESS", minDeposit: 50, minWithdrawal: 20 },
  profiles: [],
};

async function gtEnsureStore() {
  if (!window.sb) {
    console.warn("[GO TRADE] sb not ready");
    return;
  }
  const [
    packages,
    deposits,
    withdrawals,
    userPackages,
    bonuses,
    trades,
    signals,
    news,
    notifications,
    settingsRow,
    profiles,
  ] = await Promise.all([
    sb.from("packages").select("*").order("min_deposit"),
    sb.from("deposits").select("*").order("created_at", { ascending: false }),
    sb.from("withdrawals").select("*").order("created_at", { ascending: false }),
    sb.from("user_packages").select("*").order("created_at", { ascending: false }),
    sb.from("bonuses").select("*").order("created_at", { ascending: false }),
    sb.from("trades").select("*").order("created_at", { ascending: false }),
    sb.from("signals").select("*").order("created_at", { ascending: false }),
    sb.from("news").select("*").order("created_at", { ascending: false }),
    sb.from("notifications").select("*").order("created_at", { ascending: false }),
    sb.from("settings").select("*").eq("id", 1).maybeSingle(),
    sb.from("profiles").select("*").order("joined", { ascending: false }),
  ]);

  _gtCache.packages = (packages.data || []).map((p) => ({
    id: p.id, name: p.name, minDeposit: Number(p.min_deposit), dailyRoi: Number(p.daily_roi),
    duration: p.duration, color: p.color, icon: p.icon, description: p.description || "",
  }));
  _gtCache.deposits = (deposits.data || []).map((d) => ({
    id: d.id, email: d.email, amount: Number(d.amount), method: d.method, note: d.note || "",
    status: d.status, date: d.date,
  }));
  _gtCache.withdrawals = (withdrawals.data || []).map((w) => ({
    id: w.id, email: w.email, amount: Number(w.amount), address: w.address, note: w.note || "",
    status: w.status, date: w.date,
  }));
  _gtCache.userPackages = (userPackages.data || []).map((p) => ({
    id: p.id, email: p.email, packageId: p.package_id, packageName: p.package_name,
    amount: Number(p.amount), dailyRoi: Number(p.daily_roi), startDate: p.start_date, status: p.status,
  }));
  _gtCache.bonuses = (bonuses.data || []).map((b) => ({
    id: b.id, email: b.email, type: b.type, amount: Number(b.amount), note: b.note || "", date: b.date,
  }));
  _gtCache.trades = (trades.data || []).map((t) => ({
    id: t.id, email: t.email, pair: t.pair, type: t.type, amount: Number(t.amount),
    pnl: t.pnl, status: t.status, date: t.date,
  }));
  _gtCache.signals = (signals.data || []).map((s) => ({
    id: s.id, pair: s.pair, type: s.type, timeframe: s.timeframe, entry: s.entry,
    target: s.target, stopLoss: s.stop_loss, note: s.note || "", status: s.status,
    createdBy: s.created_by, date: s.date,
  }));
  _gtCache.news = (news.data || []).map((n) => ({
    id: n.id, title: n.title, body: n.body, image: n.image, date: n.date,
  }));
  _gtCache.notifications = (notifications.data || []).map((n) => ({
    id: n.id, audience: n.audience, title: n.title, body: n.body, image: n.image,
    date: n.date, read: !!n.read,
  }));
  if (settingsRow.data) {
    _gtCache.settings = {
      depositAddress: settingsRow.data.deposit_address,
      minDeposit: Number(settingsRow.data.min_deposit),
      minWithdrawal: Number(settingsRow.data.min_withdrawal),
    };
  }
  _gtCache.profiles = (profiles.data || []).map((row) => ({
    id: row.id, name: row.name, email: row.email, role: row.role,
    referralCode: row.referral_code, referredBy: row.referred_by, level: row.level,
    walletBalance: Number(row.wallet_balance || 0), verified: !!row.verified,
    joined: row.joined, status: row.status || "active", avatar: row.avatar || null,
  }));
  _gtCache.ready = true;
}

function gtSeedStoreIfNeeded() {}

/* ---------- Sync cache readers (used by views after gtEnsureStore) ---------- */
function gtPackagesCatalog() { return _gtCache.packages.slice(); }
function gtAllDeposits() { return _gtCache.deposits.slice(); }
function gtDepositsFor(email) {
  const e = (email || "").toLowerCase();
  return _gtCache.deposits.filter((d) => d.email.toLowerCase() === e);
}
function gtAllWithdrawals() { return _gtCache.withdrawals.slice(); }
function gtWithdrawalsFor(email) {
  const e = (email || "").toLowerCase();
  return _gtCache.withdrawals.filter((w) => w.email.toLowerCase() === e);
}
function gtUserPackagesFor(email) {
  const e = (email || "").toLowerCase();
  return _gtCache.userPackages.filter((p) => p.email.toLowerCase() === e);
}
function gtAllUserPackages() { return _gtCache.userPackages.slice(); }
function gtBonusesFor(email) {
  const e = (email || "").toLowerCase();
  return _gtCache.bonuses.filter((b) => b.email.toLowerCase() === e);
}
function gtTradesFor(email) {
  const e = (email || "").toLowerCase();
  return _gtCache.trades.filter((t) => t.email.toLowerCase() === e);
}
function gtAllSignals() { return _gtCache.signals.slice(); }
function gtActiveSignals() { return _gtCache.signals.filter((s) => s.status === "active"); }
function gtPublishedSignals() { return gtActiveSignals(); }
function gtAllNews() { return _gtCache.news.slice(); }
function gtNotificationsFor(email) {
  const e = (email || "").toLowerCase();
  return _gtCache.notifications.filter((n) => n.audience === "all" || (n.audience || "").toLowerCase() === e);
}
function gtAllNotifications() { return _gtCache.notifications.slice(); }
function gtSettings() { return { ..._gtCache.settings }; }
function gtReferralsFor(code) {
  if (!code) return [];
  return _gtCache.profiles.filter((p) => p.referredBy === code);
}
function gtReferralsOf(code) { return gtReferralsFor(code); }
function gtAllMembers() { return _gtCache.profiles.filter((p) => p.role === "member"); }
function gtAllProfiles() { return _gtCache.profiles.slice(); }
function gtFindUser(email) {
  const e = (email || "").toLowerCase();
  return _gtCache.profiles.find((p) => p.email.toLowerCase() === e) || null;
}
function gtUnreadCount(email) {
  return gtNotificationsFor(email).filter((n) => !n.read).length;
}

/* ---------- Async mutators (write to Supabase, then refresh cache) ---------- */
async function gtSavePackagesCatalog(list) {
  const keepIds = new Set((list || []).map((p) => p.id));
  const existing = await sb.from("packages").select("id");
  for (const row of (existing.data || [])) {
    if (!keepIds.has(row.id)) {
      await sb.from("packages").delete().eq("id", row.id);
    }
  }
  for (const p of list || []) {
    await sb.from("packages").upsert({
      id: p.id, name: p.name, min_deposit: p.minDeposit, daily_roi: p.dailyRoi,
      duration: p.duration, color: p.color || "#e5f7ec", icon: p.icon || "layers",
      description: p.description || "",
    });
  }
  await gtEnsureStore();
}

async function gtAddDepositRequest({ email, amount, method, note }) {
  const amt = Number(amount);
  if (!email || !(amt > 0)) return { error: "Data deposit tidak valid." };
  await sb.from("deposits").insert({
    email, amount: amt, method: method || "USDT (BEP20)", note: note || "",
    status: "pending", date: gtToday(),
  });
  await gtEnsureStore();
  return { ok: true };
}

async function gtSetDepositStatus(id, status) {
  const { data: item } = await sb.from("deposits").select("*").eq("id", id).single();
  if (!item) return;
  await sb.from("deposits").update({ status }).eq("id", id);
  if (status === "approved") {
    const user = await gtFetchProfileByEmail(item.email);
    if (user) {
      await gtAdminUpdateUser(item.email, {
        walletBalance: Number((user.walletBalance + Number(item.amount)).toFixed(2)),
      });
    }
    await gtAddNotification({
      audience: item.email,
      title: "Deposit disetujui",
      body: `Deposit sebesar $${item.amount} telah ditambahkan ke wallet Anda.`,
    });
  } else if (status === "rejected") {
    await gtAddNotification({
      audience: item.email,
      title: "Deposit ditolak",
      body: `Deposit sebesar $${item.amount} ditolak oleh admin.`,
    });
  }
  await gtEnsureStore();
}

async function gtDeleteDeposit(id) {
  await sb.from("deposits").delete().eq("id", id);
  await gtEnsureStore();
}

async function gtAddWithdrawalRequest({ email, amount, address, note }) {
  const amt = Number(amount);
  if (!email || !(amt > 0) || !address) return { error: "Data penarikan tidak valid." };
  // Fresh balance from DB
  const user = await gtFetchProfileByEmail(email);
  if (!user || user.walletBalance < amt) return { error: "Saldo tidak mencukupi." };
  const settings = gtSettings();
  if (amt < settings.minWithdrawal) return { error: `Minimum penarikan $${settings.minWithdrawal}.` };
  await sb.from("withdrawals").insert({
    email, amount: amt, address: String(address).slice(0, 200), note: note || "",
    status: "pending", date: gtToday(),
  });
  await gtAdminUpdateUser(email, {
    walletBalance: Number((user.walletBalance - amt).toFixed(2)),
  });
  await gtEnsureStore();
  return { ok: true };
}

async function gtSetWithdrawalStatus(id, status) {
  const { data: item } = await sb.from("withdrawals").select("*").eq("id", id).single();
  if (!item) return;
  await sb.from("withdrawals").update({ status }).eq("id", id);
  if (status === "rejected") {
    const user = await gtFetchProfileByEmail(item.email);
    if (user) {
      await gtAdminUpdateUser(item.email, {
        walletBalance: Number((user.walletBalance + Number(item.amount)).toFixed(2)),
      });
    }
    await gtAddNotification({
      audience: item.email,
      title: "Penarikan ditolak",
      body: `Penarikan $${item.amount} ditolak. Saldo dikembalikan.`,
    });
  } else if (status === "approved") {
    await gtAddNotification({
      audience: item.email,
      title: "Penarikan disetujui",
      body: `Penarikan $${item.amount} sedang diproses ke alamat Anda.`,
    });
  }
  await gtEnsureStore();
}

async function gtDeleteWithdrawal(id) {
  await sb.from("withdrawals").delete().eq("id", id);
  await gtEnsureStore();
}

async function gtActivatePackage({ email, packageId, packageName, amount, dailyRoi }) {
  const amt = Number(amount);
  if (!email || !(amt > 0)) return { error: "Data paket tidak valid." };
  const user = await gtFetchProfileByEmail(email);
  if (!user || user.walletBalance < amt) return { error: "Saldo tidak mencukupi." };
  await sb.from("user_packages").insert({
    email, package_id: packageId, package_name: packageName,
    amount: amt, daily_roi: dailyRoi, start_date: gtToday(), status: "active",
  });
  await gtAdminUpdateUser(email, {
    walletBalance: Number((user.walletBalance - amt).toFixed(2)),
  });
  await gtEnsureStore();
  return { ok: true };
}

async function gtAddBonus({ email, type, amount, note }) {
  const amt = Number(amount);
  if (!email || !(amt > 0)) return;
  await sb.from("bonuses").insert({
    email, type: type || "Bonus", amount: amt, note: note || "", date: gtToday(),
  });
  const user = await gtFetchProfileByEmail(email);
  if (user) {
    await gtAdminUpdateUser(email, {
      walletBalance: Number((user.walletBalance + amt).toFixed(2)),
    });
  }
  await gtEnsureStore();
}

async function gtSaveSignal(signal) {
  if (signal.id) {
    const row = {};
    if (signal.pair !== undefined) row.pair = signal.pair;
    if (signal.type !== undefined) row.type = signal.type;
    if (signal.timeframe !== undefined) row.timeframe = signal.timeframe;
    if (signal.entry !== undefined) row.entry = signal.entry;
    if (signal.target !== undefined) row.target = signal.target;
    if (signal.stopLoss !== undefined) row.stop_loss = signal.stopLoss;
    if (signal.note !== undefined) row.note = signal.note;
    if (signal.status !== undefined) row.status = signal.status;
    if (signal.createdBy !== undefined) row.created_by = signal.createdBy;
    if (Object.keys(row).length) await sb.from("signals").update(row).eq("id", signal.id);
  } else {
    await sb.from("signals").insert({
      pair: signal.pair, type: signal.type, timeframe: signal.timeframe || "H4",
      entry: signal.entry, target: signal.target, stop_loss: signal.stopLoss,
      note: signal.note || "", status: signal.status || "active",
      created_by: signal.createdBy, date: signal.date || gtToday(),
    });
  }
  await gtEnsureStore();
}

async function gtDeleteSignal(id) {
  await sb.from("signals").delete().eq("id", id);
  await gtEnsureStore();
}

async function gtToggleSignalStatus(id) {
  const { data } = await sb.from("signals").select("status").eq("id", id).single();
  if (!data) return;
  await sb.from("signals").update({ status: data.status === "active" ? "closed" : "active" }).eq("id", id);
  await gtEnsureStore();
}

async function gtSaveNews(item) {
  const row = {
    title: item.title, body: item.body, image: item.image || null, date: item.date || gtToday(),
  };
  if (item.id) await sb.from("news").update(row).eq("id", item.id);
  else await sb.from("news").insert(row);
  await gtEnsureStore();
}

async function gtDeleteNews(id) {
  await sb.from("news").delete().eq("id", id);
  await gtEnsureStore();
}

async function gtAddNotification({ audience, title, body, image }) {
  await sb.from("notifications").insert({
    audience, title, body, image: image || null, date: gtToday(), read: false,
  });
  // lightweight cache update
  if (_gtCache.ready) {
    _gtCache.notifications.unshift({
      id: gtUid(), audience, title, body, image: image || null, date: gtToday(), read: false,
    });
  }
}

async function gtMarkNotificationRead(id) {
  await sb.from("notifications").update({ read: true }).eq("id", id);
  const n = _gtCache.notifications.find((x) => x.id === id);
  if (n) n.read = true;
}

async function gtMarkAllNotificationsRead(email) {
  const list = gtNotificationsFor(email).filter((x) => !x.read);
  for (const n of list) await gtMarkNotificationRead(n.id);
}

async function gtDeleteNotification(id) {
  await sb.from("notifications").delete().eq("id", id);
  _gtCache.notifications = _gtCache.notifications.filter((n) => n.id !== id);
}

async function gtSaveSettings(patch) {
  const row = { updated_at: new Date().toISOString() };
  if (patch.depositAddress !== undefined) row.deposit_address = String(patch.depositAddress).slice(0, 200);
  if (patch.minDeposit !== undefined) row.min_deposit = Number(patch.minDeposit);
  if (patch.minWithdrawal !== undefined) row.min_withdrawal = Number(patch.minWithdrawal);
  await sb.from("settings").update(row).eq("id", 1);
  await gtEnsureStore();
}

async function gtResetDemoData() {
  console.warn("gtResetDemoData: gunakan SQL Editor Supabase untuk reset data produksi.");
}

/* Compatibility aliases */
async function gtDeleteUser(email) { return gtAdminDeleteUser(email); }
async function gtGiveManualBonus(email, amount, note) {
  return gtAddBonus({ email, type: "Bonus manual", amount, note });
}
async function gtAddSignal(signal) { return gtSaveSignal(signal); }
async function gtUpdateSignal(signal) { return gtSaveSignal(signal); }
async function gtAddNews(item) { return gtSaveNews(item); }
async function gtUpdateNews(item) { return gtSaveNews(item); }
