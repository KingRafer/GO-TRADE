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
  currentUser = { ...DEFAULT_USER, role };
  if (role === 'admin') {
    currentUser.name = 'Admin GO TRADE';
    currentUser.email = 'admin@go-trade.app';
  }
  const landing = $('#landing');
  const app = $('#app');
  if (landing) landing.style.display = 'none';
  if (app) app.style.display = 'flex';
  document.body.classList.add('app-mode', 'light'); document.body.classList.remove('dark');
  renderSidebar();
  navigate(role === 'admin' ? 'admin-overview' : 'dashboard');
  startLiveUpdates();
  toast('Masuk sebagai ' + (role === 'admin' ? 'Admin' : 'Member') + ' Demo', 'success');
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
  { section: 'WORKSPACE' },
  { id: 'dashboard', icon: '◈', label: 'Dashboard' },
  { id: 'signals', icon: '⚡', label: 'Signals' },
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
  { id: 'settings', icon: '⚙️', label: 'Account settings' },
  { id: 'charts', icon: '📊', label: 'Live Charts' },
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
    if (item.section) return '<div class="nav-section">' + item.section + '</div>';
    return '<div class="nav-item ' + (currentView === item.id ? 'active' : '') + '" data-view="' + item.id + '">' +
      '<span class="icon">' + item.icon + '</span> ' + item.label + '</div>';
  }).join('');
  nav.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigate(el.dataset.view));
  });
  const roleLabel = $('#roleLabel');
  if (roleLabel) roleLabel.textContent = currentRole === 'admin' ? 'ADMIN CENTER' : 'WORKSPACE';
  if (currentUser) {
    const initials = currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2);
    ['userName', 'footName'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = currentUser.name; });
    ['userAvatar', 'topAvatar', 'footAvatar'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = initials; });
    const st = document.getElementById('userStatus');
    if (st) st.textContent = currentUser.verified ? 'Verified member' : 'Unverified';
  }
}

function navigate(viewId) {
  currentView = viewId;
  $$('.nav-item').forEach(el => el.classList.toggle('active', el.dataset.view === viewId));
  const labels = {
    dashboard: 'Dashboard', signals: 'Signals', charts: 'Live Charts', portfolio: 'Portfolio',
    packages: 'Auto Trading', wallet: 'Wallet', deposit: 'Deposit', withdrawal: 'Withdrawal',
    history: 'Trade History', referral: 'Network & referral', bonus: 'Bonus Tracking',
    notifications: 'Notifications', news: 'News', settings: 'Account settings', help: 'Help Center',
    'admin-overview': 'Admin Overview', 'admin-users': 'Manage Users', 'admin-signals': 'Manage Signals',
    'admin-deposits': 'Deposit Approvals', 'admin-withdrawals': 'Withdrawal Approvals',
    'admin-packages': 'Manage Packages', 'admin-news': 'News & Broadcast', 'admin-settings': 'System Settings',
  };
  const bc = $('#breadcrumb');
  if (bc) bc.textContent = labels[viewId] || viewId;
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
    const reply = AI_REPLIES[Math.floor(Math.random() * AI_REPLIES.length)];
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
  const themeBtn = $('#themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
  const menuBtn = $('#menuBtn');
  if (menuBtn) menuBtn.addEventListener('click', () => { const s = $('#sidebar'); if (s) s.classList.toggle('open'); });
  const notifBtn = $('#notifBtn');
  if (notifBtn) notifBtn.addEventListener('click', () => {
    const list = typeof gtGetNotifs === 'function' ? gtGetNotifs() : NOTIFS;
    openModal('Notifikasi', list.map(n =>
      '<div style="padding:10px 0;border-bottom:1px solid var(--border);display:flex;gap:10px">' +
      '<span style="width:8px;height:8px;border-radius:50%;background:' + (n.read ? 'transparent' : 'var(--primary)') + ';margin-top:6px"></span>' +
      '<div><div style="font-size:13px">' + n.text + '</div><div style="font-size:11px;color:var(--text-muted)">' + n.time + '</div></div></div>'
    ).join('') + '<div style="margin-top:12px"><button class="btn btn-ghost btn-sm" onclick="if(typeof gtMarkNotifsRead===\'function\')gtMarkNotifsRead();closeModal();toast(\'Semua ditandai dibaca\',\'info\')">Tandai semua dibaca</button></div>');
  });
});
