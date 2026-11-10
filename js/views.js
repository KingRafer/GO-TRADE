/* GO TRADE — Premium Views (screenshot-matched + luxury) */
function renderView(id) {
  const root = document.getElementById('viewRoot');
  if (!root) return;
  const map = {
    dashboard: viewDashboard,
    terminal: viewTerminalPlaceholder,
    signals: viewSignals,
    charts: viewCharts,
    portfolio: viewPortfolio,
    packages: viewPackages,
    wallet: viewWallet,
    deposit: viewDeposit,
    withdrawal: viewWithdrawal,
    history: viewHistory,
    referral: viewReferral,
    bonus: viewBonus,
    news: viewNews,
    settings: viewSettings,
    help: viewHelp,
    notifications: viewNotifications,
    'admin-overview': viewAdminOverview,
    'admin-users': viewAdminUsers,
    'admin-signals': viewAdminSignals,
    'admin-deposits': viewAdminDeposits,
    'admin-withdrawals': viewAdminWithdrawals,
    'admin-packages': viewAdminPackages,
    'admin-news': viewAdminNews,
    'admin-settings': viewAdminSettings,
  };
  const fn = map[id];
  if (fn) {
    root.innerHTML = fn();
    if (id === 'dashboard') {
      setTimeout(() => {
        if (typeof initMiniChart === 'function') initMiniChart('equityChart', 'BTCUSDT', 180);
      }, 60);
    }
    if (id === 'charts') {
      setTimeout(() => {
        currentPair = (typeof activeTerminalPair !== 'undefined' && activeTerminalPair) || 'BTCUSDT';
        currentTf = '15m';
        if (typeof initMainChart === 'function') initMainChart('workspaceChart');
        bindPairTabs();
      }, 80);
    }
    if (id === 'terminal') {
      setTimeout(() => {
        currentPair = (typeof activeTerminalPair !== 'undefined' && activeTerminalPair) || 'BTCUSDT';
        currentTf = currentTf || '5m';
        if (typeof initMainChart === 'function') initMainChart('terminalChart');
        if (typeof generateOrderBook === 'function') generateOrderBook(currentPair);
        if (typeof seedRecentTrades === 'function') seedRecentTrades(currentPair);
        renderOrderBookUI();
        renderRecentTradesUI();
        bindTerminalTfTabs();
        updateTerminalPriceBox();
        bindOrderForm();
        bindTerminalDock();
        renderTermSignalsPanel();
        renderTermPackagePanel();
        if (typeof renderBottomPanel === 'function') renderBottomPanel('positions');
      }, 80);
    }
    if (id === 'signals') {
      // already rendered in view
    }
  } else {
    root.innerHTML = '<div class="empty-state"><div class="icon">🚧</div><p>View "' + id + '" sedang dikembangkan</p></div>';
  }
}

function money(n) {
  if (n == null || isNaN(n)) return '$0.00';
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function viewTerminalPlaceholder() {
  return viewTerminal();
}

function viewTerminal() {
  const pair = (typeof activeTerminalPair !== 'undefined' && activeTerminalPair) || 'BTCUSDT';
  const m = (typeof marketState !== 'undefined' && marketState[pair]) || { price: 0, change24h: 0, high24: 0, low24: 0, quoteVolume: 0 };
  const chg = parseFloat(m.change24h) || 0;
  const dec = (typeof PAIRS !== 'undefined' && PAIRS[pair]) ? PAIRS[pair].decimals : 2;
  const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const vol = m.quoteVolume || 0;
  const volStr = vol > 1e9 ? '$' + (vol / 1e9).toFixed(2) + 'B' : '$' + (vol / 1e6).toFixed(1) + 'M';

  const u = currentUser || { balance: 1250.5, activePackage: 'Growth', pnlToday: 31.5 };
  const latestSig = (typeof signals !== 'undefined' && signals[0]) ? signals[0] : null;

  return `
  <div class="term-layout term-layout-3">
    <div class="term-chart-col">
      <div class="term-context-bar">
        <div class="term-ctx-item">
          <span class="ctx-label">Package</span>
          <strong class="ctx-val primary">${u.activePackage || '—'}</strong>
        </div>
        <div class="term-ctx-item">
          <span class="ctx-label">Wallet</span>
          <strong class="ctx-val mono">${money(u.balance)}</strong>
        </div>
        <div class="term-ctx-item grow">
          <span class="ctx-label">Latest AI Signal</span>
          <strong class="ctx-val ${latestSig ? (latestSig.side === 'long' || latestSig.side === 'buy' ? 'up' : 'down') : ''}">${latestSig ? (latestSig.pair + ' ' + String(latestSig.side).toUpperCase() + ' · ' + (latestSig.confidence || '—') + '%') : '—'}</strong>
        </div>
        <button class="term-ctx-btn" onclick="navigate('deposit')">+ Deposit</button>
        <button class="term-ctx-btn ghost" onclick="navigate('packages')">Packages</button>
        <button class="term-ctx-btn ghost" onclick="navigate('signals')">All Signals</button>
      </div>
      <div class="term-chart-toolbar">
        <div class="term-dock" id="termDock">
          <button class="dock-btn active" data-dock="trading">▣ Trading</button>
          <button class="dock-btn" data-dock="signals">⚡ AI Signals</button>
          <button class="dock-btn" data-dock="package">📦 Auto Package</button>
        </div>
        <div class="term-price-box">
          <span class="term-last" id="termLastPrice">$${fmt(m.price)}</span>
          <span class="term-chg ${chg >= 0 ? 'up' : 'down'}" id="termPriceChg">${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%</span>
        </div>
        <div class="term-stats">
          <div><span>24H High</span><strong id="termHigh">$${fmt(m.high24)}</strong></div>
          <div><span>24H Low</span><strong id="termLow">$${fmt(m.low24)}</strong></div>
          <div><span>24H Vol</span><strong id="termVol">${volStr}</strong></div>
        </div>
        <div class="term-tf-tabs" id="termTfTabs">
          <button data-tf="1m">1m</button>
          <button data-tf="5m" class="active">5m</button>
          <button data-tf="15m">15m</button>
          <button data-tf="1h">1H</button>
          <button data-tf="4h">4H</button>
          <button data-tf="1d">1D</button>
        </div>
      </div>
      <div id="terminalChart" class="term-chart dock-panel" data-panel="trading"></div>
      <div id="termSignalsPanel" class="term-feature-panel dock-panel" data-panel="signals" style="display:none"></div>
      <div id="termPackagePanel" class="term-feature-panel dock-panel" data-panel="package" style="display:none"></div>
    </div>
    <div class="term-mid">
      <div class="term-panel term-ob-panel">
        <div class="term-panel-head">
          <span>Order Book</span>
          <span class="term-spread" id="termSpread">Spread —</span>
        </div>
        <div class="ob-header"><span>Price</span><span>Size</span><span>Total</span></div>
        <div class="ob-asks" id="obAsks"></div>
        <div class="ob-mid" id="obMid">—</div>
        <div class="ob-bids" id="obBids"></div>
      </div>
      <div class="term-panel term-trades-panel">
        <div class="term-panel-head"><span>Recent Trades</span></div>
        <div class="tr-header"><span>Price</span><span>Size</span><span>Time</span></div>
        <div class="tr-body" id="recentTradesBody"></div>
      </div>
    </div>
    <div class="term-order">
      <div class="term-panel-head"><span>Order</span><span class="term-pair-label" id="orderPairLabel">${pair.replace('USDT','/USDT')}</span></div>
      <div class="ord-side-tabs">
        <button class="ord-side active buy" data-side="long" id="ordSideBuy">Buy / Long</button>
        <button class="ord-side sell" data-side="short" id="ordSideSell">Sell / Short</button>
      </div>
      <div class="ord-type-tabs" id="ordTypeTabs">
        <button class="active" data-type="market">Market</button>
        <button data-type="limit">Limit</button>
        <button data-type="stop">Stop</button>
      </div>
      <div class="ord-field" id="ordPriceField" style="display:none">
        <label>Price</label>
        <input type="number" id="ordPrice" class="ord-input" step="any" placeholder="0.00" />
      </div>
      <div class="ord-field">
        <label>Size</label>
        <input type="number" id="ordSize" class="ord-input" step="any" placeholder="0.00" value="0.01" />
      </div>
      <div class="ord-presets">
        <button data-pct="25">25%</button>
        <button data-pct="50">50%</button>
        <button data-pct="75">75%</button>
        <button data-pct="100">100%</button>
      </div>
      <div class="ord-meta">
        <div><span>Available</span><strong id="ordAvail">$0.00</strong></div>
        <div><span>Cost est.</span><strong id="ordCost">$0.00</strong></div>
      </div>
      <button class="ord-submit buy" id="ordSubmit">Buy / Long</button>
      <p class="ord-hint">Paper trading · tidak ada dana real yang dipotong</p>
    </div>
  </div>`;
}

function viewDashboard() {
  const u = currentUser || { name: 'satrio', balance: 1250.5, equity: 1250.5, pnlToday: 31.5, activePackage: 'Growth', referralCode: 'GOTRADE-DEMO1', verified: true };
  const firstName = (u.name || 'satrio').split(' ')[0];
  return `
  <div class="view-header dash-header">
    <div>
      <div class="eyebrow">WORKSPACE</div>
      <h1>Halo, ${firstName}</h1>
      <p class="sub">Ringkasan akun yang membantu Anda melihat langkah berikutnya.</p>
    </div>
    <button class="btn btn-primary" onclick="navigate('deposit')">+ Tambah dana</button>
  </div>

  <div class="ticker-bar" id="dashTicker"></div>

  <div class="summary-banner">
    <div>
      <h3>Ringkasan akun</h3>
      <p>Data simulasi tersimpan lokal. Pantau wallet, sinyal, dan aktivitas dari satu ruang kerja.</p>
    </div>
    <div class="summary-meta">
      <div><span>USERNAME</span><strong>${u.name || 'satrio'}</strong></div>
      <div><span>EMAIL</span><strong>${u.email || 'demo@gotrade.io'}</strong></div>
      <div><span>REFERRAL CODE</span><strong>${u.referralCode || 'GOTRADE-DEMO1'}</strong></div>
      <div><span>ACCOUNT LEVEL</span><strong>Level 1</strong></div>
    </div>
  </div>

  <div class="stats-row four">
    <div class="stat-card luxury">
      <div class="stat-icon">💳</div>
      <div class="label">Wallet balance</div>
      <div class="value">${money(u.balance || 1250.5)}</div>
      <div class="change up">↑ 8.4% vs last month</div>
    </div>
    <div class="stat-card luxury">
      <div class="stat-icon">🛡️</div>
      <div class="label">Status akun</div>
      <div class="value" style="font-size:20px">${u.verified !== false ? 'Verified' : 'Unverified'}</div>
      <div class="change">Siap digunakan · demo</div>
    </div>
    <div class="stat-card luxury">
      <div class="stat-icon">📦</div>
      <div class="label">Paket aktif</div>
      <div class="value" style="font-size:22px">1</div>
      <div class="change">Reward harian · berjalan</div>
    </div>
    <div class="stat-card luxury">
      <div class="stat-icon">✨</div>
      <div class="label">Total bonus</div>
      <div class="value">${money(u.pnlToday || 31.5)}</div>
      <div class="change up">↑ 12.5% dari network</div>
    </div>
  </div>

  <div class="grid-2 dash-grid">
    <div class="card">
      <div class="card-head">
        <div>
          <h3>Performa portofolio</h3>
          <p class="card-sub">Saldo dan intensitas sinyal selama 30 hari</p>
        </div>
        <select class="select-sm" onchange="toast('Filter diubah','info')">
          <option>30 hari terakhir</option>
          <option>7 hari</option>
          <option>90 hari</option>
        </select>
      </div>
      <div id="equityChart" style="height:220px;padding:8px 12px 16px"></div>
      <div class="chart-legend">
        <span><i class="dot saldo"></i> Saldo</span>
        <span><i class="dot signal"></i> Signal activity</span>
      </div>
    </div>
    <div class="card">
      <div class="card-head">
        <div>
          <h3>Paket auto-trading</h3>
          <p class="card-sub">Sedang berjalan</p>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="navigate('packages')">Lihat semua →</button>
      </div>
      <div class="active-pkg">
        <div class="pkg-icon">◈</div>
        <div>
          <strong>Growth Auto-Trade</strong>
          <div class="pkg-meta">Modal $500.00 · ROI 1.3% /hari</div>
        </div>
        <span class="tag success">Active</span>
      </div>
      <div class="pkg-progress">
        <div class="progress-bar"><div style="width:62%"></div></div>
        <div class="progress-labels"><span>Hari 18/45</span><span>62%</span></div>
      </div>
    </div>
  </div>

  <div class="grid-2" style="margin-top:20px">
    <div class="card">
      <div class="card-head"><h3>Aktivitas mingguan</h3></div>
      <div class="activity-list">
        <div class="activity-item"><span class="ai-dot up"></span><div><strong>ROI harian Growth</strong><small>+$6.50</small></div><span class="time">Hari ini</span></div>
        <div class="activity-item"><span class="ai-dot"></span><div><strong>Sinyal BTC/USDT aktif</strong><small>Buy · H4</small></div><span class="time">2 jam</span></div>
        <div class="activity-item"><span class="ai-dot"></span><div><strong>Referral code dibagikan</strong><small>GOTRADE-DEMO1</small></div><span class="time">1 hari</span></div>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><h3>Komposisi wallet</h3></div>
      <div class="wallet-comp">
        <div class="comp-row"><span>USDT (BEP20)</span><strong>92%</strong></div>
        <div class="comp-bar"><div style="width:92%;background:#10b981"></div></div>
        <div class="comp-row"><span>Bonus pending</span><strong>5%</strong></div>
        <div class="comp-bar"><div style="width:5%;background:#34d399"></div></div>
        <div class="comp-row"><span>Locked package</span><strong>3%</strong></div>
        <div class="comp-bar"><div style="width:3%;background:#6ee7b7"></div></div>
      </div>
    </div>
  </div>`;
}

function viewSignals() {
  const demoSignals = [
    {
      pair: 'BTC/USDT', side: 'Buy', tf: 'H4 · Sep 13, 2026',
      entry: '63,800', target: '66,200', sl: '62,400', status: 'ACTIVE',
      note: 'Momentum bullish setelah breakout resistance mingguan. Perhatikan volume konfirmasi.',
      desk: 'GO TRADE signal desk', tfShort: 'H4'
    },
    {
      pair: 'ETH/USDT', side: 'Sell', tf: 'H1 · Sep 12, 2026',
      entry: '3,180', target: '3,050', sl: '3,250', status: 'ACTIVE',
      note: 'Rejection dari resistance kuat. RSI overbought di timeframe H1.',
      desk: 'GO TRADE signal desk', tfShort: 'H1'
    },
  ];

  return `
  <div class="view-header">
    <div>
      <div class="eyebrow">GO TRADE INTELLIGENCE</div>
      <h1>Signals</h1>
      <p class="sub">Sinyal resmi yang dipublikasikan tim GO TRADE.</p>
    </div>
    <div class="header-actions">
      <span class="live-pill">● 2 signal aktif</span>
    </div>
  </div>

  <div class="alert-banner warning">
    Signal adalah data simulasi untuk demo, bukan saran keuangan atau jaminan profit. Lakukan riset Anda sendiri sebelum mengambil keputusan trading.
  </div>

  <div class="signal-cards">
    ${demoSignals.map(s => `
      <div class="signal-card luxury">
        <div class="signal-card-top">
          <div>
            <div class="signal-pair">${s.pair}</div>
            <div class="signal-tf">${s.tf}</div>
          </div>
          <span class="side-badge ${s.side.toLowerCase()}">${s.side === 'Buy' ? '↗ Buy' : '↘ Sell'}</span>
        </div>
        <div class="signal-grid">
          <div><span>ENTRY</span><strong>${s.entry}</strong></div>
          <div><span>TARGET</span><strong>${s.target}</strong></div>
          <div><span>STOP LOSS</span><strong>${s.sl}</strong></div>
          <div><span>STATUS</span><strong class="status-active">${s.status}</strong></div>
        </div>
        <p class="signal-note">${s.note}</p>
        <div class="signal-foot">
          <span>✦ ${s.desk}</span>
          <span>${s.tfShort}</span>
        </div>
      </div>
    `).join('')}
  </div>

  <div class="card" style="margin-top:24px">
    <div class="card-head">
      <h3>Semua sinyal</h3>
      <button class="btn btn-outline btn-sm" onclick="toast('Sinyal diperbarui','success')">⟳ Refresh</button>
    </div>
    <div id="fullSignalList" class="signal-list"></div>
  </div>`;
}

function viewCharts() {
  return `
  <div class="view-header">
    <div>
      <div class="eyebrow">MARKET DATA</div>
      <h1>Live Charts</h1>
      <p class="sub">Data real-time dari Binance · Chart disesuaikan per pair</p>
    </div>
    <span class="live-badge"><span class="dot"></span> REAL DATA</span>
  </div>
  <div class="card chart-card luxury">
    <div class="card-head chart-toolbar">
      <div class="pair-tabs" id="pairTabsWS">
        ${Object.keys(PAIRS).map((p, i) => `<button class="${i === 0 ? 'active' : ''}" data-pair="${p}">${p.replace('USDT', '')}</button>`).join('')}
      </div>
      <div class="tf-tabs">
        <button data-tf="1m">1m</button>
        <button data-tf="5m">5m</button>
        <button data-tf="15m" class="active">15m</button>
        <button data-tf="1h">1H</button>
        <button data-tf="4h">4H</button>
        <button data-tf="1d">1D</button>
      </div>
    </div>
    <div id="workspaceChart" class="chart-container" style="height:520px"></div>
    <div class="chart-footer">
      <div class="price-box"><span class="label">Last</span><strong id="lastPrice">—</strong> <span class="chg" id="priceChg"></span></div>
      <div class="price-box"><span class="label">24h High</span><strong id="high24">—</strong></div>
      <div class="price-box"><span class="label">24h Low</span><strong id="low24">—</strong></div>
      <div class="price-box"><span class="label">Volume</span><strong id="vol24">—</strong></div>
    </div>
  </div>`;
}

function bindPairTabs() {
  document.querySelectorAll('#pairTabsWS button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#pairTabsWS button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPair = btn.dataset.pair;
      if (typeof initMainChart === 'function') initMainChart('workspaceChart');
    });
  });
  document.querySelectorAll('.tf-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tf-tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTf = btn.dataset.tf;
      if (typeof initMainChart === 'function') initMainChart('workspaceChart');
    });
  });
}

function viewPortfolio() {
  return `
  <div class="view-header"><div><h1>Portfolio</h1><p class="sub">Posisi dan performa terkini</p></div></div>
  <div class="stats-row">
    <div class="stat-card"><div class="label">Total Equity</div><div class="value">${money(currentUser?.equity || 1250)}</div></div>
    <div class="stat-card"><div class="label">Unrealized PnL</div><div class="value" style="color:var(--long)">+${money(492)}</div></div>
    <div class="stat-card"><div class="label">Open Positions</div><div class="value">3</div></div>
  </div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Pair</th><th>Side</th><th>Size</th><th>Entry</th><th>Current</th><th>PnL</th></tr></thead>
    <tbody>
      ${(positions || []).map(p => `<tr>
        <td><strong>${p.pair}</strong></td>
        <td><span class="tag ${p.side}">${p.side.toUpperCase()}</span></td>
        <td>${p.size}</td>
        <td style="font-family:var(--mono)">${p.entry}</td>
        <td style="font-family:var(--mono)">${p.current}</td>
        <td style="color:${p.pnl >= 0 ? 'var(--long)' : 'var(--short)'};font-family:var(--mono)">${p.pnl >= 0 ? '+' : ''}${money(p.pnl)} (${p.pnlPct}%)</td>
      </tr>`).join('')}
    </tbody>
  </table></div></div>`;
}

function viewPackages() {
  return `
  <div class="view-header"><div><h1>Auto-Trading Packages</h1><p class="sub">Aktifkan paket dari saldo wallet</p></div></div>
  <div class="packages-grid">
    ${PACKAGES.map(pkg => `
      <div class="pkg-card ${pkg.popular ? 'popular' : ''}">
        ${pkg.popular ? '<div class="pkg-badge">PALING POPULER</div>' : ''}
        <div class="pkg-name">${pkg.name.toUpperCase()}</div>
        <div class="pkg-price">$${pkg.price}<span>/min</span></div>
        <p class="pkg-desc">ROI harian hingga ${pkg.roi}% · ${pkg.duration} hari</p>
        <ul>${pkg.features.map(f => `<li>✓ ${f}</li>`).join('')}</ul>
        <button class="btn ${pkg.popular ? 'btn-primary' : 'btn-outline'} btn-block" onclick="toast('Paket ${pkg.name} diaktifkan (demo)','success')">Aktifkan</button>
      </div>
    `).join('')}
  </div>`;
}

function viewWallet() {
  const u = currentUser || { balance: 1250.5 };
  return `
  <div class="view-header"><div><h1>Wallet</h1><p class="sub">Saldo & transaksi</p></div>
  <div class="header-actions">
    <button class="btn btn-outline" onclick="navigate('deposit')">Deposit</button>
    <button class="btn btn-primary" onclick="navigate('withdrawal')">Withdraw</button>
  </div></div>
  <div class="stats-row">
    <div class="stat-card luxury"><div class="label">Available</div><div class="value">${money(u.balance)}</div></div>
    <div class="stat-card luxury"><div class="label">In Packages</div><div class="value">$500.00</div></div>
    <div class="stat-card luxury"><div class="label">Total Earned</div><div class="value" style="color:var(--long)">+$186.30</div></div>
  </div>
  <div class="card"><div class="card-head"><h3>Riwayat transaksi</h3></div>
  <div class="table-wrap"><table>
    <thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
    <tbody>
      ${(transactions || []).map(t => `<tr>
        <td style="font-family:var(--mono)">${t.id}</td>
        <td><span class="tag">${t.type}</span></td>
        <td style="font-family:var(--mono);color:${t.amount >= 0 ? 'var(--long)' : 'var(--text)'}">${t.amount >= 0 ? '+' : ''}${money(Math.abs(t.amount))}</td>
        <td><span class="tag ${t.status === 'completed' ? 'success' : 'warning'}">${t.status}</span></td>
        <td>${t.date}</td>
      </tr>`).join('')}
    </tbody>
  </table></div></div>`;
}

function viewDeposit() {
  return `
  <div class="view-header">
    <div>
      <div class="eyebrow">WALLET / TOP UP</div>
      <h1>Deposit</h1>
      <p class="sub">Top up saldo untuk membeli paket auto-trading. Admin akan memverifikasi setiap permintaan deposit.</p>
    </div>
  </div>

  <div class="alert-banner warning">
    ⚠️ Ini adalah alamat demo, bukan alamat sungguhan. Jangan pernah mengirim dana asli ke alamat ini.
  </div>

  <div class="deposit-grid">
    <div class="card deposit-card">
      <h3>Pilih rekening & alamat tujuan deposit</h3>
      <div class="network-tabs">
        <button class="active">USDT (BEP20) · BNB Smart Chain (BSC)</button>
      </div>
      <div class="qr-row">
        <div class="qr-box">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=0x168B8E4D0AE5F875a22061aa59ee58239F2988a5&color=0d3b2e" alt="QR" width="140" height="140" style="border-radius:8px" />
        </div>
        <div class="addr-box">
          <label>Alamat wallet penerima (BEP20) — DEMO</label>
          <div class="addr-value">0x168B8E4D0AE5F875a22061aa59ee58239F2988a5</div>
          <button class="btn btn-primary" onclick="navigator.clipboard.writeText('0x168B8E4D0AE5F875a22061aa59ee58239F2988a5');toast('Alamat disalin','success')">Salin alamat</button>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>Transfer bank (opsional)</h3>
      <div class="form-group"><label>Atas nama</label><input class="form-control" value="GO TRADE Demo Ltd." readonly /></div>
      <div class="form-group"><label>Nomor rekening — DEMO</label><input class="form-control" value="0000-1111-2222-3333" readonly /></div>
    </div>
  </div>

  <div class="card" style="margin-top:20px">
    <h3 style="margin-bottom:16px">Form deposit</h3>
    <div class="form-group"><label>Jumlah deposit (min $10)</label><input class="form-control" type="number" placeholder="Masukkan jumlah dalam USD" min="10" /></div>
    <div class="form-group"><label>Metode pembayaran</label>
      <select class="form-control"><option>USDT (BEP20)</option><option>Transfer Bank</option></select>
    </div>
    <div class="form-group"><label>Catatan (opsional)</label><input class="form-control" placeholder="Contoh: bukti transfer dikirim via chat" /></div>
    <div class="form-group"><label>Upload bukti transfer</label><input class="form-control" type="file" accept="image/*" /></div>
    <button class="btn btn-primary" onclick="toast('Permintaan deposit dikirim (demo)','success')">Kirim permintaan deposit</button>
  </div>`;
}

function viewWithdrawal() {
  return `
  <div class="view-header"><div><h1>Withdrawal</h1><p class="sub">Tarik dana ke wallet atau rekening Anda</p></div></div>
  <div class="alert-banner warning">Minimum penarikan $20. Proses verifikasi 1×24 jam (demo instan).</div>
  <div class="card" style="max-width:520px">
    <div class="form-group"><label>Jumlah (USD)</label><input class="form-control" type="number" placeholder="Minimal 20" min="20" /></div>
    <div class="form-group"><label>Network</label><select class="form-control"><option>USDT BEP20</option><option>Bank Transfer</option></select></div>
    <div class="form-group"><label>Alamat / Nomor rekening</label><input class="form-control" placeholder="Masukkan alamat tujuan" /></div>
    <button class="btn btn-primary" onclick="toast('Permintaan penarikan dikirim','success')">Ajukan penarikan</button>
  </div>`;
}

function viewHistory() {
  return `
  <div class="view-header"><div><h1>Trade History</h1></div></div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Time</th><th>Pair</th><th>Side</th><th>Entry</th><th>Exit</th><th>PnL</th></tr></thead>
    <tbody>
      <tr><td>2026-11-07 14:22</td><td>BTCUSDT</td><td><span class="tag long">LONG</span></td><td>74250</td><td>75884</td><td style="color:var(--long)">+$196.08</td></tr>
      <tr><td>2026-11-06 09:10</td><td>ETHUSDT</td><td><span class="tag long">LONG</span></td><td>2180</td><td>2234</td><td style="color:var(--long)">+$151.20</td></tr>
      <tr><td>2026-11-05 22:40</td><td>SOLUSDT</td><td><span class="tag short">SHORT</span></td><td>92.40</td><td>89.18</td><td style="color:var(--long)">+$144.90</td></tr>
    </tbody>
  </table></div></div>`;
}

function viewReferral() {
  const code = (currentUser && currentUser.referralCode) || 'GOTRADE-DEMO1';
  return `
  <div class="view-header">
    <div>
      <div class="eyebrow">GROWTH NETWORK</div>
      <h1>Network & referral</h1>
      <p class="sub">Undang orang yang Anda percaya dan tumbuh bersama mereka.</p>
    </div>
  </div>

  <div class="referral-grid">
    <div class="card referral-main">
      <div class="eyebrow">KODE REFERRAL ANDA</div>
      <h3>Bagikan GO TRADE ke jaringan Anda</h3>
      <p class="sub">Dapatkan bonus setiap kali teman bergabung dan mengaktifkan paket.</p>
      <div class="code-box">
        <span class="code">${code}</span>
        <button class="btn btn-outline" onclick="navigator.clipboard.writeText('${code}');toast('Kode disalin','success')">Salin kode</button>
      </div>
      <div class="ref-link">gotrade.io/join/${code}</div>
      <div class="ref-stats">
        <div class="ref-stat"><div class="label">Total referral</div><div class="value">0</div></div>
        <div class="ref-stat"><div class="label">Member aktif</div><div class="value">0</div></div>
        <div class="ref-stat"><div class="label">Bonus diterima</div><div class="value">${money(31.5)}</div></div>
        <div class="ref-stat"><div class="label">Level</div><div class="value">1</div></div>
      </div>
    </div>
    <div class="card">
      <h3>Referral Anda</h3>
      <p class="sub">Orang yang bergabung lewat kode Anda</p>
      <div class="empty-ref">
        <p>Belum ada referral. Bagikan kode Anda untuk mulai.</p>
      </div>
    </div>
  </div>`;
}

function viewBonus() {
  return `
  <div class="view-header"><div><h1>Bonus Tracking</h1><p class="sub">Riwayat bonus referral & reward</p></div></div>
  <div class="stats-row">
    <div class="stat-card"><div class="label">Total bonus</div><div class="value">${money(31.5)}</div></div>
    <div class="stat-card"><div class="label">Bulan ini</div><div class="value">${money(12.5)}</div></div>
    <div class="stat-card"><div class="label">Pending</div><div class="value">$0.00</div></div>
  </div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Tanggal</th><th>Sumber</th><th>Jumlah</th><th>Status</th></tr></thead>
    <tbody>
      <tr><td>2026-11-02</td><td>Referral bonus</td><td style="color:var(--long)">+$25.00</td><td><span class="tag success">Paid</span></td></tr>
      <tr><td>2026-10-28</td><td>Network reward</td><td style="color:var(--long)">+$6.50</td><td><span class="tag success">Paid</span></td></tr>
    </tbody>
  </table></div></div>`;
}

function viewNews() {
  return `
  <div class="view-header"><div><h1>News</h1><p class="sub">Update pasar & produk</p></div></div>
  <div class="news-list">
    ${(NEWS || []).map(n => `
      <div class="card news-item">
        <span class="tag info">${n.tag}</span>
        <h3>${n.title}</h3>
        <span class="time">${n.time}</span>
      </div>
    `).join('')}
  </div>`;
}

function viewNotifications() {
  return `
  <div class="view-header"><div><h1>Notifications</h1></div>
  <button class="btn btn-ghost btn-sm" onclick="toast('Semua ditandai dibaca','info')">Tandai semua dibaca</button></div>
  <div class="card">
    ${(NOTIFS || []).map(n => `
      <div class="notif-row ${n.read ? '' : 'unread'}">
        <div class="notif-dot"></div>
        <div><strong>${n.text}</strong><div class="time">${n.time}</div></div>
      </div>
    `).join('')}
  </div>`;
}

function viewSettings() {
  const u = currentUser || { name: 'satrio', email: 'demo@gotrade.io' };
  return `
  <div class="view-header"><div><h1>Account settings</h1></div></div>
  <div class="grid-2">
    <div class="card">
      <h3 style="margin-bottom:16px">Profil</h3>
      <div class="form-group"><label>Nama</label><input class="form-control" value="${u.name}" /></div>
      <div class="form-group"><label>Email</label><input class="form-control" value="${u.email}" readonly /></div>
      <button class="btn btn-primary" onclick="toast('Profil disimpan','success')">Simpan</button>
    </div>
    <div class="card">
      <h3 style="margin-bottom:16px">Keamanan</h3>
      <div class="form-group"><label>Password baru</label><input class="form-control" type="password" placeholder="••••••••" /></div>
      <button class="btn btn-outline" onclick="toast('Password diubah (demo)','success')">Ubah password</button>
      <div style="margin-top:20px"><label style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" /> Aktifkan 2FA (demo)</label></div>
    </div>
  </div>`;
}

function viewHelp() {
  return `
  <div class="view-header"><div><h1>Help Center</h1></div></div>
  <div class="grid-2">
    ${[['Bagaimana deposit?', 'Pilih network BEP20, transfer USDT ke alamat yang ditampilkan, lalu submit form dengan bukti.'],
      ['Apa itu AI Confidence?', 'Skor 0–100% yang menunjukkan keyakinan model terhadap setup sinyal.'],
      ['ROI paket dihitung bagaimana?', 'Dihitung harian dari modal paket yang aktif dan dikredit ke wallet.'],
      ['Bagaimana referral bekerja?', 'Bagikan kode Anda. Setiap downline yang aktif paket, Anda mendapat bonus.']
    ].map(([q, a]) => `<div class="card" style="padding:24px"><h3 style="font-size:15px;margin-bottom:10px">${q}</h3><p style="font-size:13px;color:var(--text-secondary);line-height:1.55">${a}</p></div>`).join('')}
  </div>`;
}

/* ========== ADMIN VIEWS ========== */
function viewAdminOverview() {
  return `
  <div class="view-header"><div><h1>Admin Overview</h1></div></div>
  <div class="stats-row">
    <div class="stat-card"><div class="label">Total Users</div><div class="value">3,842</div></div>
    <div class="stat-card"><div class="label">Active Packages</div><div class="value">1,204</div></div>
    <div class="stat-card"><div class="label">Pending Deposits</div><div class="value">12</div></div>
    <div class="stat-card"><div class="label">Pending Withdrawals</div><div class="value">7</div></div>
  </div>
  <div class="card"><div class="card-head"><h3>Recent activity</h3></div>
  <div class="table-wrap"><table>
    <thead><tr><th>User</th><th>Action</th><th>Amount</th><th>Time</th></tr></thead>
    <tbody>
      <tr><td>Andi R.</td><td>Deposit</td><td>$500</td><td>10m ago</td></tr>
      <tr><td>Sari L.</td><td>Activate Growth</td><td>$250</td><td>1h ago</td></tr>
      <tr><td>Budi K.</td><td>Withdraw request</td><td>$1,200</td><td>2h ago</td></tr>
    </tbody>
  </table></div></div>`;
}

function viewAdminUsers() {
  return `
  <div class="view-header"><div><h1>Manage Users</h1></div><button class="btn btn-primary" onclick="toast('User ditambahkan','success')">+ Add User</button></div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Name</th><th>Email</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>
      ${(adminUsers || []).map(u => `<tr>
        <td>${u.name}</td><td>${u.email}</td><td style="font-family:var(--mono)">${money(u.balance)}</td>
        <td><span class="tag success">${u.status}</span></td>
        <td><button class="btn btn-ghost btn-sm" onclick="toast('Edit ${u.name}','info')">Edit</button></td>
      </tr>`).join('')}
    </tbody>
  </table></div></div>`;
}

function viewAdminSignals() {
  return `
  <div class="view-header"><div><h1>Manage Signals</h1></div><button class="btn btn-primary" onclick="toast('Signal dibuat','success')">+ New Signal</button></div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Pair</th><th>Side</th><th>Entry</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>
      <tr><td>BTCUSDT</td><td><span class="tag long">BUY</span></td><td>63800</td><td><span class="tag success">ACTIVE</span></td><td><button class="btn btn-ghost btn-sm">Edit</button></td></tr>
      <tr><td>ETHUSDT</td><td><span class="tag short">SELL</span></td><td>3180</td><td><span class="tag success">ACTIVE</span></td><td><button class="btn btn-ghost btn-sm">Edit</button></td></tr>
    </tbody>
  </table></div></div>`;
}

function viewAdminDeposits() {
  return `
  <div class="view-header"><div><h1>Deposit Approvals</h1></div></div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>User</th><th>Amount</th><th>Network</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>
      <tr><td>Andi R.</td><td style="font-family:var(--mono)">$500</td><td>BEP20</td><td><span class="tag warning">pending</span></td>
      <td><button class="btn btn-primary btn-sm" onclick="toast('Approved','success')">Approve</button></td></tr>
    </tbody>
  </table></div></div>`;
}

function viewAdminWithdrawals() {
  return `
  <div class="view-header"><div><h1>Withdrawal Approvals</h1></div></div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>User</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>
      <tr><td>Demo Trader</td><td style="font-family:var(--mono)">$200</td><td><span class="tag warning">pending</span></td>
      <td><button class="btn btn-primary btn-sm" onclick="toast('Processed','success')">Approve</button></td></tr>
    </tbody>
  </table></div></div>`;
}

function viewAdminPackages() {
  return `
  <div class="view-header"><div><h1>Manage Packages</h1></div></div>
  <div class="packages-grid">
    ${PACKAGES.map(pkg => `<div class="pkg-card"><div class="pkg-name">${pkg.name.toUpperCase()}</div><div class="pkg-price">$${pkg.price}</div>
    <p>ROI ${pkg.roi}%/hari · ${pkg.duration} hari</p>
    <button class="btn btn-outline btn-block" onclick="toast('Edit ${pkg.name}','info')">Edit</button></div>`).join('')}
  </div>`;
}

function viewAdminNews() {
  return `
  <div class="view-header"><div><h1>News & Broadcast</h1></div>
  <button class="btn btn-primary" onclick="toast('Broadcast terkirim','success')">📢 Broadcast</button></div>
  <div class="card" style="padding:24px">
    <h3 style="margin-bottom:12px">Publish News</h3>
    <div class="form-group"><label>Judul</label><input class="form-control" /></div>
    <button class="btn btn-primary" onclick="toast('Published','success')">Publish</button>
  </div>`;
}

function viewAdminSettings() {
  return `
  <div class="view-header"><div><h1>System Settings</h1></div></div>
  <div class="grid-2">
    <div class="card" style="padding:24px">
      <h3 style="margin-bottom:16px">Deposit Wallet</h3>
      <div class="form-group"><label>BEP20 Address</label><input class="form-control" value="0x168B8E4D0AE5F875a22061aa59ee58239F2988a5" /></div>
      <button class="btn btn-primary" onclick="toast('Saved','success')">Simpan</button>
    </div>
    <div class="card" style="padding:24px">
      <h3 style="margin-bottom:16px">Config</h3>
      <div class="form-group"><label>Min Deposit</label><input class="form-control" type="number" value="10" /></div>
      <button class="btn btn-primary" onclick="toast('Saved','success')">Simpan</button>
    </div>
  </div>`;
}

/* ========== Terminal Market Panels UI (Step 2) ========== */
function bindTerminalTfTabs() {
  const tabs = document.getElementById('termTfTabs');
  if (!tabs) return;
  tabs.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      tabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTf = btn.dataset.tf;
      currentPair = (typeof activeTerminalPair !== 'undefined' && activeTerminalPair) || currentPair || 'BTCUSDT';
      if (typeof loadChartData === 'function') loadChartData(currentPair, currentTf);
    };
  });
}

function updateTerminalPriceBox() {
  const pair = (typeof activeTerminalPair !== 'undefined' && activeTerminalPair) || currentPair || 'BTCUSDT';
  const m = (typeof marketState !== 'undefined' && marketState[pair]) || null;
  if (!m) return;
  const dec = (typeof PAIRS !== 'undefined' && PAIRS[pair]) ? PAIRS[pair].decimals : 2;
  const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('termLastPrice', '$' + fmt(m.price));
  const chg = parseFloat(m.change24h) || 0;
  const chgEl = document.getElementById('termPriceChg');
  if (chgEl) {
    chgEl.textContent = (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%';
    chgEl.className = 'term-chg ' + (chg >= 0 ? 'up' : 'down');
  }
  set('termHigh', '$' + fmt(m.high24));
  set('termLow', '$' + fmt(m.low24));
  const vol = m.quoteVolume || 0;
  set('termVol', vol > 1e9 ? '$' + (vol / 1e9).toFixed(2) + 'B' : '$' + (vol / 1e6).toFixed(1) + 'M');
}

function renderOrderBookUI() {
  const asksEl = document.getElementById('obAsks');
  const bidsEl = document.getElementById('obBids');
  const midEl = document.getElementById('obMid');
  const spreadEl = document.getElementById('termSpread');
  if (!asksEl || !bidsEl || typeof orderBook === 'undefined') return;

  const ob = orderBook;
  const maxTotal = Math.max(
    ...(ob.asks || []).map(a => a.total),
    ...(ob.bids || []).map(b => b.total),
    0.001
  );

  // Asks: show highest first visually at top (already reversed in generate)
  const asks = (ob.asks || []).slice(-12).reverse();
  asksEl.innerHTML = asks.map(a => {
    const pct = Math.min(100, (a.total / maxTotal) * 100);
    return '<div class="ob-row ask">' +
      '<div class="ob-bar" style="width:' + pct + '%"></div>' +
      '<span class="ob-price">' + a.price + '</span>' +
      '<span class="ob-size">' + a.size + '</span>' +
      '<span class="ob-total">' + a.total + '</span></div>';
  }).join('');

  const bids = (ob.bids || []).slice(0, 12);
  bidsEl.innerHTML = bids.map(b => {
    const pct = Math.min(100, (b.total / maxTotal) * 100);
    return '<div class="ob-row bid">' +
      '<div class="ob-bar" style="width:' + pct + '%"></div>' +
      '<span class="ob-price">' + b.price + '</span>' +
      '<span class="ob-size">' + b.size + '</span>' +
      '<span class="ob-total">' + b.total + '</span></div>';
  }).join('');

  if (midEl) {
    const dec = (ob.mid > 100) ? 2 : (ob.mid > 1 ? 4 : 5);
    midEl.textContent = Number(ob.mid).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }
  if (spreadEl && ob.spread != null) {
    spreadEl.textContent = 'Spread ' + Number(ob.spread).toPrecision(4);
  }
}

function renderRecentTradesUI() {
  const body = document.getElementById('recentTradesBody');
  if (!body || typeof recentTrades === 'undefined') return;
  body.innerHTML = recentTrades.slice(0, 24).map(t => {
    const d = new Date(t.time);
    const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return '<div class="tr-row ' + t.side + '">' +
      '<span class="tr-price">' + t.price + '</span>' +
      '<span class="tr-size">' + t.size + '</span>' +
      '<span class="tr-time">' + time + '</span></div>';
  }).join('');
}

/* ========== Step 3: Order Form + Bottom Panel ========== */
let ordSide = 'long';
let ordType = 'market';

function bindOrderForm() {
  ordSide = 'long';
  ordType = 'market';
  const pair = (typeof activeTerminalPair !== 'undefined' && activeTerminalPair) || currentPair || 'BTCUSDT';

  document.querySelectorAll('.ord-side').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.ord-side').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ordSide = btn.dataset.side;
      const sub = document.getElementById('ordSubmit');
      if (sub) {
        sub.textContent = ordSide === 'long' ? 'Buy / Long' : 'Sell / Short';
        sub.className = 'ord-submit ' + (ordSide === 'long' ? 'buy' : 'sell');
      }
      updateOrderCost();
    };
  });

  const typeTabs = document.getElementById('ordTypeTabs');
  if (typeTabs) {
    typeTabs.querySelectorAll('button').forEach(btn => {
      btn.onclick = () => {
        typeTabs.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        ordType = btn.dataset.type;
        const pf = document.getElementById('ordPriceField');
        if (pf) pf.style.display = ordType === 'market' ? 'none' : 'block';
        if (ordType !== 'market') {
          const m = marketState[pair];
          const inp = document.getElementById('ordPrice');
          if (inp && m) inp.value = m.price;
        }
        updateOrderCost();
      };
    });
  }

  const sizeInp = document.getElementById('ordSize');
  const priceInp = document.getElementById('ordPrice');
  if (sizeInp) sizeInp.oninput = updateOrderCost;
  if (priceInp) priceInp.oninput = updateOrderCost;

  document.querySelectorAll('.ord-presets button').forEach(btn => {
    btn.onclick = () => {
      const pct = parseInt(btn.dataset.pct, 10) / 100;
      const m = marketState[pair];
      const bal = (currentUser && currentUser.balance) || 1250;
      if (!m) return;
      const size = (bal * pct) / m.price;
      const dec = m.price > 1000 ? 4 : m.price > 10 ? 3 : 2;
      if (sizeInp) sizeInp.value = size.toFixed(dec);
      updateOrderCost();
    };
  });

  const sub = document.getElementById('ordSubmit');
  if (sub) {
    sub.onclick = () => {
      const size = parseFloat(document.getElementById('ordSize')?.value || '0');
      const price = parseFloat(document.getElementById('ordPrice')?.value || '0');
      const p = (typeof activeTerminalPair !== 'undefined' && activeTerminalPair) || currentPair || 'BTCUSDT';
      if (!size || size <= 0) { toast('Masukkan size valid', 'error'); return; }
      let res;
      if (typeof gtGuardedAction === 'function') {
        res = gtGuardedAction('order:' + (currentUser && currentUser.id || 'anon'), (window.GT_CONFIG && GT_CONFIG.security && GT_CONFIG.security.orderPerMinute) || 30, function () {
          return placePaperOrder({ pair: p, side: ordSide, type: ordType, size, price });
        });
      } else {
        res = placePaperOrder({ pair: p, side: ordSide, type: ordType, size, price });
      }
      if (res && res.ok) {
        if (typeof gtLogActivity === 'function') gtLogActivity('order', p, res.message || ordType + ' ' + ordSide, { size, type: ordType, side: ordSide });
        toast(res.message || 'Order berhasil', 'success');
        renderBottomPanel(document.querySelector('.t-bottom-tab.active')?.dataset.tab || 'positions');
        updateTopMetrics();
        updateOrderCost();
      } else {
        toast(res.error || 'Gagal', 'error');
      }
    };
  }

  updateOrderCost();
}

function updateOrderCost() {
  const pair = (typeof activeTerminalPair !== 'undefined' && activeTerminalPair) || currentPair || 'BTCUSDT';
  const m = marketState[pair];
  const size = parseFloat(document.getElementById('ordSize')?.value || '0') || 0;
  const priceInp = document.getElementById('ordPrice');
  const px = ordType === 'market' ? (m?.price || 0) : (parseFloat(priceInp?.value) || m?.price || 0);
  const cost = size * px;
  const avail = document.getElementById('ordAvail');
  const costEl = document.getElementById('ordCost');
  if (avail) avail.textContent = money((currentUser && currentUser.balance) || 0);
  if (costEl) costEl.textContent = money(cost);
  const label = document.getElementById('orderPairLabel');
  if (label) label.textContent = pair.replace('USDT', '/USDT');
}

function renderBottomPanel(tab) {
  tab = tab || 'positions';
  const body = document.getElementById('bottomBody');
  const posCount = document.getElementById('posCount');
  const ordCount = document.getElementById('ordCount');
  if (posCount) posCount.textContent = (typeof positions !== 'undefined' ? positions.length : 0);
  if (ordCount) ordCount.textContent = (typeof openOrders !== 'undefined' ? openOrders.length : 0);
  if (!body) return;

  if (tab === 'positions') {
    if (!positions || !positions.length) {
      body.innerHTML = '<div class="empty-hint">Belum ada posisi aktif</div>';
      return;
    }
    body.innerHTML = `
      <table class="t-table">
        <thead><tr>
          <th>Pair</th><th>Side</th><th>Size</th><th>Entry</th><th>Mark</th><th>PnL</th><th>PnL %</th><th></th>
        </tr></thead>
        <tbody>
          ${positions.map(p => {
            const up = p.pnl >= 0;
            return '<tr>' +
              '<td class="mono">' + p.pair.replace('USDT','') + '</td>' +
              '<td class="' + (p.side === 'long' ? 'up' : 'down') + '">' + p.side.toUpperCase() + '</td>' +
              '<td class="mono">' + p.size + '</td>' +
              '<td class="mono">' + Number(p.entry).toLocaleString('en-US', { maximumFractionDigits: 4 }) + '</td>' +
              '<td class="mono">' + Number(p.current).toLocaleString('en-US', { maximumFractionDigits: 4 }) + '</td>' +
              '<td class="mono ' + (up ? 'up' : 'down') + '">' + (up ? '+' : '') + Number(p.pnl).toFixed(2) + '</td>' +
              '<td class="mono ' + (up ? 'up' : 'down') + '">' + (up ? '+' : '') + Number(p.pnlPct).toFixed(2) + '%</td>' +
              '<td><button class="t-close-btn" data-pair="' + p.pair + '" data-side="' + p.side + '">Close</button></td>' +
              '</tr>';
          }).join('')}
        </tbody>
      </table>`;
    body.querySelectorAll('.t-close-btn').forEach(btn => {
      btn.onclick = () => {
        const res = closePosition(btn.dataset.pair, btn.dataset.side);
        if (res.ok) {
          toast(res.message, res.pnl >= 0 ? 'success' : 'info');
          renderBottomPanel('positions');
          updateTopMetrics();
        }
      };
    });
  } else if (tab === 'orders') {
    if (!openOrders || !openOrders.length) {
      body.innerHTML = '<div class="empty-hint">Tidak ada open order</div>';
      return;
    }
    body.innerHTML = `
      <table class="t-table">
        <thead><tr>
          <th>ID</th><th>Pair</th><th>Side</th><th>Type</th><th>Size</th><th>Price</th><th></th>
        </tr></thead>
        <tbody>
          ${openOrders.map(o =>
            '<tr>' +
            '<td class="mono">' + o.id + '</td>' +
            '<td class="mono">' + o.pair.replace('USDT','') + '</td>' +
            '<td class="' + (o.side === 'long' ? 'up' : 'down') + '">' + o.side.toUpperCase() + '</td>' +
            '<td>' + o.type.toUpperCase() + '</td>' +
            '<td class="mono">' + o.size + '</td>' +
            '<td class="mono">' + Number(o.price).toLocaleString('en-US', { maximumFractionDigits: 4 }) + '</td>' +
            '<td><button class="t-close-btn" data-id="' + o.id + '">Cancel</button></td>' +
            '</tr>'
          ).join('')}
        </tbody>
      </table>`;
    body.querySelectorAll('.t-close-btn').forEach(btn => {
      btn.onclick = () => {
        cancelOrder(btn.dataset.id);
        toast('Order dibatalkan', 'info');
        renderBottomPanel('orders');
      };
    });
  } else {
    // history
    const list = (typeof tradeHistory !== 'undefined' ? tradeHistory : []).slice(0, 30);
    if (!list.length) {
      body.innerHTML = '<div class="empty-hint">Belum ada trade history</div>';
      return;
    }
    body.innerHTML = `
      <table class="t-table">
        <thead><tr>
          <th>Time</th><th>Pair</th><th>Side</th><th>Size</th><th>Entry</th><th>Exit</th><th>PnL</th>
        </tr></thead>
        <tbody>
          ${list.map(t => {
            const up = (t.pnl || 0) >= 0;
            return '<tr>' +
              '<td class="mono">' + t.time + '</td>' +
              '<td class="mono">' + t.pair.replace('USDT','') + '</td>' +
              '<td class="' + (t.side === 'long' ? 'up' : 'down') + '">' + t.side.toUpperCase() + '</td>' +
              '<td class="mono">' + t.size + '</td>' +
              '<td class="mono">' + Number(t.entry).toLocaleString('en-US', { maximumFractionDigits: 4 }) + '</td>' +
              '<td class="mono">' + (t.exit != null ? Number(t.exit).toLocaleString('en-US', { maximumFractionDigits: 4 }) : '—') + '</td>' +
              '<td class="mono ' + (up ? 'up' : 'down') + '">' + (t.exit != null ? ((up ? '+' : '') + Number(t.pnl).toFixed(2)) : '—') + '</td>' +
              '</tr>';
          }).join('')}
        </tbody>
      </table>`;
  }
}

/* ========== Step 4: Feature Integration (dock panels) ========== */
function bindTerminalDock() {
  const dock = document.getElementById('termDock');
  if (!dock) return;
  dock.querySelectorAll('.dock-btn').forEach(btn => {
    btn.onclick = () => {
      dock.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const which = btn.dataset.dock;
      document.querySelectorAll('.dock-panel').forEach(p => {
        p.style.display = p.dataset.panel === which ? (which === 'trading' ? 'block' : 'flex') : 'none';
      });
      // chart needs block + height
      const chart = document.getElementById('terminalChart');
      if (chart) {
        chart.style.display = which === 'trading' ? 'block' : 'none';
        if (which === 'trading' && typeof initMainChart === 'function') {
          setTimeout(() => initMainChart('terminalChart'), 50);
        }
      }
      if (which === 'signals') renderTermSignalsPanel();
      if (which === 'package') renderTermPackagePanel();
    };
  });
}

function renderTermSignalsPanel() {
  const el = document.getElementById('termSignalsPanel');
  if (!el) return;
  const list = (typeof signals !== 'undefined' && signals.length) ? signals.slice(0, 12) : [];
  if (!list.length) {
    el.innerHTML = '<div class="empty-hint" style="padding:40px">Belum ada sinyal AI</div>';
    return;
  }
  el.innerHTML = `
    <div class="term-sig-head">
      <div>
        <strong>AI Trading Signals</strong>
        <span>${list.length} signal · live feed</span>
      </div>
      <button class="term-ctx-btn ghost" onclick="navigate('signals')">Buka full page →</button>
    </div>
    <div class="term-sig-list">
      ${list.map(s => {
        const side = String(s.side || '').toLowerCase();
        const isLong = side === 'long' || side === 'buy';
        return '<div class="term-sig-card">' +
          '<div class="term-sig-top">' +
            '<span class="mono">' + (s.pair || '') + '</span>' +
            '<span class="side-pill ' + (isLong ? 'long' : 'short') + '">' + String(s.side).toUpperCase() + '</span>' +
            '<span class="conf">' + (s.confidence || '—') + '%</span>' +
          '</div>' +
          '<div class="term-sig-grid">' +
            '<div><span>Entry</span><strong class="mono">' + (s.entry || '—') + '</strong></div>' +
            '<div><span>SL</span><strong class="mono">' + (s.sl || '—') + '</strong></div>' +
            '<div><span>TP1</span><strong class="mono">' + (s.tp1 || s.target || '—') + '</strong></div>' +
            '<div><span>R:R</span><strong>1:' + (s.rr || '—') + '</strong></div>' +
          '</div>' +
          '<p class="term-sig-note">' + (s.reason || s.note || '') + '</p>' +
          '<div class="term-sig-foot">' +
            '<span>' + (s.timeframe || '') + '</span>' +
            '<button class="term-ctx-btn sm" data-pair="' + String(s.pair || '').replace('/','') + '" data-side="' + (isLong ? 'long' : 'short') + '">Trade this</button>' +
          '</div></div>';
      }).join('')}
    </div>`;
  el.querySelectorAll('[data-pair]').forEach(btn => {
    btn.onclick = () => {
      const raw = btn.dataset.pair.replace('/', '');
      const pair = raw.endsWith('USDT') ? raw : raw + 'USDT';
      if (typeof activeTerminalPair !== 'undefined') activeTerminalPair = pair;
      if (typeof currentPair !== 'undefined') currentPair = pair;
      // switch to trading dock
      const tradeBtn = document.querySelector('.dock-btn[data-dock="trading"]');
      if (tradeBtn) tradeBtn.click();
      if (typeof renderWatchlist === 'function') renderWatchlist();
      if (typeof updateActivePairUI === 'function') updateActivePairUI();
      // set order side
      const sideBtn = document.querySelector('.ord-side[data-side="' + btn.dataset.side + '"]');
      if (sideBtn) sideBtn.click();
      toast('Pair ' + pair + ' · side ' + btn.dataset.side, 'info');
    };
  });
}

function renderTermPackagePanel() {
  const el = document.getElementById('termPackagePanel');
  if (!el) return;
  const u = currentUser || { activePackage: 'Growth', balance: 1250.5 };
  const active = (typeof PACKAGES !== 'undefined' ? PACKAGES : []).find(p =>
    p.name.toLowerCase() === String(u.activePackage || '').toLowerCase()
  ) || (typeof PACKAGES !== 'undefined' ? PACKAGES[1] : null);

  el.innerHTML = `
    <div class="term-pkg-wrap">
      <div class="term-pkg-active">
        <div class="term-pkg-badge">ACTIVE</div>
        <h3>${u.activePackage || '—'} Auto-Trade</h3>
        <p>ROI harian hingga <strong>${active ? active.roi : '1.8'}%</strong> · Durasi ${active ? active.duration : 45} hari</p>
        <div class="term-pkg-stats">
          <div><span>Modal terikat</span><strong>$500.00</strong></div>
          <div><span>Est. hari ini</span><strong class="up">+$${(500 * ((active ? active.roi : 1.8) / 100)).toFixed(2)}</strong></div>
          <div><span>Wallet free</span><strong>${money(u.balance)}</strong></div>
        </div>
        <div class="term-pkg-progress">
          <div class="bar"><div style="width:62%"></div></div>
          <span>Hari 18 / ${active ? active.duration : 45}</span>
        </div>
      </div>
      <div class="term-pkg-list">
        <h4>Upgrade / Ganti paket</h4>
        ${(typeof PACKAGES !== 'undefined' ? PACKAGES : []).map(pkg => `
          <div class="term-pkg-row ${pkg.name === u.activePackage ? 'on' : ''}">
            <div>
              <strong>${pkg.name}</strong>
              <span>$${pkg.price} · ROI ${pkg.roi}%/hari · ${pkg.duration}h</span>
            </div>
            <button class="term-ctx-btn ${pkg.name === u.activePackage ? 'ghost' : ''}" onclick="toast('Paket ${pkg.name} ${pkg.name === u.activePackage ? 'sudah aktif' : 'diaktifkan (demo)'}','success')">
              ${pkg.name === u.activePackage ? 'Aktif' : 'Aktifkan'}
            </button>
          </div>
        `).join('')}
        <button class="term-ctx-btn ghost" style="margin-top:12px;width:100%" onclick="navigate('packages')">Kelola di halaman Packages →</button>
      </div>
    </div>`;
}
