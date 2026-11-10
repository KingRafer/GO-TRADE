/* GO TRADE — Core Application Logic */
let currentUser = null;
let currentRole = 'member';
let currentView = 'dashboard';
let liveInterval = null;

function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
function money(n) {
  return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function toast(msg, type = 'info') {
  const root = $('#toastRoot');
  if (!root) return;
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  root.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
function fmtTime(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return Math.floor(diff) + 's lalu';
  if (diff < 3600) return Math.floor(diff / 60) + 'm lalu';
  if (diff < 86400) return Math.floor(diff / 3600) + 'j lalu';
  return d.toLocaleDateString('id-ID');
}

function enterWorkspace(role = 'member') { enterDemo(role); }

function enterDemo(role = 'member') {
  currentRole = role;
  currentUser = { ...DEFAULT_USER, role }; if (role === "member") currentUser.name = "satrio";
  if (role === 'admin') {
    currentUser.name = 'Admin GO TRADE';
    currentUser.email = 'admin@go-trade.app';
  }
  const landing = $('#landing');
  const app = $('#app');
  if (landing) landing.style.display = 'none';
  if (app) app.style.display = 'grid'; // terminal uses CSS grid
  // Aurora default = soft light workspace
  document.body.classList.add('app-mode', 'light');
  const themeBtn = $('#themeBtn');
  if (themeBtn) themeBtn.textContent = '☀';
  renderSidebar();
  renderWatchlist();
  updateTopMetrics();
  setupTerminalChrome();
  navigate(role === 'admin' ? 'admin-overview' : 'dashboard');
  startLiveUpdates();
  toast('Masuk sebagai ' + (role === 'admin' ? 'Admin' : 'Member') + ' Demo', 'success');
  if (typeof gtLogActivity === 'function') gtLogActivity('login', role, 'demo workspace');
}

function logout() {
  if (typeof gtSignOut === 'function') gtSignOut();
  currentUser = null;
  const app = $('#app');
  const landing = $('#landing');
  if (app) app.style.display = 'none';
  if (landing) landing.style.display = 'block';
  document.body.classList.remove('app-mode');
  history.replaceState({}, '', location.pathname);
  toast('Berhasil keluar', 'info');
}

const MEMBER_NAV = [
  { section: 'TERMINAL' },
  { id: 'terminal', icon: '▣', label: 'Trading Terminal', tag: 'NEW' },
  { id: 'charts', icon: '📊', label: 'Live Charts' },
  { section: 'WORKSPACE' },
  { id: 'dashboard', icon: '◈', label: 'Dashboard' },
  { id: 'signals', icon: '⚡', label: 'AI Signals' },
  { id: 'packages', icon: '📦', label: 'Auto Trading' },
  { id: 'wallet', icon: '💰', label: 'Wallet' },
  { id: 'deposit', icon: '↓', label: 'Deposit' },
  { id: 'withdrawal', icon: '↑', label: 'Withdrawal' },
  { section: 'GROWTH' },
  { id: 'referral', icon: '🌐', label: 'Network' },
  { id: 'bonus', icon: '✦', label: 'Bonus Tracking' },
  { id: 'history', icon: '📋', label: 'Trade History' },
  { id: 'notifications', icon: '🔔', label: 'Notifications' },
  { id: 'news', icon: '📰', label: 'News' },
  { id: 'help', icon: '❓', label: 'Help Center' },
  { id: 'settings', icon: '⚙️', label: 'Account Settings' },
];

const ADMIN_NAV = [
  { section: 'Admin' },
  { id: 'admin-overview', icon: '◈', label: 'Overview' },
  { id: 'admin-users', icon: '👥', label: 'Manage Users' },
  { id: 'admin-signals', icon: '⚡', label: 'Manage Signals' },
  { id: 'admin-deposits', icon: '💰', label: 'Deposits' },
  { id: 'admin-withdrawals', icon: '🏦', label: 'Withdrawals' },
  { id: 'admin-packages', icon: '📦', label: 'Packages' },
  { id: 'admin-news', icon: '📰', label: 'News & Broadcast' },
  { id: 'admin-settings', icon: '⚙️', label: 'System Settings' },
];

function renderSidebar() {
  const nav = $('#sidebarNav');
  if (!nav) return;
  const items = currentRole === 'admin' ? ADMIN_NAV : MEMBER_NAV;
  nav.innerHTML = items.map(item => {
    if (item.section) return '<div class="t-nav-section">' + item.section + '</div>';
    const tag = item.tag ? '<span class="tag">' + item.tag + '</span>' : '';
    return '<div class="t-nav-item ' + (currentView === item.id ? 'active' : '') + '" data-view="' + item.id + '">' +
      '<span class="icon">' + item.icon + '</span> ' + item.label + tag + '</div>';
  }).join('');
  nav.querySelectorAll('.t-nav-item').forEach(el => {
    el.addEventListener('click', () => {
      navigate(el.dataset.view);
      // close mobile sidebar
      const sb = $('#sidebar');
      const ov = $('#sidebarOverlay');
      if (sb) sb.classList.remove('open');
      if (ov) ov.classList.remove('show');
    });
  });
  const roleLabel = $('#roleLabel');
  if (roleLabel) roleLabel.textContent = currentRole === 'admin' ? 'ADMIN CENTER' : 'TERMINAL';
  if (currentUser) {
    const initials = currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    ['userName', 'topUserName'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = currentUser.name; });
    ['userAvatar', 'topAvatar'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = initials; });
    const st = document.getElementById('userStatus');
    if (st) st.textContent = currentUser.verified !== false ? 'Verified member' : 'Unverified';
  }
}

function navigate(viewId) {
  currentView = viewId;
  $$('.t-nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === viewId));
  // terminal view = full-bleed panels (Step 2+)
  const vc = $('#viewRoot');
  if (vc) vc.classList.toggle('terminal-view', viewId === 'terminal');
  if (typeof renderView === 'function') renderView(viewId);
}

function startLiveUpdates() {
  if (liveInterval) clearInterval(liveInterval);
  setInterval(() => { if (typeof fetchRealTickers === 'function') fetchRealTickers().catch(() => {}); }, 12000);
  liveInterval = setInterval(() => {
    if (typeof tickPrices === 'function') tickPrices();
    if (typeof updateLiveCandle === 'function') updateLiveCandle();
    renderTicker();
    if (Math.random() < 0.07 && typeof generateSignal === 'function') {
      signals.unshift(generateSignal());
      if (signals.length > 25) signals.pop();
      if (currentView === 'signals') renderSignalList('fullSignalList', 15);
      if (currentView === 'dashboard') renderSignalList('dashSignals', 4);
    }
  }, 1600);
}

function renderTicker() {
  const el = $('#ticker');
  if (!el || typeof marketState === 'undefined') return;
  const items = Object.keys(marketState).map(p => {
    const m = marketState[p];
    const chg = parseFloat(m.change24h);
    const dec = (PAIRS[p] && PAIRS[p].decimals) || 2;
    return '<span class="ticker-item"><span class="sym">' + p.replace('USDT', '') + '</span> <span>$' +
      m.price.toLocaleString('en-US', { maximumFractionDigits: dec }) + '</span> <span class="' +
      (chg >= 0 ? 'up' : 'down') + '">' + (chg >= 0 ? '▲' : '▼') + ' ' + Math.abs(chg).toFixed(2) + '%</span></span>';
  }).join('');
  el.innerHTML = items + items;
}

function renderSignalList(containerId = 'signalList', limit = 6) {
  const el = document.getElementById(containerId);
  if (!el || typeof signals === 'undefined') return;
  el.innerHTML = signals.slice(0, limit).map(s =>
    '<div class="signal-item"><div class="signal-top"><span class="signal-pair">' + s.pair +
    '</span><span class="signal-side ' + s.side + '">' + s.side.toUpperCase() + '</span></div>' +
    '<div class="signal-meta"><div><span>Entry</span><strong>' + s.entry + '</strong></div>' +
    '<div><span>SL</span><strong>' + s.sl + '</strong></div><div><span>TP1</span><strong>' + s.tp1 + '</strong></div></div>' +
    '<div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">' + s.reason + '</div>' +
    '<div class="confidence"><div class="confidence-bar" style="width:' + s.confidence + '%"></div></div>' +
    '<div class="signal-time">' + s.confidence + '% confidence · ' + s.timeframe + ' · R:R 1:' + s.rr + ' · ' + fmtTime(s.createdAt) + '</div></div>'
  ).join('');
}

function toggleTheme() {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  const btn = $('#themeBtn');
  if (btn) btn.textContent = isLight ? '☀' : '☾';
  if (currentView === 'charts' || $('#mainChart')) {
    setTimeout(() => { if ($('#mainChart') || $('#workspaceChart')) initMainChart(currentView === 'charts' ? 'workspaceChart' : 'mainChart'); }, 50);
  }
}

const AI_REPLIES = [
  'Berdasarkan analisis multi-timeframe, BTC sedang di fase accumulation. Support kuat di area demand.',
  'Confidence signal ETH saat ini tinggi. Confluence order block H4 dan FVG M15.',
  'Portfolio Anda long-biased. Correlation BTC-ETH tinggi. Pertimbangkan hedge jika volatility naik.',
  'Trailing stop di paket Growth memakai ATR(14) × 1.5 untuk mengunci profit.',
  'Market regime: Trending. Fokus breakout dan trend-following setups.',
  'Tunggu konfirmasi candle close sebelum entry agresif. Risk management prioritas utama.',
];

function getAIContextReply(msg) {
  const pair = (typeof activeTerminalPair !== 'undefined' && activeTerminalPair) || currentPair || 'BTCUSDT';
  const m = (typeof marketState !== 'undefined' && marketState[pair]) || null;
  const q = (msg || '').toLowerCase();
  if (m && (q.includes('harga') || q.includes('price') || q.includes('btc') || q.includes('eth') || q.includes(pair.slice(0, 3).toLowerCase()))) {
    const chg = parseFloat(m.change24h) || 0;
    return pair.replace('USDT', '') + ' sekarang $' + Number(m.price).toLocaleString('en-US') +
      ' (' + (chg >= 0 ? '+' : '') + chg.toFixed(2) + '% 24h). High $' + Number(m.high24).toLocaleString('en-US') +
      ' · Low $' + Number(m.low24).toLocaleString('en-US') + '.';
  }
  if (q.includes('posisi') || q.includes('position') || q.includes('pnl')) {
    if (typeof positions !== 'undefined' && positions.length) {
      return 'Anda punya ' + positions.length + ' posisi: ' +
        positions.map(p => p.pair.replace('USDT', '') + ' ' + p.side + ' PnL ' + (p.pnl >= 0 ? '+' : '') + p.pnl.toFixed(2)).join(' · ') + '.';
    }
    return 'Belum ada posisi terbuka. Buka di Trading Terminal dengan Market/Limit order.';
  }
  if (q.includes('signal') || q.includes('sinyal')) {
    const s = (typeof signals !== 'undefined' && signals[0]) ? signals[0] : null;
    if (s) return 'Sinyal terbaru: ' + s.pair + ' ' + String(s.side).toUpperCase() + ' confidence ' + s.confidence + '% · ' + (s.reason || '');
    return 'Belum ada sinyal aktif di feed.';
  }
  if (q.includes('paket') || q.includes('package') || q.includes('roi')) {
    const pkg = (currentUser && currentUser.activePackage) || 'Growth';
    return 'Paket aktif: ' + pkg + '. ROI harian mengikuti setting Admin. Kelola di dock Auto Package atau halaman Packages.';
  }
  if (q.includes('bantuan') || q.includes('help') || q.includes('shortcut')) {
    return 'Tekan ? untuk daftar keyboard shortcuts. T=Terminal, B=Buy, V=Sell, O=Positions, L=Dual chart, A=AI panel.';
  }
  return AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
}

function setupAI() {
  const toggle = $('#aiToggle');
  const panel = $('#aiPanel');
  if (toggle && panel) {
    toggle.addEventListener('click', () => {
      panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    });
  }
  const send = $('#aiSend');
  const input = $('#aiInput');
  if (send) send.addEventListener('click', sendAI);
  if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') sendAI(); });
}

function sendAI() {
  const input = $('#aiInput');
  const msg = input && input.value.trim();
  if (!msg) return;
  const box = $('#aiMessages');
  if (!box) return;
  box.innerHTML += '<div class="ai-msg user">' + msg + '</div>';
  input.value = '';
  box.scrollTop = box.scrollHeight;
  setTimeout(() => {
    const reply = typeof getAIContextReply === 'function' ? getAIContextReply(msg) : AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
    box.innerHTML += '<div class="ai-msg bot">' + reply + '</div>';
    box.scrollTop = box.scrollHeight;
  }, 600 + Math.random() * 800);
}

function openModal(title, bodyHtml, actions = []) {
  const overlay = $('#modalOverlay');
  const m = $('#modal');
  if (!overlay || !m) return;
  overlay.style.display = 'block';
  m.style.display = 'block';
  m.innerHTML = '<h3>' + title + '</h3><div>' + bodyHtml + '</div><div class="modal-actions">' +
    actions.map(a => '<button class="btn ' + (a.class || 'btn-primary') + '" data-action="' + a.id + '">' + a.label + '</button>').join('') +
    '<button class="btn btn-ghost" id="modalClose">Tutup</button></div>';
  $('#modalClose').onclick = closeModal;
  overlay.onclick = closeModal;
  actions.forEach(a => {
    const btn = m.querySelector('[data-action="' + a.id + '"]');
    if (btn) btn.addEventListener('click', () => { if (a.onClick) a.onClick(); closeModal(); });
  });
}
function closeModal() {
  const m = $('#modal');
  const o = $('#modalOverlay');
  if (m) m.style.display = 'none';
  if (o) o.style.display = 'none';
}

/* ========== TERMINAL CHROME (Step 1) ========== */
let activeTerminalPair = 'BTCUSDT';

function renderWatchlist() {
  const body = $('#watchlistBody');
  if (!body || typeof marketState === 'undefined') return;
  const symbols = typeof SYMBOLS !== 'undefined' ? SYMBOLS : Object.keys(marketState);
  body.innerHTML = symbols.map(sym => {
    const m = marketState[sym] || { price: 0, change24h: 0 };
    const chg = parseFloat(m.change24h) || 0;
    const dec = (typeof PAIRS !== 'undefined' && PAIRS[sym]) ? PAIRS[sym].decimals : 2;
    const short = sym.replace('USDT', '');
    const active = activeTerminalPair === sym ? ' active' : '';
    return '<div class="t-wl-item' + active + '" data-pair="' + sym + '">' +
      '<span class="sym">' + short + '/USDT</span>' +
      '<span class="price">$' + Number(m.price).toLocaleString('en-US', { maximumFractionDigits: dec }) + '</span>' +
      '<span class="chg ' + (chg >= 0 ? 'up' : 'down') + '">' + (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%</span>' +
      '</div>';
  }).join('');
  body.querySelectorAll('.t-wl-item').forEach(el => {
    el.addEventListener('click', () => {
      activeTerminalPair = el.dataset.pair;
      updateActivePairUI();
      renderWatchlist();
      // If on charts/terminal, refresh chart + order book
      if (typeof currentPair !== 'undefined') currentPair = activeTerminalPair;
      if ((currentView === 'charts' || currentView === 'terminal') && typeof initMainChart === 'function') {
        setTimeout(() => {
          const chartId = currentView === 'charts' ? 'workspaceChart' : 'terminalChart';
          if (document.getElementById(chartId)) initMainChart(chartId);
          if (currentView === 'terminal') {
            if (typeof generateOrderBook === 'function') generateOrderBook(activeTerminalPair);
            if (typeof seedRecentTrades === 'function') seedRecentTrades(activeTerminalPair);
            if (typeof renderOrderBookUI === 'function') renderOrderBookUI();
            if (typeof renderRecentTradesUI === 'function') renderRecentTradesUI();
            if (typeof updateTerminalPriceBox === 'function') updateTerminalPriceBox();
          }
        }, 40);
      }
    });
  });
}

function updateActivePairUI() {
  const m = (typeof marketState !== 'undefined' && marketState[activeTerminalPair]) || { price: 0, change24h: 0 };
  const chg = parseFloat(m.change24h) || 0;
  const nameEl = $('#activePairName');
  const chgEl = $('#activePairChg');
  if (nameEl) nameEl.textContent = activeTerminalPair.replace('USDT', '/USDT');
  if (chgEl) {
    chgEl.textContent = (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%';
    chgEl.className = 'pair-change ' + (chg >= 0 ? 'up' : 'down');
  }
}

function updateTopMetrics() {
  const u = currentUser || {};
  const equity = u.equity != null ? u.equity : (u.balance || 1250.5);
  const balance = u.balance != null ? u.balance : 1250.5;
  const pnl = u.pnlToday != null ? u.pnlToday : 31.5;
  const pkg = u.activePackage || 'Growth';

  const set = (id, text, cls) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    if (cls) el.className = 'value mono ' + cls;
  };
  set('mEquity', money(equity));
  set('mBalance', money(balance));
  set('mPnl', (pnl >= 0 ? '+' : '') + money(pnl).replace('$', '$'), pnl >= 0 ? 'up' : 'down');
  const pkgEl = document.getElementById('mPackage');
  if (pkgEl) pkgEl.textContent = pkg;
  updateActivePairUI();
}

function setupTerminalChrome() {
  // Bottom bar tabs + expand
  const bottom = $('#bottomBar');
  const toggle = $('#bottomToggle');
  if (toggle && bottom) {
    toggle.onclick = () => {
      bottom.classList.toggle('expanded');
      toggle.textContent = bottom.classList.contains('expanded') ? '▾' : '▴';
    };
  }
  $$('.t-bottom-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.t-bottom-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const bottom = $('#bottomBar');
      if (bottom && !bottom.classList.contains('expanded')) {
        bottom.classList.add('expanded');
        const toggle = $('#bottomToggle');
        if (toggle) toggle.textContent = '▾';
      }
      if (typeof renderBottomPanel === 'function') renderBottomPanel(tab.dataset.tab);
    });
  });

  // Mobile sidebar
  const menuBtn = $('#menuBtn');
  const sidebar = $('#sidebar');
  const overlay = $('#sidebarOverlay');
  if (menuBtn && sidebar) {
    menuBtn.onclick = () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('show', sidebar.classList.contains('open'));
    };
  }
  if (overlay) {
    overlay.onclick = () => {
      if (sidebar) sidebar.classList.remove('open');
      overlay.classList.remove('show');
    };
  }

  // Theme toggle already wired; ensure icon correct
  const themeBtn = $('#themeBtn');
  if (themeBtn) {
    themeBtn.onclick = () => {
      document.body.classList.toggle('light');
      const isLight = document.body.classList.contains('light');
      themeBtn.textContent = isLight ? '☀' : '☾';
    };
  }
}

// Keep watchlist + metrics + terminal panels in sync with live ticks
function startLiveUpdates() {
  if (liveInterval) clearInterval(liveInterval);
  setInterval(() => { if (typeof fetchRealTickers === 'function') fetchRealTickers().catch(() => {}); }, 12000);
  liveInterval = setInterval(() => {
    if (typeof tickPrices === 'function') tickPrices();
    if (typeof updateLiveCandle === 'function') updateLiveCandle();
    renderTicker();
    if (document.body.classList.contains('app-mode')) {
      renderWatchlist();
      updateActivePairUI();
      updateTopMetrics();
    }
    if (currentView === 'terminal') {
      if (typeof tickOrderBookAndTrades === 'function') tickOrderBookAndTrades();
      if (typeof tickOpenOrders === 'function') tickOpenOrders();
      if (typeof renderOrderBookUI === 'function') renderOrderBookUI();
      if (typeof renderRecentTradesUI === 'function') renderRecentTradesUI();
      if (typeof updateTerminalPriceBox === 'function') updateTerminalPriceBox();
      if (typeof updateOrderCost === 'function') updateOrderCost();
      // throttle positions table refresh (~ every 3 ticks)
      if (!window.__posTick) window.__posTick = 0;
      window.__posTick++;
      const bottom = document.getElementById('bottomBar');
      if (bottom && bottom.classList.contains('expanded') && window.__posTick % 3 === 0) {
        const activeTab = document.querySelector('.t-bottom-tab.active')?.dataset.tab || 'positions';
        if (activeTab === 'positions' && typeof renderBottomPanel === 'function') renderBottomPanel('positions');
        if (typeof updateTopMetrics === 'function') updateTopMetrics();
      }
      const pc = document.getElementById('posCount');
      const oc = document.getElementById('ordCount');
      if (pc && typeof positions !== 'undefined') pc.textContent = positions.length;
      if (oc && typeof openOrders !== 'undefined') oc.textContent = openOrders.length;
    }
    if (Math.random() < 0.07 && typeof generateSignal === 'function') {
      signals.unshift(generateSignal());
      if (signals.length > 25) signals.pop();
      if (currentView === 'signals') renderSignalList('fullSignalList', 15);
      if (currentView === 'dashboard') renderSignalList('dashSignals', 4);
    }
  }, 1600);
}

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof initSupabase === 'function') initSupabase();
  if (typeof fetchRealTickers === 'function') await fetchRealTickers().catch(() => {});
  renderTicker();
  renderSignalList();
  setTimeout(() => { if ($('#mainChart')) initMainChart('mainChart'); }, 400);

  setInterval(() => {
    if (typeof tickPrices === 'function') tickPrices();
    if (typeof updateLiveCandle === 'function') updateLiveCandle();
    renderTicker();
    if ($('#signalList') && Math.random() < 0.06 && typeof generateSignal === 'function') {
      signals.unshift(generateSignal());
      renderSignalList();
    }
  }, 2000);
  setInterval(() => { if (typeof fetchRealTickers === 'function') fetchRealTickers().catch(() => {}); }, 15000);

  const params = new URLSearchParams(location.search);
  if (params.get('workspace') === '1') {
    const role = params.get('role') || 'member';
    if (typeof gtRestoreSession === 'function') {
      const u = await gtRestoreSession();
      if (u) { currentUser = u; currentRole = u.role || role; enterWorkspace(currentRole); }
      else enterDemo(role);
    } else enterDemo(role);
  }

  setupAI();
  setupKeyboardShortcuts();
  const notifBtn = $('#notifBtn');
  if (notifBtn) notifBtn.addEventListener('click', () => {
    const list = typeof gtGetNotifs === 'function' ? gtGetNotifs() : (typeof NOTIFS !== 'undefined' ? NOTIFS : []);
    openModal('Notifikasi', list.map(n =>
      '<div style="padding:10px 0;border-bottom:1px solid var(--border);display:flex;gap:10px">' +
      '<span style="width:8px;height:8px;border-radius:50%;background:' + (n.read ? 'transparent' : 'var(--primary)') + ';margin-top:6px"></span>' +
      '<div><div style="font-size:13px">' + n.text + '</div><div style="font-size:11px;color:var(--text-muted)">' + n.time + '</div></div></div>'
    ).join('') + '<div style="margin-top:12px"><button class="btn btn-ghost btn-sm" onclick="if(typeof gtMarkNotifsRead===\'function\')gtMarkNotifsRead();closeModal();toast(\'Semua ditandai dibaca\',\'info\')">Tandai semua dibaca</button></div>');
  });
});

/* ========== Step 5: Keyboard Shortcuts + Dual Chart + Polish ========== */
function setupKeyboardShortcuts() {
  if (window.__gtKeysBound) return;
  window.__gtKeysBound = true;
  document.addEventListener('keydown', (e) => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
    if (!document.body.classList.contains('app-mode')) return;

    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault();
      showShortcutHelp();
      return;
    }
    if (e.key === 'Escape') {
      closeModal();
      const ai = $('#aiPanel');
      if (ai) ai.style.display = 'none';
      const bottom = $('#bottomBar');
      if (bottom && bottom.classList.contains('expanded')) {
        bottom.classList.remove('expanded');
        const t = $('#bottomToggle');
        if (t) t.textContent = '▴';
      }
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    const key = e.key.toLowerCase();
    if (key === 't') { navigate('terminal'); return; }
    if (key === 'd') { navigate('dashboard'); return; }
    if (key === 's') { navigate('signals'); return; }
    if (key === 'w') { navigate('wallet'); return; }
    if (key === 'p') { navigate('packages'); return; }
    if (key === 'c') { navigate('charts'); return; }

    if (currentView !== 'terminal') return;

    if (key >= '1' && key <= '8' && typeof SYMBOLS !== 'undefined') {
      const idx = parseInt(key, 10) - 1;
      if (SYMBOLS[idx]) {
        activeTerminalPair = SYMBOLS[idx];
        currentPair = SYMBOLS[idx];
        if (typeof renderWatchlist === 'function') renderWatchlist();
        if (typeof updateActivePairUI === 'function') updateActivePairUI();
        if (typeof initMainChart === 'function' && document.getElementById('terminalChart')) initMainChart('terminalChart');
        if (typeof generateOrderBook === 'function') {
          generateOrderBook(activeTerminalPair);
          if (typeof seedRecentTrades === 'function') seedRecentTrades(activeTerminalPair);
          if (typeof renderOrderBookUI === 'function') renderOrderBookUI();
          if (typeof renderRecentTradesUI === 'function') renderRecentTradesUI();
          if (typeof updateTerminalPriceBox === 'function') updateTerminalPriceBox();
        }
      }
      return;
    }
    if (key === 'b') {
      const btn = document.querySelector('.ord-side[data-side="long"]');
      if (btn) btn.click();
      return;
    }
    if (key === 'v') {
      const btn = document.querySelector('.ord-side[data-side="short"]');
      if (btn) btn.click();
      return;
    }
    if (key === 'o') {
      const tab = document.querySelector('.t-bottom-tab[data-tab="positions"]');
      if (tab) tab.click();
      return;
    }
    if (key === 'a') {
      const panel = $('#aiPanel');
      if (panel) panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
      return;
    }
    if (key === 'l') {
      toggleDualChart();
      return;
    }
  });
}

function showShortcutHelp() {
  openModal('Keyboard Shortcuts', `
    <div class="shortcut-grid">
      <div><kbd>T</kbd> Trading Terminal</div>
      <div><kbd>D</kbd> Dashboard</div>
      <div><kbd>S</kbd> Signals</div>
      <div><kbd>P</kbd> Packages</div>
      <div><kbd>W</kbd> Wallet</div>
      <div><kbd>C</kbd> Live Charts</div>
      <div><kbd>1</kbd>–<kbd>8</kbd> Pair watchlist</div>
      <div><kbd>B</kbd> Buy / Long</div>
      <div><kbd>V</kbd> Sell / Short</div>
      <div><kbd>O</kbd> Expand Positions</div>
      <div><kbd>A</kbd> AI Coach</div>
      <div><kbd>L</kbd> Dual chart layout</div>
      <div><kbd>?</kbd> Bantuan ini</div>
      <div><kbd>Esc</kbd> Tutup panel</div>
    </div>
    <p style="margin-top:12px;font-size:12px;color:var(--text-muted)">Aktif di workspace · nonaktif saat fokus di input</p>
  `);
}

let dualChartOn = false;
function toggleDualChart() {
  if (currentView !== 'terminal') {
    toast('Dual chart hanya di Trading Terminal', 'info');
    return;
  }
  const tradeBtn = document.querySelector('.dock-btn[data-dock="trading"]');
  if (tradeBtn && !tradeBtn.classList.contains('active')) tradeBtn.click();

  dualChartOn = !dualChartOn;
  let dual = document.getElementById('terminalChartDual');
  const main = document.getElementById('terminalChart');
  if (dualChartOn) {
    if (!dual && main && main.parentNode) {
      dual = document.createElement('div');
      dual.id = 'terminalChartDual';
      dual.className = 'term-chart term-chart-dual';
      main.parentNode.insertBefore(dual, main.nextSibling);
    }
    if (dual) dual.style.display = 'block';
    if (main) main.classList.add('term-chart-split');
    const pair = activeTerminalPair || currentPair || 'BTCUSDT';
    const altTf = (currentTf === '5m' || currentTf === '1m') ? '1h' : '15m';
    setTimeout(() => {
      initDualChart('terminalChartDual', pair, altTf);
      if (typeof initMainChart === 'function') initMainChart('terminalChart');
    }, 60);
    toast('Dual chart ON · TF sekunder: ' + altTf, 'success');
  } else {
    if (dual) dual.style.display = 'none';
    if (main) main.classList.remove('term-chart-split');
    setTimeout(() => { if (typeof initMainChart === 'function') initMainChart('terminalChart'); }, 40);
    toast('Dual chart OFF', 'info');
  }
}

function initDualChart(containerId, pair, tf) {
  const el = document.getElementById(containerId);
  if (!el || typeof LightweightCharts === 'undefined') return;
  el.innerHTML = '';
  const th = typeof getChartTheme === 'function' ? getChartTheme() : { bg: '#0b0e14', text: '#8b9bb4', grid: '#1a2030', border: '#1e2636' };
  const chart = LightweightCharts.createChart(el, {
    width: el.clientWidth,
    height: el.clientHeight || 200,
    layout: { background: { type: 'solid', color: th.bg }, textColor: th.text, fontFamily: 'Inter, system-ui, sans-serif' },
    grid: { vertLines: { color: th.grid }, horzLines: { color: th.grid } },
    rightPriceScale: { borderColor: th.border },
    timeScale: { borderColor: th.border, timeVisible: true },
  });
  const series = chart.addCandlestickSeries({
    upColor: '#10b981', downColor: '#ef4444',
    borderUpColor: '#10b981', borderDownColor: '#ef4444',
    wickUpColor: '#10b981', wickDownColor: '#ef4444',
  });
  if (typeof fetchKlines === 'function') {
    fetchKlines(pair, tf, 120).then(candles => {
      if (candles && candles.length) {
        series.setData(candles.map(c => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })));
        chart.timeScale().fitContent();
      }
    });
  }
  new ResizeObserver(() => {
    chart.applyOptions({ width: el.clientWidth, height: el.clientHeight || 200 });
  }).observe(el);
}
