/* GO TRADE — opt-in push service-worker registration.
 * Actual FCM registration/token storage is intentionally disabled until the
 * Firebase project and authenticated token-storage/RLS backend are configured.
 */
(function () {
  "use strict";

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) return null;
    try {
      return await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
    } catch (error) {
      console.warn("[GO TRADE] Push service worker unavailable:", error);
      return null;
    }
  }

  window.GTNotifications = {
    async prepare() {
      return registerServiceWorker();
    },
    async requestPermission() {
      if (!("Notification" in window)) {
        return { ok: false, reason: "unsupported" };
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return { ok: false, reason: permission };
      }
      const registration = await registerServiceWorker();
      return registration
        ? { ok: true, permission, readyForFirebaseSetup: true }
        : { ok: false, reason: "service_worker_unavailable" };
    },
    getPermission() {
      return "Notification" in window ? Notification.permission : "unsupported";
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => registerServiceWorker(), { once: true });
  } else {
    registerServiceWorker();
  }
})();
