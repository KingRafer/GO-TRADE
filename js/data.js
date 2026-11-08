/* GO TRADE — Real Market Data Engine + Store */
const PAIRS = {
  BTCUSDT:  { name: 'Bitcoin',   coingecko: 'bitcoin',      decimals: 2, base: 76000 },
  ETHUSDT:  { name: 'Ethereum',  coingecko: 'ethereum',     decimals: 2, base: 2200 },
  SOLUSDT:  { name: 'Solana',    coingecko: 'solana',       decimals: 2, base: 90 },
  BNBUSDT:  { name: 'BNB',       coingecko: 'binancecoin',  decimals: 2, base: 690 },
  XRPUSDT:  { name: 'XRP',       coingecko: 'ripple',       decimals: 4, base: 0.55 },
  DOGEUSDT: { name: 'Dogecoin',  coingecko: 'dogecoin',     decimals: 5, base: 0.14 },
  ADAUSDT:  { name: 'Cardano',   coingecko: 'cardano',      decimals: 4, base: 0.45 },
  AVAXUSDT: { name: 'Avalanche', coingecko: 'avalanche-2',  decimals: 2, base: 28 },
};
const SYMBOLS = Object.keys(PAIRS);
let marketState = {};
let lastFetch = 0;
let useRealData = true;
SYMBOLS.forEach(p => {
  marketState[p] = { price: PAIRS[p].base, change24h: 0, high24: PAIRS[p].base * 1.02, low24: PAIRS[p].base * 0.98, volume: 1e9, quoteVolume: 0 };
});
async function fetchRealTickers() {
  try {
    const symbols = JSON.stringify(SYMBOLS);
    const url = 'https://data-api.binance.vision/api/v3/ticker/24hr?symbols=' + encodeURIComponent(symbols);
    const res = await fetch(url);
    if (!res.ok) throw new Error('ticker fail');
    const data = await res.json();
    data.forEach(t => {
      if (!marketState[t.symbol]) return;
      marketState[t.symbol] = {
        price: parseFloat(t.lastPrice),
        change24h: parseFloat(t.priceChangePercent),
        high24: parseFloat(t.highPrice),
        low24: parseFloat(t.lowPrice),
        volume: parseFloat(t.volume),
        quoteVolume: parseFloat(t.quoteVolume),
      };
    });
    useRealData = true;
    lastFetch = Date.now();
    return true;
  } catch (e) {
    console.warn('Binance ticker failed, trying CoinGecko', e);
    return fetchCoinGecko();
  }
}
async function fetchCoinGecko() {
  try {
    const ids = Object.values(PAIRS).map(p => p.coingecko).join(',');
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=' + ids + '&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true');
    if (!res.ok) throw new Error('cg fail');
    const data = await res.json();
    Object.entries(PAIRS).forEach(([sym, meta]) => {
      const d = data[meta.coingecko];
      if (!d) return;
      marketState[sym] = {
        price: d.usd,
        change24h: d.usd_24h_change || 0,
        high24: d.usd * 1.015,
        low24: d.usd * 0.985,
        volume: d.usd_24h_vol || 1e9,
        quoteVolume: d.usd_24h_vol || 1e9,
      };
    });
    useRealData = true;
    lastFetch = Date.now();
    return true;
  } catch (e) {
    console.warn('CoinGecko also failed, using simulation', e);
    useRealData = false;
    return false;
  }
}
async function fetchKlines(symbol, interval = '5m', limit = 200) {
  try {
    const url = 'https://data-api.binance.vision/api/v3/klines?symbol=' + symbol + '&interval=' + interval + '&limit=' + limit;
    const res = await fetch(url);
    if (!res.ok) throw new Error('klines fail');
    const raw = await res.json();
    return raw.map(k => ({
      time: Math.floor(k[0] / 1000),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));
  } catch (e) {
    console.warn('Real klines failed, generating', e);
    return generateCandles(symbol, interval, limit);
  }
}
function generateCandles(pair, tf = '5m', count = 200) {
  const base = marketState[pair]?.price || PAIRS[pair].base;
  const candles = [];
  let price = base * (0.96 + Math.random() * 0.04);
  const now = Math.floor(Date.now() / 1000);
  const tfSec = { '1m': 60, '5m': 300, '15m': 900, '1h': 3600, '4h': 14400, '1d': 86400 }[tf] || 300;
  for (let i = count; i >= 0; i--) {
    const time = now - i * tfSec;
    const volatility = base * 0.0025;
    const open = price;
    const change = (Math.random() - 0.48) * volatility * 2;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.random() * 800 + 50;
    candles.push({ time, open, high, low, close, volume });
    price = close;
  }
  if (candles.length && marketState[pair]) {
    const last = candles[candles.length - 1];
    last.close = marketState[pair].price;
    last.high = Math.max(last.high, last.close);
    last.low = Math.min(last.low, last.close);
  }
  return candles;
}
const SIGNAL_REASONS = {
  long: ['Bullish engulfing + RSI divergence di support kuat','Breakout resistance volume tinggi + MACD golden cross','Order block bullish + FVG terisi, confluence multi-TF','Liquidity grab di bawah + smart money masuk terdeteksi','EMA 50/200 golden cross + volume profile POC support','Higher high + higher low structure + ADX rising','Demand zone H4 + bullish pinbar konfirmasi M15'],
  short: ['Bearish engulfing di resistance + RSI overbought','Breakdown support volume + MACD death cross','Order block bearish + liquidity above taken','Rejection di supply zone + divergence bearish jelas','EMA death cross + volume profile distribution','Lower high + lower low + ADX confirming trend','Supply zone H1 + bearish engulfing konfirmasi'],
};
function generateSignal(forcePair = null) {
  const pair = forcePair || SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  const side = Math.random() > 0.47 ? 'long' : 'short';
  const price = marketState[pair]?.price || PAIRS[pair].base;
  const conf = Math.floor(74 + Math.random() * 23);
  const atrPct = 0.006 + Math.random() * 0.012;
  const atr = price * atrPct;
  const dec = PAIRS[pair].decimals;
  let entry, sl, tp1, tp2, tp3;
  if (side === 'long') {
    entry = price * (0.9985 + Math.random() * 0.002);
    sl = entry - atr * 1.15;
    tp1 = entry + atr * 1.6;
    tp2 = entry + atr * 2.9;
    tp3 = entry + atr * 4.5;
  } else {
    entry = price * (0.999 + Math.random() * 0.002);
    sl = entry + atr * 1.15;
    tp1 = entry - atr * 1.6;
    tp2 = entry - atr * 2.9;
    tp3 = entry - atr * 4.5;
  }
  const reasons = SIGNAL_REASONS[side];
  return {
    id: 'SIG-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    pair, side,
    entry: +entry.toFixed(dec), sl: +sl.toFixed(dec),
    tp1: +tp1.toFixed(dec), tp2: +tp2.toFixed(dec), tp3: +tp3.toFixed(dec),
    confidence: conf,
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    timeframe: ['5m', '15m', '1h', '4h'][Math.floor(Math.random() * 4)],
    status: 'active',
    createdAt: new Date().toISOString(),
    rr: (Math.abs(tp1 - entry) / Math.abs(entry - sl)).toFixed(1),
  };
}
let signals = [];
function seedSignals() {
  signals = Array.from({ length: 10 }, () => generateSignal()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
const DEFAULT_USER = {
  id: 'u-demo', name: 'satrio', email: 'demo@gotrade.io', role: 'member',
  balance: 1250.50, equity: 1250.50, pnlToday: 31.50, pnlTotal: 186.30,
  activePackage: 'Growth', verified: true, referralCode: 'GOTRADE-DEMO1', avatar: null, joinedAt: '2025-11-12',
};
const PACKAGES = [
  { id: 'starter', name: 'Starter', price: 50, roi: 1.1, duration: 30, features: ['Sinyal dasar', 'Chart standar', 'Risk basic', 'Support komunitas'] },
  { id: 'growth', name: 'Growth', price: 250, roi: 1.8, duration: 45, features: ['Sinyal prioritas', 'AI confidence', 'Trailing stop', 'AI Coach', 'Bonus referral'], popular: true },
  { id: 'pro', name: 'Pro', price: 1000, roi: 2.5, duration: 60, features: ['Sinyal eksklusif', 'Deep insight', 'Dedicated risk', 'Custom strategy', '24/7 support', 'Early access'] },
];
const NEWS = [
  { id: 1, title: 'BTC menembus resistance kunci, AI mendeteksi momentum kuat berlanjut', time: '8 menit lalu', tag: 'Market' },
  { id: 2, title: 'Update sistem: Trailing stop dinamis ATR sekarang tersedia di Growth+', time: '1 jam lalu', tag: 'Product' },
  { id: 3, title: 'ETH menunjukkan pola accumulation di order block harian', time: '2 jam lalu', tag: 'Analysis' },
  { id: 4, title: 'Maintenance terjadwal 10 Nov 02:00 UTC', time: '5 jam lalu', tag: 'System' },
  { id: 5, title: 'AI Model v2.1 deployed — akurasi signal naik 3.2%', time: '1 hari lalu', tag: 'Product' },
];
const NOTIFS = [
  { id: 1, text: 'Sinyal baru BTCUSDT LONG dengan confidence 91%', time: '2m', read: false },
  { id: 2, text: 'Deposit $500 berhasil dikonfirmasi', time: '1h', read: false },
  { id: 3, text: 'Paket Growth Anda aktif hingga 22 Des 2026', time: '3h', read: true },
  { id: 4, text: 'Referral bonus $25 masuk ke wallet', time: '5h', read: true },
];
let positions = [
  { pair: 'BTCUSDT', side: 'long', size: 0.12, entry: 74250, current: 75884, pnl: 196.08, pnlPct: 2.20 },
  { pair: 'ETHUSDT', side: 'long', size: 2.8, entry: 2180, current: 2234, pnl: 151.20, pnlPct: 2.48 },
  { pair: 'SOLUSDT', side: 'short', size: 45, entry: 92.40, current: 89.18, pnl: 144.90, pnlPct: 3.49 },
];
let transactions = [
  { id: 'TX001', type: 'deposit', amount: 500, status: 'completed', date: '2026-11-05 14:22' },
  { id: 'TX002', type: 'package', amount: -250, status: 'completed', date: '2026-11-04 09:15', note: 'Growth Package' },
  { id: 'TX003', type: 'profit', amount: 48.5, status: 'completed', date: '2026-11-03 23:00', note: 'Daily ROI' },
  { id: 'TX004', type: 'withdraw', amount: -200, status: 'pending', date: '2026-11-06 11:40' },
  { id: 'TX005', type: 'bonus', amount: 25, status: 'completed', date: '2026-11-02 16:00', note: 'Referral bonus' },
  { id: 'TX006', type: 'profit', amount: 62.3, status: 'completed', date: '2026-11-06 23:00', note: 'Daily ROI' },
];
let adminUsers = [
  { id: 1, name: 'Demo Trader', email: 'demo@go-trade.app', role: 'member', balance: 12580, status: 'active', joined: '2025-11-12' },
  { id: 2, name: 'Andi Rahman', email: 'andi@mail.com', role: 'member', balance: 8420, status: 'active', joined: '2026-01-08' },
  { id: 3, name: 'Sari Lestari', email: 'sari@mail.com', role: 'member', balance: 22100, status: 'active', joined: '2025-09-20' },
  { id: 4, name: 'Budi Kusuma', email: 'budi@agency.id', role: 'member', balance: 45000, status: 'active', joined: '2025-08-15' },
  { id: 5, name: 'Admin GO TRADE', email: 'admin@go-trade.app', role: 'admin', balance: 0, status: 'active', joined: '2025-06-01' },
];
function tickPrices() {
  if (useRealData && Date.now() - lastFetch < 8000) {
    SYMBOLS.forEach(p => {
      const vol = marketState[p].price * 0.00015;
      marketState[p].price += (Math.random() - 0.5) * vol * 2;
    });
  } else if (!useRealData) {
    SYMBOLS.forEach(p => {
      const vol = marketState[p].price * 0.0008;
      marketState[p].price = Math.max(0.00001, marketState[p].price + (Math.random() - 0.5) * vol * 2);
      marketState[p].change24h = +(parseFloat(marketState[p].change24h) + (Math.random() - 0.5) * 0.04).toFixed(2);
    });
  }
  positions.forEach(pos => {
    pos.current = marketState[pos.pair]?.price || pos.current;
    const mult = pos.side === 'long' ? 1 : -1;
    pos.pnl = (pos.current - pos.entry) * pos.size * mult;
    pos.pnlPct = ((pos.current - pos.entry) / pos.entry) * 100 * mult;
  });
}
seedSignals();
fetchRealTickers().then(() => {
  positions.forEach(pos => {
    if (marketState[pos.pair]) {
      const p = marketState[pos.pair].price;
      if (pos.side === 'long') pos.entry = p * (0.975 + Math.random() * 0.015);
      else pos.entry = p * (1.01 + Math.random() * 0.015);
      pos.current = p;
      const mult = pos.side === 'long' ? 1 : -1;
      pos.pnl = (pos.current - pos.entry) * pos.size * mult;
      pos.pnlPct = ((pos.current - pos.entry) / pos.entry) * 100 * mult;
    }
  });
});
