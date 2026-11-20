/* GO TRADE — Auth (localStorage + optional Supabase) */
(function () {
  const DEMO_USERS = {
    'demo@gotrade.io': { password: 'demo123', role: 'member', name: 'Demo Member' },
    'admin@gotrade.io': { password: 'admin123', role: 'admin', name: 'Admin GO TRADE' },
  };

  function getUsers() {
    try { return JSON.parse(localStorage.getItem('gt_users') || '{}'); } catch { return {}; }
  }
  function saveUsers(users) { localStorage.setItem('gt_users', JSON.stringify(users)); }
  function setSession(user) {
    localStorage.setItem('gt_session', JSON.stringify({
      email: user.email, name: user.name, role: user.role, loggedAt: Date.now(),
    }));
  }
  function getSession() {
    try { return JSON.parse(localStorage.getItem('gt_session') || 'null'); } catch { return null; }
  }
  function clearSession() { localStorage.removeItem('gt_session'); }

  window.GTAuth = {
    login(email, password) {
      email = (email || '').trim().toLowerCase();
      const demo = DEMO_USERS[email];
      if (demo && demo.password === password) {
        setSession({ email, name: demo.name, role: demo.role });
        return { ok: true, role: demo.role };
      }
      const users = getUsers();
      if (users[email] && users[email].password === password) {
        setSession({ email, name: users[email].name || email.split('@')[0], role: users[email].role || 'member' });
        return { ok: true, role: users[email].role || 'member' };
      }
      return { ok: false, error: 'Email atau password salah' };
    },
    register(email, password, name) {
      email = (email || '').trim().toLowerCase();
      if (!email || !password) return { ok: false, error: 'Email & password wajib' };
      if (password.length < 6) return { ok: false, error: 'Password minimal 6 karakter' };
      if (DEMO_USERS[email]) return { ok: false, error: 'Email sudah terdaftar' };
      const users = getUsers();
      if (users[email]) return { ok: false, error: 'Email sudah terdaftar' };
      users[email] = { password, name: name || email.split('@')[0], role: 'member', createdAt: Date.now() };
      saveUsers(users);
      setSession({ email, name: users[email].name, role: 'member' });
      return { ok: true, role: 'member' };
    },
    logout() { clearSession(); location.href = '/login.html'; },
    getSession,
    requireAuth(role) {
      const s = getSession();
      if (!s) { location.href = '/login.html'; return null; }
      if (role && s.role !== role) {
        location.href = s.role === 'admin' ? '/admin/dashboard.html' : '/member/dashboard.html';
        return null;
      }
      return s;
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm') || document.querySelector('form[data-login]');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('[name="email"], #email, input[type="email"]')?.value;
        const password = form.querySelector('[name="password"], #password, input[type="password"]')?.value;
        const res = GTAuth.login(email, password);
        const errEl = document.getElementById('loginError') || form.querySelector('.error-msg');
        if (res.ok) {
          location.href = res.role === 'admin' ? 'admin/dashboard.html' : 'member/dashboard.html';
        } else if (errEl) {
          errEl.textContent = res.error;
          errEl.style.display = 'block';
        } else alert(res.error);
      });
    }
    const regForm = document.getElementById('registerForm') || document.querySelector('form[data-register]');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = regForm.querySelector('[name="email"], #email, input[type="email"]')?.value;
        const password = regForm.querySelector('[name="password"], #password, input[type="password"]')?.value;
        const name = regForm.querySelector('[name="name"], #name')?.value;
        const res = GTAuth.register(email, password, name);
        if (res.ok) location.href = 'member/dashboard.html';
        else {
          const errEl = document.getElementById('regError') || regForm.querySelector('.error-msg');
          if (errEl) { errEl.textContent = res.error; errEl.style.display = 'block'; }
          else alert(res.error);
        }
      });
    }
  });
})();
