/* GO TRADE — admin workspace app (frontend demo only) */
(function () {
  const admin = gtRequireRole("admin");
  if (!admin) return; // gtRequireRole already redirected to login.html

  gtSeedStoreIfNeeded();

  const app = document.getElementById("app");
  const breadcrumb = document.getElementById("breadcrumbCurrent");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modal = document.getElementById("modal");
  const toastContainer = document.getElementById("toastContainer");

let currentView = "overview";

function initials(name) {
  return (name || "??").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}
function money(n) {
  return "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function statCard(label, value, change, icon, color) {
  return `<div class="card stat-card"><div class="stat-top"><span>${label}</span><i class="stat-icon" style="background:${color}"><span data-icon="${icon}" data-icon-size="15"></span></i></div><div class="stat-number">${value}</div><div class="stat-change">${change}</div></div>`;
}
function viewHeader(eyebrow, title, subhead, action = "") {
  return `<div class="view-header"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="subhead">${subhead}</p></div>${action ? `<div class="header-actions">${action}</div>` : ""}</div>`;
}
function pillForStatus(status) {
  const map = { active: "pill-active", pending: "pill-draft", approved: "pill-active", rejected: "pill-danger", completed: "pill-published" };
  return `<span class="pill ${map[status] || "pill-paused"}">${status}</span>`;
}

function paintProfileChrome() {
  document.getElementById("sideAvatar").textContent = initials(admin.name);
  document.getElementById("sideName").textContent = admin.name;
  document.getElementById("footAvatar").textContent = initials(admin.name);
  document.getElementById("footName").textContent = admin.name;
  document.getElementById("topAvatar").textContent = initials(admin.name);
}
function refreshBadges() {
  document.getElementById("depBadge").textContent = gtAllDeposits().filter((d) => d.status === "pending").length;
  document.getElementById("wdBadge").textContent = gtAllWithdrawals().filter((w) => w.status === "pending").length;
}

/* ---------------- Views ---------------- */

function overviewView() {
  const members = gtAllMembers();
  const deposits = gtAllDeposits();
  const withdrawals = gtAllWithdrawals();
  const approvedVolume = deposits.filter((d) => d.status === "approved").reduce((s, d) => s + d.amount, 0);
  const pendingDeposits = deposits.filter((d) => d.status === "pending");
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending");
  const activePackages = gtAllUserPackages().filter((p) => p.status === "active");
  const activeSignals = gtAllSignals().filter((s) => s.status === "active");

  return `${viewHeader("GO TRADE / administration", "Admin overview", "Tampilan menyeluruh atas member, dana, dan aktivitas platform.")}
    <div class="admin-banner"><div><h2>Semua sistem berjalan normal <span style="color:#2fe0a4">●</span></h2><p>Ini adalah lingkungan demo — seluruh data disimpan lokal di browser ini.</p></div><span class="pill pill-active">Demo environment</span></div>
    <div class="admin-grid admin-grid-5">
      <div class="card admin-metric"><div class="stat-icon"><span data-icon="users" data-icon-size="16"></span></div><b>${members.length}</b><span>Total member</span></div>
      <div class="card admin-metric"><div class="stat-icon"><span data-icon="layers" data-icon-size="16"></span></div><b>${activePackages.length}</b><span>Paket aktif</span></div>
      <div class="card admin-metric"><div class="stat-icon"><span data-icon="sparkles" data-icon-size="16"></span></div><b>${activeSignals.length}</b><span>Sinyal aktif</span></div>
      <div class="card admin-metric"><div class="stat-icon"><span data-icon="inbox" data-icon-size="16"></span></div><b>${pendingDeposits.length}</b><span>Deposit menunggu</span></div>
      <div class="card admin-metric"><div class="stat-icon"><span data-icon="wallet" data-icon-size="16"></span></div><b>${money(approvedVolume)}</b><span>Volume deposit disetujui</span></div>
    </div>
    <div class="dashboard-grid">
      <div class="card table-card"><div class="card-header"><div><h2>Deposit menunggu verifikasi</h2><p class="muted">Perlu tindakan Anda</p></div><button class="action-link" data-view="deposits">Kelola →</button></div><table class="data-table"><thead><tr><th>Member</th><th>Jumlah</th><th>Tanggal</th></tr></thead><tbody>${
        pendingDeposits.length ? pendingDeposits.slice(0, 5).map((d) => `<tr><td>${d.email}</td><td>${money(d.amount)}</td><td>${d.date}</td></tr>`).join("") : `<tr><td colspan="3" class="empty-placeholder">Tidak ada deposit menunggu.</td></tr>`
      }</tbody></table></div>
      <div class="card table-card"><div class="card-header"><div><h2>Penarikan menunggu proses</h2><p class="muted">Perlu tindakan Anda</p></div><button class="action-link" data-view="withdrawals">Kelola →</button></div><table class="data-table"><thead><tr><th>Member</th><th>Jumlah</th><th>Tanggal</th></tr></thead><tbody>${
        pendingWithdrawals.length ? pendingWithdrawals.slice(0, 5).map((w) => `<tr><td>${w.email}</td><td>${money(w.amount)}</td><td>${w.date}</td></tr>`).join("") : `<tr><td colspan="3" class="empty-placeholder">Tidak ada penarikan menunggu.</td></tr>`
      }</tbody></table></div>
    </div>`;
}

function usersView() {
  const members = gtAllMembers();
  return `${viewHeader("Kelola / akun", "Manage users", "Lihat, edit, verifikasi, beri bonus, atau hapus akun member.")}
    <div class="toolbar"><div class="search-box"><span data-icon="search" data-icon-size="15"></span><input id="userSearch" placeholder="Cari nama atau email..." /></div></div>
    <div class="card table-card"><table class="data-table"><thead><tr><th>Member</th><th>Saldo wallet</th><th>Level</th><th>Status</th><th>Bergabung</th><th></th></tr></thead><tbody id="usersTbody">${members
      .map(
        (m) => `<tr data-email="${m.email}"><td><span class="table-avatar" style="background:#e5f7ec">${initials(m.name)}</span><span class="table-name">${m.name}<span class="table-meta">${m.email}</span></span></td><td>${money(m.walletBalance)}</td><td>Level ${m.level}</td><td>${m.verified ? '<span class="pill pill-active">Verified</span>' : '<span class="pill pill-draft">Unverified</span>'} ${m.status === "suspended" ? '<span class="pill pill-danger">Suspended</span>' : ""}</td><td>${m.joined}</td><td style="white-space:nowrap">
        <button class="btn btn-secondary" style="padding:6px 8px;font-size:9px" data-action="edit-user" data-email="${m.email}">Edit</button>
        <button class="btn btn-secondary" style="padding:6px 8px;font-size:9px" data-action="give-bonus" data-email="${m.email}">+ Bonus</button>
        <button class="btn btn-secondary" style="padding:6px 8px;font-size:9px" data-action="toggle-verify" data-email="${m.email}">${m.verified ? "Unverify" : "Verify"}</button>
        <button class="btn ${m.status === "suspended" ? "btn-mint" : "btn-danger"}" style="padding:6px 8px;font-size:9px" data-action="toggle-suspend" data-email="${m.email}">${m.status === "suspended" ? "Aktifkan" : "Suspend"}</button>
        <button class="btn btn-danger" style="padding:6px 8px;font-size:9px" data-action="delete-user" data-email="${m.email}">Hapus</button>
        </td></tr>`
      )
      .join("")}</tbody></table></div>`;
}

function depositsView() {
  const deposits = gtAllDeposits().sort((a, b) => (a.date < b.date ? 1 : -1));
  return `${viewHeader("Kelola / dana masuk", "Deposit requests", "Verifikasi setiap permintaan deposit sebelum saldo ditambahkan ke member.")}
    <div class="card table-card"><table class="data-table"><thead><tr><th>Member</th><th>Jumlah</th><th>Metode</th><th>Catatan</th><th>Tanggal</th><th>Status</th><th></th></tr></thead><tbody>${
      deposits.length
        ? deposits
            .map(
              (d) => `<tr><td>${d.email}</td><td>${money(d.amount)}</td><td>${d.method}</td><td>${d.note || "—"}</td><td>${d.date}</td><td>${pillForStatus(d.status)}</td><td style="white-space:nowrap">${
                d.status === "pending"
                  ? `<button class="btn btn-mint" style="padding:6px 8px;font-size:9px" data-action="approve-deposit" data-id="${d.id}">Setujui</button> <button class="btn btn-danger" style="padding:6px 8px;font-size:9px" data-action="reject-deposit" data-id="${d.id}">Tolak</button> `
                  : ""
              }<button class="btn btn-secondary" style="padding:6px 8px;font-size:9px" data-action="delete-deposit" data-id="${d.id}">Hapus</button></td></tr>`
            )
            .join("")
        : `<tr><td colspan="7" class="empty-placeholder">Belum ada permintaan deposit.</td></tr>`
    }</tbody></table></div>`;
}

function withdrawalsView() {
  const withdrawals = gtAllWithdrawals().sort((a, b) => (a.date < b.date ? 1 : -1));
  return `${viewHeader("Kelola / dana keluar", "Withdrawal requests", "Proses setiap permintaan penarikan member.")}
    <div class="card table-card"><table class="data-table"><thead><tr><th>Member</th><th>Jumlah</th><th>Alamat tujuan</th><th>Tanggal</th><th>Status</th><th></th></tr></thead><tbody>${
      withdrawals.length
        ? withdrawals
            .map(
              (w) => `<tr><td>${w.email}</td><td>${money(w.amount)}</td><td>${w.address}</td><td>${w.date}</td><td>${pillForStatus(w.status)}</td><td style="white-space:nowrap">${
                w.status === "pending"
                  ? `<button class="btn btn-mint" style="padding:6px 8px;font-size:9px" data-action="approve-withdrawal" data-id="${w.id}">Setujui</button> <button class="btn btn-danger" style="padding:6px 8px;font-size:9px" data-action="reject-withdrawal" data-id="${w.id}">Tolak</button> `
                  : ""
              }<button class="btn btn-secondary" style="padding:6px 8px;font-size:9px" data-action="delete-withdrawal" data-id="${w.id}">Hapus</button></td></tr>`
            )
            .join("")
        : `<tr><td colspan="6" class="empty-placeholder">Belum ada permintaan penarikan.</td></tr>`
    }</tbody></table></div>`;
}

function packagesView() {
  const catalog = gtPackagesCatalog();
  return `${viewHeader("Kelola / produk", "Manage packages", "Atur paket auto-trading yang tersedia untuk member.", `<button class="btn btn-primary" data-action="new-package">＋ Tambah paket</button>`)}
    <div class="card table-card"><table class="data-table"><thead><tr><th>Paket</th><th>Min. deposit</th><th>ROI harian</th><th>Durasi</th><th></th></tr></thead><tbody>${catalog
      .map(
        (p) => `<tr><td><span data-icon="${p.icon}" data-icon-size="13"></span> ${p.name}<span class="table-meta">${p.description}</span></td><td>${money(p.minDeposit)}</td><td>${p.dailyRoi}%</td><td>${p.duration} hari</td><td><button class="btn btn-secondary" style="padding:6px 9px;font-size:9px" data-action="edit-package" data-id="${p.id}">Edit</button> <button class="btn btn-danger" style="padding:6px 9px;font-size:9px" data-action="delete-package" data-id="${p.id}">Hapus</button></td></tr>`
      )
      .join("")}</tbody></table></div>`;
}

function signalsView() {
  const signals = gtAllSignals().sort((a, b) => (a.date < b.date ? 1 : -1));
  return `${viewHeader("Kelola / intelligence", "Manage signals", "Publikasikan sinyal trading yang akan tampil di halaman Signal member.", `<button class="btn btn-primary" data-action="new-signal">＋ Buat sinyal baru</button>`)}
    <div class="card table-card"><table class="data-table"><thead><tr><th>Pair</th><th>Tipe</th><th>Entry / Target / SL</th><th>Timeframe</th><th>Status</th><th>Tanggal</th><th></th></tr></thead><tbody>${
      signals.length
        ? signals
            .map(
              (s) => `<tr><td>${s.pair}</td><td><span class="pill ${s.type === "Buy" || s.type === "Long" ? "pill-active" : "pill-danger"}">${s.type}</span></td><td>${s.entry} / ${s.target} / ${s.stopLoss}</td><td>${s.timeframe}</td><td>${pillForStatus(s.status)}</td><td>${s.date}</td><td style="white-space:nowrap">
                <button class="btn btn-secondary" style="padding:6px 8px;font-size:9px" data-action="edit-signal" data-id="${s.id}">Edit</button>
                <button class="btn ${s.status === "closed" ? "btn-mint" : "btn-secondary"}" style="padding:6px 8px;font-size:9px" data-action="toggle-signal-status" data-id="${s.id}">${s.status === "closed" ? "Buka lagi" : "Tutup"}</button>
                <button class="btn btn-danger" style="padding:6px 8px;font-size:9px" data-action="delete-signal" data-id="${s.id}">Hapus</button>
                </td></tr>`
            )
            .join("")
        : `<tr><td colspan="7" class="empty-placeholder">Belum ada sinyal. Buat sinyal pertama Anda.</td></tr>`
    }</tbody></table></div>`;
}

function newsView() {
  const news = gtAllNews();
  return `${viewHeader("Kelola / konten", "Manage news", "Publikasikan berita dan pengumuman lengkap dengan gambar untuk member.", `<button class="btn btn-primary" data-action="new-news">＋ Tulis berita baru</button>`)}
    <div class="news-grid">${
      news.length
        ? news
            .map(
              (n) => `<div class="card news-card">${n.image ? `<img src="${n.image}" class="news-image" alt="" />` : `<div class="news-image news-image-empty"><span data-icon="megaphone" data-icon-size="26"></span></div>`}<div class="news-body"><h3>${n.title}</h3><p>${n.body}</p><time>${n.date}</time><div style="display:flex;gap:6px;margin-top:12px"><button class="btn btn-secondary" style="padding:6px 8px;font-size:9px;flex:1" data-action="edit-news" data-id="${n.id}">Edit</button><button class="btn btn-danger" style="padding:6px 8px;font-size:9px;flex:1" data-action="delete-news" data-id="${n.id}">Hapus</button></div></div></div>`
            )
            .join("")
        : `<div class="card"><div class="empty-placeholder">Belum ada berita. Tulis yang pertama.</div></div>`
    }</div>`;
}

function newsFormBody(n = {}) {
  return `<div class="field"><label class="form-label">Judul</label><input class="form-control" id="newsTitle" value="${n.title || ""}" /></div>
    <div class="field"><label class="form-label">Isi berita</label><textarea class="form-control" id="newsBody" rows="4">${n.body || ""}</textarea></div>
    <div class="field"><label class="form-label">Gambar (opsional, maks 3MB)</label><input type="file" accept="image/*" class="form-control" data-image-input="newsImagePreview" /><img id="newsImagePreview" src="${n.image || ""}" style="margin-top:10px;max-width:100%;border-radius:8px;${n.image ? "" : "display:none"}" alt="" /></div>`;
}

function networkView() {
  const members = gtAllMembers();
  const rows = members.map((m) => ({ ...m, refCount: gtReferralsOf(m.referralCode).length }));
  return `${viewHeader("Kelola / pertumbuhan", "Referral & network", "Pantau performa referral seluruh member.")}
    <div class="card table-card"><table class="data-table"><thead><tr><th>Member</th><th>Kode referral</th><th>Jumlah referral</th><th>Direferensikan oleh</th></tr></thead><tbody>${rows
      .map((m) => `<tr><td>${m.name}<span class="table-meta">${m.email}</span></td><td>${m.referralCode}</td><td>${m.refCount}</td><td>${m.referredBy || "—"}</td></tr>`)
      .join("")}</tbody></table></div>`;
}

function notifyView() {
  return `${viewHeader("Sistem / komunikasi", "Broadcast notification", "Kirim pengumuman ke seluruh member sekaligus.")}
    <div class="card" style="padding:22px;max-width:640px">
      <div class="field"><label class="form-label">Judul</label><input class="form-control" id="notifTitle" placeholder="e.g. Pemeliharaan sistem terjadwal" /></div>
      <div class="field"><label class="form-label">Isi pesan</label><textarea class="form-control" id="notifBody" rows="4" placeholder="Tuliskan pengumuman Anda di sini..."></textarea></div>
      <div class="field"><label class="form-label">Gambar (opsional, maks 3MB)</label><input type="file" accept="image/*" class="form-control" data-image-input="notifImagePreview" /><img id="notifImagePreview" src="" style="margin-top:10px;max-width:100%;border-radius:8px;display:none" alt="" /></div>
      <button class="btn btn-primary" data-action="send-broadcast">Kirim ke semua member</button>
    </div>
    <div class="card table-card" style="margin-top:17px;max-width:640px"><div class="card-header"><div><h2>Riwayat broadcast</h2></div></div><div class="activity-list">${gtAllNotifications()
      .filter((n) => n.audience === "all")
      .reverse()
      .map(
        (n) =>
          `<div class="activity-row">${n.image ? `<img src="${n.image}" class="notification-thumb" alt="" />` : `<div class="activity-icon" style="background:#e5f7ec;color:#15803d"><span data-icon="megaphone" data-icon-size="14"></span></div>`}<div class="activity-copy"><strong>${n.title}</strong><span>${n.body} · ${n.date}</span></div><button class="btn btn-danger" style="padding:6px 8px;font-size:9px" data-action="delete-broadcast" data-id="${n.id}">Hapus</button></div>`
      )
      .join("") || `<div class="empty-placeholder">Belum ada broadcast terkirim.</div>`}</div></div>`;
}

function settingsView() {
  const s = gtSettings();
  return `${viewHeader("Sistem / konfigurasi", "System settings", "Atur nama situs, alamat deposit demo, dan batas transaksi.", `<button class="btn btn-primary" data-action="save-system-settings">Simpan pengaturan</button>`)}
    <div class="card" style="padding:22px;max-width:640px">
      <div class="field-row"><div class="field"><label class="form-label">Nama situs</label><input class="form-control" id="setSiteName" value="${s.siteName}" /></div><div class="field"><label class="form-label">Tagline</label><input class="form-control" id="setTagline" value="${s.tagline}" /></div></div>
      <div class="field"><label class="form-label">Alamat deposit demo (USDT BEP20)</label><div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap"><input class="form-control" id="setDepositAddress" value="${s.depositAddress}" style="flex:1;min-width:200px" /><div id="settingsQrBox" class="qr-placeholder" style="flex:0 0 auto"><span data-icon="qr" data-icon-size="26"></span><span>Memuat QR...</span></div></div><span class="subhead" style="font-size:9px">⚠ Selalu gunakan alamat DEMO, jangan alamat wallet sungguhan.</span></div>
      <div class="field-row"><div class="field"><label class="form-label">Minimal deposit (USD)</label><input class="form-control" id="setMinDeposit" type="number" value="${s.minDeposit}" /></div><div class="field"><label class="form-label">Minimal penarikan (USD)</label><input class="form-control" id="setMinWithdrawal" type="number" value="${s.minWithdrawal}" /></div></div>
      <div class="field"><label class="form-label">Email support</label><input class="form-control" id="setSupportEmail" value="${s.supportEmail}" /></div>
    </div>
    <div class="card" style="padding:22px;max-width:640px;margin-top:17px"><h2 style="margin-bottom:10px;color:#b23a41">Zona berbahaya</h2><p class="subhead" style="margin-bottom:14px">Kembalikan seluruh data demo (user, deposit, paket, dsb.) ke kondisi awal.</p><button class="btn btn-danger" data-action="reset-demo">Reset semua data demo</button></div>`;
}

function signalFormBody(sig = {}) {
  return `<div class="form-row"><div><label class="form-label">Pair</label><input class="form-control" id="sigPair" placeholder="e.g. BTC/USDT" value="${sig.pair || ""}" /></div><div><label class="form-label">Tipe</label><select class="form-control" id="sigType"><option value="Buy" ${sig.type === "Buy" ? "selected" : ""}>Buy</option><option value="Sell" ${sig.type === "Sell" ? "selected" : ""}>Sell</option></select></div></div>
    <div class="form-row"><div><label class="form-label">Timeframe</label><input class="form-control" id="sigTimeframe" placeholder="e.g. H4" value="${sig.timeframe || ""}" /></div><div><label class="form-label">Entry</label><input class="form-control" id="sigEntry" placeholder="e.g. 63,800" value="${sig.entry || ""}" /></div></div>
    <div class="form-row"><div><label class="form-label">Target</label><input class="form-control" id="sigTarget" placeholder="e.g. 66,200" value="${sig.target || ""}" /></div><div><label class="form-label">Stop Loss</label><input class="form-control" id="sigStopLoss" placeholder="e.g. 62,400" value="${sig.stopLoss || ""}" /></div></div>
    <div class="field"><label class="form-label">Catatan / analisis <span style="font-weight:400">(opsional)</span></label><textarea class="form-control" id="sigNote" rows="3">${sig.note || ""}</textarea></div>`;
}

const views = { overview: overviewView, users: usersView, deposits: depositsView, withdrawals: withdrawalsView, packages: packagesView, signals: signalsView, news: newsView, network: networkView, notify: notifyView, settings: settingsView };
const viewNames = { overview: "Overview", users: "Manage Users", deposits: "Deposit Requests", withdrawals: "Withdrawal Requests", packages: "Manage Packages", signals: "Manage Signals", news: "Manage News", network: "Referral & Network", notify: "Broadcast Notification", settings: "System Settings" };

function render(view = currentView) {
  currentView = view;
  app.innerHTML = views[view]();
  breadcrumb.textContent = viewNames[view];
  document.querySelectorAll(".nav-item[data-view]").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  refreshBadges();
  gtRenderIcons(app);
  if (view === "settings") renderSettingsQr();
  window.scrollTo({ top: 0 });
}

function renderSettingsQr() {
  const box = document.getElementById("settingsQrBox");
  const input = document.getElementById("setDepositAddress");
  if (!box || !input) return;
  const paint = () => {
    box.innerHTML = "";
    if (typeof QRCode === "undefined") {
      box.innerHTML = `<span data-icon="qr" data-icon-size="26"></span><span>QR tidak dapat dimuat.</span>`;
      gtRenderIcons(box);
      return;
    }
    try {
      new QRCode(box, { text: input.value || " ", width: 110, height: 110, colorDark: "#0a0c1f", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
    } catch (e) {
      box.innerHTML = `<span>QR gagal dibuat.</span>`;
    }
  };
  paint();
  input.addEventListener("input", paint);
}

function showToast(message, title = "Admin") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<b>${title}</b>${message}`;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function openModal(title, body, footer = `<button class="btn btn-secondary" data-action="close-modal">Batal</button><button class="btn btn-primary" data-action="modal-save">Simpan</button>`) {
  modal.innerHTML = `<div class="modal-header"><h2>${title}</h2><button data-action="close-modal">×</button></div><div class="modal-body">${body}</div><div class="modal-footer">${footer}</div>`;
  modalBackdrop.hidden = false;
  gtRenderIcons(modal);
}

function packageFormBody(pkg = {}) {
  const iconOptions = ["layers", "trendUp", "package", "sparkles", "gift", "wallet", "depositIn"];
  return `<div class="field"><label class="form-label">Nama paket</label><input class="form-control" id="pkgName" value="${pkg.name || ""}" /></div>
    <div class="form-row"><div><label class="form-label">Min. deposit (USD)</label><input class="form-control" id="pkgMin" type="number" value="${pkg.minDeposit || ""}" /></div><div><label class="form-label">ROI harian (%)</label><input class="form-control" id="pkgRoi" type="number" step="0.1" value="${pkg.dailyRoi || ""}" /></div></div>
    <div class="form-row"><div><label class="form-label">Durasi (hari)</label><input class="form-control" id="pkgDuration" type="number" value="${pkg.duration || 30}" /></div><div><label class="form-label">Ikon</label><select class="form-control" id="pkgIcon">${iconOptions.map((i) => `<option value="${i}" ${pkg.icon === i ? "selected" : ""}>${i}</option>`).join("")}</select></div></div>
    <div class="field"><label class="form-label">Deskripsi</label><textarea class="form-control" id="pkgDesc" rows="2">${pkg.description || ""}</textarea></div>`;
}

function handleAction(event) {
  const action = event.currentTarget.dataset.action;
  const id = event.currentTarget.dataset.id;
  const email = event.currentTarget.dataset.email;

  if (action === "close-modal") modalBackdrop.hidden = true;
  if (action === "modal-save") modalBackdrop.hidden = true;

  if (action === "approve-deposit") {
    gtSetDepositStatus(id, "approved");
    showToast("Deposit disetujui, saldo member diperbarui.", "Deposit");
    render("deposits");
  }
  if (action === "reject-deposit") {
    gtSetDepositStatus(id, "rejected");
    showToast("Deposit ditolak.", "Deposit");
    render("deposits");
  }
  if (action === "approve-withdrawal") {
    gtSetWithdrawalStatus(id, "approved");
    showToast("Penarikan disetujui.", "Withdrawal");
    render("withdrawals");
  }
  if (action === "reject-withdrawal") {
    gtSetWithdrawalStatus(id, "rejected");
    showToast("Penarikan ditolak, saldo dikembalikan ke member.", "Withdrawal");
    render("withdrawals");
  }
  if (action === "delete-deposit") {
    gtDeleteDeposit(id);
    showToast("Riwayat deposit dihapus.", "Deposit");
    render("deposits");
  }
  if (action === "delete-withdrawal") {
    gtDeleteWithdrawal(id);
    showToast("Riwayat penarikan dihapus.", "Withdrawal");
    render("withdrawals");
  }
  if (action === "toggle-verify") {
    const u = gtFindUser(email);
    gtAdminUpdateUser(email, { verified: !u.verified });
    showToast(`Status verifikasi ${u.name} diperbarui.`, "Users");
    render("users");
  }
  if (action === "toggle-suspend") {
    const u = gtFindUser(email);
    gtAdminUpdateUser(email, { status: u.status === "suspended" ? "active" : "suspended" });
    showToast(`Status akun ${u.name} diperbarui.`, "Users");
    render("users");
  }
  if (action === "edit-user") {
    const u = gtFindUser(email);
    openModal(
      `Edit ${u.name}`,
      `<div class="field"><label class="form-label">Nama lengkap</label><input class="form-control" id="editUserName" value="${u.name}" /></div>
       <div class="form-row"><div><label class="form-label">Saldo wallet (USD)</label><input class="form-control" id="editUserBalance" type="number" step="0.01" value="${u.walletBalance}" /></div><div><label class="form-label">Level</label><input class="form-control" id="editUserLevel" value="${u.level}" /></div></div>`,
      `<button class="btn btn-secondary" data-action="close-modal">Batal</button><button class="btn btn-primary" data-action="save-edit-user" data-email="${u.email}">Simpan perubahan</button>`
    );
  }
  if (action === "save-edit-user") {
    const name = document.getElementById("editUserName").value.trim();
    const walletBalance = Number(document.getElementById("editUserBalance").value);
    const level = document.getElementById("editUserLevel").value;
    gtAdminUpdateUser(email, { name, walletBalance, level });
    modalBackdrop.hidden = true;
    showToast("Data member diperbarui.", "Users");
    render("users");
  }
  if (action === "give-bonus") {
    const u = gtFindUser(email);
    openModal(
      `Beri bonus ke ${u.name}`,
      `<div class="field"><label class="form-label">Jumlah bonus (USD)</label><input class="form-control" id="bonusAmount" type="number" min="1" placeholder="e.g. 10" /></div>
       <div class="field"><label class="form-label">Catatan <span style="font-weight:400">(opsional)</span></label><input class="form-control" id="bonusNote" placeholder="e.g. Bonus loyalitas" /></div>
       <div id="bonusError" class="auth-error"></div>`,
      `<button class="btn btn-secondary" data-action="close-modal">Batal</button><button class="btn btn-primary" data-action="save-give-bonus" data-email="${u.email}">Kirim bonus</button>`
    );
  }
  if (action === "save-give-bonus") {
    const amount = document.getElementById("bonusAmount").value;
    const note = document.getElementById("bonusNote").value;
    const errBox = document.getElementById("bonusError");
    if (!amount || Number(amount) <= 0) {
      errBox.textContent = "Masukkan jumlah bonus yang valid.";
      errBox.classList.add("show");
      return;
    }
    gtGiveManualBonus(email, amount, note);
    modalBackdrop.hidden = true;
    showToast(`Bonus $${amount} berhasil dikirim.`, "Bonus");
    render("users");
  }
  if (action === "delete-user") {
    const u = gtFindUser(email);
    openModal(
      `Hapus ${u.name}?`,
      `<p class="subhead">Tindakan ini akan menghapus akun member secara permanen dari data demo ini. Tidak bisa dibatalkan.</p>`,
      `<button class="btn btn-secondary" data-action="close-modal">Batal</button><button class="btn btn-danger" data-action="confirm-delete-user" data-email="${u.email}">Ya, hapus member</button>`
    );
  }
  if (action === "confirm-delete-user") {
    gtDeleteUser(email);
    modalBackdrop.hidden = true;
    showToast("Member telah dihapus.", "Users");
    render("users");
  }
  if (action === "new-package") {
    openModal("Tambah paket baru", packageFormBody(), `<button class="btn btn-secondary" data-action="close-modal">Batal</button><button class="btn btn-primary" data-action="save-new-package">Simpan paket</button>`);
  }
  if (action === "save-new-package") {
    const catalog = gtPackagesCatalog();
    catalog.push({
      id: "pkg-" + gtUid(),
      name: document.getElementById("pkgName").value || "Paket baru",
      minDeposit: Number(document.getElementById("pkgMin").value) || 50,
      dailyRoi: Number(document.getElementById("pkgRoi").value) || 1,
      duration: Number(document.getElementById("pkgDuration").value) || 30,
      description: document.getElementById("pkgDesc").value || "",
      color: "#e5f7ec",
      icon: document.getElementById("pkgIcon").value || "layers",
    });
    gtSavePackagesCatalog(catalog);
    modalBackdrop.hidden = true;
    showToast("Paket baru ditambahkan.", "Packages");
    render("packages");
  }
  if (action === "edit-package") {
    const pkg = gtPackagesCatalog().find((p) => p.id === id);
    openModal(`Edit ${pkg.name}`, packageFormBody(pkg), `<button class="btn btn-secondary" data-action="close-modal">Batal</button><button class="btn btn-primary" data-action="save-edit-package" data-id="${id}">Simpan perubahan</button>`);
  }
  if (action === "save-edit-package") {
    const catalog = gtPackagesCatalog();
    const idx = catalog.findIndex((p) => p.id === id);
    if (idx !== -1) {
      catalog[idx] = {
        ...catalog[idx],
        name: document.getElementById("pkgName").value,
        minDeposit: Number(document.getElementById("pkgMin").value),
        dailyRoi: Number(document.getElementById("pkgRoi").value),
        duration: Number(document.getElementById("pkgDuration").value),
        description: document.getElementById("pkgDesc").value,
        icon: document.getElementById("pkgIcon").value,
      };
      gtSavePackagesCatalog(catalog);
    }
    modalBackdrop.hidden = true;
    showToast("Paket diperbarui.", "Packages");
    render("packages");
  }
  if (action === "delete-package") {
    const catalog = gtPackagesCatalog().filter((p) => p.id !== id);
    gtSavePackagesCatalog(catalog);
    showToast("Paket dihapus.", "Packages");
    render("packages");
  }
  if (action === "new-signal") {
    openModal("Buat sinyal baru", signalFormBody(), `<button class="btn btn-secondary" data-action="close-modal">Batal</button><button class="btn btn-primary" data-action="save-new-signal">Publikasikan sinyal</button>`);
  }
  if (action === "save-new-signal") {
    gtAddSignal({
      pair: document.getElementById("sigPair").value || "BTC/USDT",
      type: document.getElementById("sigType").value,
      timeframe: document.getElementById("sigTimeframe").value || "H4",
      entry: document.getElementById("sigEntry").value,
      target: document.getElementById("sigTarget").value,
      stopLoss: document.getElementById("sigStopLoss").value,
      note: document.getElementById("sigNote").value,
      createdBy: admin.email,
    });
    modalBackdrop.hidden = true;
    showToast("Sinyal baru dipublikasikan ke member.", "Signals");
    render("signals");
  }
  if (action === "edit-signal") {
    const sig = gtAllSignals().find((s) => s.id === id);
    openModal(`Edit sinyal ${sig.pair}`, signalFormBody(sig), `<button class="btn btn-secondary" data-action="close-modal">Batal</button><button class="btn btn-primary" data-action="save-edit-signal" data-id="${id}">Simpan perubahan</button>`);
  }
  if (action === "save-edit-signal") {
    gtUpdateSignal(id, {
      pair: document.getElementById("sigPair").value,
      type: document.getElementById("sigType").value,
      timeframe: document.getElementById("sigTimeframe").value,
      entry: document.getElementById("sigEntry").value,
      target: document.getElementById("sigTarget").value,
      stopLoss: document.getElementById("sigStopLoss").value,
      note: document.getElementById("sigNote").value,
    });
    modalBackdrop.hidden = true;
    showToast("Sinyal diperbarui.", "Signals");
    render("signals");
  }
  if (action === "toggle-signal-status") {
    const sig = gtAllSignals().find((s) => s.id === id);
    gtUpdateSignal(id, { status: sig.status === "closed" ? "active" : "closed" });
    showToast(`Sinyal ${sig.pair} ditandai ${sig.status === "closed" ? "aktif" : "closed"}.`, "Signals");
    render("signals");
  }
  if (action === "delete-signal") {
    gtDeleteSignal(id);
    showToast("Sinyal dihapus.", "Signals");
    render("signals");
  }
  if (action === "new-news") {
    openModal("Tulis berita baru", newsFormBody(), `<button class="btn btn-secondary" data-action="close-modal">Batal</button><button class="btn btn-primary" data-action="save-new-news">Publikasikan</button>`);
  }
  if (action === "save-new-news") {
    const preview = document.getElementById("newsImagePreview");
    gtAddNews({
      title: document.getElementById("newsTitle").value || "Tanpa judul",
      body: document.getElementById("newsBody").value || "",
      image: preview.style.display !== "none" ? preview.src : null,
    });
    modalBackdrop.hidden = true;
    showToast("Berita dipublikasikan.", "News");
    render("news");
  }
  if (action === "edit-news") {
    const n = gtAllNews().find((x) => x.id === id);
    openModal(`Edit berita`, newsFormBody(n), `<button class="btn btn-secondary" data-action="close-modal">Batal</button><button class="btn btn-primary" data-action="save-edit-news" data-id="${id}">Simpan perubahan</button>`);
  }
  if (action === "save-edit-news") {
    const preview = document.getElementById("newsImagePreview");
    gtUpdateNews(id, {
      title: document.getElementById("newsTitle").value,
      body: document.getElementById("newsBody").value,
      image: preview.style.display !== "none" ? preview.src : null,
    });
    modalBackdrop.hidden = true;
    showToast("Berita diperbarui.", "News");
    render("news");
  }
  if (action === "delete-news") {
    gtDeleteNews(id);
    showToast("Berita dihapus.", "News");
    render("news");
  }
  if (action === "send-broadcast") {
    const title = document.getElementById("notifTitle").value.trim();
    const body = document.getElementById("notifBody").value.trim();
    const preview = document.getElementById("notifImagePreview");
    if (!title || !body) {
      showToast("Isi judul dan pesan terlebih dahulu.", "Perhatian");
      return;
    }
    gtAddNotification({ audience: "all", title, body, image: preview.style.display !== "none" ? preview.src : null });
    showToast("Pengumuman terkirim ke semua member.", "Broadcast");
    render("notify");
  }
  if (action === "delete-broadcast") {
    gtDeleteNotification(id);
    showToast("Broadcast dihapus.", "Broadcast");
    render("notify");
  }
  if (action === "save-system-settings") {
    gtSaveSettings({
      siteName: document.getElementById("setSiteName").value,
      tagline: document.getElementById("setTagline").value,
      depositAddress: document.getElementById("setDepositAddress").value,
      minDeposit: Number(document.getElementById("setMinDeposit").value),
      minWithdrawal: Number(document.getElementById("setMinWithdrawal").value),
      supportEmail: document.getElementById("setSupportEmail").value,
    });
    showToast("Pengaturan sistem disimpan.", "Settings");
  }
  if (action === "reset-demo") {
    openModal(
      "Reset data demo?",
      `<p class="subhead">Tindakan ini akan mengembalikan seluruh data (user, deposit, penarikan, paket, notifikasi) ke kondisi awal demo. Anda akan logout secara otomatis.</p>`,
      `<button class="btn btn-secondary" data-action="close-modal">Batal</button><button class="btn btn-danger" data-action="confirm-reset">Ya, reset semua</button>`
    );
  }
  if (action === "confirm-reset") {
    gtResetDemoData();
    window.location.href = "login.html";
  }
}

function onGlobalClick(event) {
  const viewTarget = event.target.closest("[data-view]");
  if (viewTarget) {
    render(viewTarget.dataset.view);
    document.getElementById("sidebar").classList.remove("open");
    document.getElementById("sidebarBackdrop")?.classList.remove("show");
    return;
  }
  const actionTarget = event.target.closest("[data-action]");
  if (actionTarget) {
    handleAction({ currentTarget: actionTarget, target: event.target });
  }
}
function onGlobalInput(event) {
  if (event.target.id !== "userSearch") return;
  const q = event.target.value.toLowerCase();
  document.querySelectorAll("#usersTbody tr").forEach((tr) => {
    tr.style.display = tr.dataset.email.toLowerCase().includes(q) || tr.textContent.toLowerCase().includes(q) ? "" : "none";
  });
}
document.addEventListener("click", onGlobalClick);
document.addEventListener("input", onGlobalInput);

paintProfileChrome();
gtBindThemeToggle();
document.getElementById("mobileMenu").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebarBackdrop")?.classList.toggle("show");
});
document.getElementById("sidebarBackdrop")?.addEventListener("click", () => {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebarBackdrop").classList.remove("show");
});
document.getElementById("modalBackdrop").addEventListener("click", (event) => {
  if (event.target === modalBackdrop) modalBackdrop.hidden = true;
});
document.getElementById("logoutBtn").addEventListener("click", gtLogout);
render();
})();
