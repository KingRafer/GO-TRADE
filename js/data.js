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
function pairDecimals(pair) {
  return (PAIRS[pair] && PAIRS[pair].decimals != null) ? PAIRS[pair].decimals : 2;
}
function fmtPairPrice(pair, n) {
  const dec = pairDecimals(pair);
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function roundPairPrice(pair, n) {
  const dec = pairDecimals(pair);
  const f = Math.pow(10, dec);
  return Math.round(Number(n) * f) / f;
}
SYMBOLS.forEach(p => {
  marketState[p] = { price: PAIRS[p].base, change24h: 0, high24: PAIRS[p].base * 1.02, low24: PAIRS[p].base * 0.98, volume: 1e9, quoteVolume: 0 };
});
