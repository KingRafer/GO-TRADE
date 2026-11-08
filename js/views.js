/* GO TRADE — All Views */
function renderView(id) {
  const root = document.getElementById('viewRoot');
  if (!root) return;
  const map = {
    dashboard: viewDashboard, signals: viewSignals, charts: viewCharts, portfolio: viewPortfolio,
    packages: viewPackages, wallet: viewWallet, history: viewHistory, referral: viewReferral,
    news: viewNews, settings: viewSettings, help: viewHelp,
    'admin-overview': viewAdminOverview, 'admin-users': viewAdminUsers, 'admin-signals': viewAdminSignals,
    'admin-deposits': viewAdminDeposits, 'admin-withdrawals': viewAdminWithdrawals,
    'admin-packages': viewAdminPackages, 'admin-news': viewAdminNews, 'admin-settings': viewAdminSettings,
  };
  const fn = map[id];
  if (fn) {
    root.innerHTML = fn();
    if (id === 'dashboard') setTimeout(() => { if (typeof initMiniChart==='function') initMiniChart('equityChart','BTCUSDT',160); renderSignalList('dashSignals',4); }, 50);
    if (id === 'charts') setTimeout(() => { currentPair='BTCUSDT'; currentTf='5m'; if (typeof initMainChart==='function') initMainChart('workspaceChart'); }, 80);
    if (id === 'signals') renderSignalList('fullSignalList', 15);
  } else {
    root.innerHTML = '<div class="empty-state"><div class="icon">🚧</div><p>View "'+id+'" sedang dikembangkan</p></div>';
  }
}

function viewDashboard() {
  const u = currentUser;
  return '<div class="view-header"><div><h1>Selamat datang, '+u.name.split(' ')[0]+' 👋</h1><p class="sub">Ringkasan performa dan market intelligence hari ini</p></div>'+
    '<button class="btn btn-primary" onclick="navigate(\'signals\')">Lihat Signals →</button></div>'+
    '<div class="stats-row">'+
    '<div class="stat-card"><div class="label">Wallet Balance</div><div class="value">'+money(u.balance)+'</div><div class="change up">↑ Available</div></div>'+
    '<div class="stat-card"><div class="label">Equity</div><div class="value">'+money(u.equity)+'</div><div class="change up">↑ +'+money(u.equity-u.balance)+'</div></div>'+
    '<div class="stat-card"><div class="label">PnL Hari Ini</div><div class="value" style="color:var(--long)">'+money(u.pnlToday)+'</div><div class="change up">↑ +2.81%</div></div>'+
    '<div class="stat-card"><div class="label">Paket Aktif</div><div class="value" style="font-size:20px">'+(u.activePackage||'—')+'</div><div class="change">Growth · ROI 1.8%/hari</div></div></div>'+
    '<div class="grid-chart" style="margin-bottom:24px"><div class="card"><div class="card-head"><h3 style="font-size:15px">Equity Curve</h3></div><div id="equityChart" style="height:180px;padding:8px 12px"></div></div>'+
    '<div class="card"><div class="card-head"><h3 style="font-size:15px">Posisi Aktif</h3></div><div style="padding:12px 16px">'+
    positions.map(p => '<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)"><div><strong style="font-size:13px">'+p.pair+'</strong> <span class="tag '+p.side+'">'+p.side.toUpperCase()+'</span></div>'+
    '<div style="text-align:right;font-family:var(--mono);font-size:13px;color:'+(p.pnl>=0?'var(--long)':'var(--short)')+'">'+(p.pnl>=0?'+':'')+money(p.pnl)+'</div></div>').join('')+
    '</div></div></div><div class="grid-2"><div class="card"><div class="card-head"><h3 style="font-size:15px">AI Signals Terbaru</h3><button class="btn btn-ghost btn-sm" onclick="navigate(\'signals\')">Semua →</button></div><div id="dashSignals" class="signal-list" style="max-height:340px"></div></div>'+
    '<div class="card"><div class="card-head"><h3 style="font-size:15px">News & Update</h3></div><div style="padding:8px 0">'+
    NEWS.map(n => '<div style="padding:14px 20px;border-bottom:1px solid var(--border)"><span class="tag info">'+n.tag+'</span> <span style="font-size:11px;color:var(--text-muted)">'+n.time+'</span><div style="font-size:13px;margin-top:4px">'+n.title+'</div></div>').join('')+
    '</div></div></div>';
}

function viewSignals() {
  return '<div class="view-header"><div><h1>AI Trading Signals</h1><p class="sub">Sinyal real-time dengan confidence score dan AI reasoning</p></div>'+
    '<button class="btn btn-outline btn-sm" onclick="signals.unshift(generateSignal());renderSignalList(\'fullSignalList\',15);toast(\'Sinyal baru\',\'success\')">⟳ Refresh</button></div>'+
    '<div class="stats-row"><div class="stat-card"><div class="label">Signals Aktif</div><div class="value">'+signals.filter(s=>s.status==='active').length+'</div></div>'+
    '<div class="stat-card"><div class="label">Avg Confidence</div><div class="value">'+Math.round(signals.reduce((a,s)=>a+s.confidence,0)/signals.length)+'%</div></div>'+
    '<div class="stat-card"><div class="label">Win Rate (30d)</div><div class="value" style="color:var(--long)">87.4%</div></div></div>'+
    '<div class="card"><div id="fullSignalList" class="signal-list" style="max-height:none"></div></div>';
}

function viewCharts() {
  return '<div class="view-header"><div><h1>Live Charts</h1><p class="sub">Data real-time dari Binance</p></div><span class="live-badge"><span class="dot"></span> REAL DATA</span></div>'+
    '<div class="card chart-card"><div class="card-head"><div class="pair-tabs" id="pairTabsWS">'+
    Object.keys(PAIRS).map((p,i)=>'<button class="'+(i===0?'active':'')+'" data-pair="'+p+'">'+p.replace('USDT','')+'</button>').join('')+
    '</div><div class="tf-tabs"><button data-tf="1m">1m</button><button data-tf="5m" class="active">5m</button><button data-tf="15m">15m</button><button data-tf="1h">1H</button><button data-tf="4h">4H</button><button data-tf="1d">1D</button></div></div>'+
    '<div id="workspaceChart" class="chart-container" style="height:500px"></div>'+
    '<div class="chart-footer"><div class="price-box"><span class="label">Last</span><strong id="lastPrice">—</strong> <span class="chg" id="priceChg"></span></div>'+
    '<div class="price-box"><span class="label">24h High</span><strong id="high24">—</strong></div>'+
    '<div class="price-box"><span class="label">24h Low</span><strong id="low24">—</strong></div>'+
    '<div class="price-box"><span class="label">Volume</span><strong id="vol24">—</strong></div></div></div>';
}

function viewPortfolio() {
  const totalPnl = positions.reduce((a,p)=>a+p.pnl,0);
  return '<div class="view-header"><div><h1>Portfolio</h1><p class="sub">Posisi terbuka dan risk metrics</p></div></div>'+
    '<div class="stats-row"><div class="stat-card"><div class="label">Positions</div><div class="value">'+positions.length+'</div></div>'+
    '<div class="stat-card"><div class="label">Unrealized PnL</div><div class="value" style="color:'+(totalPnl>=0?'var(--long)':'var(--short)')+'">'+(totalPnl>=0?'+':'')+money(totalPnl)+'</div></div></div>'+
    '<div class="table-wrap"><table><thead><tr><th>Pair</th><th>Side</th><th>Size</th><th>Entry</th><th>Current</th><th>PnL</th></tr></thead><tbody>'+
    positions.map(p=>'<tr><td><strong>'+p.pair+'</strong></td><td><span class="tag '+p.side+'">'+p.side.toUpperCase()+'</span></td><td style="font-family:var(--mono)">'+p.size+'</td><td style="font-family:var(--mono)">'+p.entry+'</td><td style="font-family:var(--mono)">'+p.current.toFixed(2)+'</td><td style="font-family:var(--mono);color:'+(p.pnl>=0?'var(--long)':'var(--short)')+'">'+(p.pnl>=0?'+':'')+money(p.pnl)+'</td></tr>').join('')+
    '</tbody></table></div>';
}

function viewPackages() {
  return '<div class="view-header"><div><h1>Auto-Trading Packages</h1><p class="sub">Aktifkan mesin trading AI</p></div></div><div class="packages-grid">'+
    PACKAGES.map(pkg=>'<div class="pkg-card '+(pkg.popular?'featured':'')+'"><div class="pkg-badge '+(pkg.popular?'popular':'')+'">'+(pkg.popular?'PALING POPULER':pkg.name.toUpperCase())+'</div>'+
    '<div class="pkg-price">$'+pkg.price+'<span>/min</span></div><p>ROI harian hingga <strong style="color:var(--primary)">'+pkg.roi+'%</strong> · '+pkg.duration+' hari</p>'+
    '<ul>'+pkg.features.map(f=>'<li>✓ '+f+'</li>').join('')+'</ul>'+
    '<button class="btn '+(pkg.popular?'btn-primary':'btn-outline')+' btn-block" onclick="toast(\'Paket '+pkg.name+' — gunakan wallet untuk aktivasi\',\'info\')">'+(currentUser.activePackage===pkg.name?'✓ Aktif':'Aktifkan')+'</button></div>').join('')+'</div>';
}

function viewWallet() {
  return '<div class="view-header"><div><h1>Wallet</h1><p class="sub">Deposit, withdraw, riwayat</p></div>'+
    '<button class="btn btn-primary" onclick="toast(\'Deposit demo: saldo ditambah\',\'success\');currentUser.balance+=100;navigate(\'wallet\')">+ Deposit</button></div>'+
    '<div class="stats-row"><div class="stat-card"><div class="label">Available</div><div class="value">'+money(currentUser.balance)+'</div></div>'+
    '<div class="stat-card"><div class="label">Equity</div><div class="value">'+money(currentUser.equity)+'</div></div></div>'+
    '<div class="table-wrap"><table><thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>'+
    transactions.map(t=>'<tr><td style="font-family:var(--mono);font-size:12px">'+t.id+'</td><td><span class="tag info">'+t.type+'</span></td><td style="font-family:var(--mono);color:'+(t.amount>=0?'var(--long)':'var(--short)')+'">'+(t.amount>=0?'+':'')+money(t.amount)+'</td><td><span class="tag '+(t.status==='completed'?'success':'warning')+'">'+t.status+'</span></td><td style="font-size:12px">'+t.date+'</td></tr>').join('')+
    '</tbody></table></div>';
}

function viewHistory() {
  return '<div class="view-header"><div><h1>Trade History</h1></div></div><div class="table-wrap"><table><thead><tr><th>Date</th><th>Pair</th><th>Side</th><th>Entry</th><th>Exit</th><th>PnL</th></tr></thead><tbody>'+
    [{d:'2026-11-07',p:'BTCUSDT',s:'long',e:66120,x:67840,pnl:206.4},{d:'2026-11-06',p:'ETHUSDT',s:'long',e:3320,x:3450,pnl:234},{d:'2026-11-05',p:'SOLUSDT',s:'short',e:185.2,x:178.4,pnl:204}].map(t=>
    '<tr><td>'+t.d+'</td><td><strong>'+t.p+'</strong></td><td><span class="tag '+t.s+'">'+t.s.toUpperCase()+'</span></td><td style="font-family:var(--mono)">'+t.e+'</td><td style="font-family:var(--mono)">'+t.x+'</td><td style="color:var(--long)">+'+money(t.pnl)+'</td></tr>').join('')+
    '</tbody></table></div>';
}

function viewReferral() {
  return '<div class="view-header"><div><h1>Referral Network</h1></div></div><div class="stats-row">'+
    '<div class="stat-card"><div class="label">Kode</div><div class="value" style="font-size:16px;font-family:var(--mono)">'+currentUser.referralCode+'</div></div>'+
    '<div class="stat-card"><div class="label">Downline</div><div class="value">12</div></div>'+
    '<div class="stat-card"><div class="label">Bonus</div><div class="value" style="color:var(--long)">'+money(185)+'</div></div></div>'+
    '<div class="card" style="padding:24px"><h3 style="margin-bottom:12px">Link Referral</h3><input class="form-control" readonly value="https://go-trade.app/ref/'+currentUser.referralCode+'" /></div>';
}

function viewNews() {
  return '<div class="view-header"><div><h1>News & Analysis</h1></div></div><div class="grid-2">'+
    NEWS.map(n=>'<div class="card" style="padding:24px"><span class="tag info">'+n.tag+'</span><h3 style="margin:12px 0 8px;font-size:16px">'+n.title+'</h3><p style="font-size:13px;color:var(--text-muted)">'+n.time+'</p></div>').join('')+'</div>';
}

function viewSettings() {
  return '<div class="view-header"><div><h1>Account Settings</h1></div></div><div class="grid-2">'+
    '<div class="card" style="padding:24px"><h3 style="margin-bottom:16px">Profil</h3>'+
    '<div class="form-group"><label>Nama</label><input class="form-control" value="'+currentUser.name+'" /></div>'+
    '<div class="form-group"><label>Email</label><input class="form-control" value="'+currentUser.email+'" disabled /></div>'+
    '<button class="btn btn-primary" onclick="toast(\'Profil disimpan\',\'success\')">Simpan</button></div>'+
    '<div class="card" style="padding:24px"><h3 style="margin-bottom:16px">Keamanan</h3>'+
    '<div class="form-group"><label>Password Baru</label><input class="form-control" type="password" /></div>'+
    '<button class="btn btn-primary" onclick="toast(\'Password diupdate\',\'success\')">Update</button></div></div>';
}

function viewHelp() {
  return '<div class="view-header"><div><h1>Help Center</h1></div></div><div class="grid-2">'+
    [['Bagaimana deposit?','Pilih network, transfer USDT, konfirmasi otomatis.'],['Apa AI Confidence?','Skor 0-100% keyakinan model terhadap setup.'],['ROI paket?','Dihitung harian dari modal paket.']].map(([q,a])=>
    '<div class="card" style="padding:24px"><h3 style="font-size:15px;margin-bottom:10px">'+q+'</h3><p style="font-size:13px;color:var(--text-secondary)">'+a+'</p></div>').join('')+'</div>';
}

function viewAdminOverview() {
  return '<div class="view-header"><div><h1>Admin Overview</h1></div></div><div class="stats-row">'+
    '<div class="stat-card"><div class="label">Members</div><div class="value">'+adminUsers.filter(u=>u.role==='member').length+'</div></div>'+
    '<div class="stat-card"><div class="label">Active Signals</div><div class="value">'+signals.length+'</div></div>'+
    '<div class="stat-card"><div class="label">Pending Deposits</div><div class="value" style="color:var(--warning)">2</div></div>'+
    '<div class="stat-card"><div class="label">AUM</div><div class="value">'+money(adminUsers.reduce((a,u)=>a+u.balance,0))+'</div></div></div>';
}

function viewAdminUsers() {
  return '<div class="view-header"><div><h1>Manage Users</h1></div></div><div class="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Balance</th><th>Status</th></tr></thead><tbody>'+
    adminUsers.map(u=>'<tr><td><strong>'+u.name+'</strong></td><td style="font-size:12px">'+u.email+'</td><td><span class="tag info">'+u.role+'</span></td><td style="font-family:var(--mono)">'+money(u.balance)+'</td><td><span class="tag success">'+u.status+'</span></td></tr>').join('')+
    '</tbody></table></div>';
}

function viewAdminSignals() {
  return '<div class="view-header"><div><h1>Manage Signals</h1></div><button class="btn btn-primary" onclick="signals.unshift(generateSignal());toast(\'Signal dibuat\',\'success\');navigate(\'admin-signals\')">+ Create</button></div>'+
    '<div class="table-wrap"><table><thead><tr><th>Pair</th><th>Side</th><th>Entry</th><th>SL</th><th>Conf</th><th>Status</th></tr></thead><tbody>'+
    signals.slice(0,12).map(s=>'<tr><td><strong>'+s.pair+'</strong></td><td><span class="tag '+s.side+'">'+s.side.toUpperCase()+'</span></td><td style="font-family:var(--mono)">'+s.entry+'</td><td style="font-family:var(--mono)">'+s.sl+'</td><td>'+s.confidence+'%</td><td><span class="tag success">'+s.status+'</span></td></tr>').join('')+
    '</tbody></table></div>';
}

function viewAdminDeposits() {
  return '<div class="view-header"><div><h1>Deposit Approvals</h1></div></div><div class="table-wrap"><table><thead><tr><th>User</th><th>Amount</th><th>Network</th><th>Status</th><th>Actions</th></tr></thead><tbody>'+
    '<tr><td>Andi R.</td><td style="font-family:var(--mono)">'+money(500)+'</td><td>BEP20</td><td><span class="tag warning">pending</span></td><td><button class="btn btn-primary btn-sm" onclick="toast(\'Approved\',\'success\')">Approve</button></td></tr></tbody></table></div>';
}

function viewAdminWithdrawals() {
  return '<div class="view-header"><div><h1>Withdrawal Approvals</h1></div></div><div class="table-wrap"><table><thead><tr><th>User</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody>'+
    '<tr><td>Demo Trader</td><td style="font-family:var(--mono)">'+money(200)+'</td><td><span class="tag warning">pending</span></td><td><button class="btn btn-primary btn-sm" onclick="toast(\'Processed\',\'success\')">Approve</button></td></tr></tbody></table></div>';
}

function viewAdminPackages() {
  return '<div class="view-header"><div><h1>Manage Packages</h1></div></div><div class="packages-grid">'+
    PACKAGES.map(pkg=>'<div class="pkg-card"><div class="pkg-badge">'+pkg.name.toUpperCase()+'</div><div class="pkg-price">$'+pkg.price+'</div><p>ROI '+pkg.roi+'%/hari · '+pkg.duration+' hari</p><button class="btn btn-outline btn-block" onclick="toast(\'Edit '+pkg.name+'\',\'info\')">Edit</button></div>').join('')+'</div>';
}

function viewAdminNews() {
  return '<div class="view-header"><div><h1>News & Broadcast</h1></div><button class="btn btn-primary" onclick="toast(\'Broadcast terkirim\',\'success\')">📢 Broadcast</button></div>'+
    '<div class="card" style="padding:24px"><h3 style="margin-bottom:12px">Publish News</h3><div class="form-group"><label>Judul</label><input class="form-control" /></div><button class="btn btn-primary" onclick="toast(\'Published\',\'success\')">Publish</button></div>';
}

function viewAdminSettings() {
  return '<div class="view-header"><div><h1>System Settings</h1></div></div><div class="grid-2">'+
    '<div class="card" style="padding:24px"><h3 style="margin-bottom:16px">Deposit Wallet</h3><div class="form-group"><label>BEP20</label><input class="form-control" value="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1" /></div><button class="btn btn-primary" onclick="toast(\'Saved\',\'success\')">Simpan</button></div>'+
    '<div class="card" style="padding:24px"><h3 style="margin-bottom:16px">Config</h3><div class="form-group"><label>Min Deposit</label><input class="form-control" type="number" value="50" /></div><button class="btn btn-primary" onclick="toast(\'Saved\',\'success\')">Simpan</button></div></div>';
}
