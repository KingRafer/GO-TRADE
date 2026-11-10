/* GO TRADE — Client security helpers: rate limit, activity log, error track */
(function (global) {
  const buckets = new Map();

  /** Simple sliding-window rate limit (client-side soft guard) */
  function rateLimit(key, limit = 20, windowMs = 60000) {
    const now = Date.now();
    let b = buckets.get(key);
    if (!b || now - b.start > windowMs) {
      b = { start: now, count: 0 };
      buckets.set(key, b);
    }
    b.count += 1;
    if (b.count > limit) {
      return { ok: false, retryAfterMs: windowMs - (now - b.start) };
    }
    return { ok: true, remaining: limit - b.count };
  }

  function gtLogActivity(action, target, detail, meta) {
    try {
      const entry = {
        action: String(action || 'unknown'),
        target: target || null,
        detail: detail || '',
        meta: meta || {},
        at: new Date().toISOString(),
        email: (global.currentUser && currentUser.email) || null,
        role: global.currentRole || null,
      };
      // local ring buffer
      const key = 'gt_activity_local';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.unshift(entry);
      if (list.length > 100) list.length = 100;
      localStorage.setItem(key, JSON.stringify(list));

      // Supabase if available
      if (global.sb && typeof sb.from === 'function') {
        sb.from('activity_logs').insert({
          actor_email: entry.email,
          actor_role: entry.role,
          action: entry.action,
          target: entry.target,
          detail: entry.detail,
          meta: entry.meta,
        }).then(() => {}).catch(() => {});
      }
    } catch (_) { /* ignore */ }
  }

  function gtTrackError(err, context) {
    const payload = {
      message: err && (err.message || String(err)),
      stack: err && err.stack ? String(err.stack).slice(0, 1500) : null,
      context: context || null,
      view: global.currentView || null,
      url: location.href,
      at: new Date().toISOString(),
    };
    try {
      const key = 'gt_errors_local';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.unshift(payload);
      if (list.length > 50) list.length = 50;
      localStorage.setItem(key, JSON.stringify(list));
    } catch (_) {}
    console.error('[GO TRADE]', context || 'error', err);
    gtLogActivity('error', context || 'client', payload.message, { stack: payload.stack });
    // Hook for future Sentry: if (window.Sentry) Sentry.captureException(err)
  }

  function gtSafeAsync(fn, context) {
    return async function () {
      try {
        return await fn.apply(this, arguments);
      } catch (e) {
        gtTrackError(e, context || fn.name || 'async');
        throw e;
      }
    };
  }

  /** Wrap order placement with rate limit */
  function gtGuardedAction(key, limit, fn) {
    const rl = rateLimit(key, limit, 60000);
    if (!rl.ok) {
      if (typeof toast === 'function') toast('Terlalu banyak permintaan. Coba lagi sebentar.', 'error');
      return { ok: false, error: 'rate_limited' };
    }
    return fn();
  }

  global.gtRateLimit = rateLimit;
  global.gtLogActivity = gtLogActivity;
  global.gtTrackError = gtTrackError;
  global.gtSafeAsync = gtSafeAsync;
  global.gtGuardedAction = gtGuardedAction;

  // Global handlers
  global.addEventListener('error', function (ev) {
    gtTrackError(ev.error || ev.message, 'window.onerror');
  });
  global.addEventListener('unhandledrejection', function (ev) {
    gtTrackError(ev.reason, 'unhandledrejection');
  });
})(window);
