// ── Match Filters → Alert Pair Preferences ─────────────────────────
// Pure mapping function that converts the exclusion-based filter state
// from the IQ Strategies Alerts page into the alertPairPreferences
// payload expected by PUT /users/auth/alert-pair-preferences.
//
// Output format: Hierarchical nested structure
//   { strategy: { pair: { timeframe: true/false } } }
//
// Strategy validation uses the centralized config (isValidPairTimeframe)
// from src/config/strategyConfig.js — the single source of truth.

import { 
  isValidPairTimeframe, 
  STRATEGY_TIMEFRAME_MAP,
  REACT_DEFY_DEFAULT_EXCLUDED_TIMEFRAMES_CANONICAL 
} from "@/config/strategyConfig";

// ── Helpers ──────────────────────────────────────────────────────────

// isInvalidStrategyCombo uses centralized config — no longer duplicated
const isInvalidStrategyCombo = (strategyKey, pair, tf) => !isValidPairTimeframe(strategyKey, pair, tf);

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
 * @param {string} configPair - Pair from alertPreferenceConfigs (e.g. "EURUSD", "US30", "Majors")
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
 * Returns a hierarchical nested structure:
 *   { strategy: { pair: { timeframe: true/false } } }
 *
 * @param {Object}  exclusionFilters       - { excludedStrategies, excludedSignalTypes, excludedSymbols, excludedTimeframes, excludedSessions }
 * @param {Array}   alertPreferenceConfigs - From GET /users/tv-signals/alert-preference-configs → data.alertPreferenceConfigs
 * @param {Array}   sessionOptions         - [{ value: "Asian", label: "Asian" }, ...]
 * @param {Array}   strategyOptions        - [{ value: "Killshot", label: "Killshot" }, ...]
 * @param {Array}   allSymbolOptions       - Flat list of all symbol options from instrument categories [{symbol}, ...]
 * @returns {{ prefs: Object, summary: Object }}
 *   - prefs: The complete alertPairPreferences object to save (nested format)
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
  const strategyTimeframes = exclusionFilters?.strategyTimeframes || {};
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

  // Build per-strategy included timeframe sets (in config format)
  // strategyTimeframes: { react: ["1m","5m"], ... } → converted to canonical
  const strategyIncludedTfSets = {};
  for (const [key, selectedTfs] of Object.entries(strategyTimeframes)) {
    if (Array.isArray(selectedTfs)) {
      strategyIncludedTfSets[key] = new Set(selectedTfs.map(mapFilterTfToConfigTf));
    }
  }

  // Included sessions
  const excludedSessionSet = new Set(excludedSessions);
  const includedSessions = sessions.filter((s) => !excludedSessionSet.has(s.value));

  // ── Step 2: Build the nested preferences object ───────────────────
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

        totalCount++;

        if (!strategyIncluded) {
          // Strategy excluded → mark all its combos as false
          if (!prefs[strategyKey]) prefs[strategyKey] = {};
          if (!prefs[strategyKey][pair]) prefs[strategyKey][pair] = {};
          prefs[strategyKey][pair][tf] = false;
          continue;
        }

        const pairIncluded = isPairIncluded(
          pair, normalizedIncludedSymbols, allSymbolOptions || [], normalizedExcludedSymbols
        );
        // Check if this timeframe is selected for this specific strategy
        const tfSet = strategyIncludedTfSets[strategyKey];
        // If no entry in map, use default inclusion behavior
        let tfIncluded = true;
        if (tfSet) {
          tfIncluded = tfSet.has(tf);
        } else {
          // Exclude default-hidden timeframes for React and Defy when not explicitly set
          if ((strategyKey === "react" || strategyKey === "defy") && REACT_DEFY_DEFAULT_EXCLUDED_TIMEFRAMES_CANONICAL.includes(tf)) {
            tfIncluded = false;
          }
        }

        const isSelected = pairIncluded && tfIncluded;
        if (!prefs[strategyKey]) prefs[strategyKey] = {};
        if (!prefs[strategyKey][pair]) prefs[strategyKey][pair] = {};
        prefs[strategyKey][pair][tf] = isSelected;
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

  // Add session exclusions into each strategy's nested object
  Object.entries(strategySessionExclusions).forEach(([stratKey, sessions]) => {
    if (Array.isArray(sessions) && sessions.length > 0) {
      if (!prefs[stratKey]) prefs[stratKey] = {};
      prefs[stratKey].excludedSessions = sessions;
    }
  });

  // ── Step 3: Build human-readable summary ──────────────────────────
  const summary = {
    strategies: includedStrategyNames,
    symbols: excludedSymbols.length === 0
      ? ["All Symbols"]
      : (allSymbolOptions || [])
          .filter((opt) => !normalizedExcludedSymbols.has(normalizeSymbol(opt.symbol || opt.value || "")))
          .map((opt) => opt.symbol || opt.value)
          .slice(0, 15), // Cap at 15 for display
    timeframes: Object.keys(strategyTimeframes).length === 0
      ? ["All Time Frames"]
      : (() => {
          // Show included timeframes per strategy
          const included = [];
          for (const [key, tfs] of Object.entries(strategyTimeframes)) {
            if (Array.isArray(tfs)) {
              const allTfs = STRATEGY_TIMEFRAME_MAP[key] || [];
              const isAll = tfs.length === allTfs.length;
              if (isAll) {
                included.push(`${key}: All`);
              } else {
                included.push(`${key}: ${tfs.join(", ")}`);
              }
            }
          }
          return included.length > 0 ? included : ["All Time Frames"];
        })(),
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
