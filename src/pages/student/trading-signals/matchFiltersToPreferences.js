// ── Match Filters → Alert Pair Preferences ─────────────────────────
// Pure mapping function that converts the exclusion-based filter state
// from the IQ Strategies Alerts page into the alertPairPreferences
// payload expected by PUT /users/auth/alert-pair-preferences.
//
// This file is intentionally self-contained — it duplicates buildKey and
// isInvalidStrategyCombo from AlertPairPreferences.jsx to avoid creating
// a cross-page import dependency. Keep both copies in sync.

// ── Helpers (duplicated from AlertPairPreferences.jsx — keep in sync) ──

const buildKey = (strategy, pair, tf) => `${strategy}__${pair}__${tf}`;

const isInvalidStrategyCombo = (strategyKey, pair, tf) => {
  const p = String(pair).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (strategyKey === "supernova") {
    if (p === "XAUUSD" && tf !== "M15") return true;
    if (p === "GBPNZD" && tf !== "H4") return true;
    if (p === "US30" && tf !== "M15") return true;
  }
  if (strategyKey === "killshot") {
    if (p === "US30" && tf !== "M1") return true;
    if (p === "XAUUSD" && tf !== "M3") return true;
    if (p === "EURUSD" && tf !== "M5") return true;
    if (p === "BTCUSD" && tf !== "M5") return true;
  }
  return false;
};

// ── Normalization ───────────────────────────────────────────────────

/**
 * Normalize a symbol string for cross-format comparison.
 * "EUR/USD" → "EURUSD", "XAU/USD" → "XAUUSD", "US30" → "US30"
 */
const normalizeSymbol = (sym) =>
  sym ? sym.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : "";

/**
 * Convert a frontend-format timeframe to the preference-config format.
 * "1m" → "M1", "15m" → "M15", "1H" → "H1", "4H" → "H4"
 */
const mapFilterTfToConfigTf = (filterTf) => {
  if (!filterTf) return "";
  const lower = filterTf.toLowerCase();
  const minuteMatch = lower.match(/^(\d+)m$/);
  if (minuteMatch) return `M${minuteMatch[1]}`;
  const hourMatch = lower.match(/^(\d+)h$/);
  if (hourMatch) return `H${hourMatch[1]}`;
  return filterTf.toUpperCase();
};

/**
 * Check if a config pair is included in the user's active symbol filters.
 * Compares normalized forms to handle slash-vs-no-slash differences.
 *
 * @param {string} configPair - Pair from alertPreferenceConfigs (e.g. "EUR/USD", "US30", "Majors")
 * @param {Set<string>} normalizedIncludedSymbols - Set of normalized included symbols
 * @param {Array} allSymbolOptions - Flat list of all available symbol objects [{symbol}]
 * @param {Set<string>} normalizedExcludedSymbols - Set of normalized excluded symbols
 * @returns {boolean}
 */
const isPairIncluded = (configPair, normalizedIncludedSymbols, allSymbolOptions, normalizedExcludedSymbols) => {
  const normalizedConfigPair = normalizeSymbol(configPair);

  // If ALL symbols are included (nothing excluded), this pair is included
  if (normalizedExcludedSymbols.size === 0) return true;

  // Direct match — the config pair is in the included symbols set
  if (normalizedIncludedSymbols.has(normalizedConfigPair)) return true;

  // Meta-group pairs (e.g. "Majors", "SP500") in Bullseye don't appear
  // in the symbol filter directly — they are always included unless
  // every individual symbol they represent is excluded. For simplicity
  // and correctness, if the config pair doesn't match any known filter
  // symbol, include it by default (safe behavior — user can disable
  // via Alert Preferences page if needed).
  const isKnownFilterSymbol = allSymbolOptions.some(
    (opt) => normalizeSymbol(opt.symbol || opt.value || "") === normalizedConfigPair
  );
  if (!isKnownFilterSymbol) return true;

  return false;
};

// ── Main Mapping Function ───────────────────────────────────────────

/**
 * Build the alertPairPreferences payload from the current filter state.
 *
 * @param {Object}  exclusionFilters       - { excludedStrategies, excludedSignalTypes, excludedSymbols, excludedTimeframes, excludedSessions }
 * @param {Array}   alertPreferenceConfigs - From GET /users/tv-signals/alert-preference-configs → data.alertPreferenceConfigs
 * @param {Array}   sessionOptions         - [{ value: "Asian", label: "Asian" }, ...]
 * @param {Array}   strategyOptions        - [{ value: "Killshot", label: "Killshot" }, ...]
 * @param {Array}   allSymbolOptions       - Flat list of all symbol options from instrument categories [{symbol}, ...]
 * @returns {{ prefs: Object, summary: Object }}
 *   - prefs: The complete alertPairPreferences object to save
 *   - summary: A human-readable summary for the confirmation dialog
 */
export function buildMatchedPreferences(
  exclusionFilters,
  alertPreferenceConfigs,
  sessionOptions,
  strategyOptions,
  allSymbolOptions
) {
  const configs = alertPreferenceConfigs || [];
  const sessions = sessionOptions || [];
  const strategies = strategyOptions || [];

  // ── Step 1: Derive INCLUDED values from exclusion arrays ──────────
  const excludedStrategies = exclusionFilters?.excludedStrategies || [];
  const excludedSymbols = exclusionFilters?.excludedSymbols || [];
  const excludedTimeframes = exclusionFilters?.excludedTimeframes || [];
  const excludedSessions = exclusionFilters?.excludedSessions || [];
  const excludedSignalTypes = exclusionFilters?.excludedSignalTypes || [];

  // Included strategy names (case-insensitive comparison)
  const excludedStrategyNamesLower = new Set(excludedStrategies.map((s) => s.toLowerCase()));
  const knownStrategyNamesLower = new Set(strategies.map((s) => s.value.toLowerCase()));
  const includedStrategyNames = strategies
    .filter((s) => !excludedStrategyNamesLower.has(s.value.toLowerCase()))
    .map((s) => s.value);

  // Included symbols — normalize for cross-format matching
  const normalizedExcludedSymbols = new Set(excludedSymbols.map(normalizeSymbol));
  const normalizedIncludedSymbols = new Set(
    (allSymbolOptions || [])
      .map((opt) => normalizeSymbol(opt.symbol || opt.value || ""))
      .filter((s) => s && !normalizedExcludedSymbols.has(s))
  );

  // Included timeframes — convert filter format to config format
  const excludedTfSet = new Set(excludedTimeframes.map(mapFilterTfToConfigTf));

  // Included sessions
  const excludedSessionSet = new Set(excludedSessions);
  const includedSessions = sessions.filter((s) => !excludedSessionSet.has(s.value));

  // ── Step 2: Build the preferences object ──────────────────────────
  const prefs = {};
  const strategySessionExclusions = {};
  let selectedCount = 0;
  let totalCount = 0;

  for (const config of configs) {
    const strategyKey = config.key;
    const strategyName = config.name;
    const pairs = config.pairs || [];
    const timeframes = config.timeframes || [];

    // Strategy is included only if it exists in the filter dropdown AND is not excluded.
    // Strategies in the API configs but not in the dropdown (e.g., Smart Shot)
    // are treated as excluded.
    const strategyIncluded =
      knownStrategyNamesLower.has(strategyName.toLowerCase()) &&
      !excludedStrategyNamesLower.has(strategyName.toLowerCase());

    for (const pair of pairs) {
      for (const tf of timeframes) {
        if (isInvalidStrategyCombo(strategyKey, pair, tf)) continue;

        const key = buildKey(strategyKey, pair, tf);
        totalCount++;

        if (!strategyIncluded) {
          prefs[key] = false;
          continue;
        }

        const pairIncluded = isPairIncluded(
          pair, normalizedIncludedSymbols, allSymbolOptions || [], normalizedExcludedSymbols
        );
        const tfIncluded = !excludedTfSet.has(tf);

        const isSelected = pairIncluded && tfIncluded;
        prefs[key] = isSelected;
        if (isSelected) selectedCount++;
      }
    }

    // Map session exclusions for this strategy
    if (strategyIncluded && excludedSessions.length > 0) {
      // Only set exclusions for sessions that are actually excluded
      const validExclusions = excludedSessions.filter((s) =>
        sessions.some((opt) => opt.value === s)
      );
      if (validExclusions.length > 0) {
        strategySessionExclusions[strategyKey] = validExclusions;
      }
    } else if (!strategyIncluded && sessions.length > 0) {
      // Strategy is excluded entirely — exclude all sessions for it
      strategySessionExclusions[strategyKey] = sessions.map((s) => s.value);
    }
  }

  // Add session exclusions to prefs if any exist
  const hasSessionExclusions = Object.values(strategySessionExclusions).some(
    (arr) => Array.isArray(arr) && arr.length > 0
  );
  if (hasSessionExclusions) {
    prefs.strategySessionExclusions = strategySessionExclusions;
  }

  // ── Step 3: Build human-readable summary ──────────────────────────
  const summary = {
    strategies: includedStrategyNames,
    symbols: excludedSymbols.length === 0
      ? ["All Symbols"]
      : (allSymbolOptions || [])
          .filter((opt) => !normalizedExcludedSymbols.has(normalizeSymbol(opt.symbol || opt.value || "")))
          .map((opt) => opt.symbol || opt.value)
          .slice(0, 15), // Cap at 15 for display
    timeframes: excludedTimeframes.length === 0
      ? ["All Time Frames"]
      : excludedTimeframes.length > 0
        ? (() => {
            // Show included timeframes
            const allTfs = ["1m", "3m", "5m", "15m", "30m", "45m", "1H", "2H", "3H", "4H", "1D", "1W", "1M"];
            return allTfs.filter((tf) => !excludedTimeframes.includes(tf));
          })()
        : [],
    sessions: excludedSessions.length === 0
      ? ["All Sessions"]
      : includedSessions.map((s) => s.label),
    alertTypes: excludedSignalTypes.length > 0
      ? { excluded: excludedSignalTypes, note: "Alert Type is not supported in the notification model and will be ignored." }
      : null,
    symbolsOverflow: excludedSymbols.length > 0 && (allSymbolOptions || []).length - excludedSymbols.length > 15,
    selectedCount,
    totalCount,
  };

  return { prefs, summary };
}
