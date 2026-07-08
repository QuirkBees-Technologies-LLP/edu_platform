import React, { useMemo, useId } from "react";
import { DollarSign, Bitcoin, BarChart3, Gem, HelpCircle } from "lucide-react";

// ── Helpers ─────────────────────────────────────────────────────────

/** Generate a 5-pointed star polygon string centered at (cx, cy) */
const starPoints = (cx, cy, outerR, innerR = outerR * 0.4) => {
  return [...Array(10)]
    .map((_, i) => {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = ((i * 36 - 90) * Math.PI) / 180;
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
    })
    .join(" ");
};

// ── Known currencies for forex detection ────────────────────────────
const KNOWN_CURRENCIES = [
  "USD", "EUR", "GBP", "JPY", "CAD", "CHF", "AUD", "NZD",
  "SGD", "HKD", "SEK", "NOK", "MXN", "ZAR", "TRY", "PLN",
  "DKK", "CZK", "HUF", "ILS", "THB", "CNY", "INR", "BRL",
];

// Currency → background color for text-fallback badges
const CURRENCY_COLORS = {
  USD: "#002868", EUR: "#003399", GBP: "#012169", JPY: "#BC002D",
  CAD: "#FF0000", CHF: "#D52B1E", AUD: "#00008B", NZD: "#00247D",
  SGD: "#EF3340", HKD: "#DE2910", SEK: "#006AA7", NOK: "#BA0C2F",
  MXN: "#006847", ZAR: "#007749", TRY: "#E30A17", PLN: "#DC143C",
  DKK: "#C8102E", CZK: "#11457E", HUF: "#477050", ILS: "#0038B8",
  THB: "#A51931", CNY: "#DE2910", INR: "#FF9933", BRL: "#009739",
};

// ── Country Flag SVGs (circular) ────────────────────────────────────
// Minimalist flat circle flags matching TradingView style.
// All flags are clipped to a circle via <clipPath>.

const flags = {
  USD: ({ size = 20, clipId }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <clipPath id={clipId}><circle cx="20" cy="20" r="20" /></clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx="20" cy="20" r="20" fill="#002868" />
        <rect x="0" y="4" width="40" height="3" fill="#BF0A30" />
        <rect x="0" y="10" width="40" height="3" fill="#BF0A30" />
        <rect x="0" y="16" width="40" height="3" fill="#BF0A30" />
        <rect x="0" y="22" width="40" height="3" fill="#BF0A30" />
        <rect x="0" y="28" width="40" height="3" fill="#BF0A30" />
        <rect x="0" y="34" width="40" height="3" fill="#BF0A30" />
        <rect x="0" y="7" width="40" height="3" fill="white" />
        <rect x="0" y="13" width="40" height="3" fill="white" />
        <rect x="0" y="19" width="40" height="3" fill="white" />
        <rect x="0" y="25" width="40" height="3" fill="white" />
        <rect x="0" y="31" width="40" height="3" fill="white" />
        <rect x="0" y="0" width="18" height="19" fill="#002868" />
        {/* Stars simplified as dots */}
        <circle cx="4" cy="4" r="1" fill="white" />
        <circle cx="8" cy="4" r="1" fill="white" />
        <circle cx="12" cy="4" r="1" fill="white" />
        <circle cx="16" cy="4" r="1" fill="white" />
        <circle cx="6" cy="7" r="1" fill="white" />
        <circle cx="10" cy="7" r="1" fill="white" />
        <circle cx="14" cy="7" r="1" fill="white" />
        <circle cx="4" cy="10" r="1" fill="white" />
        <circle cx="8" cy="10" r="1" fill="white" />
        <circle cx="12" cy="10" r="1" fill="white" />
        <circle cx="16" cy="10" r="1" fill="white" />
        <circle cx="6" cy="13" r="1" fill="white" />
        <circle cx="10" cy="13" r="1" fill="white" />
        <circle cx="14" cy="13" r="1" fill="white" />
        <circle cx="4" cy="16" r="1" fill="white" />
        <circle cx="8" cy="16" r="1" fill="white" />
        <circle cx="12" cy="16" r="1" fill="white" />
      </g>
    </svg>
  ),
  EUR: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#003399" />
      {/* 12 five-pointed stars arranged in a circle */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const cx = 20 + 12 * Math.cos(angle);
        const cy = 20 + 12 * Math.sin(angle);
        return (
          <polygon
            key={i}
            points={starPoints(cx, cy, 2.5, 1)}
            fill="#FFCC00"
          />
        );
      })}
    </svg>
  ),
  GBP: ({ size = 20, clipId }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <clipPath id={clipId}><circle cx="20" cy="20" r="20" /></clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx="20" cy="20" r="20" fill="#012169" />
        <line x1="0" y1="0" x2="40" y2="40" stroke="white" strokeWidth="5" />
        <line x1="40" y1="0" x2="0" y2="40" stroke="white" strokeWidth="5" />
        <line x1="0" y1="0" x2="40" y2="40" stroke="#C8102E" strokeWidth="2" />
        <line x1="40" y1="0" x2="0" y2="40" stroke="#C8102E" strokeWidth="2" />
        <rect x="16" y="0" width="8" height="40" fill="white" />
        <rect x="0" y="16" width="40" height="8" fill="white" />
        <rect x="17.5" y="0" width="5" height="40" fill="#C8102E" />
        <rect x="0" y="17.5" width="40" height="5" fill="#C8102E" />
      </g>
    </svg>
  ),
  JPY: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="white" />
      <circle cx="20" cy="20" r="8.5" fill="#BC002D" />
      <circle cx="20" cy="20" r="19.5" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
    </svg>
  ),
  CAD: ({ size = 20, clipId }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <clipPath id={clipId}><circle cx="20" cy="20" r="20" /></clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx="20" cy="20" r="20" fill="white" />
        <rect x="0" y="0" width="10" height="40" fill="#FF0000" />
        <rect x="30" y="0" width="10" height="40" fill="#FF0000" />
        <path d="M20 10 L22 16 L28 16 L23 20 L25 26 L20 22 L15 26 L17 20 L12 16 L18 16Z" fill="#FF0000" />
      </g>
    </svg>
  ),
  CHF: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#D52B1E" />
      <rect x="16" y="10" width="8" height="20" fill="white" rx="1" />
      <rect x="10" y="16" width="20" height="8" fill="white" rx="1" />
    </svg>
  ),
  AUD: ({ size = 20, clipId }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <clipPath id={clipId}><circle cx="20" cy="20" r="20" /></clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx="20" cy="20" r="20" fill="#00008B" />
        <rect x="0" y="0" width="18" height="14" fill="#012169" />
        <line x1="0" y1="0" x2="18" y2="14" stroke="white" strokeWidth="2" />
        <line x1="18" y1="0" x2="0" y2="14" stroke="white" strokeWidth="2" />
        <rect x="7.5" y="0" width="3" height="14" fill="white" />
        <rect x="0" y="5.5" width="18" height="3" fill="white" />
        <rect x="8" y="0" width="2" height="14" fill="#C8102E" />
        <rect x="0" y="6" width="18" height="2" fill="#C8102E" />
        <circle cx="30" cy="12" r="1.5" fill="white" />
        <circle cx="33" cy="18" r="1.5" fill="white" />
        <circle cx="28" cy="22" r="1.5" fill="white" />
        <circle cx="32" cy="26" r="1.5" fill="white" />
        <circle cx="26" cy="30" r="1" fill="white" />
        <circle cx="9" cy="26" r="2.5" fill="white" />
      </g>
    </svg>
  ),
  NZD: ({ size = 20, clipId }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <defs>
        <clipPath id={clipId}><circle cx="20" cy="20" r="20" /></clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx="20" cy="20" r="20" fill="#00247D" />
        <rect x="0" y="0" width="18" height="14" fill="#012169" />
        <line x1="0" y1="0" x2="18" y2="14" stroke="white" strokeWidth="2" />
        <line x1="18" y1="0" x2="0" y2="14" stroke="white" strokeWidth="2" />
        <rect x="7.5" y="0" width="3" height="14" fill="white" />
        <rect x="0" y="5.5" width="18" height="3" fill="white" />
        <rect x="8" y="0" width="2" height="14" fill="#C8102E" />
        <rect x="0" y="6" width="18" height="2" fill="#C8102E" />
        <circle cx="30" cy="12" r="1.8" fill="#CC142B" stroke="white" strokeWidth="0.5" />
        <circle cx="33" cy="20" r="1.8" fill="#CC142B" stroke="white" strokeWidth="0.5" />
        <circle cx="30" cy="28" r="1.8" fill="#CC142B" stroke="white" strokeWidth="0.5" />
        <circle cx="26" cy="22" r="1.5" fill="#CC142B" stroke="white" strokeWidth="0.5" />
      </g>
    </svg>
  ),
};

// ── Text-circle fallback for currencies without a full SVG flag ─────

const CurrencyTextBadge = ({ code = "", size = 20 }) => {
  const bg = CURRENCY_COLORS?.[code] || "#64748b";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill={bg} />
      <circle cx="20" cy="20" r="18" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.25" />
      <text
        x="20"
        y="21"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={(code?.length || 0) > 2 ? "12" : "14"}
        fontWeight="800"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {code || ""}
      </text>
    </svg>
  );
};

// ── Crypto Icons ────────────────────────────────────────────────────

const cryptoIcons = {
  BTC: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#F7931A" />
      <path
        d="M27.2 17.7c.4-2.5-1.5-3.9-4.2-4.8l.9-3.5-2.1-.5-.8 3.4c-.6-.1-1.1-.3-1.7-.4l.8-3.4-2.1-.5-.9 3.5c-.5-.1-.9-.2-1.4-.3l-2.8-.7-.6 2.2s1.5.4 1.5.4c.8.2 1 .8.9 1.2l-1 3.8c.1 0 .1 0 .2.1h-.2l-1.3 5.3c-.1.3-.4.7-.9.5 0 0-1.5-.4-1.5-.4l-1 2.4 2.7.7c.5.1 1 .3 1.5.4l-.9 3.5 2.1.5.9-3.5c.6.2 1.1.3 1.7.4l-.9 3.5 2.1.5.9-3.5c3.7.7 6.5.4 7.7-2.9.9-2.7 0-4.2-2-5.2 1.4-.3 2.5-1.3 2.8-3.2zm-5 7c-.7 2.7-5.1 1.2-6.6.9l1.2-4.7c1.4.4 6.1 1.1 5.4 3.8zm.7-7c-.6 2.4-4.3 1.2-5.5.9l1.1-4.3c1.2.3 5.1.9 4.4 3.4z"
        fill="white"
      />
    </svg>
  ),
  ETH: ({ size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#627EEA" />
      <path d="M20 6L12 20.5L20 24.5L28 20.5L20 6Z" fill="white" fillOpacity="0.6" />
      <path d="M20 6L20 24.5L28 20.5L20 6Z" fill="white" />
      <path d="M20 26.5L12 22.5L20 34L28 22.5L20 26.5Z" fill="white" fillOpacity="0.6" />
      <path d="M20 26.5L20 34L28 22.5L20 26.5Z" fill="white" />
    </svg>
  ),
  SOL: ({ size = 20, gradientId }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#0D0D0D" />
      <defs>
        <linearGradient id={gradientId} x1="8" y1="32" x2="32" y2="8">
          <stop offset="0%" stopColor="#9945FF" />
          <stop offset="50%" stopColor="#14F195" />
          <stop offset="100%" stopColor="#00D1FF" />
        </linearGradient>
      </defs>
      {/* Slanted parallelogram bars matching TradingView Solana logo */}
      <path d="M10 14.5 L27 11 L30 14 L13 17.5Z" fill={`url(#${gradientId})`} />
      <path d="M10 21.5 L27 18 L30 21 L13 24.5Z" fill={`url(#${gradientId})`} />
      <path d="M10 28.5 L27 25 L30 28 L13 31.5Z" fill={`url(#${gradientId})`} />
    </svg>
  ),
};

// ── Index Badges ────────────────────────────────────────────────────
// Numbered circle badges matching TradingView style — solid fill + thin ring.

const indexIcons = {
  US30:   { text: "30",  bg: "#2196F3", fg: "white" },
  US500:  { text: "500", bg: "#D32F2F", fg: "white" },
  SP500:  { text: "500", bg: "#D32F2F", fg: "white" },
  NAS100: { text: "100", bg: "#00897B", fg: "white" },
  US2000: { text: "2K",  bg: "#5E35B1", fg: "white" },
  GER40:  { text: "40",  bg: "#FFB300", fg: "#1a1a1a" },
  FRA40:  { text: "40",  bg: "#0D47A1", fg: "white" },
  UK100:  { text: "100", bg: "#C62828", fg: "white" },
  EU50:   { text: "50",  bg: "#003399", fg: "#FFCC00" },
  SPA35:  { text: "35",  bg: "#C8102E", fg: "#FABD00" },
  SWI20:  { text: "20",  bg: "#D52B1E", fg: "white" },
  JPN225: { text: "225", bg: "#BC002D", fg: "white" },
  HK50:   { text: "50",  bg: "#DE2910", fg: "#FFDE00" },
  CHN50:  { text: "50",  bg: "#DE2910", fg: "#FFDE00" },
  AUS200: { text: "200", bg: "#00008B", fg: "white" },
};

const IndexBadge = ({ config, size = 20 }) => {
  if (!config) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill={config?.bg || "#64748b"} />
      <circle cx="20" cy="20" r="17.5" fill="none" stroke={config?.fg || "white"} strokeWidth="1.2" strokeOpacity="0.3" />
      <text
        x="20"
        y="21"
        textAnchor="middle"
        dominantBaseline="central"
        fill={config?.fg || "white"}
        fontSize={(config?.text?.length || 0) > 2 ? "11" : "16"}
        fontWeight="900"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {config?.text || ""}
      </text>
    </svg>
  );
};

// ── Commodity Icons ─────────────────────────────────────────────────
// TradingView uses stacked gold/silver bar ingots (3 bars: 2 bottom, 1 top)

const GoldBarsIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#D4A017" />
    {/* Top bar (centered) */}
    <path d="M15 14 L18 10 L22 10 L25 14Z" fill="white" fillOpacity="0.9" />
    <path d="M15 14 L25 14 L24 16 L16 16Z" fill="white" fillOpacity="0.7" />
    {/* Bottom-left bar */}
    <path d="M8 22 L11 18 L17 18 L20 22Z" fill="white" fillOpacity="0.9" />
    <path d="M8 22 L20 22 L19 24 L9 24Z" fill="white" fillOpacity="0.7" />
    {/* Bottom-right bar */}
    <path d="M20 22 L23 18 L29 18 L32 22Z" fill="white" fillOpacity="0.9" />
    <path d="M20 22 L32 22 L31 24 L21 24Z" fill="white" fillOpacity="0.7" />
    {/* Bottom highlights */}
    <path d="M9 26 L12 24 L28 24 L31 26Z" fill="white" fillOpacity="0.5" />
    <path d="M9 26 L31 26 L30 28 L10 28Z" fill="white" fillOpacity="0.35" />
  </svg>
);

const SilverBarsIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#A8A9AD" />
    {/* Top bar (centered) */}
    <path d="M15 14 L18 10 L22 10 L25 14Z" fill="white" fillOpacity="0.85" />
    <path d="M15 14 L25 14 L24 16 L16 16Z" fill="white" fillOpacity="0.6" />
    {/* Bottom-left bar */}
    <path d="M8 22 L11 18 L17 18 L20 22Z" fill="white" fillOpacity="0.85" />
    <path d="M8 22 L20 22 L19 24 L9 24Z" fill="white" fillOpacity="0.6" />
    {/* Bottom-right bar */}
    <path d="M20 22 L23 18 L29 18 L32 22Z" fill="white" fillOpacity="0.85" />
    <path d="M20 22 L32 22 L31 24 L21 24Z" fill="white" fillOpacity="0.6" />
    {/* Bottom highlights */}
    <path d="M9 26 L12 24 L28 24 L31 26Z" fill="white" fillOpacity="0.45" />
    <path d="M9 26 L31 26 L30 28 L10 28Z" fill="white" fillOpacity="0.3" />
  </svg>
);

const PlatinumBarsIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#E5E4E2" />
    {/* Top bar (centered) */}
    <path d="M15 14 L18 10 L22 10 L25 14Z" fill="#666" fillOpacity="0.6" />
    <path d="M15 14 L25 14 L24 16 L16 16Z" fill="#666" fillOpacity="0.4" />
    {/* Bottom-left bar */}
    <path d="M8 22 L11 18 L17 18 L20 22Z" fill="#666" fillOpacity="0.6" />
    <path d="M8 22 L20 22 L19 24 L9 24Z" fill="#666" fillOpacity="0.4" />
    {/* Bottom-right bar */}
    <path d="M20 22 L23 18 L29 18 L32 22Z" fill="#666" fillOpacity="0.6" />
    <path d="M20 22 L32 22 L31 24 L21 24Z" fill="#666" fillOpacity="0.4" />
    {/* Bottom highlights */}
    <path d="M9 26 L12 24 L28 24 L31 26Z" fill="#666" fillOpacity="0.3" />
    <path d="M9 26 L31 26 L30 28 L10 28Z" fill="#666" fillOpacity="0.2" />
  </svg>
);

const OilIcon = ({ size = 20, barrelColor = "#4FC3F7" }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#1a1a2e" />
    {/* Oil barrel */}
    <rect x="14" y="11" width="12" height="18" rx="2" fill={barrelColor} fillOpacity="0.85" />
    <ellipse cx="20" cy="11" rx="6" ry="2.5" fill={barrelColor} />
    <ellipse cx="20" cy="29" rx="6" ry="2.5" fill={barrelColor} fillOpacity="0.6" />
    {/* Barrel rings */}
    <rect x="14" y="16" width="12" height="1.2" fill="white" fillOpacity="0.3" />
    <rect x="14" y="22" width="12" height="1.2" fill="white" fillOpacity="0.3" />
    {/* Drop */}
    <path d="M20 13 L22 17 Q22 19 20 19 Q18 19 18 17Z" fill="white" fillOpacity="0.5" />
  </svg>
);

const GasIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#1a1a2e" />
    {/* Flame shape */}
    <path
      d="M20 8 C20 8 27 16 27 22 C27 26 24 30 20 30 C16 30 13 26 13 22 C13 16 20 8 20 8Z"
      fill="#81C784"
      fillOpacity="0.85"
    />
    <path
      d="M20 16 C20 16 24 20 24 23 C24 25.5 22.2 27 20 27 C17.8 27 16 25.5 16 23 C16 20 20 16 20 16Z"
      fill="#A5D6A7"
      fillOpacity="0.7"
    />
  </svg>
);

// Map commodity symbols to their icon components
// Keys include both canonical (XAUUSD) and slash (XAU/USD) format
// because signals from the DB may arrive in either format.
const commodityIconMap = {
  "XAUUSD":  GoldBarsIcon,
  "XAU/USD": GoldBarsIcon,
  "XAGUSD":  SilverBarsIcon,
  "XAG/USD": SilverBarsIcon,
  "XPTUSD":  PlatinumBarsIcon,
  "XPT/USD": PlatinumBarsIcon,
  "XPDUSD":  PlatinumBarsIcon,
  "XPD/USD": PlatinumBarsIcon,
};

const commodityOilGas = {
  UKOIL: { Component: OilIcon, props: { barrelColor: "#4FC3F7" } },
  USOIL: { Component: OilIcon, props: { barrelColor: "#FF7043" } },
  NGAS:  { Component: GasIcon, props: {} },
};

// ── Forex Pair: overlapping dual flag circles (TradingView style) ───
// Base flag in FRONT (left), quote flag BEHIND (right) with white ring separator.

const ForexPairIcon = ({ base = "", quote = "", size = 20 }) => {
  const uid = useId();
  const BaseFlag = flags?.[base];
  const QuoteFlag = flags?.[quote];

  const flagSize = Math.round(size * 0.82);
  const overlap = Math.round(flagSize * 0.35);
  const totalW = flagSize * 2 - overlap;
  const scale = size / totalW;
  const scaledFlag = Math.round(flagSize * scale);
  const topOffset = Math.round((size - scaledFlag) / 2);

  return (
    <span
      className="relative inline-flex items-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      {/* Quote flag (behind, right) */}
      {QuoteFlag ? (
        <span
          className="absolute rounded-full overflow-hidden"
          style={{ right: 0, top: topOffset, width: scaledFlag, height: scaledFlag }}
        >
          <QuoteFlag size={scaledFlag} clipId={`${uid}-q`} />
        </span>
      ) : (
        <span
          className="absolute rounded-full overflow-hidden"
          style={{ right: 0, top: topOffset, width: scaledFlag, height: scaledFlag }}
        >
          <CurrencyTextBadge code={quote} size={scaledFlag} />
        </span>
      )}
      {/* Base flag (front, left) — with white ring separator like TradingView */}
      {BaseFlag ? (
        <span
          className="absolute rounded-full overflow-hidden shadow-sm ring-[1.5px] ring-white dark:ring-[#0F0F1A]"
          style={{ left: 0, top: topOffset, width: scaledFlag, height: scaledFlag, zIndex: 1 }}
        >
          <BaseFlag size={scaledFlag} clipId={`${uid}-b`} />
        </span>
      ) : (
        <span
          className="absolute rounded-full overflow-hidden shadow-sm ring-[1.5px] ring-white dark:ring-[#0F0F1A]"
          style={{ left: 0, top: topOffset, width: scaledFlag, height: scaledFlag, zIndex: 1 }}
        >
          <CurrencyTextBadge code={base} size={scaledFlag} />
        </span>
      )}
    </span>
  );
};

// ── Fallback category icon ──────────────────────────────────────────

const categoryFallbackIcon = {
  forex: DollarSign,
  crypto: Bitcoin,
  indices: BarChart3,
  commodities: Gem,
};

// ── Normalize symbols to match our keys ─────────────────────────────

const normalizeSymbol = (raw) => {
  if (!raw || typeof raw !== "string") return { normalized: "", base: "", quote: "" };
  try {
    const s = raw.toUpperCase().replace(/\s+/g, "");
    if (s?.includes("/")) {
      const parts = s.split("/");
      return { normalized: s, base: parts?.[0] || "", quote: parts?.[1] || "" };
    }
    if (s?.length === 6) {
      const b = s.slice(0, 3);
      const q = s.slice(3);
      if (KNOWN_CURRENCIES?.includes(b) && KNOWN_CURRENCIES?.includes(q)) {
        return { normalized: `${b}/${q}`, base: b, quote: q };
      }
    }
    const cryptoKeys = Object.keys(cryptoIcons || {});
    for (const ck of cryptoKeys) {
      if (s?.startsWith(ck)) {
        return { normalized: `${ck}/${s.slice(ck?.length) || "USD"}`, base: ck, quote: s.slice(ck?.length) || "USD" };
      }
    }
    return { normalized: s || "", base: s || "", quote: "" };
  } catch {
    return { normalized: String(raw || ""), base: String(raw || ""), quote: "" };
  }
};

// ── Determine category for a symbol ─────────────────────────────────

const getCategory = (symbol) => {
  try {
    const s = (symbol || "").toUpperCase().replace(/\s+/g, "").replace("/", "");
    if (s?.length === 6 && KNOWN_CURRENCIES?.includes(s.slice(0, 3)) && KNOWN_CURRENCIES?.includes(s.slice(3))) return "forex";
    if (Object.keys(cryptoIcons || {})?.some((k) => s?.startsWith(k))) return "crypto";
    if (indexIcons?.[s] || indexIcons?.[symbol]) return "indices";
    // Commodities
    const commodityPrefixes = ["XAU", "XAG", "XPT", "XPD"];
    if (commodityPrefixes?.some((p) => s?.startsWith(p))) return "commodities";
    if (["UKOIL", "USOIL", "NGAS"]?.includes(s)) return "commodities";
    if (commodityIconMap?.[symbol] || commodityIconMap?.[s]) return "commodities";
    return null;
  } catch {
    return null;
  }
};

// ── Main export: SymbolIcon component ───────────────────────────────
// Default size increased to 26 for better visibility on cards.

const SymbolIcon = React.memo(({ symbol, size = 26 }) => {
  const uid = useId();

  const { base, quote, normalized, category, upperSymbol } = useMemo(() => {
    try {
      const norm = normalizeSymbol(symbol);
      const cat = getCategory(symbol);
      const upper = (symbol || "").toUpperCase().replace(/\s+/g, "");
      return { ...(norm || {}), category: cat, upperSymbol: upper };
    } catch {
      return { normalized: "", base: "", quote: "", category: null, upperSymbol: "" };
    }
  }, [symbol]);

  if (!symbol) return null;

  try {
    // 1. Forex pair — overlapping flags
    if (category === "forex" && base && quote) {
      return <ForexPairIcon base={base} quote={quote} size={size} />;
    }

    // 2. Crypto
    if (category === "crypto" && cryptoIcons?.[base]) {
      const CryptoIcon = cryptoIcons[base];
      return (
        <span className="inline-flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden" style={{ width: size, height: size }}>
          <CryptoIcon size={size} gradientId={`${uid}-grad`} />
        </span>
      );
    }

    // 3. Indices
    const idxConfig = indexIcons?.[upperSymbol] || indexIcons?.[base];
    if (idxConfig) {
      return (
        <span className="inline-flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden" style={{ width: size, height: size }}>
          <IndexBadge config={idxConfig} size={size} />
        </span>
      );
    }

    // 4. Commodities — TradingView-style bar/barrel icons
    const CommodityComp = commodityIconMap?.[normalized] || commodityIconMap?.[symbol] || commodityIconMap?.[upperSymbol];
    if (CommodityComp) {
      return (
        <span className="inline-flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden" style={{ width: size, height: size }}>
          <CommodityComp size={size} />
        </span>
      );
    }
    const oilGas = commodityOilGas?.[upperSymbol] || commodityOilGas?.[symbol];
    if (oilGas) {
      const { Component, props: oilGasProps } = oilGas;
      return (
        <span className="inline-flex items-center justify-center flex-shrink-0 rounded-full overflow-hidden" style={{ width: size, height: size }}>
          <Component size={size} {...(oilGasProps || {})} />
        </span>
      );
    }

    // 5. Fallback — category-based lucide icon or generic
    const FallbackIcon = (category && categoryFallbackIcon?.[category]) || HelpCircle;
    return (
      <span
        className="inline-flex items-center justify-center flex-shrink-0 rounded-full bg-slate-200/50 dark:bg-slate-700/50"
        style={{ width: size, height: size }}
      >
        <FallbackIcon size={Math.round(size * 0.55)} className="text-slate-500 dark:text-slate-400" />
      </span>
    );
  } catch {
    // Ultimate fallback — never crash in production
    return (
      <span
        className="inline-flex items-center justify-center flex-shrink-0 rounded-full bg-slate-200/50 dark:bg-slate-700/50"
        style={{ width: size, height: size }}
      >
        <HelpCircle size={Math.round(size * 0.55)} className="text-slate-500 dark:text-slate-400" />
      </span>
    );
  }
});

SymbolIcon.displayName = "SymbolIcon";

export default SymbolIcon;
