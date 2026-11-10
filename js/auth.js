/* ============================================================
   GO TRADE — Auth (Supabase + local fallback)
   ============================================================ */
let sb = null;
let authReady = false;

/** Demo-only one-way token — not for production auth */
function gtHashPass(email, password) {
  try {
    return btoa(unescape(encodeURIComponent(String(email).toLowerCase() + '|' + String(password))));
  } catch (_) {
    return String(password).length + ':' + String(email).length;
  }
}

function initSupabase() {
  if (typeof supabase === 'undefined' || !window.GT_CONFIG?.supabase?.url) {
    console.warn('Supabase SDK or config missing — using local auth');
    return null;
  }
  try {
    sb = supabase.createClient(GT_CONFIG.supabase.url, GT_CONFIG.supabase.anonKey);
    return sb;
  } catch (e) {
    console.warn('Supabase init failed', e);
    return null;
  }
}

async function gtSignUp(email, password, name) {
  if (sb) {
    try {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { name, role: 'member' } }
      });
      if (error) throw error;
      if (data.user) {
        await sb.from('profiles').upsert({
          id: data.user.id,
          email,
          name,
          role: 'member',
          wallet_balance: 0,
          referral_code: 'GT' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        });
      }
      return { ok: true, user: data.user, mode: 'supabase' };
    } catch (e) {
      console.warn('Supabase signup failed, fallback local', e.message);
    }
  }
  const users = JSON.parse(localStorage.getItem('gt_users') || '[]');
  if (users.find(u => u.email === email)) {
    return { ok: false, error: 'Email sudah terdaftar' };
  }
  const user = {
    id: 'local-' + Date.now(),
    email,
    name,
    passToken: gtHashPass(email, password),
    role: 'member',
    balance: 100,
    equity: 100,
    pnlToday: 0,
    pnlTotal: 0,
    activePackage: null,
    verified: false,
    referralCode: 'GT' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    joinedAt: new Date().toISOString().slice(0, 10),
  };
  users.push(user);
  localStorage.setItem('gt_users', JSON.stringify(users));
  localStorage.setItem('gt_session', JSON.stringify({ email, role: 'member' }));
  return { ok: true, user, mode: 'local' };
}

async function gtSignIn(email, password) {
  if (sb) {
    try {
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      let profile = null;
      try {
        const { data: p } = await sb.from('profiles').select('*').eq('id', data.user.id).single();
        profile = p;
      } catch (_) {}
      const user = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata?.name || email.split('@')[0],
        role: profile?.role || data.user.user_metadata?.role || 'member',
        balance: profile?.wallet_balance ?? 0,
        equity: profile?.wallet_balance ?? 0,
        pnlToday: 0,
        pnlTotal: 0,
        activePackage: profile?.active_package || null,
        verified: !!profile?.verified,
        referralCode: profile?.referral_code || 'GT-USER',
        joinedAt: profile?.created_at?.slice(0, 10) || '',
      };
      localStorage.setItem('gt_session', JSON.stringify({ email, role: user.role, id: user.id }));
      return { ok: true, user, mode: 'supabase' };
    } catch (e) {
      console.warn('Supabase login failed', e.message);
    }
  }
  if (email === 'demo@go-trade.app' && password === 'demo123') {
    const user = { ...DEFAULT_USER, role: 'member' };
    localStorage.setItem('gt_session', JSON.stringify({ email, role: 'member' }));
    return { ok: true, user, mode: 'demo' };
  }
  if (email === 'admin@go-trade.app' && password === 'admin123') {
    const user = { ...DEFAULT_USER, name: 'Admin GO TRADE', email, role: 'admin', balance: 0 };
    localStorage.setItem('gt_session', JSON.stringify({ email, role: 'admin' }));
    return { ok: true, user, mode: 'demo' };
  }
  const users = JSON.parse(localStorage.getItem('gt_users') || '[]');
  const token = gtHashPass(email, password);
  const found = users.find(u => u.email === email && (u.passToken === token || u.password === password));
  if (found && found.password) { delete found.password; found.passToken = token; localStorage.setItem('gt_users', JSON.stringify(users)); }
  if (found) {
    localStorage.setItem('gt_session', JSON.stringify({ email, role: found.role || 'member' }));
    return { ok: true, user: found, mode: 'local' };
  }
  return { ok: false, error: 'Email atau password salah' };
}

async function gtSignOut() {
  if (sb) {
    try { await sb.auth.signOut(); } catch (_) {}
  }
  localStorage.removeItem('gt_session');
  currentUser = null;
}

function gtGetSession() {
  try {
    return JSON.parse(localStorage.getItem('gt_session') || 'null');
  } catch { return null; }
}

async function gtRestoreSession() {
  const session = gtGetSession();
  if (!session) return null;
  if (session.email === 'demo@go-trade.app') {
    return { ...DEFAULT_USER, role: session.role || 'member' };
  }
  if (session.email === 'admin@go-trade.app') {
    return { ...DEFAULT_USER, name: 'Admin GO TRADE', email: session.email, role: 'admin', balance: 0 };
  }
  if (sb && session.id) {
    try {
      const { data: { user } } = await sb.auth.getUser();
      if (user) {
        const { data: p } = await sb.from('profiles').select('*').eq('id', user.id).single();
        return {
          id: user.id,
          email: user.email,
          name: p?.name || user.email.split('@')[0],
          role: p?.role || 'member',
          balance: p?.wallet_balance ?? 0,
          equity: p?.wallet_balance ?? 0,
          pnlToday: 0,
          pnlTotal: 0,
          activePackage: p?.active_package || null,
          verified: !!p?.verified,
          referralCode: p?.referral_code || 'GT-USER',
        };
      }
    } catch (_) {}
  }
  const users = JSON.parse(localStorage.getItem('gt_users') || '[]');
  return users.find(u => u.email === session.email) || null;
}

function gtPushNotif(text, type = 'info') {
  const list = JSON.parse(localStorage.getItem('gt_notifs') || '[]');
  list.unshift({ id: Date.now(), text, type, time: 'baru saja', read: false });
  localStorage.setItem('gt_notifs', JSON.stringify(list.slice(0, 50)));
  const badge = document.getElementById('notifCount');
  if (badge) {
    const unread = list.filter(n => !n.read).length;
    badge.textContent = unread;
    badge.style.display = unread ? 'flex' : 'none';
  }
}

function gtGetNotifs() {
  return JSON.parse(localStorage.getItem('gt_notifs') || 'null') || NOTIFS;
}

function gtMarkNotifsRead() {
  const list = gtGetNotifs().map(n => ({ ...n, read: true }));
  localStorage.setItem('gt_notifs', JSON.stringify(list));
  const badge = document.getElementById('notifCount');
  if (badge) badge.style.display = 'none';
}
