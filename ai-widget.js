/* GO TRADE — Floating AI Assistant Widget v8 */

(function () {
  const html = `
    <div id="aiWidgetPanel" class="ai-widget-panel" hidden>
      <div class="ai-widget-head">
        <div style="display:flex;align-items:center;gap:8px"><span data-icon="sparkles" data-icon-size="16"></span><strong>GO TRADE Assistant</strong></div>
        <button id="aiWidgetClose" aria-label="Tutup"><span data-icon="x" data-icon-size="16"></span></button>
      </div>
      <div id="aiWidgetMessages" class="ai-widget-messages"></div>
      <form id="aiWidgetForm" class="ai-widget-form">
        <input id="aiWidgetInput" type="text" placeholder="Tanya tentang deposit, sinyal, paket..." autocomplete="off" />
        <button type="submit" aria-label="Kirim"><span data-icon="arrowRight" data-icon-size="16"></span></button>
      </form>
    </div>
    <button id="aiWidgetFab" class="ai-widget-fab" aria-label="Buka asisten AI"><span data-icon="sparkles" data-icon-size="22"></span></button>
  `;
  const wrap = document.createElement("div");
  wrap.innerHTML = html;
  document.body.appendChild(wrap);
  if (typeof gtRenderIcons === "function") gtRenderIcons(wrap);

  const panel = document.getElementById("aiWidgetPanel");
  const fab = document.getElementById("aiWidgetFab");
  const closeBtn = document.getElementById("aiWidgetClose");
  const messages = document.getElementById("aiWidgetMessages");
  const form = document.getElementById("aiWidgetForm");
  const input = document.getElementById("aiWidgetInput");

  function addMessage(text, from) {
    const row = document.createElement("div");
    row.className = "ai-widget-msg " + (from === "user" ? "from-user" : "from-bot");
    row.textContent = text;
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function addTyping() {
    const row = document.createElement("div");
    row.className = "ai-widget-msg from-bot";
    row.id = "aiTyping";
    row.innerHTML = '<span style="opacity:.6">●</span> <span style="opacity:.45">●</span> <span style="opacity:.3">●</span>';
    messages.appendChild(row);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById("aiTyping");
    if (el) el.remove();
  }

  function canned(question) {
    const q = question.toLowerCase();
    if (q.includes("deposit") || q.includes("setor"))
      return "Untuk deposit: buka menu Deposit → pilih USDT (BEP20) → isi jumlah & kirim. Admin akan memverifikasi dalam 1–30 menit. Minimal deposit tergantung paket yang dipilih.";
    if (q.includes("withdraw") || q.includes("tarik") || q.includes("penarikan") || q.includes("wd"))
      return "Penarikan: buka menu Withdrawal → masukkan jumlah & alamat wallet USDT (BEP20). Saldo dipotong dulu; jika ditolak admin, saldo dikembalikan otomatis. Proses biasanya 1–24 jam.";
    if (q.includes("paket") || q.includes("package") || q.includes("auto"))
      return "Tersedia 3 paket Auto Trading: Starter, Growth, dan Pro. Masing-masing punya minimum deposit, ROI harian, dan durasi berbeda. Cek menu Auto Trading untuk detail & aktivasi.";
    if (q.includes("sinyal") || q.includes("signal") || q.includes("entry"))
      return "Sinyal real-time ada di menu Signal. Setiap sinyal berisi arah (Buy/Sell), entry, target, stop-loss, dan status. Ikuti manajemen risiko — jangan FOMO.";
    if (q.includes("bonus") || q.includes("referral") || q.includes("referal"))
      return "Bonus referral & bonus manual dari admin tampil di menu Bonus Tracking. Bagikan kode referral Anda di menu Network untuk mendapatkan komisi dari member baru.";
    if (q.includes("level") || q.includes("rank"))
      return "Level akun naik seiring aktivitas (deposit, paket aktif, referral). Level lebih tinggi membuka fitur & benefit tambahan di masa depan.";
    if (q.includes("verifikasi") || q.includes("verify") || q.includes("kyc"))
      return "Status verifikasi diatur oleh admin. Setelah deposit pertama disetujui, akun biasanya ditandai Verified. Hubungi support jika butuh bantuan.";
    if (q.includes("password") || q.includes("keamanan") || q.includes("2fa") || q.includes("aman"))
      return "Ganti password di Account Settings. Aktifkan 2FA untuk keamanan ekstra. Jangan bagikan kredensial ke siapa pun, termasuk yang mengaku admin.";
    if (q.includes("support") || q.includes("bantuan") || q.includes("help") || q.includes("cs"))
      return "Tim support bisa dihubungi lewat menu Help Center atau email " + (window.GT_CONFIG?.brand?.supportEmail || "support@go-trade.vercel.app") + ". Sertakan email akun & deskripsi singkat masalah agar lebih cepat ditangani.";
    if (q.includes("roi") || q.includes("profit") || q.includes("hasil"))
      return "ROI harian bergantung pada paket yang aktif. Hasil trading dapat bervariasi sesuai kondisi pasar. Selalu gunakan modal yang siap Anda kelola risikonya.";
    if (q.includes("halo") || q.includes("hai") || q.includes("hello") || q.includes("hi") || q.includes("pagi") || q.includes("siang") || q.includes("malam"))
      return "Halo! Saya asisten GO TRADE. Tanyakan tentang deposit, penarikan, paket auto-trading, sinyal, bonus, atau keamanan akun — saya siap bantu.";
    if (q.includes("terima kasih") || q.includes("thanks") || q.includes("makasih"))
      return "Sama-sama! Semoga trading Anda berjalan lancar. Ada yang lain yang ingin ditanyakan?";
    return "Saya masih belajar. Coba tanyakan secara spesifik: deposit, penarikan, paket, sinyal, bonus, level, verifikasi, atau keamanan akun.";
  }

  fab.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden && !messages.childElementCount) {
      addMessage("Halo! Saya asisten GO TRADE. Ada yang bisa saya bantu seputar trading, deposit, paket, atau sinyal?", "bot");
    }
    if (!panel.hidden) input.focus();
  });
  closeBtn.addEventListener("click", () => (panel.hidden = true));
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addMessage(text, "user");
    input.value = "";
    addTyping();
    setTimeout(() => {
      removeTyping();
      addMessage(canned(text), "bot");
    }, 420 + Math.random() * 280);
  });
})();
