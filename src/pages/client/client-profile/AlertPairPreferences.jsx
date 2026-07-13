import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Bell, BellOff, Save, Clock, DollarSign, SlidersHorizontal } from "lucide-react";
import { isValidPairTimeframe, getAssetClassCategories, HIERARCHICAL_STRATEGIES } from "@/config/strategyConfig";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import {
  useGetAlertPairPreferencesQuery,
  useUpdateAlertPairPreferencesMutation,
} from "../../../store/api/client/clientProfileApiSlice";
import {
  useGetAlertPreferenceConfigsQuery,
  useGetFilterOptionsQuery,
  useGetFilterPreferencesQuery,
} from "../../../store/api/client/clientTvSignalsApiSlice";
import { buildMatchedPreferences } from "../../student/trading-signals/matchFiltersToPreferences";
import MatchFiltersConfirmModal from "../../student/trading-signals/MatchFiltersConfirmModal";
import instrumentCategories from "../../student/trading-signals/instrumentData";


// ── Helpers ─────────────────────────────────────────────────────────
// Internal path format for Set-based tracking: "strategy.pair.tf"
const buildPath = (strategy, pair, tf) => `${strategy}.${pair}.${tf}`;

// isInvalidStrategyCombo replaced by isValidPairTimeframe from strategyConfig (inverted logic)
const isInvalidStrategyCombo = (strategyKey, pair, tf) => !isValidPairTimeframe(strategyKey, pair, tf);

/** Build a Set of all valid strategy.pair.tf paths from strategy configs. */
function buildAllPaths(strategies) {
  const paths = new Set();
  (strategies || []).forEach((s) => {
    (s?.pairs || []).forEach((pair) => {
      (s?.timeframes || []).forEach((tf) => {
        if (!isInvalidStrategyCombo(s.key, pair, tf)) {
          paths.add(buildPath(s.key, pair, tf));
        }
      });
    });
  });
  return paths;
}

/** Non-pair keys that live at root level in the prefs object. */
const NON_PAIR_KEYS = new Set([
  "strategySessionExclusions",
  "excludedDefyTypes",
  "excludedReactTypes",
]);

/**
 * Initialize the selected Set from saved nested preferences.
 * Handles both new nested format and legacy flat format.
 * Empty/null prefs = all selected (default behavior).
 */
function initSelectedFromSaved(savedPrefs, allPaths) {
  if (!savedPrefs || Object.keys(savedPrefs).length === 0) {
    // New user: no preferences saved — start with everything OFF
    return new Set();
  }

  // Detect legacy flat format (keys contain "__")
  const isFlat = Object.keys(savedPrefs).some(
    (k) => k.includes("__") && typeof savedPrefs[k] === "boolean"
  );

  const selected = new Set();

  if (isFlat) {
    // Legacy migration: "react__EURUSD__M1" → path "react.EURUSD.M1"
    allPaths.forEach((path) => {
      const [strat, pair, tf] = path.split(".");
      const flatKey = `${strat}__${pair}__${tf}`;
      if (savedPrefs[flatKey] !== false) {
        selected.add(path);
      }
    });
  } else {
    // New nested format: savedPrefs[strategy][pair][tf]
    allPaths.forEach((path) => {
      const [strat, pair, tf] = path.split(".");
      if (savedPrefs[strat]?.[pair]?.[tf] !== false) {
        selected.add(path);
      }
    });
  }

  return selected;
}

/**
 * Convert the selected Set to the nested preferences object for saving.
 * If all paths are selected → returns empty object (default = all enabled).
 * Otherwise returns: { strategy: { pair: { tf: true/false } } }
 */
function selectedToPrefs(selected, allPaths) {
  // All selected → save empty (default)
  if (selected.size === allPaths.size) return {};

  const prefs = {};
  allPaths.forEach((path) => {
    const [strat, pair, tf] = path.split(".");
    if (!prefs[strat]) prefs[strat] = {};
    if (!prefs[strat][pair]) prefs[strat][pair] = {};
    prefs[strat][pair][tf] = selected.has(path);
  });
  return prefs;
}

function initStrategySessionExclusions(savedPrefs) {
  if (!savedPrefs || typeof savedPrefs !== 'object') return {};

  // New format: prefs[strategyKey].excludedSessions = [...]
  const result = {};
  Object.entries(savedPrefs).forEach(([key, value]) => {
    if (NON_PAIR_KEYS.has(key)) return;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (Array.isArray(value.excludedSessions) && value.excludedSessions.length > 0) {
        result[key] = value.excludedSessions;
      }
    }
  });
  if (Object.keys(result).length > 0) return result;

  // Legacy fallback: root-level strategySessionExclusions
  if (savedPrefs.strategySessionExclusions && typeof savedPrefs.strategySessionExclusions === 'object') {
    return savedPrefs.strategySessionExclusions;
  }
  return {};
}

// Asset class categories derived from centralized config (strategyConfig.js)
const ASSET_CLASS_CATEGORIES = getAssetClassCategories();

/**
 * Groups a flat array of pair strings into asset class categories.
 * Pairs that don't match any category are collected into an "Other" group.
 * Returns only categories that have at least one matching pair.
 */
function categorizeStrategyPairs(pairs) {
  const remaining = new Set(pairs);
  const result = [];

  for (const cat of ASSET_CLASS_CATEGORIES) {
    const matched = pairs.filter((p) => cat.symbols.has(p));
    if (matched.length > 0) {
      result.push({
        key: cat.key,
        label: cat.label,
        icon: cat.icon,
        color: cat.color,
        colorLight: cat.colorLight,
        pairs: matched,
      });
      matched.forEach((p) => remaining.delete(p));
    }
  }

  // Fallback for any unmatched pairs
  if (remaining.size > 0) {
    result.push({
      key: "other",
      label: "Other",
      icon: DollarSign,
      color: "#64748b",
      colorLight: "#64748b15",
      pairs: [...remaining],
    });
  }

  return result;
}

// Strategies that should use the hierarchical UI
// HIERARCHICAL_STRATEGIES imported from @/config/strategyConfig

// ── Checkbox with indeterminate support ─────────────────────────────
const IndeterminateCheckbox = ({ checked, indeterminate, onChange, className = "", id }) => {
  const ref = React.useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate && !checked;
    }
  }, [indeterminate, checked]);

  return (
    <input
      id={id}
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={`w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary bg-transparent focus:ring-primary/30 focus:ring-2 cursor-pointer transition-colors accent-primary ${className}`}
    />
  );
};

// ── Hierarchical Strategy Section (React / Defy) ────────────────────
// Strategy → Asset Class (expand) → Flat table with PAIR + timeframe columns
const HierarchicalStrategySection = ({
  strategy, selected, onToggle, onToggleRow, onToggleStrategy,
  onToggleCategory, onToggleCategoryColumn,
  sessionOptions, excludedSessions, onSessionToggle, onSessionToggleAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const strategyKeys = useMemo(() => {
    const keys = [];
    (strategy?.pairs || []).forEach((pair) => {
      (strategy?.timeframes || []).forEach((tf) => {
        keys.push(buildPath(strategy.key, pair, tf));
      });
    });
    return keys;
  }, [strategy]);

  const selectedCount = strategyKeys.filter((k) => selected.has(k)).length;
  const allSelected = strategyKeys.length > 0 && selectedCount === strategyKeys.length;
  const someSelected = selectedCount > 0 && !allSelected;

  // Group pairs into asset class categories
  const categories = useMemo(
    () => categorizeStrategyPairs(strategy?.pairs || []),
    [strategy?.pairs]
  );

  // Session counts for this strategy
  const sessionSelectedCount = (sessionOptions?.length ?? 0) - (excludedSessions?.length ?? 0);
  const allSessionsSelected = (excludedSessions?.length ?? 0) === 0;

  return (
    <div className="card rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
      {/* Strategy Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <h4 className="text-base font-bold text-gray-900 dark:text-white">
              {strategy.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-50">
              {(strategy?.pairs?.length ?? 0)} pairs × {(strategy?.timeframes?.length ?? 0)} time frames
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full text-sm font-semibold bg-primary/10 text-primary">
            {selectedCount}/{strategyKeys.length}
          </span>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2"
          >
            <IndeterminateCheckbox
              id={`strategy-${strategy.key}`}
              checked={allSelected}
              indeterminate={someSelected}
              onChange={() => onToggleStrategy(strategy.key)}
            />
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded: Asset Class sections */}
      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {categories.map((cat) => (
            <AssetClassTable
              key={cat.key}
              category={cat}
              strategy={strategy}
              selected={selected}
              onToggle={onToggle}
              onToggleRow={onToggleRow}
              onToggleCategory={onToggleCategory}
              onToggleCategoryColumn={onToggleCategoryColumn}
            />
          ))}

          {/* Trading Sessions — per strategy */}
          {sessionOptions.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Trading Sessions</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                    {sessionSelectedCount}/{sessionOptions.length}
                  </span>
                </div>
                <IndeterminateCheckbox
                  id={`session-master-${strategy.key}`}
                  checked={allSessionsSelected}
                  indeterminate={sessionSelectedCount > 0 && !allSessionsSelected}
                  onChange={onSessionToggleAll}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {sessionOptions.map((session) => {
                  const isExcluded = excludedSessions.includes(session.value);
                  const isChecked = !isExcluded;
                  return (
                    <label
                      key={session.value}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer select-none transition-colors ${isChecked
                        ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/5 opacity-60"
                        }`}
                    >
                      <IndeterminateCheckbox
                        id={`session-${strategy.key}-${session.value}`}
                        checked={isChecked}
                        indeterminate={false}
                        onChange={() => onSessionToggle(session.value)}
                      />
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {session.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Asset Class Table (Level 2: Forex, Crypto, etc.) ────────────────
// Expands to show a flat table with PAIR + timeframe columns
const AssetClassTable = ({ category, strategy, selected, onToggle, onToggleRow, onToggleCategory, onToggleCategoryColumn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const CatIcon = category.icon;

  // All keys for every pair in this category
  const categoryKeys = useMemo(() => {
    const keys = [];
    category.pairs.forEach((pair) => {
      strategy.timeframes.forEach((tf) => {
        keys.push(buildPath(strategy.key, pair, tf));
      });
    });
    return keys;
  }, [category.pairs, strategy.key, strategy.timeframes]);

  const selectedCount = categoryKeys.filter((k) => selected.has(k)).length;
  const allSelected = categoryKeys.length > 0 && selectedCount === categoryKeys.length;
  const someSelected = selectedCount > 0 && !allSelected;

  return (
    <div className="border-t border-gray-100 dark:border-gray-800">
      {/* Category header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary/10"
          >
            <CatIcon size={14} className="text-primary" />
          </div>
          <span className="text-base font-semibold text-gray-800 dark:text-white">
            {category.label}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-50">
            {category.pairs.length} pair{category.pairs.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {selectedCount}/{categoryKeys.length}
          </span>
          <div onClick={(e) => e.stopPropagation()} className="flex items-center">
            <IndeterminateCheckbox
              id={`cat-${strategy.key}-${category.key}`}
              checked={allSelected}
              indeterminate={someSelected}
              onChange={() => onToggleCategory(strategy.key, category.pairs)}
            />
          </div>
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded: Flat table with PAIR + timeframe columns */}
      {isOpen && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-white text-sm uppercase tracking-wider min-w-[140px]">
                  Pairs
                </th>
                {strategy.timeframes.map((tf) => {
                  // Column keys scoped to THIS category's pairs only
                  const colKeys = category.pairs.map((p) => buildPath(strategy.key, p, tf));
                  const colSelectedCount = colKeys.filter((k) => selected.has(k)).length;
                  const colAllSelected = colKeys.length > 0 && colSelectedCount === colKeys.length;
                  const colSomeSelected = colSelectedCount > 0 && !colAllSelected;

                  return (
                    <th key={tf} className="px-3 py-3 text-center font-semibold text-gray-700 dark:text-white text-sm uppercase tracking-wider">
                      <div className="flex flex-col items-center gap-1.5">
                        <span>{tf}</span>
                        <IndeterminateCheckbox
                          id={`col-${strategy.key}-${category.key}-${tf}`}
                          checked={colAllSelected}
                          indeterminate={colSomeSelected}
                          onChange={() => onToggleCategoryColumn(strategy.key, category.pairs, tf)}
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {category.pairs.map((pair, idx) => {
                const rowKeys = strategy.timeframes.map((tf) => buildPath(strategy.key, pair, tf));
                const rowSelectedCount = rowKeys.filter((k) => selected.has(k)).length;
                const rowAllSelected = rowKeys.length > 0 && rowSelectedCount === rowKeys.length;
                const rowSomeSelected = rowSelectedCount > 0 && !rowAllSelected;

                return (
                  <tr
                    key={pair}
                    className={`border-t border-gray-100 dark:border-gray-800 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${idx % 2 === 0 ? "" : "bg-gray-50/30 dark:bg-white/[0.02]"
                      }`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <IndeterminateCheckbox
                          id={`row-${strategy.key}-${pair}`}
                          checked={rowAllSelected}
                          indeterminate={rowSomeSelected}
                          onChange={() => onToggleRow(strategy.key, pair)}
                        />
                        <label
                          htmlFor={`row-${strategy.key}-${pair}`}
                          className="font-medium text-gray-800 dark:text-white cursor-pointer select-none text-sm"
                        >
                          {pair}
                        </label>
                      </div>
                    </td>
                    {strategy.timeframes.map((tf) => {
                      const key = buildPath(strategy.key, pair, tf);
                      return (
                        <td key={tf} className="px-3 py-2.5 text-center">
                          <IndeterminateCheckbox
                            id={`cell-${key}`}
                            checked={selected.has(key)}
                            indeterminate={false}
                            onChange={() => onToggle(key)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


// ── Strategy Section Component (flat table — Killshot, Supernova, etc.) ──
const StrategySection = ({
  strategy, selected, onToggle, onToggleRow, onToggleColumn, onToggleStrategy,
  sessionOptions, excludedSessions, onSessionToggle, onSessionToggleAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);


  const strategyKeys = useMemo(() => {
    const keys = [];
    (strategy?.pairs || []).forEach((pair) => {
      (strategy?.timeframes || []).forEach((tf) => {
        if (!isInvalidStrategyCombo(strategy.key, pair, tf)) {
          keys.push(buildPath(strategy.key, pair, tf));
        }
      });
    });
    return keys;
  }, [strategy]);

  const selectedCount = strategyKeys.filter((k) => selected.has(k)).length;
  const allSelected = selectedCount === strategyKeys.length;
  const someSelected = selectedCount > 0 && !allSelected;

  // Session counts for this strategy
  const sessionSelectedCount = (sessionOptions?.length ?? 0) - (excludedSessions?.length ?? 0);
  const allSessionsSelected = (excludedSessions?.length ?? 0) === 0;

  return (
    <div className="card rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
      {/* Strategy Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">
              {strategy.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-50">
              {(strategy?.pairs?.length ?? 0)} pairs × {(strategy?.timeframes?.length ?? 0)} time frame{(strategy?.timeframes?.length ?? 0) > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {selectedCount}/{strategyKeys.length}
          </span>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2"
          >
            <IndeterminateCheckbox
              id={`strategy-${strategy.key}`}
              checked={allSelected}
              indeterminate={someSelected}
              onChange={() => onToggleStrategy(strategy.key)}
            />
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Strategy Expanded Content */}
      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-white text-xs uppercase tracking-wider min-w-[140px]">
                  Pairs
                </th>
                {strategy.timeframes.map((tf) => {
                  const colKeys = strategy.pairs
                    .filter((p) => !isInvalidStrategyCombo(strategy.key, p, tf))
                    .map((p) => buildPath(strategy.key, p, tf));
                  const colSelectedCount = colKeys.filter((k) => selected.has(k)).length;
                  const colAllSelected = colKeys.length > 0 && colSelectedCount === colKeys.length;
                  const colSomeSelected = colSelectedCount > 0 && !colAllSelected;

                  return (
                    <th key={tf} className="px-3 py-3 text-center font-semibold text-gray-700 dark:text-white text-xs uppercase tracking-wider">
                      <div className="flex flex-col items-center gap-1.5">
                        <span>{tf}</span>
                        <IndeterminateCheckbox
                          id={`col-${strategy.key}-${tf}`}
                          checked={colAllSelected}
                          indeterminate={colSomeSelected}
                          onChange={() => onToggleColumn(strategy.key, tf)}
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {strategy.pairs.map((pair, idx) => {
                const rowKeys = strategy.timeframes
                  .filter((tf) => !isInvalidStrategyCombo(strategy.key, pair, tf))
                  .map((tf) => buildPath(strategy.key, pair, tf));
                const rowSelectedCount = rowKeys.filter((k) => selected.has(k)).length;
                const rowAllSelected = rowKeys.length > 0 && rowSelectedCount === rowKeys.length;
                const rowSomeSelected = rowSelectedCount > 0 && !rowAllSelected;

                return (
                  <tr
                    key={pair}
                    className={`border-t border-gray-100 dark:border-gray-800 transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${idx % 2 === 0 ? "" : "bg-gray-50/30 dark:bg-white/[0.02]"
                      }`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <IndeterminateCheckbox
                          id={`row-${strategy.key}-${pair}`}
                          checked={rowAllSelected}
                          indeterminate={rowSomeSelected}
                          onChange={() => onToggleRow(strategy.key, pair)}
                        />
                        <label
                          htmlFor={`row-${strategy.key}-${pair}`}
                          className="font-medium text-gray-800 dark:text-white cursor-pointer select-none text-xs"
                        >
                          {pair}
                        </label>
                      </div>
                    </td>
                    {strategy.timeframes.map((tf) => {
                      const key = buildPath(strategy.key, pair, tf);
                      const isInvalid = isInvalidStrategyCombo(strategy.key, pair, tf);
                      return (
                        <td key={tf} className="px-3 py-2.5 text-center">
                          {isInvalid ? (
                            <span className="text-gray-300 dark:text-gray-600 font-bold select-none">—</span>
                          ) : (
                            <IndeterminateCheckbox
                              id={`cell-${key}`}
                              checked={selected.has(key)}
                              indeterminate={false}
                              onChange={() => onToggle(key)}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Trading Sessions — per strategy */}
          {sessionOptions.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider">Trading Sessions</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                    {sessionSelectedCount}/{sessionOptions.length}
                  </span>
                </div>
                <IndeterminateCheckbox
                  id={`session-master-${strategy.key}`}
                  checked={allSessionsSelected}
                  indeterminate={sessionSelectedCount > 0 && !allSessionsSelected}
                  onChange={onSessionToggleAll}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {sessionOptions.map((session) => {
                  const isExcluded = excludedSessions.includes(session.value);
                  const isChecked = !isExcluded;
                  return (
                    <label
                      key={session.value}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer select-none transition-colors ${isChecked
                        ? "border-primary/30 bg-primary/5 hover:bg-primary/10"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/5 opacity-60"
                        }`}
                    >
                      <IndeterminateCheckbox
                        id={`session-${strategy.key}-${session.value}`}
                        checked={isChecked}
                        indeterminate={false}
                        onChange={() => onSessionToggle(session.value)}
                      />
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {session.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Component ──────────────────────────────────────────────────
const AlertPairPreferences = () => {
  const { data: rawData, isLoading, refetch } = useGetAlertPairPreferencesQuery();
  const { data: rawFilterOptions, isLoading: isLoadingFilters } = useGetAlertPreferenceConfigsQuery();

  const lastDataRef = useRef(rawData);
  useEffect(() => {
    if (rawData?.data !== undefined) lastDataRef.current = rawData;
  }, [rawData]);
  const data = rawData?.data !== undefined ? rawData : (lastDataRef.current || rawData);

  const lastFilterOptionsRef = useRef(rawFilterOptions);
  useEffect(() => {
    if (rawFilterOptions?.data !== undefined) lastFilterOptionsRef.current = rawFilterOptions;
  }, [rawFilterOptions]);
  const filterOptions = rawFilterOptions?.data !== undefined ? rawFilterOptions : (lastFilterOptionsRef.current || rawFilterOptions);
  const [updatePreferences, { isLoading: isSaving }] = useUpdateAlertPairPreferencesMutation();
  const [selected, setSelected] = useState(new Set());
  const [strategySessionExclusions, setStrategySessionExclusions] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // ── Match Filters Settings ────────────────────────────────────
  const { data: savedFilterPrefs } = useGetFilterPreferencesQuery();
  const { data: filterOptionsData } = useGetFilterOptionsQuery();
  const [showMatchConfirm, setShowMatchConfirm] = useState(false);

  const allSymbolOptions = useMemo(
    () => instrumentCategories.flatMap((c) => c?.instruments || []),
    []
  );

  // Derive strategy options from the filter page (strategies visible in the IQ Strategies Alerts dropdown)
  const filterPageStrategyOptions = useMemo(() => {
    const strategies = filterOptionsData?.data?.strategies || [];
    return strategies.map((s) => ({ value: s?.name || "", label: s?.name || "" }));
  }, [filterOptionsData]);

  // Build the current exclusion filters — prefer localStorage (always up-to-date)
  // over the API response (may be stale due to debounced saves on the Alerts page).
  const FILTER_STORAGE_KEY = "tradingSignalFilters";

  const savedExclusionFilters = useMemo(() => {
    // 1. Try localStorage first — it's written instantly on every filter change
    try {
      const stored = localStorage.getItem(FILTER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          return {
            excludedStrategies: Array.isArray(parsed.excludedStrategies) ? parsed.excludedStrategies : [],
            excludedSignalTypes: Array.isArray(parsed.excludedSignalTypes) ? parsed.excludedSignalTypes : [],
            excludedSymbols: Array.isArray(parsed.excludedSymbols) ? parsed.excludedSymbols : [],
            excludedTimeframes: Array.isArray(parsed.excludedTimeframes) ? parsed.excludedTimeframes : [],
            excludedSessions: Array.isArray(parsed.excludedSessions) ? parsed.excludedSessions : [],
          };
        }
      }
    } catch {
      // localStorage parse failed — fall through to API data
    }

    // 2. Fallback to API data
    const prefs = savedFilterPrefs?.data;
    if (!prefs) return null;
    return {
      excludedStrategies: Array.isArray(prefs.excludedStrategies) ? prefs.excludedStrategies : [],
      excludedSignalTypes: Array.isArray(prefs.excludedSignalTypes) ? prefs.excludedSignalTypes : [],
      excludedSymbols: Array.isArray(prefs.excludedSymbols) ? prefs.excludedSymbols : [],
      excludedTimeframes: Array.isArray(prefs.excludedTimeframes) ? prefs.excludedTimeframes : [],
      excludedSessions: Array.isArray(prefs.excludedSessions) ? prefs.excludedSessions : [],
    };
  }, [savedFilterPrefs]);

  const matchFiltersSummary = useMemo(() => {
    if (!savedExclusionFilters || !filterOptions?.data?.alertPreferenceConfigs) return null;
    const { summary } = buildMatchedPreferences(
      savedExclusionFilters,
      filterOptions.data.alertPreferenceConfigs,
      filterOptions.data.sessions || [],
      filterPageStrategyOptions,
      allSymbolOptions
    );
    return summary;
  }, [savedExclusionFilters, filterOptions, filterPageStrategyOptions, allSymbolOptions]);


  // Derive active strategies from alertPreferenceConfigs (Defy, Bullseye, Killshot, etc.)
  const activeStrategies = useMemo(() => {
    const configs = filterOptions?.data?.alertPreferenceConfigs;
    if (!configs || !Array.isArray(configs)) return [];
    // Only include strategies that have both pairs and timeframes
    return configs
      .filter((c) => c.pairs?.length > 0 && c.timeframes?.length > 0)
      .map((c) => ({
        key: c.key,
        name: c.name,
        pairs: c.pairs,
        timeframes: c.timeframes,
      }));
  }, [filterOptions]);

  // Build ALL_KEYS from active strategies
  const allPaths = useMemo(() => buildAllPaths(activeStrategies), [activeStrategies]);

  // Load saved preferences — re-derive when strategies or saved prefs change
  useEffect(() => {
    if (allPaths.size > 0 && data?.data !== undefined) {
      setSelected(initSelectedFromSaved(data.data, allPaths));
      setStrategySessionExclusions(initStrategySessionExclusions(data.data));
      setHasChanges(false);
    }
  }, [data, allPaths]);

  // ── Match Filters handlers (must be after allPaths) ─────────────
  const handleMatchFiltersClick = () => {
    setShowMatchConfirm(true);
  };

  const [isMatchingSaving, setIsMatchingSaving] = useState(false);

  const handleMatchFiltersConfirm = async () => {
    if (!savedExclusionFilters || !filterOptions?.data?.alertPreferenceConfigs) return;

    setIsMatchingSaving(true);
    try {
      const { prefs } = buildMatchedPreferences(
        savedExclusionFilters,
        filterOptions.data.alertPreferenceConfigs,
        filterOptions.data.sessions || [],
        filterPageStrategyOptions,
        allSymbolOptions
      );

      // Build the API payload from the matched prefs (nested format)
      const newSelected = new Set();
      allPaths.forEach((path) => {
        const [strat, pair, tf] = path.split(".");
        if (prefs[strat]?.[pair]?.[tf] !== false) {
          newSelected.add(path);
        }
      });

      const apiPrefs = selectedToPrefs(newSelected, allPaths);

      // Merge session exclusions from matched prefs (nested format)
      const sessionExclusions = {};
      Object.entries(prefs).forEach(([stratKey, stratData]) => {
        if (typeof stratData === 'object' && stratData !== null && Array.isArray(stratData.excludedSessions)) {
          sessionExclusions[stratKey] = stratData.excludedSessions;
          if (!apiPrefs[stratKey]) apiPrefs[stratKey] = {};
          apiPrefs[stratKey].excludedSessions = stratData.excludedSessions;
        }
      });

      // Save directly to the API
      await updatePreferences(apiPrefs).unwrap();

      // Refresh data from server so UI reflects saved state
      await refetch();

      // Update local state to match (no unsaved changes)
      setSelected(newSelected);
      setStrategySessionExclusions(sessionExclusions);
      setHasChanges(false);
      setShowMatchConfirm(false);
      toast.success("Alert preferences updated successfully.");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to update alert preferences. Please try again.");
    } finally {
      setIsMatchingSaving(false);
    }
  };

  // ── Toggle handlers ───────────────────────────────────────────
  const handleToggle = useCallback((key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setHasChanges(true);
  }, []);

  const handleToggleRow = useCallback((strategyKey, pair) => {
    const strategy = activeStrategies.find((s) => s.key === strategyKey);
    if (!strategy) return;

    const rowKeys = strategy.timeframes
      .filter((tf) => !isInvalidStrategyCombo(strategyKey, pair, tf))
      .map((tf) => buildPath(strategyKey, pair, tf));
    const allSelected = rowKeys.length > 0 && rowKeys.every((k) => selected.has(k));

    setSelected((prev) => {
      const next = new Set(prev);
      rowKeys.forEach((k) => {
        if (allSelected) next.delete(k);
        else next.add(k);
      });
      return next;
    });
    setHasChanges(true);
  }, [selected, activeStrategies]);

  const handleToggleColumn = useCallback((strategyKey, tf) => {
    const strategy = activeStrategies.find((s) => s.key === strategyKey);
    if (!strategy) return;

    const colKeys = strategy.pairs
      .filter((p) => !isInvalidStrategyCombo(strategyKey, p, tf))
      .map((p) => buildPath(strategyKey, p, tf));
    const allSelected = colKeys.length > 0 && colKeys.every((k) => selected.has(k));

    setSelected((prev) => {
      const next = new Set(prev);
      colKeys.forEach((k) => {
        if (allSelected) next.delete(k);
        else next.add(k);
      });
      return next;
    });
    setHasChanges(true);
  }, [selected, activeStrategies]);

  const handleToggleStrategy = useCallback((strategyKey) => {
    const strategy = activeStrategies.find((s) => s.key === strategyKey);
    if (!strategy) return;

    const strategyKeys = [];
    strategy.pairs.forEach((pair) => {
      strategy.timeframes.forEach((tf) => {
        if (!isInvalidStrategyCombo(strategyKey, pair, tf)) {
          strategyKeys.push(buildPath(strategyKey, pair, tf));
        }
      });
    });

    const allSelected = strategyKeys.length > 0 && strategyKeys.every((k) => selected.has(k));

    setSelected((prev) => {
      const next = new Set(prev);
      strategyKeys.forEach((k) => {
        if (allSelected) next.delete(k);
        else next.add(k);
      });
      return next;
    });
    setHasChanges(true);
  }, [selected, activeStrategies]);

  // ── Category-level toggle (for hierarchical UI) ───────────────
  const handleToggleCategory = useCallback((strategyKey, pairsInCategory) => {
    const strategy = activeStrategies.find((s) => s.key === strategyKey);
    if (!strategy) return;

    const catKeys = [];
    pairsInCategory.forEach((pair) => {
      strategy.timeframes.forEach((tf) => {
        catKeys.push(buildPath(strategyKey, pair, tf));
      });
    });

    const allSelected = catKeys.length > 0 && catKeys.every((k) => selected.has(k));

    setSelected((prev) => {
      const next = new Set(prev);
      catKeys.forEach((k) => {
        if (allSelected) next.delete(k);
        else next.add(k);
      });
      return next;
    });
    setHasChanges(true);
  }, [selected, activeStrategies]);

  // ── Category + column toggle (for hierarchical UI table columns) ──
  const handleToggleCategoryColumn = useCallback((strategyKey, pairsInCategory, tf) => {
    const colKeys = pairsInCategory.map((pair) => buildPath(strategyKey, pair, tf));
    const allSelected = colKeys.length > 0 && colKeys.every((k) => selected.has(k));

    setSelected((prev) => {
      const next = new Set(prev);
      colKeys.forEach((k) => {
        if (allSelected) next.delete(k);
        else next.add(k);
      });
      return next;
    });
    setHasChanges(true);
  }, [selected]);

  const handleSelectAll = useCallback(() => {
    const allSelected = selected.size === allPaths.size;
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allPaths));
    }
    setHasChanges(true);
  }, [selected, allPaths]);

  const handleSave = async () => {
    try {
      const prefs = selectedToPrefs(selected, allPaths);
      // Merge per-strategy session exclusions into each strategy's nested object
      Object.entries(strategySessionExclusions || {}).forEach(([stratKey, sessions]) => {
        if (Array.isArray(sessions) && sessions.length > 0) {
          if (!prefs[stratKey]) prefs[stratKey] = {};
          prefs[stratKey].excludedSessions = sessions;
        }
      });
      await updatePreferences(prefs).unwrap();
      toast.success("Alert preferences saved successfully!");
      setHasChanges(false);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save alert preferences");
    }
  };

  // ── Derived state ─────────────────────────────────────────────
  const masterAllSelected = allPaths.size > 0 && selected.size === allPaths.size;
  const masterSomeSelected = selected.size > 0 && !masterAllSelected;

  // Session options from API
  const sessionOptions = filterOptions?.data?.sessions || [];

  if (isLoading || isLoadingFilters) {
    return <LoadingSpinner />;
  }

  if (activeStrategies.length === 0) {
    return (
      <div className="w-full">
        <div className="card w-full">
          <div className="card-body p-8 text-center">
            <BellOff className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-gray-600 dark:text-gray-400 font-semibold mb-2 text-base">
              No Strategies Available
            </h3>
            <p className="text-gray-400 dark:text-gray-500 text-sm max-w-md mx-auto">
              There are currently no active strategies configured. Alert preferences will appear here when strategies are enabled.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="card w-full">
        {/* Header */}
        <div className="card-header border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between w-full flex-wrap gap-4">
            <div>
              <h3 className="card-title text-gray-900 dark:text-white font-semibold text-lg">
                Alert Preferences
              </h3>
              <p className="text-gray-500 dark:text-gray-50 text-sm mt-0.5">
                Choose which trading pairs and time frames you want to receive notifications for.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleMatchFiltersClick}
                disabled={!savedExclusionFilters}
                title="Apply your IQ Strategies Alerts filter selections to these preferences"
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${!savedExclusionFilters
                  ? "text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-[#131324] border border-slate-200 dark:border-[#202038] cursor-not-allowed opacity-60"
                  : "text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 cursor-pointer"
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Match filters preferences
              </button>
              {/* Select All */}
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-white/5 cursor-pointer select-none hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                onClick={handleSelectAll}
              >
                <IndeterminateCheckbox
                  id="select-all-master"
                  checked={masterAllSelected}
                  indeterminate={masterSomeSelected}
                  onChange={handleSelectAll}
                />
                <label htmlFor="select-all-master" className="text-sm font-medium text-gray-700 dark:text-white cursor-pointer">
                  Select All
                </label>
                <span className="text-xs text-gray-500 dark:text-white text-gray-700 font-mono">
                  ({selected.size}/{allPaths.size})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Sections */}
        <div className="card-body p-5">
          <div className="grid gap-5">
            {activeStrategies.map((strategy) => {
              // Use hierarchical UI for React and Defy, flat table for all others
              if (HIERARCHICAL_STRATEGIES.has(strategy.key)) {
                return (
                  <HierarchicalStrategySection
                    key={strategy.key}
                    strategy={strategy}
                    selected={selected}
                    onToggle={handleToggle}
                    onToggleRow={handleToggleRow}
                    onToggleStrategy={handleToggleStrategy}
                    onToggleCategory={handleToggleCategory}
                    onToggleCategoryColumn={handleToggleCategoryColumn}
                    sessionOptions={sessionOptions}
                    excludedSessions={strategySessionExclusions[strategy.key] || []}
                    onSessionToggle={(sessionValue) => {
                      setStrategySessionExclusions((prev) => {
                        const current = prev[strategy.key] || [];
                        const updated = current.includes(sessionValue)
                          ? current.filter((s) => s !== sessionValue)
                          : [...current, sessionValue];
                        return { ...prev, [strategy.key]: updated };
                      });
                      setHasChanges(true);
                    }}
                    onSessionToggleAll={() => {
                      setStrategySessionExclusions((prev) => {
                        const current = prev[strategy.key] || [];
                        const allExcluded = current.length === sessionOptions.length;
                        return {
                          ...prev,
                          [strategy.key]: allExcluded ? [] : sessionOptions.map((s) => s.value),
                        };
                      });
                      setHasChanges(true);
                    }}
                  />
                );
              }

              return (
                <StrategySection
                  key={strategy.key}
                  strategy={strategy}
                  selected={selected}
                  onToggle={handleToggle}
                  onToggleRow={handleToggleRow}
                  onToggleColumn={handleToggleColumn}
                  onToggleStrategy={handleToggleStrategy}
                  sessionOptions={sessionOptions}
                  excludedSessions={strategySessionExclusions[strategy.key] || []}
                  onSessionToggle={(sessionValue) => {
                    setStrategySessionExclusions((prev) => {
                      const current = prev[strategy.key] || [];
                      const updated = current.includes(sessionValue)
                        ? current.filter((s) => s !== sessionValue)
                        : [...current, sessionValue];
                      return { ...prev, [strategy.key]: updated };
                    });
                    setHasChanges(true);
                  }}
                  onSessionToggleAll={() => {
                    setStrategySessionExclusions((prev) => {
                      const current = prev[strategy.key] || [];
                      const allExcluded = current.length === sessionOptions.length;
                      return {
                        ...prev,
                        [strategy.key]: allExcluded ? [] : sessionOptions.map((s) => s.value),
                      };
                    });
                    setHasChanges(true);
                  }}
                />
              );
            })}
          </div>



          {/* Save Button */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="btn btn-primary flex items-center gap-2"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Preferences
                </>
              )}
            </button>
            {hasChanges && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                You have unsaved changes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Match Filters Confirm Modal */}
      <MatchFiltersConfirmModal
        isOpen={showMatchConfirm}
        onClose={() => { if (!isMatchingSaving) setShowMatchConfirm(false); }}
        onConfirm={handleMatchFiltersConfirm}
        isLoading={isMatchingSaving}
        summary={matchFiltersSummary}
      />
    </div>
  );
};

export default AlertPairPreferences;
