/* GO TRADE — floating AI assistant widget (demo only, canned responses, no real API). */

(function () {
  const html = `
    <div id="aiWidgetPanel" class="ai-widget-panel" hidden>
      <div class="ai-widget-head">
        <div style="display:flex;align-items:center;gap:8px"><span data-icon="sparkles" data-icon-size="16"></span><strong>GO TRADE Assistant</strong></div>
        <button id="aiWidgetClose" aria-label="Tutup"><span data-icon="x" data-icon-size="16"></span></button>
      </div>
      <div id="aiWidgetMessages" class="ai-widget-messages"></div>
      <form id="aiWidgetForm" class="ai-widget-form">
        <input id="aiWidgetInput" type="text" placeholder="Tanya sesuatu..." autocomplete="off" />
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

  function canned(question) {
    const q = question.toLowerCase();
    if (q.includes("deposit")) return "Untuk deposit, buka menu Deposit, pilih metode USDT (BEP20), lalu isi form. Admin akan memverifikasi permintaan Anda.";
    if (q.includes("withdraw") || q.includes("tarik") || q.includes("penarikan")) return "Untuk penarikan, buka menu Withdrawal. Saldo akan terpotong dulu dan otomatis dikembalikan bila admin menolak.";
    if (q.includes("paket") || q.includes("package")) return "Cek menu Auto Trading untuk melihat paket Starter, Growth, dan Pro beserta ROI harian simulasinya.";
    if (q.includes("sinyal") || q.includes("signal")) return "Sinyal trading terbaru dari tim GO TRADE bisa dilihat di menu Signal, lengkap dengan entry, target, dan stop-loss.";
    if (q.includes("bonus")) return "Bonus referral & bonus manual dari admin bisa dicek di menu Bonus Tracking.";
    if (q.includes("halo") || q.includes("hai") || q.includes("hello")) return "Halo! Saya asisten demo GO TRADE. Coba tanya soal deposit, penarikan, paket, atau sinyal trading.";
    return "AI assisten ini masih dalam tahap uji coba. Coba tanyakan tentang deposit, penarikan, paket, sinyal, atau bonus.";
  }

  fab.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden && !messages.childElementCount) {
      addMessage("Halo! Saya asisten demo GO TRADE. Ada yang bisa saya bantu seputar trading, deposit, atau paket?", "bot");
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
    setTimeout(() => addMessage(canned(text), "bot"), 350);
  });
})();
