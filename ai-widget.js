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
        <input id="aiWidgetInput" type="text" placeholder="Ask about deposits, signals, packages..." autocomplete="off" />
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
    if (q.includes("deposit") || q.includes("setor"))
      return "To deposit: open Deposit → choose USDT (BEP20) → enter amount & submit. Admin verifies within 1–30 minutes. Minimum depends on the package you choose.";
    if (q.includes("withdraw") || q.includes("tarik") || q.includes("penarikan") || q.includes("wd"))
      return "Withdrawal: open Withdrawal → enter amount & USDT (BEP20) wallet address. Balance is reserved first; if admin rejects, it is refunded automatically. Usually takes 1–24 hours.";
    if (q.includes("paket") || q.includes("package") || q.includes("auto"))
      return "There are 3 Auto Trading packages: Starter, Growth, and Pro. Each has its own minimum deposit, daily ROI, and duration. Check Auto Trading for details and activation.";
    if (q.includes("sinyal") || q.includes("signal") || q.includes("entry"))
      return "Real-time signals are in the Signal menu. Each signal includes direction (Buy/Sell), entry, target, stop-loss, and status. Follow risk management — don't FOMO.";
    if (q.includes("bonus") || q.includes("referral") || q.includes("referal"))
      return "Referral and manual bonuses from admin appear under Bonuses Tracking. Share your referral code on the Network page to earn commission from new members.";
    if (q.includes("level") || q.includes("rank"))
      return "Account level rises with activity (deposits, active packages, referrals). Higher levels unlock extra features and benefits over time.";
    if (q.includes("verifikasi") || q.includes("verify") || q.includes("kyc"))
      return "Verification status is set by admin. After your first deposit is approved, your account is usually marked Verified. Contact support if you need help.";
    if (q.includes("password") || q.includes("keamanan") || q.includes("2fa") || q.includes("aman"))
      return "Change your password in Account Settings. Enable 2FA for extra security. Never share credentials with anyone, including people claiming to be admin.";
    if (q.includes("support") || q.includes("bantuan") || q.includes("help") || q.includes("cs"))
      return "Contact support via Help Center or email " + (window.GT_CONFIG?.brand?.supportEmail || "support@go-trade.vercel.app") + ". Include your account email and a short description so we can help faster.";
    if (q.includes("roi") || q.includes("profit") || q.includes("hasil"))
      return "Daily ROI depends on your active package. Trading results can vary with market conditions. Only use capital you can afford to risk.";
    if (q.includes("halo") || q.includes("hai") || q.includes("hello") || q.includes("hi") || q.includes("pagi") || q.includes("siang") || q.includes("malam"))
      return "Hi! I'm the GO TRADE assistant. Ask me about deposits, withdrawals, auto-trading packages, signals, bonuses, or account security — I'm here to help.";
    if (q.includes("terima kasih") || q.includes("thanks") || q.includes("makasih"))
      return "You're welcome! Wishing you smooth trades. Anything else you'd like to ask?";
    return "I'm still learning. Try asking specifically about: deposits, withdrawals, packages, signals, bonuses, levels, verification, or account security.";
  }

  fab.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden && !messages.childElementCount) {
      addMessage("Hi! I'm the GO TRADE assistant. How can I help with trading, deposits, packages, or signals?", "bot");
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
