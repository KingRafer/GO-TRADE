/* GO TRADE — member workspace app (frontend demo only) */
(function () {
  const user = gtRequireRole("member");
  if (!user) return; // gtRequireRole already redirected to login.html

  gtSeedStoreIfNeeded();

  const app = document.getElementById("app");
  const breadcrumb = document.getElementById("breadcrumbCurrent");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modal = document.getElementById("modal");
  const toastContainer = document.getElementById("toastContainer");

  const DEMO_DEPOSIT_NOTE = "Masih dalam tahap uji coba";

let currentView = "dashboard";

function initials(name) {
  return (name || "??").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}
function money(n) {
  return "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function paintAvatarEl(el) {
  if (!el) return;
  if (user.avatar) {
    el.style.backgroundImage = `url(${user.avatar})`;
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.textContent = "";
  } else {
    el.style.backgroundImage = "";
    el.textContent = initials(user.name);
  }
}
function paintProfileChrome() {
  paintAvatarEl(document.getElementById("sideAvatar"));
  document.getElementById("sideName").textContent = user.name;
  paintAvatarEl(document.getElementById("footAvatar"));
  document.getElementById("footName").textContent = user.name;
  document.getElementById("footStatus").textContent = user.verified ? "Verified member" : "Belum verifikasi";
  paintAvatarEl(document.getElementById("topAvatar"));
}

function statCard(label, value, change, icon, color, down = false) {
  return `<div class="card stat-card"><div class="stat-top"><span>${label}</span><i class="stat-icon" style="background:${color}"><span data-icon="${icon}" data-icon-size="15"></span></i></div><div class="stat-number">${value}</div><div class="stat-change ${down ? "down" : ""}">${down ? "↓" : "↑"} ${change}<span>vs last month</span></div></div>`;
}

function viewHeader(eyebrow, title, subhead, action = "") {
  return `<div class="view-header"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p class="subhead">${subhead}</p></div>${action ? `<div class="header-actions">${action}</div>` : ""}</div>`;
}

function donutChart(segments, size = 168) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 62;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const cx = size / 2;
  const cy = size / 2;
  const circles = segments
    .map((seg) => {
      const frac = seg.value / total;
      const dash = frac * c;
      const circle = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="20" stroke-dasharray="${dash} ${c - dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})" />`;
      offset += dash;
      return circle;
    })
    .join("");
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${circles}</svg>`;
}

function barChartSvg(bars, height = 170) {
  const max = Math.max(...bars.map((b) => Math.max(b.a, b.b)), 1);
  const w = 620;
  const groupW = w / bars.length;
  const barW = Math.min(20, groupW / 4);
  const bars_svg = bars
    .map((b, i) => {
      const x = i * groupW + groupW / 2;
      const hA = (b.a / max) * (height - 30);
      const hB = (b.b / max) * (height - 30);
      return `<rect x="${x - barW - 3}" y="${height - 24 - hA}" width="${barW}" height="${hA}" rx="3" fill="#16b884" />
        <rect x="${x + 3}" y="${height - 24 - hB}" width="${barW}" height="${hB}" rx="3" fill="#6cc6ff" />
        <text x="${x}" y="${height - 6}" font-size="9" fill="#9aa1c0" text-anchor="middle">${b.label}</text>`;
    })
    .join("");
  return `<svg viewBox="0 0 ${w} ${height}" width="100%" height="${height}">${bars_svg}</svg>`;
}

function chartSvg() {
  return `<svg class="chart-svg" viewBox="0 0 620 190" preserveAspectRatio="none" aria-label="Grafik performa">
    <defs><linearGradient id="fillGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2fe0a4" stop-opacity=".32"/><stop offset="1" stop-color="#2fe0a4" stop-opacity="0"/></linearGradient><linearGradient id="fillBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6cc6ff" stop-opacity=".2"/><stop offset="1" stop-color="#6cc6ff" stop-opacity="0"/></linearGradient></defs>
    <path d="M0 165 C35 151 48 145 73 152 S112 119 142 127 S176 144 204 111 S238 123 265 101 S304 112 332 81 S363 102 392 67 S430 90 458 52 S493 65 520 39 S566 49 620 18 L620 190 L0 190Z" fill="url(#fillGreen)"/>
    <path d="M0 175 C32 165 52 169 75 159 S122 145 144 153 S186 126 207 136 S251 105 273 120 S313 104 337 110 S376 84 399 96 S438 72 466 82 S505 62 528 70 S574 51 620 58 L620 190 L0 190Z" fill="url(#fillBlue)"/>
    <path d="M0 165 C35 151 48 145 73 152 S112 119 142 127 S176 144 204 111 S238 123 265 101 S304 112 332 81 S363 102 392 67 S430 90 458 52 S493 65 520 39 S566 49 620 18" fill="none" stroke="#16b884" stroke-width="3"/>
    <path d="M0 175 C32 165 52 169 75 159 S122 145 144 153 S186 126 207 136 S251 105 273 120 S313 104 337 110 S376 84 399 96 S438 72 466 82 S505 62 528 70 S574 51 620 58" fill="none" stroke="#6cc6ff" stroke-width="2"/>
  </svg>`;
}

function pillForStatus(status) {
  const map = { active: "pill-active", pending: "pill-draft", approved: "pill-active", rejected: "pill-danger", completed: "pill-published", Open: "pill-draft", Closed: "pill-active" };
  return `<span class="pill ${map[status] || "pill-paused"}">${status}</span>`;
}

/* ---------------- Views ---------------- */

function tickerHTML() {
  const items = [
    { p: "BTC/USDT", v: "64,210", c: "+2.4%", up: true },
    { p: "ETH/USDT", v: "3,142", c: "+1.1%", up: true },
    { p: "BNB/USDT", v: "588", c: "-0.6%", up: false },
    { p: "SOL/USDT", v: "142.8", c: "+3.7%", up: true },
    { p: "XRP/USDT", v: "0.612", c: "-1.2%", up: false },
    { p: "ADA/USDT", v: "0.401", c: "+0.8%", up: true },
  ];
  const row = items.map((i) => `<span>${i.p} <b>${i.v}</b><span class="${i.up ? "up" : "down"}">${i.c}</span></span>`).join("");
  return `<div class="ticker-wrap"><div class="ticker-track">${row}${row}</div></div>`;
}

function dashboardView() {
  const deposits = gtDepositsFor(user.email);
  const withdrawals = gtWithdrawalsFor(user.email);
  const packages = gtUserPackagesFor(user.email).filter((p) => p.status === "active");
  const referrals = gtReferralsOf(user.referralCode);
  const bonuses = gtBonusesFor(user.email);
  const totalBonus = bonuses.reduce((s, b) => s + b.amount, 0);

  const packageColors = ["#16a34a", "#4ade80", "#6cc6ff", "#ffab74"];
  const allocationSegments = [
    ...packages.map((p, i) => ({ label: p.packageName, value: p.amount, color: packageColors[i % packageColors.length] })),
    { label: "Saldo tersedia", value: Math.max(user.walletBalance, 0.01), color: "#dfe1ee" },
  ];
  const approvedDeposits = deposits.filter((d) => d.status === "approved").reduce((s, d) => s + d.amount, 0);
  const doneWithdrawals = withdrawals.filter((w) => w.status !== "rejected").reduce((s, w) => s + w.amount, 0);
  const trendBars = [
    { label: "Apr", a: 120, b: 40 },
    { label: "Mei", a: 260, b: 90 },
    { label: "Jun", a: 180, b: 60 },
    { label: "Jul", a: 340, b: 150 },
    { label: "Agu", a: approvedDeposits || 500, b: doneWithdrawals || 80 },
    { label: "Sep", a: (approvedDeposits || 500) * 0.6, b: (doneWithdrawals || 80) * 1.4 },
  ];

  return `${viewHeader("Workspace", `Halo, ${user.name.split(" ")[0]}! 👋`, "Selamat datang kembali di workspace GO TRADE Anda.")}
    ${tickerHTML()}
    <div class="welcome-banner">
      <div>
        <h2>Ringkasan akun</h2>
        <p>Semua data di bawah ini adalah data demo untuk keperluan simulasi tampilan.</p>
      </div>
      <div class="welcome-grid">
        <div><span>Username</span><b>${user.name}</b></div>
        <div><span>Email</span><b>${user.email}</b></div>
        <div><span>Referral code</span><b>${user.referralCode}</b></div>
        <div><span>Level</span><b>Level ${user.level}</b></div>
      </div>
    </div>

    <div class="stat-grid">
      ${statCard("Wallet balance", money(user.walletBalance), "+0.0%", "wallet", "#e3fbf1")}
      ${statCard("Status akun", user.verified ? "Verified" : "Pending", "Siap deposit", "checkCircle", "#dfe8ff")}
      ${statCard("Paket aktif", `${packages.length} paket`, "Reward harian", "layers", "#e5f7ec")}
      ${statCard("Total bonus", money(totalBonus), "Dari network", "gift", "#ffe9d6")}
    </div>

    <div class="dashboard-grid">
      <div class="card wide-card"><div class="card-header"><div><h2>Performa portofolio</h2><p class="muted">Simulasi pertumbuhan saldo & sinyal AI</p></div><select class="select-small"><option>30 hari terakhir</option><option>90 hari terakhir</option></select></div><div class="chart-area"><div class="chart-labels"><span>3k</span><span>2k</span><span>1k</span><span>500</span><span>0</span></div><div class="chart-grid"></div>${chartSvg()}</div><div class="legend"><span><i class="green"></i>Saldo</span><span><i class="blue"></i>Sinyal aktif</span></div></div>
      <div class="card"><div class="card-header"><div><h2>Paket auto-trading</h2><p class="muted">Sedang berjalan</p></div><button class="action-link" data-view="packages">Lihat semua →</button></div><div class="campaign-list">${
        packages.length
          ? packages.map((p) => `<div class="campaign-row"><div class="campaign-mark" style="background:#e3fbf1"><span data-icon="layers" data-icon-size="15"></span></div><div class="campaign-info"><strong>${p.packageName}</strong><span>Modal ${money(p.amount)} · ROI ${p.dailyRoi}%/hari</span></div><span class="pill pill-active">Active</span></div>`).join("")
          : `<div class="empty-placeholder">Belum ada paket aktif. <br><button class="btn btn-mint" style="margin-top:10px" data-view="packages">Aktifkan paket</button></div>`
      }</div></div>
    </div>

    <div class="dashboard-grid">
      <div class="card"><div class="card-header"><div><h2>Riwayat terbaru</h2><p class="muted">Deposit & penarikan terakhir</p></div><button class="action-link" data-view="history">Lihat semua →</button></div><div class="activity-list">
        ${deposits.slice(0, 2).map((d) => `<div class="activity-row"><div class="activity-icon" style="background:#e3fbf1;color:#17915f"><span data-icon="depositIn" data-icon-size="14"></span></div><div class="activity-copy"><strong>Deposit ${money(d.amount)}</strong><span>${d.method} · ${d.date}</span></div>${pillForStatus(d.status)}</div>`).join("")}
        ${withdrawals.slice(0, 1).map((w) => `<div class="activity-row"><div class="activity-icon" style="background:#fff3e4;color:#ba7b35"><span data-icon="withdrawOut" data-icon-size="14"></span></div><div class="activity-copy"><strong>Penarikan ${money(w.amount)}</strong><span>${w.date}</span></div>${pillForStatus(w.status)}</div>`).join("")}
        ${!deposits.length && !withdrawals.length ? `<div class="empty-placeholder">Belum ada riwayat transaksi.</div>` : ""}
      </div></div>
      <div class="card"><div class="card-header"><div><h2>Aktivitas network</h2><p class="muted">Referral & bonus</p></div><button class="action-link" data-view="network">Lihat semua →</button></div><div class="network-grid" style="display:block;padding:9px 21px 20px"><div class="referral-stats" style="grid-template-columns:1fr 1fr"><div class="referral-stat"><span>Total referral</span><b>${referrals.length}</b></div><div class="referral-stat"><span>Total bonus</span><b>${money(totalBonus)}</b></div></div></div></div>
    </div>

    <div class="dashboard-grid">
      <div class="card"><div class="card-header"><div><h2>Alokasi portofolio</h2><p class="muted">Distribusi saldo & paket aktif</p></div></div><div class="donut-row">${donutChart(allocationSegments)}<div class="donut-legend">${allocationSegments.map((s) => `<div><i style="background:${s.color}"></i>${s.label}<b>${money(s.value)}</b></div>`).join("")}</div></div></div>
      <div class="card wide-card"><div class="card-header"><div><h2>Deposit vs penarikan</h2><p class="muted">Simulasi tren 6 bulan terakhir</p></div></div><div style="padding:6px 21px 18px">${barChartSvg(trendBars)}</div><div class="legend" style="padding:0 21px 17px"><span><i class="green"></i>Deposit</span><span><i class="blue"></i>Penarikan</span></div></div>
    </div>`;
}

function signalView() {
  const signals = gtPublishedSignals();
  const active = signals.filter((s) => s.status === "active");
  const closed = signals.filter((s) => s.status === "closed");
  return `${viewHeader("GO TRADE intelligence", "Signal", "Sinyal trading resmi yang dipublikasikan oleh tim GO TRADE.", `<span class="demo-chip"><span class="status-dot"></span> ${active.length} sinyal aktif</span>`)}
    <div class="disclaimer-box">⚠ Sinyal akan muncul setelah admin menambahkan sinyal.</div>
    ${
      signals.length
        ? `<div class="signal-grid">${signals.map(signalCard).join("")}</div>`
        : `<div class="card"><div class="empty-placeholder">Belum ada sinyal yang dipublikasikan admin. Cek lagi nanti.</div></div>`
    }`;
}

function signalCard(s) {
  const isBuy = s.type === "Buy" || s.type === "Long";
  return `<div class="card signal-card">
    <div class="signal-head">
      <div><strong>${s.pair}</strong><span class="muted" style="display:block;font-size:9px;margin-top:2px">Timeframe ${s.timeframe}</span></div>
      <span class="pill ${isBuy ? "pill-active" : "pill-danger"}"><span data-icon="${isBuy ? "trendUp" : "withdrawOut"}" data-icon-size="11"></span> ${s.type}</span>
    </div>
    <div class="signal-body">
      <div><span>Entry</span><b>${s.entry}</b></div>
      <div><span>Target</span><b>${s.target}</b></div>
      <div><span>Stop Loss</span><b>${s.stopLoss}</b></div>
      <div><span>Status</span><b>${pillForStatus(s.status)}</b></div>
    </div>
    ${s.note ? `<p class="signal-note">${s.note}</p>` : ""}
    <div class="signal-foot"><span data-icon="sparkles" data-icon-size="12"></span><span>Tim GO TRADE</span><span class="muted" style="margin-left:auto">${s.date}</span></div>
  </div>`;
}

function packagesView() {
  const catalog = gtPackagesCatalog();
  const active = gtUserPackagesFor(user.email);
  return `${viewHeader("Workspace / auto-trading", "Trading packages", "Aktifkan paket auto-trading dan biarkan sistem bekerja untuk Anda.")}
    <div class="metric-strip"><div class="card metric-card"><span>Paket tersedia</span><strong>${catalog.length}</strong><small>Diperbarui admin</small></div><div class="card metric-card"><span>Paket aktif Anda</span><strong>${active.filter((p) => p.status === "active").length}</strong><small>Sedang berjalan</small></div><div class="card metric-card"><span>Wallet balance</span><strong>${money(user.walletBalance)}</strong><small>Tersedia untuk aktivasi</small></div></div>
    <div class="product-grid">${catalog
      .map(
        (p) => `<div class="card product-card"><div class="product-image" style="background:${p.color}"><span data-icon="${p.icon}" data-icon-size="30"></span></div><div class="product-body"><span class="pill pill-active">Tersedia</span><h3 style="margin-top:10px">${p.name}</h3><p>${p.description}</p><div class="package-roi">${p.dailyRoi}%<span style="font-size:10px;color:var(--muted);font-weight:400"> /hari</span></div><div class="product-bottom"><span class="muted" style="font-size:10px">Min. ${money(p.minDeposit)} · ${p.duration} hari</span></div><button class="btn btn-primary" style="width:100%;margin-top:12px" data-action="activate-package" data-package="${p.id}">Aktifkan paket</button></div></div>`
      )
      .join("")}</div>
    <div class="card table-card" style="margin-top:17px"><div class="card-header"><div><h2>Paket Anda</h2><p class="muted">Riwayat aktivasi paket</p></div></div><table class="data-table"><thead><tr><th>Paket</th><th>Modal</th><th>ROI harian</th><th>Mulai</th><th>Status</th></tr></thead><tbody>${
      active.length
        ? active.map((p) => `<tr><td>${p.packageName}</td><td>${money(p.amount)}</td><td>${p.dailyRoi}%</td><td>${p.startDate}</td><td>${pillForStatus(p.status)}</td></tr>`).join("")
        : `<tr><td colspan="5" class="empty-placeholder">Belum ada paket yang diaktifkan.</td></tr>`
    }</tbody></table></div>`;
}

function walletView() {
  const deposits = gtDepositsFor(user.email);
  const withdrawals = gtWithdrawalsFor(user.email);
  const totalDeposit = deposits.filter((d) => d.status === "approved").reduce((s, d) => s + d.amount, 0);
  const totalWithdraw = withdrawals.filter((w) => w.status !== "rejected").reduce((s, w) => s + w.amount, 0);
  return `${viewHeader("Insights / finances", "Wallet", "Pantau saldo dan seluruh riwayat transaksi Anda.", `<button class="btn btn-secondary" data-action="export-csv"><span data-icon="download" data-icon-size="14"></span> Export CSV</button><button class="btn btn-secondary" data-view="deposit"><span data-icon="plus" data-icon-size="14"></span> Deposit</button><button class="btn btn-primary" data-view="withdrawal"><span data-icon="withdrawOut" data-icon-size="14"></span> Withdraw</button>`)}
    <div class="wallet-layout"><div class="card balance-card"><div class="eyebrow">Saldo tersedia</div><div class="balance-number">${money(user.walletBalance)}</div><div class="balance-sub">Diperbarui saat ini · Saldo demo</div><div class="balance-footer"><div><span>Total deposit disetujui</span><b>${money(totalDeposit)}</b></div><div><span>Total penarikan</span><b>${money(totalWithdraw)}</b></div></div></div><div class="card referral-card"><div><h2>Jaga saldo tetap sehat</h2><p class="subhead">Aktifkan paket auto-trading untuk mulai mendapatkan reward harian secara simulasi.</p></div><div class="progress-wrap" style="margin:20px 0 0"><div class="progress-top"><strong>${gtUserPackagesFor(user.email).filter((p) => p.status === "active").length} paket aktif</strong><span>dari ${gtPackagesCatalog().length} tersedia</span></div><div class="progress-bar"><i style="width:${Math.min(100, gtUserPackagesFor(user.email).length * 30)}%;background:#6cc6ff"></i></div></div></div></div>
    <div class="card table-card" style="margin-top:17px"><div class="card-header"><div><h2>Riwayat transaksi</h2><p class="muted">Deposit & penarikan Anda</p></div></div><table class="data-table"><thead><tr><th>Tipe</th><th>Jumlah</th><th>Metode / tujuan</th><th>Tanggal</th><th>Status</th></tr></thead><tbody>${
      [...deposits.map((d) => ({ ...d, kind: "Deposit", ref: d.method })), ...withdrawals.map((w) => ({ ...w, kind: "Withdrawal", ref: w.address }))]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .map((t) => `<tr><td>${t.kind}</td><td>${t.kind === "Deposit" ? "+" : "−"} ${money(t.amount)}</td><td>${t.ref}</td><td>${t.date}</td><td>${pillForStatus(t.status)}</td></tr>`)
        .join("") || `<tr><td colspan="5" class="empty-placeholder">Belum ada transaksi.</td></tr>`
    }</tbody></table></div>`;
}

function depositView() {
  const deposits = gtDepositsFor(user.email);
  const settings = gtSettings();
  return `${viewHeader("Wallet / top up", "Deposit", "Top up saldo untuk membeli paket auto-trading. Admin akan memverifikasi setiap permintaan deposit.")}
    <div class="deposit-address-card">
      <div class="warn">⚠ Masih dalam tahap uji coba</div>
      <h2 style="margin-bottom:14px">Pilih rekening & alamat tujuan deposit</h2>
      <div class="deposit-methods">
        <div class="deposit-method">
          <div class="deposit-method-head"><span>💰</span><span>USDT (BEP20)</span><span class="chain-badge">BNB Smart Chain (BSC)</span></div>
          <div style="display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap">
            <div id="depositQrBox" class="qr-placeholder" style="flex:0 0 auto"><span data-icon="qr" data-icon-size="26"></span><span>Memuat QR...</span></div>
            <div style="flex:1;min-width:180px">
              <div class="address-box"><span>Alamat wallet penerima (BEP20) — DEMO</span>${settings.depositAddress}</div>
              <button class="btn btn-mint" style="width:100%" data-action="copy-address"><span data-icon="copy" data-icon-size="14"></span> Salin alamat</button>
            </div>
          </div>
        </div>
        <div class="deposit-method">
          <div class="deposit-method-head"><span>🏦</span><span>Transfer bank (opsional)</span></div>
          <div class="address-box"><span>Atas nama</span>GO TRADE Demo Ltd.</div>
          <div class="address-box"><span>Nomor rekening — DEMO</span>0000-1111-2222-3333</div>
        </div>
      </div>
    </div>

    <div class="card" style="padding:22px">
      <h2 style="margin-bottom:16px">Form deposit</h2>
      <div class="field"><label class="form-label">Jumlah deposit (min $${settings.minDeposit})</label><input class="form-control" id="depAmount" type="number" min="${settings.minDeposit}" placeholder="Masukkan jumlah dalam USD" /></div>
      <div class="field"><label class="form-label">Metode pembayaran</label><select class="form-control" id="depMethod"><option>USDT (BEP20)</option><option>Bank transfer</option></select></div>
      <div class="field"><label class="form-label">Catatan (opsional)</label><textarea class="form-control" id="depNote" rows="2" placeholder="Contoh: bukti transfer dikirim via chat"></textarea></div>
      <div class="field"><label class="form-label">Upload bukti transfer</label><input class="form-control" type="file" disabled /><span class="subhead" style="font-size:9px">Upload file dinonaktifkan pada demo ini — cukup isi form dan kirim.</span></div>
      <button class="btn btn-primary" style="width:100%;padding:13px" data-action="submit-deposit">Kirim permintaan deposit</button>
      <p class="subhead" style="margin-top:10px;font-size:10px">Permintaan akan diperiksa oleh admin. Saldo ditambahkan setelah disetujui.</p>
    </div>

    <div class="card table-card" style="margin-top:17px"><div class="card-header"><div><h2>Riwayat deposit</h2></div></div><table class="data-table"><thead><tr><th>Jumlah</th><th>Metode</th><th>Tanggal</th><th>Status</th></tr></thead><tbody>${
      deposits.length ? deposits.map((d) => `<tr><td>${money(d.amount)}</td><td>${d.method}</td><td>${d.date}</td><td>${pillForStatus(d.status)}</td></tr>`).join("") : `<tr><td colspan="4" class="empty-placeholder">Belum ada riwayat deposit.</td></tr>`
    }</tbody></table></div>`;
}

function withdrawalView() {
  const withdrawals = gtWithdrawalsFor(user.email);
  const settings = gtSettings();
  return `${viewHeader("Wallet / cair", "Withdrawal", "Ajukan penarikan saldo ke wallet Anda. Admin akan memproses setiap permintaan.")}
    <div class="stat-grid" style="grid-template-columns:repeat(2,1fr)">
      ${statCard("Saldo tersedia", money(user.walletBalance), "Siap ditarik", "wallet", "#e3fbf1")}
      ${statCard("Minimal penarikan", money(settings.minWithdrawal), "Per transaksi", "withdrawOut", "#fff3e4")}
    </div>
    <div class="card" style="padding:22px">
      <h2 style="margin-bottom:16px">Form penarikan</h2>
      <div class="field"><label class="form-label">Jumlah penarikan</label><input class="form-control" id="wdAmount" type="number" min="${settings.minWithdrawal}" placeholder="Masukkan jumlah dalam USD" /></div>
      <div class="field"><label class="form-label">Alamat wallet tujuan (USDT BEP20)</label><input class="form-control" id="wdAddress" placeholder="0x..." /></div>
      <div class="field"><label class="form-label">Catatan (opsional)</label><textarea class="form-control" id="wdNote" rows="2" placeholder="Catatan tambahan"></textarea></div>
      <div id="wdError" class="auth-error"></div>
      <button class="btn btn-primary" style="width:100%;padding:13px" data-action="submit-withdrawal">Ajukan penarikan</button>
      <p class="subhead" style="margin-top:10px;font-size:10px">Saldo langsung dipotong (demo) dan dikembalikan otomatis bila admin menolak.</p>
    </div>
    <div class="card table-card" style="margin-top:17px"><div class="card-header"><div><h2>Riwayat penarikan</h2></div></div><table class="data-table"><thead><tr><th>Jumlah</th><th>Alamat tujuan</th><th>Tanggal</th><th>Status</th></tr></thead><tbody>${
      withdrawals.length ? withdrawals.map((w) => `<tr><td>${money(w.amount)}</td><td>${w.address}</td><td>${w.date}</td><td>${pillForStatus(w.status)}</td></tr>`).join("") : `<tr><td colspan="4" class="empty-placeholder">Belum ada riwayat penarikan.</td></tr>`
    }</tbody></table></div>`;
}

function networkView() {
  const referrals = gtReferralsOf(user.referralCode);
  const bonuses = gtBonusesFor(user.email);
  const totalBonus = bonuses.reduce((s, b) => s + b.amount, 0);
  return `${viewHeader("Growth network", "Network & referral", "Undang orang yang Anda percaya dan tumbuh bersama mereka.")}
    <div class="network-grid"><div class="card referral-card"><div class="eyebrow">Kode referral Anda</div><h2>Bagikan GO TRADE ke jaringan Anda</h2><p class="subhead">Dapatkan bonus setiap kali teman bergabung dan mengaktifkan paket.</p><div class="referral-code"><b>${user.referralCode}</b><button class="btn btn-mint" data-action="copy-referral">Salin kode</button></div><span class="muted" style="font-size:9px">gotrade.io/join/${user.referralCode}</span><div class="referral-stats"><div class="referral-stat"><span>Total referral</span><b>${referrals.length}</b></div><div class="referral-stat"><span>Member aktif</span><b>${referrals.filter((r) => r.status === "active").length}</b></div><div class="referral-stat"><span>Bonus diterima</span><b>${money(totalBonus)}</b></div><div class="referral-stat"><span>Level</span><b>Level ${user.level}</b></div></div></div><div class="card"><div class="card-header"><div><h2>Referral Anda</h2><p class="muted">Orang yang bergabung lewat kode Anda</p></div></div><div class="activity-list">${
      referrals.length
        ? referrals.map((r) => `<div class="activity-row"><div class="table-avatar" style="background:#e3fbf1">${initials(r.name)}</div><div class="activity-copy"><strong>${r.name}</strong><span>Bergabung ${r.joined}</span></div><span class="pill pill-active">Active</span></div>`).join("")
        : `<div class="empty-placeholder">Belum ada referral. Bagikan kode Anda untuk mulai mendapatkan bonus.</div>`
    }</div></div></div>`;
}

function bonusView() {
  const bonuses = gtBonusesFor(user.email);
  const total = bonuses.reduce((s, b) => s + b.amount, 0);
  return `${viewHeader("Growth / rewards", "Bonus tracking", "Pantau semua bonus referral dan reward paket yang Anda terima.")}
    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr)">${statCard("Total bonus", money(total), "Sepanjang waktu", "gift", "#ffe9d6")}${statCard("Bonus bulan ini", money(bonuses.filter((b) => b.date.startsWith("2026-09")).reduce((s, b) => s + b.amount, 0)), "September 2026", "wallet", "#e3fbf1")}${statCard("Jumlah entri", `${bonuses.length}`, "Riwayat tercatat", "history", "#e5f7ec")}</div>
    <div class="card table-card"><div class="card-header"><div><h2>Riwayat bonus</h2></div></div><table class="data-table"><thead><tr><th>Tipe</th><th>Catatan</th><th>Tanggal</th><th>Jumlah</th></tr></thead><tbody>${
      bonuses.length ? bonuses.map((b) => `<tr><td>${b.type}</td><td>${b.note}</td><td>${b.date}</td><td style="color:#17915f">+ ${money(b.amount)}</td></tr>`).join("") : `<tr><td colspan="4" class="empty-placeholder">Belum ada bonus tercatat.</td></tr>`
    }</tbody></table></div>`;
}

function historyView() {
  const trades = gtTradesFor(user.email);
  return `${viewHeader("Workspace / activity", "Trade history", "Semua posisi trading yang tercatat dalam sistem auto-trading Anda.")}
    <div class="toolbar"><div class="search-box"><span data-icon="search" data-icon-size="15"></span><input placeholder="Cari pair..." /></div><div class="filter-group"><select class="select-small"><option>Semua status</option><option>Open</option><option>Closed</option></select></div></div>
    <div class="card table-card"><table class="data-table"><thead><tr><th>Pair</th><th>Tipe</th><th>Modal</th><th>P/L</th><th>Status</th><th>Tanggal</th></tr></thead><tbody>${
      trades.length
        ? trades.map((t) => `<tr><td>${t.pair}</td><td>${t.type}</td><td>${money(t.amount)}</td><td style="color:${t.pnl.startsWith("+") ? "#17915f" : t.pnl.startsWith("-") ? "#c0525a" : "var(--muted)"}">${t.pnl}</td><td>${pillForStatus(t.status)}</td><td>${t.date}</td></tr>`).join("")
        : `<tr><td colspan="6" class="empty-placeholder">Belum ada riwayat trading.</td></tr>`
    }</tbody></table></div>`;
}

function notificationsView() {
  const notifs = gtNotificationsFor(user.email);
  return `${viewHeader("Workspace / updates", "Notifications", "Hal penting yang terjadi di akun Anda. Klik untuk melihat detail lengkap.", `<button class="btn btn-secondary" data-action="mark-read">Tandai semua dibaca</button>`)}
    <div class="card notification-list">${
      notifs.length
        ? notifs
            .map(
              (n) =>
                `<div class="notification-item ${n.read ? "" : "unread"}" data-action="view-notification" data-id="${n.id}" style="cursor:pointer">${
                  n.image ? `<img src="${n.image}" class="notification-thumb" alt="" />` : `<div class="activity-icon" style="background:#e5f7ec;color:#15803d"><span data-icon="sparkles" data-icon-size="14"></span></div>`
                }<div class="notification-copy"><strong>${n.title}</strong><p class="notification-preview">${n.body}</p><time>${n.date}</time></div>${n.read ? "" : '<span class="dot"></span>'}</div>`
            )
            .join("")
        : `<div class="empty-placeholder">Belum ada notifikasi.</div>`
    }</div>`;
}

function settingsView() {
  return `${viewHeader("Workspace / preferences", "Account settings", "Kelola profil, keamanan, dan preferensi akun Anda.", `<button class="btn btn-primary" data-action="save-settings">Simpan perubahan</button>`)}
    <div class="settings-layout">
      <div class="card settings-tabs">
        <button class="settings-tab active" data-tab="profile">Profile</button>
        <button class="settings-tab" data-tab="security">Security</button>
        <button class="settings-tab" data-tab="notifications">Notifications</button>
      </div>
      <div class="card settings-form">
        <div data-panel="profile">
          <h2>Informasi profil</h2>
          <p class="subhead" style="margin-bottom:23px">Begini tampilan Anda di seluruh workspace GO TRADE.</p>
          <div class="avatar-upload-row">
            <img id="profilePhotoPreview" src="${user.avatar || ""}" class="avatar-preview-img" style="${user.avatar ? "" : "display:none"}" alt="" />
            <div id="profilePhotoFallback" class="avatar-preview-fallback" style="${user.avatar ? "display:none" : ""}">${initials(user.name)}</div>
            <div>
              <label class="btn btn-secondary" style="cursor:pointer;display:inline-block">Ganti foto profil<input type="file" accept="image/*" data-image-input="profilePhotoPreview" data-hide-on-upload="profilePhotoFallback" style="display:none" /></label>
              <p class="subhead" style="font-size:9px;margin-top:6px">JPG/PNG, maks 3MB.</p>
            </div>
          </div>
          <div class="field-row"><div class="field"><label class="form-label">Nama lengkap</label><input class="form-control" value="${user.name}" id="setName" /></div><div class="field"><label class="form-label">Level</label><input class="form-control" value="Level ${user.level}" disabled /></div></div>
          <div class="field"><label class="form-label">Alamat email</label><input class="form-control" value="${user.email}" disabled /></div>
          <div class="field"><label class="form-label">Kode referral</label><input class="form-control" value="${user.referralCode}" disabled /></div>
        </div>
        <div data-panel="security" hidden>
          <h2>Keamanan akun</h2>
          <p class="subhead" style="margin-bottom:23px">Perkuat keamanan login Anda.</p>
          <div class="toggle-row"><div><p>Autentikasi dua faktor (2FA)</p><span>Wajibkan kode tambahan saat login dari perangkat baru.</span></div><button class="toggle" data-action="toggle-2fa"></button></div>
          <div class="toggle-row"><div><p>Notifikasi login perangkat baru</p><span>Kirim email setiap ada login dari perangkat baru.</span></div><button class="toggle on" data-action="toggle-2fa"></button></div>
          <div class="field" style="margin-top:18px"><label class="form-label">Ganti password</label><div class="pass-field"><input class="form-control" type="password" id="setNewPassword" placeholder="Password baru" /><button type="button" class="pass-toggle-btn" data-pass-toggle="setNewPassword"><span data-icon="eye" data-icon-size="15"></span></button></div></div>
        </div>
        <div data-panel="notifications" hidden>
          <h2>Preferensi notifikasi</h2>
          <p class="subhead" style="margin-bottom:23px">Pilih pembaruan apa saja yang ingin Anda terima.</p>
          <div class="toggle-row"><div><p>Ringkasan performa mingguan</p><span>Dapatkan ringkasan singkat tiap Senin.</span></div><button class="toggle on" data-action="toggle-2fa"></button></div>
          <div class="toggle-row"><div><p>Notifikasi sinyal AI</p><span>Diberi tahu saat sinyal baru tersedia.</span></div><button class="toggle on" data-action="toggle-2fa"></button></div>
          <div class="toggle-row"><div><p>Notifikasi deposit & penarikan</p><span>Diberi tahu saat status transaksi berubah.</span></div><button class="toggle on" data-action="toggle-2fa"></button></div>
        </div>
      </div>
    </div>`;
}

function newsView() {
  const news = gtAllNews();
  return `${viewHeader("Info & update", "News", "Berita dan pengumuman terbaru dari tim GO TRADE.")}
    ${
      news.length
        ? `<div class="news-grid">${news
            .map(
              (n) => `<div class="card news-card">${n.image ? `<img src="${n.image}" class="news-image" alt="" />` : `<div class="news-image news-image-empty"><span data-icon="megaphone" data-icon-size="26"></span></div>`}<div class="news-body"><h3>${n.title}</h3><p>${n.body}</p><time>${n.date}</time></div></div>`
            )
            .join("")}</div>`
        : `<div class="card"><div class="empty-placeholder">Belum ada berita.</div></div>`
    }`;
}

function helpView() {
  const faqs = [
    { q: "Apakah GO TRADE menjamin keuntungan?", a: "Tidak. Semua angka ROI, sinyal AI, dan hasil trading di workspace ini adalah data simulasi untuk keperluan demo tampilan, bukan jaminan hasil investasi nyata." },
    { q: "Bagaimana cara kerja Auto Trading?", a: "Anda memilih paket, mengaktifkannya dengan sejumlah modal dari wallet, lalu sistem (dalam mode demo) mensimulasikan reward harian sesuai ROI paket tersebut." },
    { q: "Berapa lama proses deposit & penarikan?", a: "Pada demo ini, admin memverifikasi permintaan secara manual. Di produk sungguhan, waktu proses tergantung kebijakan dan penyedia pembayaran yang digunakan." },
    { q: "Bagaimana cara mendapatkan bonus referral?", a: "Bagikan kode referral Anda dari halaman Network. Saat orang lain mendaftar dan aktif menggunakan kode Anda, bonus akan tercatat di halaman Bonus Tracking." },
    { q: "Apakah data saya aman?", a: "Karena ini demo frontend, seluruh data hanya tersimpan di localStorage browser Anda sendiri dan tidak dikirim ke server mana pun." },
  ];
  return `${viewHeader("Bantuan", "Help Center", "Pertanyaan yang sering diajukan seputar workspace GO TRADE.")}
    <div class="card faq-list">${faqs.map((f, i) => `<div class="faq-item${i === 0 ? " open" : ""}"><button class="faq-q" data-action="toggle-faq">${f.q}<span>+</span></button><div class="faq-a">${f.a}</div></div>`).join("")}</div>
    <div class="card" style="padding:20px;margin-top:17px"><h2 style="margin-bottom:8px">Masih butuh bantuan?</h2><p class="subhead" style="margin-bottom:14px">Tim demo kami siap membantu (simulasi).</p><button class="btn btn-primary" data-action="contact-support">✉ Hubungi Support</button></div>`;
}

const views = { dashboard: dashboardView, signal: signalView, news: newsView, packages: packagesView, wallet: walletView, deposit: depositView, withdrawal: withdrawalView, network: networkView, bonus: bonusView, history: historyView, notifications: notificationsView, help: helpView, settings: settingsView };
const viewNames = { dashboard: "Dashboard", signal: "Signal", news: "News", packages: "Auto Trading", wallet: "Wallet", deposit: "Deposit", withdrawal: "Withdrawal", network: "Network", bonus: "Bonus Tracking", history: "Trade History", notifications: "Notifications", help: "Help Center", settings: "Account settings" };

function render(view = currentView) {
  currentView = view;
  app.innerHTML = views[view]();
  breadcrumb.textContent = viewNames[view];
  document.querySelectorAll(".nav-item[data-view]").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  gtRenderIcons(app);
  if (view === "deposit") renderDepositQr();
  const badge = document.getElementById("signalBadge");
  if (badge) badge.textContent = gtPublishedSignals().filter((s) => s.status === "active").length;
  const notifDot = document.getElementById("notifDot");
  const hasUnread = !gtNotificationsFor(user.email).every((n) => n.read);
  if (notifDot) notifDot.hidden = !hasUnread;
  const sidebarNotifDot = document.getElementById("sidebarNotifDot");
  if (sidebarNotifDot) sidebarNotifDot.hidden = !hasUnread;
  window.scrollTo({ top: 0 });
}

function renderDepositQr() {
  const box = document.getElementById("depositQrBox");
  if (!box) return;
  const address = gtSettings().depositAddress;
  box.innerHTML = "";
  if (typeof QRCode === "undefined") {
    box.innerHTML = `<span data-icon="qr" data-icon-size="26"></span><span>QR tidak dapat dimuat.<br>Gunakan alamat teks.</span>`;
    gtRenderIcons(box);
    return;
  }
  try {
    new QRCode(box, { text: address, width: 120, height: 120, colorDark: "#0a0c1f", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.M });
  } catch (e) {
    box.innerHTML = `<span>QR gagal dibuat.</span>`;
  }
}

function showToast(message, title = "GO TRADE") {
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

function handleAction(event) {
  const action = event.currentTarget.dataset.action;
  const pkgId = event.currentTarget.dataset.package;
  const id = event.currentTarget.dataset.id;

  if (action === "close-modal") modalBackdrop.hidden = true;
  if (action === "modal-save") {
    modalBackdrop.hidden = true;
    showToast("Perubahan tersimpan dalam mode demo.", "Tersimpan");
  }
  if (action === "activate-package") {
    const pkg = gtPackagesCatalog().find((p) => p.id === pkgId);
    openModal(
      `Aktifkan ${pkg.name}`,
      `<p class="subhead" style="margin-bottom:14px">Minimal modal <b style="color:var(--ink)">${money(pkg.minDeposit)}</b> · ROI harian <b style="color:var(--ink)">${pkg.dailyRoi}%</b> · Durasi ${pkg.duration} hari.</p><div class="field"><label class="form-label">Jumlah modal (USD)</label><input class="form-control" id="activateAmount" type="number" min="${pkg.minDeposit}" placeholder="Min. ${pkg.minDeposit}" /></div><div id="activateError" class="auth-error"></div>`,
      `<button class="btn btn-secondary" data-action="close-modal">Batal</button><button class="btn btn-primary" data-action="confirm-activate" data-package="${pkgId}">Aktifkan</button>`
    );
  }
  if (action === "confirm-activate") {
    const amount = document.getElementById("activateAmount").value;
    const result = gtActivatePackage({ email: user.email, packageId: pkgId, amount });
    const errBox = document.getElementById("activateError");
    if (result.error) {
      errBox.textContent = result.error;
      errBox.classList.add("show");
      return;
    }
    modalBackdrop.hidden = true;
    showToast("Paket berhasil diaktifkan.", "Auto Trading");
    Object.assign(user, gtFindUser(user.email));
    render("packages");
  }
  if (action === "submit-deposit") {
    const amount = document.getElementById("depAmount").value;
    const method = document.getElementById("depMethod").value;
    const note = document.getElementById("depNote").value;
    const minDep = gtSettings().minDeposit;
    if (!amount || Number(amount) < minDep) {
      showToast(`Jumlah deposit minimal $${minDep}.`, "Perhatian");
      return;
    }
    gtAddDepositRequest({ email: user.email, amount, method, note });
    showToast("Permintaan deposit terkirim, menunggu verifikasi admin.", "Deposit");
    render("deposit");
  }
  if (action === "submit-withdrawal") {
    const amount = document.getElementById("wdAmount").value;
    const address = document.getElementById("wdAddress").value;
    const note = document.getElementById("wdNote").value;
    const errBox = document.getElementById("wdError");
    const minWd = gtSettings().minWithdrawal;
    if (!amount || Number(amount) < minWd || !address) {
      errBox.textContent = `Isi jumlah (min $${minWd}) dan alamat wallet tujuan.`;
      errBox.classList.add("show");
      return;
    }
    const result = gtAddWithdrawalRequest({ email: user.email, amount, address, note });
    if (result.error) {
      errBox.textContent = result.error;
      errBox.classList.add("show");
      return;
    }
    Object.assign(user, gtFindUser(user.email));
    showToast("Permintaan penarikan terkirim, menunggu proses admin.", "Withdrawal");
    render("withdrawal");
  }
  if (action === "copy-address") {
    navigator.clipboard?.writeText(gtSettings().depositAddress);
    showToast("Alamat demo disalin. " + DEMO_DEPOSIT_NOTE, "Disalin");
  }
  if (action === "copy-referral") {
    navigator.clipboard?.writeText(`https://gotrade.io/join/${user.referralCode}`);
    showToast("Link referral disalin ke clipboard.", "Disalin");
  }
  if (action === "export-csv") {
    const deposits = gtDepositsFor(user.email).map((d) => ({ type: "Deposit", amount: d.amount, ref: d.method, date: d.date, status: d.status }));
    const withdrawals = gtWithdrawalsFor(user.email).map((w) => ({ type: "Withdrawal", amount: w.amount, ref: w.address, date: w.date, status: w.status }));
    const rows = [...deposits, ...withdrawals];
    const header = "Type,Amount,Reference,Date,Status\n";
    const body = rows.map((r) => `${r.type},${r.amount},"${r.ref}",${r.date},${r.status}`).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gotrade-transactions-demo.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Riwayat transaksi diexport ke CSV.", "Export");
  }
  if (action === "toggle-2fa") {
    const btn = event.currentTarget;
    const nowOn = !btn.classList.contains("on");
    btn.classList.toggle("on", nowOn);
    showToast(nowOn ? "Autentikasi dua faktor diaktifkan (demo)." : "Autentikasi dua faktor dinonaktifkan.", "Security");
  }
  if (action === "toggle-faq") {
    event.currentTarget.closest(".faq-item").classList.toggle("open");
  }
  if (action === "mark-read") {
    gtMarkAllNotificationsRead(user.email);
    showToast("Semua notifikasi ditandai sudah dibaca.", "Diperbarui");
    render("notifications");
  }
  if (action === "view-notification") {
    const notif = gtNotificationsFor(user.email).find((n) => n.id === id);
    if (!notif) return;
    gtMarkNotificationRead(id);
    openModal(
      notif.title,
      `${notif.image ? `<img src="${notif.image}" alt="" style="width:100%;border-radius:10px;margin-bottom:14px" />` : ""}<p style="font-size:12px;line-height:1.7;color:var(--ink)">${notif.body}</p><p class="subhead" style="margin-top:14px;font-size:10px">${notif.date}</p>`,
      `<button class="btn btn-primary" data-action="close-modal">Tutup</button>`
    );
    const badgeDot = document.querySelector(`.notification-item[data-id="${id}"] .dot`);
    if (badgeDot) badgeDot.remove();
    document.querySelector(`.notification-item[data-id="${id}"]`)?.classList.remove("unread");
  }
  if (action === "contact-support") showToast("Pesan terkirim ke tim support (simulasi demo).", "Support");
  if (action === "save-settings") {
    const newName = document.getElementById("setName")?.value;
    const photoPreview = document.getElementById("profilePhotoPreview");
    const patch = {};
    if (newName) patch.name = newName;
    if (photoPreview && photoPreview.style.display !== "none") patch.avatar = photoPreview.src;
    if (Object.keys(patch).length) {
      gtUpdateCurrentUser(patch);
      Object.assign(user, gtFindUser(user.email));
      paintProfileChrome();
    }
    showToast("Profil tersimpan dalam mode demo.", "Tersimpan");
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
  const passToggle = event.target.closest("[data-pass-toggle]");
  if (passToggle) {
    gtTogglePasswordVisibility(passToggle);
    return;
  }
  const tabTarget = event.target.closest(".settings-tab");
  if (tabTarget) {
    document.querySelectorAll(".settings-tab").forEach((x) => x.classList.remove("active"));
    tabTarget.classList.add("active");
    document.querySelectorAll("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== tabTarget.dataset.tab));
    return;
  }
  const actionTarget = event.target.closest("[data-action]");
  if (actionTarget) {
    handleAction({ currentTarget: actionTarget, target: event.target });
  }
}
document.addEventListener("click", onGlobalClick);

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
document.getElementById("globalSearchButton").addEventListener("click", () =>
  openModal("Cari di workspace Anda", `<div class="search-box" style="width:100%"><span data-icon="search" data-icon-size="15"></span><input autofocus placeholder="Cari paket, transaksi, sinyal..." /></div><p class="subhead" style="margin-top:14px">Coba cari “BTC” atau “deposit”.</p>`, `<button class="btn btn-secondary" data-action="close-modal">Tutup</button>`)
);
document.getElementById("modalBackdrop").addEventListener("click", (event) => {
  if (event.target === modalBackdrop) modalBackdrop.hidden = true;
});
document.getElementById("logoutBtn").addEventListener("click", gtLogout);
render();
})();
