// Curated top-~50 coins by market cap (snapshot as of ~2026 Q1). `id` is the canonical
// CoinGecko ID (used in `/simple/price?ids=…`), NOT the ticker symbol — common pitfall:
// XRP's ID is `ripple`, BNB's is `binancecoin`, MATIC migrated to `polygon-ecosystem-token`
// (POL). `symbol` is the user-facing ticker; `name` is the full display name.
//
// Why a hardcoded catalog instead of fetching CoinGecko's coin list dynamically?
// 1. Single batched price request (50 coins in one HTTP call) — friendly to the free-tier
//    rate limit and removes the typing-induced refetch loop the symbol-input version had.
// 2. Predictable dropdown — users see the same coins every load; no race between coin-list
//    fetch and price fetch.
// 3. Aliases / forks / stablecoin variants resolved up-front (e.g. we list `wrapped-bitcoin`
//    explicitly, not just BTC).
//
// To extend: add a row here, restart the dev server. Don't worry about exceeding ~50 — the
// URL stays well under the practical query-string limit at this size.

export interface CoinCatalogEntry {
  id: string // CoinGecko ID, e.g., "bitcoin"
  symbol: string // ticker symbol, uppercase, e.g., "BTC"
  name: string // display name, e.g., "Bitcoin"
}

export const COINGECKO_TOP_COINS: readonly CoinCatalogEntry[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'tether', symbol: 'USDT', name: 'Tether' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'usd-coin', symbol: 'USDC', name: 'USDC' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
  { id: 'dogecoin', symbol: 'DOGE', name: 'Dogecoin' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'tron', symbol: 'TRX', name: 'TRON' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'shiba-inu', symbol: 'SHIB', name: 'Shiba Inu' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'polygon-ecosystem-token', symbol: 'POL', name: 'Polygon (POL, ex-MATIC)' },
  { id: 'wrapped-bitcoin', symbol: 'WBTC', name: 'Wrapped Bitcoin' },
  { id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash' },
  { id: 'litecoin', symbol: 'LTC', name: 'Litecoin' },
  { id: 'near', symbol: 'NEAR', name: 'NEAR Protocol' },
  { id: 'internet-computer', symbol: 'ICP', name: 'Internet Computer' },
  { id: 'uniswap', symbol: 'UNI', name: 'Uniswap' },
  { id: 'dai', symbol: 'DAI', name: 'Dai' },
  { id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic' },
  { id: 'cosmos', symbol: 'ATOM', name: 'Cosmos' },
  { id: 'stellar', symbol: 'XLM', name: 'Stellar' },
  { id: 'okb', symbol: 'OKB', name: 'OKB' },
  { id: 'monero', symbol: 'XMR', name: 'Monero' },
  { id: 'filecoin', symbol: 'FIL', name: 'Filecoin' },
  { id: 'injective-protocol', symbol: 'INJ', name: 'Injective' },
  { id: 'kaspa', symbol: 'KAS', name: 'Kaspa' },
  { id: 'arbitrum', symbol: 'ARB', name: 'Arbitrum' },
  { id: 'optimism', symbol: 'OP', name: 'Optimism' },
  { id: 'lido-dao', symbol: 'LDO', name: 'Lido DAO' },
  { id: 'maker', symbol: 'MKR', name: 'Maker' },
  { id: 'immutable-x', symbol: 'IMX', name: 'Immutable' },
  { id: 'crypto-com-chain', symbol: 'CRO', name: 'Cronos' },
  { id: 'vechain', symbol: 'VET', name: 'VeChain' },
  { id: 'aptos', symbol: 'APT', name: 'Aptos' },
  { id: 'hedera-hashgraph', symbol: 'HBAR', name: 'Hedera' },
  { id: 'render-token', symbol: 'RNDR', name: 'Render' },
  { id: 'the-graph', symbol: 'GRT', name: 'The Graph' },
  { id: 'algorand', symbol: 'ALGO', name: 'Algorand' },
  { id: 'mantle', symbol: 'MNT', name: 'Mantle' },
  { id: 'fetch-ai', symbol: 'FET', name: 'Fetch.ai' },
  { id: 'aave', symbol: 'AAVE', name: 'Aave' },
  { id: 'quant-network', symbol: 'QNT', name: 'Quant' },
  { id: 'tezos', symbol: 'XTZ', name: 'Tezos' },
  { id: 'axie-infinity', symbol: 'AXS', name: 'Axie Infinity' },
  { id: 'the-sandbox', symbol: 'SAND', name: 'The Sandbox' },
  { id: 'decentraland', symbol: 'MANA', name: 'Decentraland' },
  // Gold-backed stablecoins — 1 token ≈ 1 troy oz of gold. Surfaces alongside other
  // coins since users may diversify between fiat-pegged (USDT/USDC) and gold-pegged.
  { id: 'tether-gold', symbol: 'XAUT', name: 'Tether Gold' },
  { id: 'pax-gold', symbol: 'PAXG', name: 'PAX Gold' },
] as const

// Maps for O(1) lookup. Symbols are unique within the catalog (verified — no two coins
// share a ticker in the top-~50 + gold-backed set), so symbol lookup is unambiguous.
const BY_ID = new Map<string, CoinCatalogEntry>(
  COINGECKO_TOP_COINS.map((c) => [c.id, c]),
)
const BY_SYMBOL = new Map<string, CoinCatalogEntry>(
  COINGECKO_TOP_COINS.map((c) => [c.symbol, c]),
)

export function findCoinById(id: string): CoinCatalogEntry | undefined {
  return BY_ID.get(id)
}

// Resolves a free-text ticker (case-insensitive) to a catalog entry. Used by the panel
// when the user types or picks from the datalist — value flowing back from the input is
// always the symbol, never the ID.
export function findCoinBySymbol(symbol: string): CoinCatalogEntry | undefined {
  return BY_SYMBOL.get(symbol.trim().toUpperCase())
}

export function isKnownCoinId(id: string): boolean {
  return BY_ID.has(id)
}

export function allCoinIds(): string[] {
  return COINGECKO_TOP_COINS.map((c) => c.id)
}
