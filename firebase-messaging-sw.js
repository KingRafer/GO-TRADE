/* GO TRADE — Firebase Cloud Messaging background notifications. */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");
importScripts("/config.js");

const cfg = self.GT_CONFIG?.firebase || {};
const ready = ["apiKey", "authDomain", "projectId", "messagingSenderId", "appId"].every((key) => Boolean(cfg[key]));
if (ready) {
  firebase.initializeApp({
    apiKey: cfg.apiKey, authDomain: cfg.authDomain, projectId: cfg.projectId,
    messagingSenderId: cfg.messagingSenderId, appId: cfg.appId,
  });
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "GO TRADE";
    self.registration.showNotification(title, {
      body: payload.notification?.body || "Ada pemberitahuan akun baru.",
      icon: "/assets/logo-icon.png",
      badge: "/assets/logo-icon.png",
      data: { url: payload.data?.url || "/dashboard.html" },
      tag: payload.data?.tag || "go-trade-account-notice",
    });
  });
}
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const raw = event.notification.data?.url || "/dashboard.html";
  const target = new URL(raw, self.location.origin);
  if (target.origin !== self.location.origin) return;
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of clients) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        await client.navigate(target.href);
        return client.focus();
      }
    }
    return self.clients.openWindow(target.href);
  })());
});
