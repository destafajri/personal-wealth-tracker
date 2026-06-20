// Brand-tinted background colors per ticker. Used by TickerChip to give each
// holding a recognizable visual identity (Robinhood/Stockbit-style), so users
// can scan a portfolio grid by color, not just by reading tickers.
//
// Mapping is curated for the most common IDX + crypto holdings Cermat users
// track. Unmapped tickers fall back to a deterministic hash-based color so the
// same ticker always renders the same color across sessions (no flicker), while
// avoiding the work of curating every possible ticker.

const BRAND_COLORS: Record<string, string> = {
  // IDX — banks
  BBRI: '#1e40af', // BRI navy
  BMRI: '#0e7a3d', // Mandiri green
  BBCA: '#1e3a8a', // BCA blue
  BBNI: '#f59e0b', // BNI orange
  BBYB: '#15803d', // BCA Digital
  BRIS: '#15803d', // BSI syariah green
  BNGA: '#b91c1c', // CIMB red
  PNBN: '#0e7a3d', // BRI Agro green
  BNII: '#f59e0b', // BNI Syariah orange

  // IDX — telco + tech
  TLKM: '#f97316', // Telkom orange
  ISAT: '#b91c1c', // Indosat red
  EXCL: '#1e40af', // XL blue
  TOWR: '#dc2626', // Tower Bersama red
  MTEL: '#f97316', // Daya Mandiri Telco orange
  GOTO: '#6d28d9', // GoTo purple
  EMTK: '#e11d48', // Elang Mahkota pink
  BUKA: '#e11d48', // Bukalapak pink

  // IDX — consumer / misc blue-chip
  UNVR: '#1e40af', // Unilever blue
  ASII: '#dc2626', // Astra red
  KLBF: '#15803d', // Kalbe green
  INDF: '#dc2626', // Indofood red
  ICBP: '#dc2626', // Indofood CBP red
  CPIN: '#dc2626', // Charoen Pokphand red
  JPFA: '#b91c1c', // Japfa red
  MYOR: '#1e40af', // Mayora blue
  ULTJ: '#0e7a3d', // Ultrajaya green

  // IDX — energy + materials
  ADRO: '#1e40af', // Adaro blue
  ITMG: '#0f172a', // Indo Tambang dark
  ANTM: '#b45309', // Aneka Tambang amber
  INCO: '#0e7a3d', // Vale green
  MDKA: '#475569', // Merdeka gray
  PGAS: '#1e40af', // Perusahaan Gas blue
  MEDC: '#b45309', // Medco amber
  HRUM: '#0f172a', // Harum dark

  // Crypto — top by market cap
  BTC: '#f7931a', // Bitcoin brand orange
  ETH: '#627eea', // Ethereum brand purple
  USDT: '#26a17b', // Tether brand green
  BNB: '#f3ba2f', // BNB yellow
  XRP: '#23292f', // Ripple dark
  SOL: '#9945ff', // Solana purple
  USDC: '#2775ca', // USDC blue
  ADA: '#0033ad', // Cardano blue
  AVAX: '#e84142', // Avalanche red
  DOGE: '#c2a633', // Doge gold
  TRX: '#ff060a', // Tron red
  DOT: '#e6007a', // Polkadot pink
  MATIC: '#8247e5', // Polygon purple
  LTC: '#345d9d', // Litecoin blue
  SHIB: '#f00500', // Shiba red
  XAUT: '#ffd700', // Tether Gold
  PAXG: '#ffd700', // PAX Gold
  LINK: '#2a5ada', // Chainlink blue
  UNI: '#ff007a', // Uniswap pink
  ATOM: '#2e3148', // Cosmos dark
}

const FALLBACK_PALETTE = [
  '#475569', // slate-600
  '#64748b', // slate-500
  '#0e7490', // cyan-700
  '#7c2d12', // orange-900
  '#854d0e', // yellow-800
  '#365314', // lime-900
  '#3b0764', // purple-900
  '#831843', // pink-900
  '#1e3a8a', // blue-900
  '#0c4a6e', // sky-900
]

// Deterministic hash → palette index. Same ticker always renders the same color
// across sessions (no flicker on re-render). djb2 string hash.
function hashTicker(ticker: string): number {
  let hash = 5381
  for (let i = 0; i < ticker.length; i++) {
    hash = (hash * 33) ^ ticker.charCodeAt(i)
  }
  return Math.abs(hash) % FALLBACK_PALETTE.length
}

export function tickerColor(ticker: string): string {
  const key = ticker.trim().toUpperCase()
  if (!key) return FALLBACK_PALETTE[0]!
  return BRAND_COLORS[key] ?? FALLBACK_PALETTE[hashTicker(key)]!
}

// Compute readable text color (white vs near-black) against a given background
// hex. Used by TickerChip to ensure the ticker letters meet contrast 4.5:1.
export function readableTextColor(bgHex: string): string {
  const hex = bgHex.replace('#', '')
  if (hex.length !== 6) return '#ffffff'
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  // Relative luminance per WCAG
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.6 ? '#0f172a' : '#ffffff'
}
