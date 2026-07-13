/**
 * ── IQonic Strategy Filter Map — Centralized Configuration ──────────
 *
 * SINGLE SOURCE OF TRUTH for all strategy-related data across the frontend.
 * Derived from: IQonic_Strategy_Filter_Map.pdf (July 2026)
 *
 * ⚠ WARNING: This is the ONLY place strategy metadata should be defined.
 *   Do NOT duplicate strategy, pair, timeframe, or asset class data elsewhere.
 *   All consumers must import from this file.
 *
 * Symbol Convention: ALL symbols use canonical no-slash uppercase format.
 *   ✅ EURUSD, XAUUSD, BTCUSD, US30, NAS100
 *   ❌ EUR/USD, XAU/USD, BTC/USD, S&P 500
 *
 * Coverage: 5 strategies × 49 shared pairs (React/Defy)
 *   25 FX (7 majors + 18 crosses) · 3 Crypto · 14 Indices · 7 Commodities
 */

import { DollarSign, Bitcoin, BarChart3, Gem } from "lucide-react";

// ── Forex Pair Lists ────────────────────────────────────────────────

/** 7 major forex pairs */
const FOREX_MAJORS = [
  "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD",
];

/** 18 cross pairs (per PDF — excludes AUDCHF, NZDCAD, NZDCHF) */
const FOREX_CROSSES = [
  "EURGBP", "EURJPY", "EURCHF", "EURAUD", "EURCAD", "EURNZD",
  "GBPJPY", "GBPCHF", "GBPAUD", "GBPCAD", "GBPNZD",
  "AUDJPY", "AUDCAD", "AUDNZD",
  "CADCHF", "CADJPY", "CHFJPY", "NZDJPY",
];

// ── Majors — no-slash format (for Bullseye "Majors" pattern matching) ─
export const MAJORS_SYMBOLS = [
  "EURUSD", "GBPUSD", "USDJPY", "USDCHF", "AUDUSD", "USDCAD", "NZDUSD",
];

// ── Asset Class Definitions ─────────────────────────────────────────
// Used by instrument filter dropdowns, alert preferences categorization,
// and symbol grouping throughout the UI.

export const ASSET_CLASSES = [
  {
    key: "forex",
    label: "Forex",
    icon: DollarSign,
    color: "#3b82f6",
    colorLight: "#3b82f615",
    instruments: [
      ...FOREX_MAJORS.map((s) => ({ symbol: s, label: s })),
      ...FOREX_CROSSES.map((s) => ({ symbol: s, label: s })),
    ],
  },
  {
    key: "crypto",
    label: "Crypto",
    icon: Bitcoin,
    color: "#f59e0b",
    colorLight: "#f59e0b15",
    instruments: [
      { symbol: "BTCUSD", label: "Bitcoin" },
      { symbol: "ETHUSD", label: "Ethereum" },
      { symbol: "SOLUSD", label: "Solana" },
    ],
  },
  {
    key: "indices",
    label: "Indices",
    icon: BarChart3,
    color: "#8b5cf6",
    colorLight: "#8b5cf615",
    instruments: [
      { symbol: "US30", label: "Dow Jones" },
      { symbol: "SP500", label: "S&P 500" },
      { symbol: "NAS100", label: "Nasdaq 100" },
      { symbol: "US2000", label: "Russell 2000" },
      { symbol: "GER40", label: "DAX" },
      { symbol: "FRA40", label: "CAC 40" },
      { symbol: "UK100", label: "FTSE 100" },
      { symbol: "EURO50", label: "Euro Stoxx 50" },
      { symbol: "SPA35", label: "IBEX 35" },
      { symbol: "SWI20", label: "SMI" },
      { symbol: "JPN225", label: "Nikkei 225" },
      { symbol: "HK50", label: "Hang Seng" },
      { symbol: "CHN50", label: "China A50" },
      { symbol: "AUS200", label: "ASX 200" },
    ],
  },
  {
    key: "commodities",
    label: "Commodities",
    icon: Gem,
    color: "#10b981",
    colorLight: "#10b98115",
    instruments: [
      { symbol: "XAUUSD", label: "Gold" },
      { symbol: "XAGUSD", label: "Silver" },
      { symbol: "XPTUSD", label: "Platinum" },
      { symbol: "XPDUSD", label: "Palladium" },
      { symbol: "UKOIL", label: "Brent" },
      { symbol: "USOIL", label: "WTI" },
      { symbol: "NGAS", label: "Natural Gas" },
    ],
  },
];

// ── All 49 Pairs (flattened from asset classes) ─────────────────────
// Used by React and Defy strategies (both cover the full set).
export const ALL_PAIRS = ASSET_CLASSES.flatMap((c) => c.instruments.map((i) => i.symbol));

// ── Strategy Timeframes (canonical M/H format) ─────────────────────
// The 7 timeframes used across all strategies.
export const STRATEGY_TIMEFRAMES = ["M1", "M3", "M5", "M15", "M30", "H1", "H4"];

// ── All Filter Timeframe Options ────────────────────────────────────
// Full set of TradingView timeframes for the signal filter dropdown.
// Includes timeframes beyond the strategy set (45m, 2H, 3H, 1D, etc.)
// because signals may arrive on any TradingView interval.
export const ALL_FILTER_TIMEFRAME_OPTIONS = [
  { value: "1m", label: "1m" },
  { value: "3m", label: "3m" },
  { value: "5m", label: "5m" },
  { value: "15m", label: "15m" },
  { value: "30m", label: "30m" },
  { value: "45m", label: "45m" },
  { value: "1H", label: "1H" },
  { value: "2H", label: "2H" },
  { value: "3H", label: "3H" },
  { value: "4H", label: "4H" },
  { value: "1D", label: "1D" },
  { value: "1W", label: "1W" },
  { value: "1M", label: "1M" },
];

// ── Strategy Definitions ────────────────────────────────────────────
// Each strategy defines its supported pairs, timeframes, and optional
// per-pair timeframe constraints (pairTimeframeMap).
//
// pairTimeframeMap: null = uniform (all pairs × all timeframes).
// pairTimeframeMap: { normalizedPair: [allowedTfs] } = per-pair constraints.

export const STRATEGIES = [
  {
    key: "react",
    name: "React",
    pairs: ALL_PAIRS,
    timeframes: STRATEGY_TIMEFRAMES,
    assetClasses: ["forex", "crypto", "indices", "commodities"],
    pairTimeframeMap: null,
    totalPairs: 49,
  },
  {
    key: "defy",
    name: "DEFY",
    pairs: ALL_PAIRS,
    timeframes: STRATEGY_TIMEFRAMES,
    assetClasses: ["forex", "crypto", "indices", "commodities"],
    pairTimeframeMap: null,
    totalPairs: 48,
  },
  {
    key: "killshot",
    name: "Killshot",
    pairs: ["US30", "XAUUSD", "EURUSD", "BTCUSD"],
    timeframes: ["M1", "M3", "M5"],
    assetClasses: ["forex", "crypto", "indices"],
    pairTimeframeMap: {
      US30: ["M1"],
      XAUUSD: ["M3"],
      EURUSD: ["M5"],
      BTCUSD: ["M5"],
    },
    totalPairs: 4,
  },
  {
    key: "supernova",
    name: "Supernova",
    pairs: ["XAUUSD", "GBPNZD", "US30"],
    timeframes: ["M15", "H4"],
    assetClasses: ["forex", "indices", "commodities"],
    pairTimeframeMap: {
      XAUUSD: ["M15"],
      GBPNZD: ["H4"],
      US30: ["M15"],
    },
    totalPairs: 3,
  },
  {
    key: "bullseye",
    name: "Bullseye",
    pairs: ["XAUUSD", "GER40", "NAS100", "SP500", "Majors"],
    timeframes: ["M5"],
    assetClasses: ["indices", "commodities", "forex"],
    pairTimeframeMap: null,
    totalPairs: 5,
  },
];

// ── Strategy lookup map ─────────────────────────────────────────────
export const STRATEGIES_MAP = Object.fromEntries(
  STRATEGIES.map((s) => [s.key, s])
);

// ── DB strategy name → config key mapping ───────────────────────────
// Maps lowercase DB/webhook names to strategy config keys.
export const DB_NAME_TO_STRATEGY_KEY = {
  defy: "defy",
  bullseye: "bullseye",
  killshot: "killshot",
  react: "react",
  "smart_shot": "smart_shot",
  supernova: "supernova",
};

// ── Strategies that use hierarchical UI (asset class grouping) ──────
// React and Defy have 48 pairs — they use a three-level hierarchy:
// Strategy → Asset Class → Pair × Timeframe table.
export const HIERARCHICAL_STRATEGIES = new Set(["react", "defy"]);

// ── Helper Functions ────────────────────────────────────────────────

/**
 * Check if a pair + timeframe combination is valid for a given strategy.
 * For strategies with per-pair timeframe constraints (Killshot, Supernova),
 * only specific pair→TF combinations are valid.
 * For uniform strategies (React, Defy, Bullseye), all combinations are valid.
 *
 * @param {string} strategyKey - e.g. "killshot", "supernova"
 * @param {string} pair        - e.g. "EURUSD", "XAUUSD", "US30"
 * @param {string} tf          - e.g. "M1", "M5", "H4"
 * @returns {boolean} true if the combination is valid
 */
export function isValidPairTimeframe(strategyKey, pair, tf) {
  const strategy = STRATEGIES_MAP[strategyKey];
  if (!strategy || !strategy.pairTimeframeMap) return true;
  const normPair = String(pair).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const allowedTfs = strategy.pairTimeframeMap[normPair];
  if (!allowedTfs) return true;
  return allowedTfs.includes(tf);
}

/**
 * Get a strategy config by key.
 * @param {string} key - e.g. "killshot"
 * @returns {Object|null}
 */
export function getStrategyConfig(key) {
  return STRATEGIES_MAP[key] || null;
}

/**
 * Compute the union of pairs across multiple selected strategies.
 * @param {string[]} strategyKeys - e.g. ["killshot", "supernova"]
 * @returns {string[]}
 */
export function getUnionPairs(strategyKeys) {
  const pairSet = new Set();
  strategyKeys.forEach((key) => {
    const strategy = STRATEGIES_MAP[key];
    if (strategy) strategy.pairs.forEach((p) => pairSet.add(p));
  });
  return [...pairSet];
}

/**
 * Compute the union of timeframes across multiple selected strategies.
 * Returns in canonical order (M1, M3, M5, M15, M30, H1, H4).
 * @param {string[]} strategyKeys
 * @returns {string[]}
 */
export function getUnionTimeframes(strategyKeys) {
  const tfSet = new Set();
  strategyKeys.forEach((key) => {
    const strategy = STRATEGIES_MAP[key];
    if (strategy) strategy.timeframes.forEach((tf) => tfSet.add(tf));
  });
  return STRATEGY_TIMEFRAMES.filter((tf) => tfSet.has(tf));
}

/**
 * Get asset class categories with symbols as Sets.
 * Used by AlertPairPreferences for categorizing strategy pairs.
 * @returns {Array<{key, label, icon, color, colorLight, symbols: Set}>}
 */
export function getAssetClassCategories() {
  return ASSET_CLASSES.map((cat) => ({
    key: cat.key,
    label: cat.label,
    icon: cat.icon,
    color: cat.color,
    colorLight: cat.colorLight,
    symbols: new Set(cat.instruments.map((i) => i.symbol)),
  }));
}

/**
 * Convert a canonical timeframe (M1, H4) to filter/display format (1m, 4H).
 * @param {string} tf - e.g. "M1", "M15", "H4"
 * @returns {string} - e.g. "1m", "15m", "4H"
 */
export function canonicalToFilterTf(tf) {
  const minMatch = tf.match(/^M(\d+)$/);
  if (minMatch) return `${minMatch[1]}m`;
  const hourMatch = tf.match(/^H(\d+)$/);
  if (hourMatch) return `${hourMatch[1]}H`;
  return tf;
}
