/* GO TRADE — Floating AI Assistant Widget v8 */

(function () {
  const html = `
    <div id="aiWidgetPanel" class="ai-widget-panel" hidden>
      <div class="ai-widget-head">
        <div style="display:flex;align-items:center;gap:8px"><span data-icon="sparkles" data-icon-size="16"></span><strong>GO TRADE Assistant</strong></div>
        <button id="aiWidgetClose" aria-label="Close"><span data-icon="x" data-icon-size="16"></span></button>
      </div>
      <div id="aiWidgetMessages" class="ai-widget-messages"></div>
      <form id="aiWidgetForm" class="ai-widget-form">
        <input id="aiWidgetInput" type="text" placeholder="Tanyakan tentang akun atau fitur..." autocomplete="off" />
        <button type="submit" aria-label="Submit"><span data-icon="arrowRight" data-icon-size="16"></span></button>
      </form>
    </div>
    <button id="aiWidgetFab" class="ai-widget-fab" aria-label="Open AI assistant"><span data-icon="sparkles" data-icon-size="22"></span></button>
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
    if (q.includes("deposit") || q.includes("setor") || q.includes("withdraw") || q.includes("tarik") || q.includes("penarikan") || q.includes("wd"))
      return "Untuk keamanan, saya tidak dapat memandu pengiriman atau penarikan uang. Jangan kirim dana berdasarkan pesan chat. Verifikasi informasi dan pihak penerima melalui kanal resmi pengelola, serta jangan pernah membagikan kata sandi atau OTP.";
    if (q.includes("paket") || q.includes("package") || q.includes("auto") || q.includes("roi") || q.includes("profit") || q.includes("hasil"))
      return "Informasi paket atau angka hasil yang ditampilkan bukan jaminan keuntungan dan bukan rekomendasi investasi. Hasil dapat berbeda dan risiko dapat menyebabkan kerugian. Periksa informasi, ketentuan, dan legalitas layanan secara mandiri sebelum mengambil keputusan.";
    if (q.includes("sinyal") || q.includes("signal") || q.includes("entry"))
      return "Informasi sinyal di platform bersifat informasional, bukan rekomendasi untuk melakukan transaksi. Data dapat terlambat atau tidak lengkap. Jangan mengambil keputusan hanya berdasarkan satu sinyal.";
    if (q.includes("bonus") || q.includes("referral") || q.includes("referal"))
      return "Informasi referral dan bonus dapat dilihat pada halaman Network atau Bonus Tracking. Status yang muncul mengikuti data yang tersimpan dan perlu dikonfirmasi kepada administrator jika ada ketidaksesuaian.";
    if (q.includes("level") || q.includes("rank"))
      return "Informasi level akun dapat dilihat pada ringkasan profil. Jika data tidak sesuai, hubungi administrator melalui kanal resmi pengelola.";
    if (q.includes("verifikasi") || q.includes("verify") || q.includes("kyc"))
      return "Status verifikasi ditampilkan pada ringkasan akun. Jangan mengirim dokumen identitas melalui chat atau tautan yang tidak dapat diverifikasi.";
    if (q.includes("password") || q.includes("keamanan") || q.includes("2fa") || q.includes("aman") || q.includes("otp"))
      return "Jangan pernah membagikan kata sandi, kode OTP, atau tautan pemulihan kepada siapa pun. Gunakan hanya halaman resmi GO TRADE untuk mengelola akses akun.";
    if (q.includes("support") || q.includes("bantuan") || q.includes("help") || q.includes("cs"))
      return "Untuk bantuan akun atau kendala aplikasi, hubungi administrator melalui kanal resmi yang diberikan pengelola GO TRADE. Sertakan deskripsi kendala tanpa membagikan kata sandi atau OTP.";
    if (q.includes("halo") || q.includes("hai") || q.includes("hello") || q.includes("hi") || q.includes("pagi") || q.includes("siang") || q.includes("malam"))
      return "Halo! Saya GO TRADE Assistant. Saya dapat membantu menjelaskan navigasi, fitur akun, notifikasi, dan informasi umum platform.";
    if (q.includes("terima kasih") || q.includes("thanks") || q.includes("makasih"))
      return "Sama-sama. Semoga informasi ini membantu.";
    return "Saya dapat membantu tentang navigasi dashboard, pengaturan akun, notifikasi, verifikasi, dan kendala aplikasi. Untuk informasi transaksi atau investasi, selalu verifikasi melalui kanal resmi dan jangan mengandalkan klaim hasil.";
  }

  fab.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden && !messages.childElementCount) {
      addMessage("Halo! Saya GO TRADE Assistant. Ada yang bisa saya bantu tentang akun atau fitur platform?", "bot");
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
    }, 350);
  });
})();
