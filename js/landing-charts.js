/* GO TRADE — Lightweight Charts for landing page */
(function () {
  if (typeof LightweightCharts === 'undefined') return;
  const container = document.getElementById('mainChart');
  if (!container) return;

  let chart, series, currentPair = 'BTCUSDT', currentTf = '5m';

  function initChart() {
    chart = LightweightCharts.createChart(container, {
      layout: {
        background: { type: 'solid', color: '#0a0e17' },
        textColor: '#9fb0cc',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.04)' },
        horzLines: { color: 'rgba(255,255,255,0.04)' },
      },
      crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
      timeScale: { borderColor: 'rgba(255,255,255,0.08)', timeVisible: true },
      width: container.clientWidth,
      height: 360,
    });
    series = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f87171',
      borderUpColor: '#10b981',
      borderDownColor: '#f87171',
      wickUpColor: '#10b981',
      wickDownColor: '#f87171',
    });
    loadData();
    window.addEventListener('resize', () => {
      if (chart) chart.applyOptions({ width: container.clientWidth });
    });
  }

  async function loadData() {
    try {
      const interval = currentTf;
      const url = `https://api.binance.com/api/v3/klines?symbol=${currentPair}&interval=${interval}&limit=120`;
      const res = await fetch(url);
      const data = await res.json();
      const candles = data.map(k => ({
        time: k[0] / 1000,
        open: +k[1],
        high: +k[2],
        low: +k[3],
        close: +k[4],
      }));
      series.setData(candles);

      const tRes = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${currentPair}`);
      const t = await tRes.json();
      document.getElementById('lastPrice').textContent = '$' + (+t.lastPrice).toLocaleString(undefined, { maximumFractionDigits: 2 });
      const chg = +t.priceChangePercent;
      const chgEl = document.getElementById('priceChg');
      chgEl.textContent = (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%';
      chgEl.className = 'chg ' + (chg >= 0 ? 'up' : 'down');
      document.getElementById('high24').textContent = '$' + (+t.highPrice).toLocaleString(undefined, { maximumFractionDigits: 2 });
      document.getElementById('low24').textContent = '$' + (+t.lowPrice).toLocaleString(undefined, { maximumFractionDigits: 2 });
      document.getElementById('vol24').textContent = (+t.volume).toLocaleString(undefined, { maximumFractionDigits: 0 });
    } catch (e) {
      console.warn('Chart data error', e);
      document.getElementById('lastPrice').textContent = 'Offline';
    }
  }

  document.querySelectorAll('#pairTabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#pairTabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPair = btn.dataset.pair;
      loadData();
    });
  });
  document.querySelectorAll('.tf-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tf-tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTf = btn.dataset.tf;
      loadData();
    });
  });

  initChart();
})();
