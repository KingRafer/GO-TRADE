/* GO TRADE — opt-in Firebase Cloud Messaging registration.
 * Client config/VAPID values are public. Service-account keys stay server-side.
 */
(function () {
  "use strict";
  let firebaseReady = null;

  function cfg() { return window.GT_CONFIG?.firebase || {}; }
  function configured() {
    return ["apiKey", "authDomain", "projectId", "messagingSenderId", "appId", "vapidKey"].every((key) => Boolean(cfg()[key]));
  }
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const found = [...document.scripts].find((item) => item.src === src);
      if (found) {
        if (found.dataset.loaded === "true") return resolve();
        found.addEventListener("load", resolve, { once: true });
        found.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.onload = () => { script.dataset.loaded = "true"; resolve(); };
      script.onerror = () => reject(new Error("Firebase SDK gagal dimuat."));
      document.head.appendChild(script);
    });
  }
  async function serviceWorker() {
    if (!("serviceWorker" in navigator) || !window.isSecureContext) {
      throw new Error("Push notification memerlukan browser yang mendukung service worker dan HTTPS.");
    }
    return navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
  }
  async function messaging() {
    if (!firebaseReady) {
      firebaseReady = (async () => {
        await loadScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
        await loadScript("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");
        if (!window.firebase) throw new Error("Firebase SDK tidak tersedia.");
        if (!window.firebase.apps.length) {
          const f = cfg();
          window.firebase.initializeApp({
            apiKey: f.apiKey, authDomain: f.authDomain, projectId: f.projectId,
            messagingSenderId: f.messagingSenderId, appId: f.appId,
          });
        }
        if (!window.firebase.messaging.isSupported || !(await window.firebase.messaging.isSupported())) {
          throw new Error("Firebase Messaging tidak didukung browser ini.");
        }
        return window.firebase.messaging();
      })();
      firebaseReady.catch(() => { firebaseReady = null; });
    }
    return firebaseReady;
  }

  window.GTNotifications = {
    getPermission() {
      return "Notification" in window ? Notification.permission : "unsupported";
    },
    async requestPermission() {
      if (!("Notification" in window)) return { ok: false, reason: "unsupported" };
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return { ok: false, reason: permission };
      if (!configured()) return { ok: false, reason: "firebase_not_configured" };
      if (!window.sb) return { ok: false, reason: "supabase_not_ready" };
      const { data: authData, error: authError } = await window.sb.auth.getUser();
      if (authError || !authData?.user) return { ok: false, reason: "not_authenticated" };

      const registration = await serviceWorker();
      const messagingClient = await messaging();
      const token = await window.firebase.messaging().getToken(messagingClient, {
        vapidKey: cfg().vapidKey,
        serviceWorkerRegistration: registration,
      });
      if (!token) return { ok: false, reason: "token_unavailable" };
      const { error } = await window.sb.from("push_devices").upsert({
        user_id: authData.user.id, token, platform: "web",
      }, { onConflict: "token" });
      if (error) {
        console.error("[GO TRADE] Push token registration failed:", error.message);
        return { ok: false, reason: "token_storage_failed" };
      }
      return { ok: true, permission, registered: true };
    },
    async sendToUser(payload) {
      if (!window.sb) return { ok: false, reason: "supabase_not_ready" };
      const { data, error } = await window.sb.functions.invoke("send-account-push", { body: payload });
      if (error) return { ok: false, error };
      return { ok: true, data };
    },
  };
})();
