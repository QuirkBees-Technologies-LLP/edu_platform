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
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch (_) {
    return "—";
  }
}

/**
 * Returns a relative human-readable "time ago" string.
 * Rules:
 *   < 1 hour  → "X minutes ago" (e.g. 1 minute ago, 5 minutes ago, 15 minutes ago)
 *   1-23 hours → "X hours ago" (e.g. 1 hour ago, 23 hours ago)
 *   1-6 days   → "X days ago" (e.g. 1 day ago, 6 days ago)
 *   7+ days    → "X weeks ago" (e.g. 1 week ago, 2 weeks ago)
 */
export function getRelativeTime(dateStr) {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";
    const diffMs = Date.now() - date.getTime();
    if (diffMs < 0) return "just now";
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return "1 minute ago";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? "minute" : "minutes"} ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} ${diffHr === 1 ? "hour" : "hours"} ago`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay} ${diffDay === 1 ? "day" : "days"} ago`;
    const diffWk = Math.floor(diffDay / 7);
    return `${diffWk} ${diffWk === 1 ? "week" : "weeks"} ago`;
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
    // show today's date with that time
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      const today = new Date();
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const dd = String(today.getDate()).padStart(2, "0");
      const mon = months[today.getMonth()];
      const yyyy = today.getFullYear();
      // Convert HH:mm to 12-hour format
      const [hh, mi] = trimmed.split(":").map(Number);
      const ampm = hh >= 12 ? "pm" : "am";
      const h12 = hh % 12 || 12;
      return `${dd} ${mon} ${yyyy}, ${String(h12).padStart(2, "0")}:${String(mi).padStart(2, "0")} ${ampm}`;
    }

    // Otherwise parse as ISO 8601 UTC string (new webhook format)
    // e.g. "2026-07-01T11:36:00Z" → local "03 Jul 2026, 01:09 pm"
    const date = new Date(trimmed);
    if (isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  } catch (_) {
    return "—";
  }
}
