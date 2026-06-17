import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight, Bell, BellOff, Save } from "lucide-react";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import {
  useGetAlertPairPreferencesQuery,
  useUpdateAlertPairPreferencesMutation,
} from "../../../store/api/client/clientProfileApiSlice";

// ── Strategy Data from PDF ─────────────────────────────────────────
const SHARED_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "USD/CAD", "AUD/USD", "NZD/USD",
  "EUR/GBP", "EUR/JPY", "EUR/CHF", "EUR/CAD", "EUR/AUD", "EUR/NZD",
  "GBP/JPY", "GBP/CHF", "GBP/CAD", "GBP/AUD",
  "AUD/JPY", "CAD/JPY", "NZD/JPY", "CHF/JPY",
  "AUD/NZD", "AUD/CAD", "CHF/CAD",
  "BTC/USD", "ETH/USD", "SOL/USD",
];

const STRATEGIES = [
  {
    key: "react",
    name: "React",
    pairs: SHARED_PAIRS,
    timeframes: ["M1", "M5", "M15", "M30", "H1", "H4"],
  },
  {
    key: "defy",
    name: "Defy",
    pairs: SHARED_PAIRS,
    timeframes: ["M1", "M5", "M15", "M30", "H1", "H4"],
  },
  {
    key: "bullseye",
    name: "Bullseye",
    pairs: ["GER40", "NAS100", "SP500"],
    timeframes: ["M5"],
  },
  {
    key: "smartShot",
    name: "Smart Shot",
    pairs: ["US30", "NAS100", "SPX", "GBP/USD", "EUR/USD", "XAU/USD", "BTC/USD"],
    timeframes: ["M1"],
  },
  {
    key: "supernova",
    name: "Supernova",
    pairs: ["USD/JPY", "USD/CAD", "USD/CHF", "EUR/USD", "GBP/USD", "AUD/USD", "NZD/USD"],
    timeframes: ["M1"],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────
const buildKey = (strategy, pair, tf) => `${strategy}__${pair}__${tf}`;

function buildAllKeys() {
  const keys = new Set();
  STRATEGIES.forEach((s) => {
    s.pairs.forEach((pair) => {
      s.timeframes.forEach((tf) => {
        keys.add(buildKey(s.key, pair, tf));
      });
    });
  });
  return keys;
}

const ALL_KEYS = buildAllKeys();

function initSelectedFromSaved(savedPrefs) {
  // Empty object or null = all selected (default)
  if (!savedPrefs || Object.keys(savedPrefs).length === 0) {
    return new Set(ALL_KEYS);
  }
  // savedPrefs is { key: true/false }
  const selected = new Set();
  ALL_KEYS.forEach((key) => {
    if (savedPrefs[key] !== false) {
      selected.add(key);
    }
  });
  return selected;
}

function selectedToPrefs(selected) {
  // If all selected → save empty (default)
  if (selected.size === ALL_KEYS.size) return {};
  // Otherwise save only the deselected as false
  const prefs = {};
  ALL_KEYS.forEach((key) => {
    prefs[key] = selected.has(key);
  });
  return prefs;
}

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

// ── Strategy Section Component ──────────────────────────────────────
const StrategySection = ({ strategy, selected, onToggle, onToggleRow, onToggleColumn, onToggleStrategy }) => {
  const [isOpen, setIsOpen] = useState(false);

  const strategyKeys = useMemo(() => {
    const keys = [];
    strategy.pairs.forEach((pair) => {
      strategy.timeframes.forEach((tf) => {
        keys.push(buildKey(strategy.key, pair, tf));
      });
    });
    return keys;
  }, [strategy]);

  const selectedCount = strategyKeys.filter((k) => selected.has(k)).length;
  const allSelected = selectedCount === strategyKeys.length;
  const someSelected = selectedCount > 0 && !allSelected;

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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {strategy.pairs.length} pairs × {strategy.timeframes.length} timeframe{strategy.timeframes.length > 1 ? "s" : ""}
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

      {/* Strategy Table */}
      {isOpen && (
        <div className="border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/5">
                <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-white text-xs uppercase tracking-wider min-w-[140px]">
                  Pair
                </th>
                {strategy.timeframes.map((tf) => {
                  const colKeys = strategy.pairs.map((p) => buildKey(strategy.key, p, tf));
                  const colSelectedCount = colKeys.filter((k) => selected.has(k)).length;
                  const colAllSelected = colSelectedCount === colKeys.length;
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
                const rowKeys = strategy.timeframes.map((tf) => buildKey(strategy.key, pair, tf));
                const rowSelectedCount = rowKeys.filter((k) => selected.has(k)).length;
                const rowAllSelected = rowSelectedCount === rowKeys.length;
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
                      const key = buildKey(strategy.key, pair, tf);
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

// ── Main Component ──────────────────────────────────────────────────
const AlertPairPreferences = () => {
  const { data, isLoading, refetch } = useGetAlertPairPreferencesQuery();
  const [updatePreferences, { isLoading: isSaving }] = useUpdateAlertPairPreferencesMutation();
  const [selected, setSelected] = useState(new Set(ALL_KEYS));
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved preferences
  useEffect(() => {
    if (data?.data !== undefined) {
      setSelected(initSelectedFromSaved(data.data));
      setHasChanges(false);
    }
  }, [data]);

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
    const strategy = STRATEGIES.find((s) => s.key === strategyKey);
    if (!strategy) return;

    const rowKeys = strategy.timeframes.map((tf) => buildKey(strategyKey, pair, tf));
    const allSelected = rowKeys.every((k) => selected.has(k));

    setSelected((prev) => {
      const next = new Set(prev);
      rowKeys.forEach((k) => {
        if (allSelected) next.delete(k);
        else next.add(k);
      });
      return next;
    });
    setHasChanges(true);
  }, [selected]);

  const handleToggleColumn = useCallback((strategyKey, tf) => {
    const strategy = STRATEGIES.find((s) => s.key === strategyKey);
    if (!strategy) return;

    const colKeys = strategy.pairs.map((p) => buildKey(strategyKey, p, tf));
    const allSelected = colKeys.every((k) => selected.has(k));

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

  const handleToggleStrategy = useCallback((strategyKey) => {
    const strategy = STRATEGIES.find((s) => s.key === strategyKey);
    if (!strategy) return;

    const strategyKeys = [];
    strategy.pairs.forEach((pair) => {
      strategy.timeframes.forEach((tf) => {
        strategyKeys.push(buildKey(strategyKey, pair, tf));
      });
    });

    const allSelected = strategyKeys.every((k) => selected.has(k));

    setSelected((prev) => {
      const next = new Set(prev);
      strategyKeys.forEach((k) => {
        if (allSelected) next.delete(k);
        else next.add(k);
      });
      return next;
    });
    setHasChanges(true);
  }, [selected]);

  const handleSelectAll = useCallback(() => {
    const allSelected = selected.size === ALL_KEYS.size;
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ALL_KEYS));
    }
    setHasChanges(true);
  }, [selected]);

  const handleSave = async () => {
    try {
      const prefs = selectedToPrefs(selected);
      await updatePreferences(prefs).unwrap();
      toast.success("Alert preferences saved successfully!");
      setHasChanges(false);
      refetch();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save alert preferences");
    }
  };

  // ── Derived state ─────────────────────────────────────────────
  const masterAllSelected = selected.size === ALL_KEYS.size;
  const masterSomeSelected = selected.size > 0 && !masterAllSelected;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full">
      <div className="card w-full">
        {/* Header */}
        <div className="card-header border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between w-full flex-wrap gap-4">
            <div>
              <h3 className="card-title text-gray-900 dark:text-white font-semibold text-lg">
                Alert Pair Preferences
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                Choose which trading pairs and timeframes you want to receive notifications for.
              </p>
            </div>
            <div className="flex items-center gap-3">
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
                  ({selected.size}/{ALL_KEYS.size})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Sections */}
        <div className="card-body p-5">
          <div className="grid gap-5">
            {STRATEGIES.map((strategy) => (
              <StrategySection
                key={strategy.key}
                strategy={strategy}
                selected={selected}
                onToggle={handleToggle}
                onToggleRow={handleToggleRow}
                onToggleColumn={handleToggleColumn}
                onToggleStrategy={handleToggleStrategy}
              />
            ))}
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
                <>
                  {/* <i className="ki-filled ki-loading animate-spin"></i> */}
                  Saving...
                </>
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
    </div>
  );
};

export default AlertPairPreferences;
