/* GO TRADE — Firebase Cloud Messaging service worker
 * Fill the public Firebase Web App config after creating the Firebase project.
 * Never put service-account credentials or private keys in this file.
 */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  messagingSenderId: "",
  appId: "",
};

const configured = Object.values(firebaseConfig).every((value) => Boolean(value));

if (configured && firebaseConfig.projectId) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "GO TRADE";
    const options = {
      body: payload.notification?.body || "Ada pemberitahuan baru.",
      icon: "/assets/logo-icon.png",
      badge: "/assets/logo-icon.png",
      data: { url: payload.data?.url || "/dashboard.html" },
      tag: payload.data?.tag || "go-trade-notification",
    };
    self.registration.showNotification(title, options);
  });
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/dashboard.html", self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        await client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  })());
});
