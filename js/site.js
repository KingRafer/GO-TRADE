/* GO TRADE — Landing helpers */
(function () {
  const pairs = [
    { s: 'BTC/USDT', p: 97240, c: 1.24 },
    { s: 'ETH/USDT', p: 3421, c: -0.68 },
    { s: 'SOL/USDT', p: 198.4, c: 2.15 },
    { s: 'BNB/USDT', p: 612.3, c: 0.42 },
    { s: 'XRP/USDT', p: 1.42, c: -1.05 },
    { s: 'ADA/USDT', p: 0.68, c: 0.88 },
    { s: 'DOGE/USDT', p: 0.192, c: 3.21 },
    { s: 'AVAX/USDT', p: 38.6, c: -0.34 },
  ];
  const ticker = document.getElementById('ticker');
  if (ticker) {
    const html = pairs.concat(pairs).map(x => {
      const cls = x.c >= 0 ? 'up' : 'down';
      const sign = x.c >= 0 ? '+' : '';
      return `<span>${x.s} <strong>$${x.p.toLocaleString()}</strong> <span class="${cls}">${sign}${x.c}%</span></span>`;
    }).join('');
    ticker.innerHTML = html;
  }

  const signals = [
    { pair: 'BTC/USDT', side: 'BUY', entry: '97,180', conf: 86, time: '2m ago' },
    { pair: 'ETH/USDT', side: 'SELL', entry: '3,445', conf: 72, time: '8m ago' },
    { pair: 'SOL/USDT', side: 'BUY', entry: '196.20', conf: 91, time: '14m ago' },
    { pair: 'BNB/USDT', side: 'BUY', entry: '610.50', conf: 68, time: '22m ago' },
    { pair: 'XRP/USDT', side: 'SELL', entry: '1.435', conf: 79, time: '31m ago' },
  ];
  const list = document.getElementById('signalList');
  if (list) {
    list.innerHTML = signals.map(s => `
      <div class="signal-item">
        <div>
          <div class="pair">${s.pair}</div>
          <span class="side ${s.side.toLowerCase()}">${s.side}</span>
        </div>
        <div class="meta">
          <div>Entry ${s.entry}</div>
          <div>Conf ${s.conf}% · ${s.time}</div>
        </div>
      </div>
    `).join('');
  }
})();
