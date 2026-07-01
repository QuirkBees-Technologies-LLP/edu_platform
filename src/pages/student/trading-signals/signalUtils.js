// ── Utilities ───────────────────────────────────────────────────────

/**
 * Converts raw TradingView interval values to human-readable labels.
 * TradingView sends numeric minutes or string codes:
 *   1 → "1m", 5 → "5m", 15 → "15m", 30 → "30m",
 *   60 → "1h", 120 → "2h", 240 → "4h",
 *   "D" → "1D", "W" → "1W", "M" → "1M"
 */
export function formatTimeframe(tf) {
  if (!tf) return "—";
  const str = String(tf).trim();
  const upper = str.toUpperCase();

  // Handle "X minutes", "X minute" format (e.g. "5 minutes", "15 minute")
  const minutesMatch = str.match(/^(\d+)\s*minutes?$/i);
  if (minutesMatch) return `${minutesMatch[1]}m`;

  // Handle "X hours", "X hour" format (e.g. "1 hour", "4 hours")
  const hoursMatch = str.match(/^(\d+)\s*hours?$/i);
  if (hoursMatch) return `${hoursMatch[1]}h`;

  // Pure string codes from TradingView
  const stringMap = { D: "1D", W: "1W", M: "1M", "1D": "1D", "1W": "1W", "1M": "1M" };
  if (stringMap[upper]) return stringMap[upper];

  // Already has a unit suffix — normalise casing and return
  // e.g. "15s", "15m", "4h", "4H", "1D" — keep as-is but uppercase the unit
  const suffixMatch = str.match(/^(\d+)\s*([smhHdDwW])$/);
  if (suffixMatch) {
    const num = suffixMatch[1];
    const unit = suffixMatch[2].toLowerCase();
    if (unit === "s") return `${num}s`;   // seconds — keep raw (15s, 30s)
    if (unit === "m") return `${num}m`;   // minutes
    if (unit === "h") return `${num}h`;   // hours
    if (unit === "d") return `${num}D`;   // days
    if (unit === "w") return `${num}W`;   // weeks
  }

  // Bare numeric value — TradingView sends minutes as plain integers
  const mins = parseInt(str, 10);
  if (!isNaN(mins) && String(mins) === str.trim()) {
    if (mins < 60) return `${mins}m`;
    if (mins < 1440) {
      const h = mins / 60;
      return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
    }
    const d = mins / 1440;
    return Number.isInteger(d) ? `${d}D` : `${d.toFixed(1)}D`;
  }

  // Fallback — return as-is
  return str;
}

export function formatPrice(value) {
  if (value == null) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return String(value ?? "—");
  // Remove trailing zeros: 4342.8100 → 4342.81, but keep up to 4 decimals max
  return parseFloat(num.toFixed(4)).toString();
}

export function formatTimeAgo(dateStr) {
  if (!dateStr) return "—";
  try {
    const now = new Date();
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 0) return "Just now";
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  } catch (_) {
    return "—";
  }
}

/**
 * Converts a UTC ISO 8601 alertTimestamp to the user's local browser
 * timezone, displayed in HH:mm format (24-hour).
 *
 * Uses `Intl.DateTimeFormat` so the browser automatically determines
 * the correct timezone — no hardcoded offsets.
 *
 * @param {string|null|undefined} timestamp - UTC ISO 8601 string (e.g. "2026-07-01T11:36:00Z")
 * @returns {string} Local time in "HH:mm" format, or "—" if invalid/missing
 *
 * @example
 * formatAlertTime("2026-07-01T11:36:00Z") // "17:06" in IST, "12:36" in London
 * formatAlertTime(null)                   // "—"
 * formatAlertTime("")                     // "—"
 * formatAlertTime("not-a-date")           // "—"
 */
export function formatAlertTime(timestamp) {
  if (!timestamp || typeof timestamp !== "string" || !timestamp.trim()) {
    return "—";
  }

  const trimmed = timestamp.trim();

  try {
    // If it's already a plain HH:mm or HH:mm:ss time (old webhook format),
    // return it as-is — no conversion needed
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      return trimmed;
    }

    // Otherwise parse as ISO 8601 UTC string (new webhook format)
    // e.g. "2026-07-01T11:36:00Z" → local HH:mm
    const date = new Date(trimmed);
    if (isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date);
  } catch (_) {
    return "—";
  }
}
