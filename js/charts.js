/* ============================================================
   GO TRADE — Chart Engine (Lightweight Charts + Real Data)
   ============================================================ */
let chartInstance = null;
let candleSeries = null;
let volumeSeries = null;
let currentPair = 'BTCUSDT';
let currentTf = '5m';
let chartContainerId = 'mainChart';

function getChartTheme() {
  const isDark = !document.body.classList.contains('light');
  return {
    bg: isDark ? '#0b0e14' : '#ffffff',
    text: isDark ? '#8b9bb4' : '#64748b',
    grid: isDark ? '#1a2030' : '#e2e8f0',
    border: isDark ? '#1e2636' : '#e2e8f0',
  };
}

function initMainChart(containerId = 'mainChart') {
  const el = document.getElementById(containerId);
  if (!el || typeof LightweightCharts === 'undefined') return;
  chartContainerId = containerId;
  el.innerHTML = '';
  const th = getChartTheme();

  chartInstance = LightweightCharts.createChart(el, {
    width: el.clientWidth,
    height: el.clientHeight || 380,
    layout: {
      background: { type: 'solid', color: th.bg },
      textColor: th.text,
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    grid: {
      vertLines: { color: th.grid },
      horzLines: { color: th.grid },
    },
    crosshair: {
      mode: LightweightCharts.CrosshairMode.Normal,
      vertLine: { color: '#10b981', width: 1, style: 2, labelBackgroundColor: '#10b981' },
      horzLine: { color: '#10b981', width: 1, style: 2, labelBackgroundColor: '#10b981' },
    },
    rightPriceScale: {
      borderColor: th.border,
      scaleMargins: { top: 0.08, bottom: 0.18 },
    },
    timeScale: {
      borderColor: th.border,
      timeVisible: true,
      secondsVisible: false,
    },
    handleScroll: true,
    handleScale: true,
  });

  candleSeries = chartInstance.addCandlestickSeries({
    upColor: '#10b981',
    downColor: '#ef4444',
    borderUpColor: '#10b981',
    borderDownColor: '#ef4444',
    wickUpColor: '#10b981',
    wickDownColor: '#ef4444',
  });

  volumeSeries = chartInstance.addHistogramSeries({
    color: '#26a69a',
    priceFormat: { type: 'volume' },
    priceScaleId: '',
    scaleMargins: { top: 0.85, bottom: 0 },
  });

  loadChartData(currentPair, currentTf);

  const ro = new ResizeObserver(() => {
    if (chartInstance && el) {
      chartInstance.applyOptions({ width: el.clientWidth, height: el.clientHeight || 380 });
    }
  });
  ro.observe(el);

  document.querySelectorAll('#' + (containerId === 'workspaceChart' ? 'pairTabsWS' : 'pairTabs') + ' button, #pairTabs button, #pairTabsWS button').forEach(btn => {
    btn.onclick = () => {
      const parent = btn.parentElement;
      parent.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPair = btn.dataset.pair;
      loadChartData(currentPair, currentTf);
      updatePriceBox(currentPair);
    };
  });

  document.querySelectorAll('.tf-tabs button').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.tf-tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTf = btn.dataset.tf;
      loadChartData(currentPair, currentTf);
    };
  });
}

async function loadChartData(pair, tf) {
  if (!candleSeries) return;
  const candles = await fetchKlines(pair, tf, 200);
  if (!candles || !candles.length) return;

  candleSeries.setData(candles.map(c => ({
    time: c.time,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  })));

  volumeSeries.setData(candles.map(c => ({
    time: c.time,
    value: c.volume,
    color: c.close >= c.open ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)',
  })));

  chartInstance.timeScale().fitContent();
  updatePriceBox(pair);
}

function updatePriceBox(pair) {
  pair = pair || (typeof currentPair !== 'undefined' ? currentPair : 'BTCUSDT');
  const m = (typeof marketState !== 'undefined') ? marketState[pair] : null;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  if (!m || m.price == null) {
    set('lastPrice', 'Memuat…');
    set('high24', '…');
    set('low24', '…');
    set('vol24', '…');
    return;
  }
  const dec = (typeof PAIRS !== 'undefined' && PAIRS[pair]) ? PAIRS[pair].decimals : 2;
  const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  set('lastPrice', '$' + fmt(m.price));
  const chgEl = document.getElementById('priceChg');
  if (chgEl) {
    const chg = parseFloat(m.change24h) || 0;
    chgEl.textContent = (chg >= 0 ? '+' : '') + chg.toFixed(2) + '%';
    chgEl.className = 'chg ' + (chg >= 0 ? 'up' : 'down');
  }
  set('high24', '$' + fmt(m.high24));
  set('low24', '$' + fmt(m.low24));
  const vol = m.quoteVolume || m.volume || 0;
  set('vol24', vol > 1e9 ? '$' + (vol / 1e9).toFixed(2) + 'B' : vol > 1e6 ? '$' + (vol / 1e6).toFixed(1) + 'M' : String(Math.round(vol)));
}

function updateLiveCandle() {
  if (!candleSeries || !currentPair) return;
  const m = marketState[currentPair];
  if (!m) return;
  try {
    const now = Math.floor(Date.now() / 1000);
    candleSeries.update({
      time: now - (now % 300),
      open: m.price * 0.9995,
      high: Math.max(m.price, m.high24 * 0.999),
      low: Math.min(m.price, m.low24 * 1.001),
      close: m.price,
    });
  } catch (e) { /* ignore */ }
  updatePriceBox(currentPair);
}

function initMiniChart(containerId, pair = 'BTCUSDT', height = 180) {
  const el = document.getElementById(containerId);
  if (!el || typeof LightweightCharts === 'undefined') return null;
  el.innerHTML = '';
  const th = getChartTheme();
  const chart = LightweightCharts.createChart(el, {
    width: el.clientWidth,
    height,
    layout: {
      background: { type: 'solid', color: 'transparent' },
      textColor: th.text,
    },
    grid: { vertLines: { visible: false }, horzLines: { color: th.grid } },
    rightPriceScale: { borderVisible: false },
    timeScale: { borderVisible: false, visible: false },
    crosshair: { mode: 0 },
    handleScroll: false,
    handleScale: false,
  });
  const series = chart.addAreaSeries({
    lineColor: '#10b981',
    topColor: 'rgba(16,185,129,0.28)',
    bottomColor: 'rgba(16,185,129,0.02)',
    lineWidth: 2,
  });

  fetchKlines(pair, '15m', 80).then(candles => {
    if (candles && candles.length) {
      series.setData(candles.map(c => ({ time: c.time, value: c.close })));
      chart.timeScale().fitContent();
    }
  });
  return chart;
}
