import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  useGetClientTvSignalsQuery,
  useGetFilterOptionsQuery,
  useGetFilterPreferencesQuery,
  useSaveFilterPreferencesMutation,
  useGetStrategyFilterPreferencesQuery,
  useSaveStrategyFilterPreferencesMutation,
} from "../../../store/api/client/clientTvSignalsApiSlice";
import {
  Search,
  Filter,
  Loader2,
  ChartLine,
  X,
  Target,
  Zap,
} from "lucide-react";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import { Checkbox } from "@/components/ui/checkbox";

import signalConfig from "./signalConfig";
import SignalCard from "./SignalCard";
import SignalDetailModal from "./SignalDetailModal";
import FilterSelect from "./FilterSelect";
import InstrumentFilterDropdown from "./InstrumentFilterDropdown";
import instrumentCategories from "./instrumentData";

// ── localStorage persistence ─────────────────────────────────────────
const STORAGE_KEY = "tradingSignalFilters";

const loadSavedFilters = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        excludedSymbols: Array.isArray(parsed.excludedSymbols) ? parsed.excludedSymbols : [],
        excludedSignalTypes: Array.isArray(parsed.excludedSignalTypes) ? parsed.excludedSignalTypes : [],
        excludedStrategies: Array.isArray(parsed.excludedStrategies) ? parsed.excludedStrategies : [],
        excludedTimeframes: Array.isArray(parsed.excludedTimeframes) ? parsed.excludedTimeframes : [],
      };
    }
  } catch {
    // Corrupted storage — ignore
  }
  return {
    excludedSymbols: [],
    excludedSignalTypes: [],
    excludedStrategies: [],
    excludedTimeframes: [],
  };
};

const saveFilters = (filters) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // Storage full or unavailable — ignore
  }
};

// ── Hardcoded timeframe options ──────────────────────────────────────
const TIMEFRAME_OPTIONS = [
  { value: "1S", label: "1S" },
  { value: "5S", label: "5S" },
  { value: "10S", label: "10S" },
  { value: "15S", label: "15S" },
  { value: "30S", label: "30S" },
  { value: "45S", label: "45S" },
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

// ── Bullseye Pattern options ────────────────────────────────────────
const BULLSEYE_PATTERNS = [
  { value: "XAUUSD", label: "XAUUSD" },
  { value: "GR40",   label: "GR40" },
  { value: "NAS100", label: "NAS100" },
  { value: "S&P 500", label: "S&P 500" },
  { value: "Majors",  label: "Majors" },
];

// ── Defy Execution Mode options ─────────────────────────────────────
// entrytype field: "confirmed" = Market Execution, "pending" = Pending Orders
const DEFY_MODES = [
  { value: "confirmed", label: "Market Execution" },
  { value: "pending",   label: "Pending Orders" },
];

// ── Default strategy display state ──────────────────────────────────
const DEFAULT_STRATEGY_DISPLAY = {
  bullseye: { excludedPatterns: [] },   // [] = all selected
  defy:     { excludedModes: [] },      // [] = all selected
};

// ── StrategyFilterPanel — inline filter UI below the filter bar ─────
const BullseyeFilterPanel = ({ excludedPatterns, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="block text-[10px] font-bold text-gray-500 dark:text-white uppercase tracking-wider">
      Pattern Type
    </label>
    <div className="flex flex-wrap gap-2">
      {BULLSEYE_PATTERNS.map((p) => {
        const isChecked = !excludedPatterns.includes(p.value);
        return (
          <button
            key={p.value}
            type="button"
            onClick={() => {
              if (isChecked) {
                onChange([...excludedPatterns, p.value]);
              } else {
                onChange(excludedPatterns.filter((v) => v !== p.value));
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isChecked
                ? "bg-yellow-500/10 border-yellow-500/40 text-yellow-700 dark:text-yellow-400"
                : "bg-slate-100 dark:bg-[#1C1C30] border-slate-200 dark:border-[#202038] text-slate-400 dark:text-slate-500 opacity-60"
            }`}
          >
            <Checkbox
              checked={isChecked}
              className="h-3 w-3"
              onCheckedChange={() => {}}
            />
            {p.label}
          </button>
        );
      })}
    </div>
  </div>
);

const DefyFilterPanel = ({ excludedModes, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="block text-[10px] font-bold text-gray-500 dark:text-white uppercase tracking-wider">
      Execution Mode
    </label>
    <div className="flex flex-wrap gap-2">
      {DEFY_MODES.map((m) => {
        const isChecked = !excludedModes.includes(m.value);
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => {
              if (isChecked) {
                onChange([...excludedModes, m.value]);
              } else {
                onChange(excludedModes.filter((v) => v !== m.value));
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
              isChecked
                ? "bg-blue-500/10 border-blue-500/40 text-blue-700 dark:text-blue-400"
                : "bg-slate-100 dark:bg-[#1C1C30] border-slate-200 dark:border-[#202038] text-slate-400 dark:text-slate-500 opacity-60"
            }`}
          >
            <Checkbox
              checked={isChecked}
              className="h-3 w-3"
              onCheckedChange={() => {}}
            />
            {m.label}
          </button>
        );
      })}
    </div>
  </div>
);

// ── Student Trading Signals Page ────────────────────────────────────

const StudentTradingSignals = () => {
  // ── Separate page state so filters reset never conflict ──────────
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [exclusionFilters, setExclusionFilters] = useState(loadSavedFilters);
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [signals, setSignals] = useState([]); // accumulated list
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // track first load vs polling
  const observer = useRef();
  const saveTimerRef = useRef(null);
  const stratSaveTimerRef = useRef(null);

  // ── Strategy display filter state ────────────────────────────────
  // selectedStrategies: string[] — supports multi-select (both Bullseye + Defy at once)
  const [selectedStrategies, setSelectedStrategies] = useState([]);
  const [strategyDisplay, setStrategyDisplay] = useState(DEFAULT_STRATEGY_DISPLAY);
  const [stratPrefsInitialized, setStratPrefsInitialized] = useState(false);

  // ── Load saved preferences from API (overrides localStorage) ────
  const { data: savedPrefs } = useGetFilterPreferencesQuery();
  const [savePrefs] = useSaveFilterPreferencesMutation();

  // ── Load strategy preferences from API ──────────────────────────
  const { data: savedStratPrefs } = useGetStrategyFilterPreferencesQuery();
  const [saveStratPrefs] = useSaveStrategyFilterPreferencesMutation();

  useEffect(() => {
    if (savedPrefs?.data && !filtersInitialized) {
      const apiPrefs = savedPrefs.data;
      const hasApiData =
        (apiPrefs.excludedSymbols?.length > 0) ||
        (apiPrefs.excludedSignalTypes?.length > 0) ||
        (apiPrefs.excludedStrategies?.length > 0) ||
        (apiPrefs.excludedTimeframes?.length > 0);

      if (hasApiData) {
        setExclusionFilters({
          excludedSymbols: Array.isArray(apiPrefs.excludedSymbols) ? apiPrefs.excludedSymbols : [],
          excludedSignalTypes: Array.isArray(apiPrefs.excludedSignalTypes) ? apiPrefs.excludedSignalTypes : [],
          excludedStrategies: Array.isArray(apiPrefs.excludedStrategies) ? apiPrefs.excludedStrategies : [],
          excludedTimeframes: Array.isArray(apiPrefs.excludedTimeframes) ? apiPrefs.excludedTimeframes : [],
        });
      }
      setFiltersInitialized(true);
    }
  }, [savedPrefs, filtersInitialized]);

  // ── Load strategy display preferences from API ───────────────────
  useEffect(() => {
    if (savedStratPrefs?.data && !stratPrefsInitialized) {
      const d = savedStratPrefs.data?.display;
      if (d) {
        // Restore selected strategies array (was saved as comma-separated or array)
        if (Array.isArray(d.strategies)) {
          setSelectedStrategies(d.strategies);
        } else if (d.strategy) {
          // backward-compat: old single-value
          setSelectedStrategies([d.strategy]);
        }
        setStrategyDisplay({
          bullseye: {
            excludedPatterns: Array.isArray(d.bullseye_patterns)
              ? BULLSEYE_PATTERNS
                  .map((p) => p.value)
                  .filter((v) => !d.bullseye_patterns.includes(v))
              : [],
          },
          defy: {
            excludedModes: Array.isArray(d.defy_mode)
              ? DEFY_MODES
                  .map((m) => m.value)
                  .filter((v) => !d.defy_mode.includes(v))
              : [],
          },
        });
      }
      setStratPrefsInitialized(true);
    }
  }, [savedStratPrefs, stratPrefsInitialized]);

  // ── Persist exclusion filters to localStorage + DB (debounced) ───
  useEffect(() => {
    saveFilters(exclusionFilters); // localStorage (instant)

    // Debounce the API save to avoid excessive calls
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      savePrefs(exclusionFilters);
    }, 1000);

    return () => clearTimeout(saveTimerRef.current);
  }, [exclusionFilters, savePrefs]);

  // ── Persist strategy display prefs to DB (debounced) ────────────
  useEffect(() => {
    if (!stratPrefsInitialized) return;
    clearTimeout(stratSaveTimerRef.current);
    stratSaveTimerRef.current = setTimeout(() => {
      const bullseyeSelected = BULLSEYE_PATTERNS
        .map((p) => p.value)
        .filter((v) => !strategyDisplay.bullseye.excludedPatterns.includes(v));
      const defySelected = DEFY_MODES
        .map((m) => m.value)
        .filter((v) => !strategyDisplay.defy.excludedModes.includes(v));

      saveStratPrefs({
        display: {
          strategies: selectedStrategies,          // array
          strategy: selectedStrategies[0] || null, // backward-compat
          bullseye_patterns: bullseyeSelected,
          defy_mode: defySelected,
        },
      });
    }, 1000);

    return () => clearTimeout(stratSaveTimerRef.current);
  }, [selectedStrategies, strategyDisplay, stratPrefsInitialized, saveStratPrefs]);

  // ── Build entryType filter params for the API ────────────────────
  const excludedEntryTypes =
    selectedStrategies.includes("defy")
      ? strategyDisplay.defy.excludedModes
      : [];

  const { data, isLoading, isFetching } = useGetClientTvSignalsQuery(
    {
      page,
      limit: 12,
      search,
      excludedSymbols: exclusionFilters.excludedSymbols,
      excludedSignalTypes: exclusionFilters.excludedSignalTypes,
      excludedStrategies: exclusionFilters.excludedStrategies,
      excludedTimeframes: exclusionFilters.excludedTimeframes,
      excludedEntryTypes,
    },
    { pollingInterval: 30000 }
  );

  // ── Mark initial load complete once data arrives ─────────────────
  useEffect(() => {
    if (!isLoading && data?.data && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoading, data, isInitialLoad]);
  const { data: filterOptions } = useGetFilterOptionsQuery();

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const options = filterOptions?.data || {};

  // ── Accumulate signals — replace on page 1, append on subsequent ─
  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setSignals(data.data);
      } else {
        setSignals((prev) => {
          const incoming = data.data.filter(
            (s) => !prev.some((p) => p._id === s._id)
          );
          return [...prev, ...incoming];
        });
      }
    }
  }, [data, page, exclusionFilters, search]);

  // ── Reset page when any filter changes ─────────────────────────────
  useEffect(() => {
    setPage(1);
    setIsInitialLoad(true); // show skeletons when filters/search change
  }, [exclusionFilters, search, selectedStrategies, strategyDisplay]);

  // ── IntersectionObserver — trigger next page ─────────────────────
  const lastSignalRef = useCallback(
    (node) => {
      if (isFetching || page >= totalPages) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries?.[0]?.isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetching, page, totalPages]
  );

  const handleSignalClick = (signal) => {
    setSelectedSignal(signal);
  };

  const updateExclusion = (key, values) => {
    setExclusionFilters((prev) => ({ ...prev, [key]: values }));
  };

  const clearFilters = () => {
    setExclusionFilters({
      excludedSymbols: [],
      excludedSignalTypes: [],
      excludedStrategies: [],
      excludedTimeframes: [],
    });
    setSelectedStrategies([]);
    setStrategyDisplay(DEFAULT_STRATEGY_DISPLAY);
  };

  // ── Strategy selector — multi-select toggle ───────────────────────
  const handleStrategySelect = (strategy) => {
    setSelectedStrategies((prev) =>
      prev.includes(strategy)
        ? prev.filter((s) => s !== strategy)  // deselect
        : [...prev, strategy]                 // add
    );
  };

  const hasActiveFilters =
    exclusionFilters.excludedSymbols.length > 0 ||
    exclusionFilters.excludedSignalTypes.length > 0 ||
    exclusionFilters.excludedStrategies.length > 0 ||
    exclusionFilters.excludedTimeframes.length > 0 ||
    selectedStrategies.length > 0;

  // ── Signal type options (from signalConfig) ─────────────────────
  const signalTypeOptions = Object.keys(signalConfig)
    .filter((t) => t !== "OTHER")
    .map((t) => ({ value: t, label: t }));

  // ── Strategy options (from API) ─────────────────────────────────
  const strategyOptions = (options.strategies || []).map((s) => ({
    value: s.name,
    label: s.name,
  }));

  // ── Base filter totals ───────────────────────────────────────────
  const totalSymbols = instrumentCategories.flatMap((c) => c.instruments).length;
  const totalSignalTypes = signalTypeOptions.length;
  const totalTimeframes = TIMEFRAME_OPTIONS.length;
  const totalStrategies = strategyOptions.length;

  // ── Strategy sub-filter counts (only when strategy is active) ────
  const bullseyeActive = selectedStrategies.includes("bullseye");
  const defyActive     = selectedStrategies.includes("defy");

  const bullseyeSelectedCount = bullseyeActive
    ? BULLSEYE_PATTERNS.length - strategyDisplay.bullseye.excludedPatterns.length
    : 0;
  const bullseyeTotalCount = bullseyeActive ? BULLSEYE_PATTERNS.length : 0;

  const defySelectedCount = defyActive
    ? DEFY_MODES.length - strategyDisplay.defy.excludedModes.length
    : 0;
  const defyTotalCount = defyActive ? DEFY_MODES.length : 0;

  const totalSelected =
    (totalSymbols - exclusionFilters.excludedSymbols.length) +
    (totalSignalTypes - exclusionFilters.excludedSignalTypes.length) +
    (totalTimeframes - exclusionFilters.excludedTimeframes.length) +
    (totalStrategies - exclusionFilters.excludedStrategies.length) +
    bullseyeSelectedCount +
    defySelectedCount;

  const totalAll =
    totalSymbols + totalSignalTypes + totalTimeframes + totalStrategies +
    bullseyeTotalCount + defyTotalCount;


  return (
    <div className="container-fluid pb-5">
      {/* ── Header ── */}
      <Toolbar className="mb-5">
        <ToolbarHeading>
          <div className="flex items-center gap-2.5">
            <ChartLine size={24} className="text-blue-500" />
            <ToolbarPageTitle text="IQ Strategies Alerts" />
          </div>
          <ToolbarDescription>
            Real-time alerts from iqnoic strategies
          </ToolbarDescription>
        </ToolbarHeading>

        <ToolbarActions>
          <div className="flex gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#131324] border border-slate-200 dark:border-[#202038] rounded-xl px-3 py-2 min-w-[200px] shadow-sm">
              <Search size={16} className="text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search signals..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-none outline-none bg-transparent text-xs w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${hasActiveFilters
                ? "border-blue-500 bg-blue-500/10 text-blue-500"
                : "border-slate-200 dark:border-[#202038] bg-slate-50 dark:bg-[#131324] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C1C30]"
                }`}
            >
              <Filter size={14} />
              Filters
              <span className="bg-blue-500 text-white rounded-full min-w-5 h-5 px-1 flex items-center justify-center text-[10px] font-bold">
                {totalSelected}/{totalAll}
              </span>
            </button>
          </div>
        </ToolbarActions>
      </Toolbar>

      {/* ── Filter Bar ── */}
      {showFilters && (
        <div className="flex flex-col gap-4 mb-5 p-4 bg-slate-50 dark:bg-[#131324] rounded-xl border border-slate-200 dark:border-[#202038]">

          {/* ── Row 1: Strategy Selector ─────────────────────────────── */}
          <div className="flex flex-col gap-1.5">
            <label className="block text-[10px] font-bold text-gray-500 dark:text-white uppercase tracking-wider">
              Strategy Filter
            </label>
            <div className="flex gap-2">
              {/* Bullseye */}
              <button
                type="button"
                onClick={() => handleStrategySelect("bullseye")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  bullseyeActive
                    ? "bg-yellow-500/15 border-yellow-500 text-yellow-600 dark:text-yellow-400"
                    : "bg-white dark:bg-[#0F0F1A] border-slate-200 dark:border-[#202038] text-slate-600 dark:text-slate-300 hover:border-yellow-500/50"
                }`}
              >
                <Target size={13} className={bullseyeActive ? "text-yellow-500" : "text-slate-400"} />
                Bullseye
                {bullseyeActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                )}
              </button>

              {/* Defy */}
              <button
                type="button"
                onClick={() => handleStrategySelect("defy")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  defyActive
                    ? "bg-blue-500/15 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "bg-white dark:bg-[#0F0F1A] border-slate-200 dark:border-[#202038] text-slate-600 dark:text-slate-300 hover:border-blue-500/50"
                }`}
              >
                <Zap size={13} className={defyActive ? "text-blue-500" : "text-slate-400"} />
                Defy
                {defyActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                )}
              </button>

              {selectedStrategies.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStrategies([]);
                    setStrategyDisplay(DEFAULT_STRATEGY_DISPLAY);
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer"
                >
                  <X size={11} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* ── Row 2: Strategy-specific sub-filters — both can show simultaneously ─ */}
          {bullseyeActive && (
            <BullseyeFilterPanel
              excludedPatterns={strategyDisplay.bullseye.excludedPatterns}
              onChange={(v) =>
                setStrategyDisplay((prev) => ({
                  ...prev,
                  bullseye: { excludedPatterns: v },
                }))
              }
            />
          )}

          {defyActive && (
            <DefyFilterPanel
              excludedModes={strategyDisplay.defy.excludedModes}
              onChange={(v) =>
                setStrategyDisplay((prev) => ({
                  ...prev,
                  defy: { excludedModes: v },
                }))
              }
            />
          )}


          {/* ── Row 3: Standard Exclusion Filters ───────────────────── */}
          <div className="flex gap-4 flex-wrap items-end">
            <FilterSelect
              label="Strategy"
              excludedValues={exclusionFilters.excludedStrategies}
              onExcludedChange={(v) => updateExclusion("excludedStrategies", v)}
              placeholder="All Strategies"
              options={strategyOptions}
            />
            <FilterSelect
              label="Signal Type"
              excludedValues={exclusionFilters.excludedSignalTypes}
              onExcludedChange={(v) => updateExclusion("excludedSignalTypes", v)}
              placeholder="All Types"
              options={signalTypeOptions}
            />
            <InstrumentFilterDropdown
              excludedValues={exclusionFilters.excludedSymbols}
              onExcludedChange={(v) => updateExclusion("excludedSymbols", v)}
            />
            <FilterSelect
              label="Timeframe"
              excludedValues={exclusionFilters.excludedTimeframes}
              onExcludedChange={(v) => updateExclusion("excludedTimeframes", v)}
              placeholder="All Timeframes"
              options={TIMEFRAME_OPTIONS}
            />

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 cursor-pointer font-bold text-xs transition-colors h-10"
              >
                <X size={14} /> Clear All
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Signal Cards ── */}
      {isInitialLoad && isFetching && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#0F0F1A] border border-slate-200 dark:border-[#1F1F35] rounded-2xl p-4.5 animate-pulse flex flex-col"
            >
              {/* Header skeleton */}
              <div className="flex items-start gap-2.5 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="h-6 w-24 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 dark:border-blue-500/25 rounded-lg mb-2" />
                  <div className="flex items-center gap-1.5">
                    <div className="h-3.5 w-16 bg-slate-200 dark:bg-[#1F1F35] rounded" />
                    <div className="h-4 w-10 bg-slate-200 dark:bg-[#1F1F35] rounded-md" />
                    <div className="h-3 w-24 bg-slate-200 dark:bg-[#1F1F35] rounded" />
                  </div>
                </div>
              </div>
              {/* Chart image skeleton */}
              <div className="-mx-4.5 mb-3 h-[220px] bg-slate-100 dark:bg-[#1A1A2E] border-y border-slate-100 dark:border-[#1F1F35]/50" />
              {/* Price rows skeleton */}
              <div className="mb-3 space-y-2">
                {[1, 2, 3, 4].map((r) => (
                  <div key={r} className="flex justify-between items-center px-1">
                    <div className="h-3.5 w-16 bg-slate-200 dark:bg-[#1F1F35] rounded" />
                    <div className="h-3.5 w-20 bg-slate-200 dark:bg-[#1F1F35] rounded" />
                  </div>
                ))}
              </div>
              {/* Footer skeleton */}
              <div className="flex justify-between items-center pt-2.5 mt-auto border-t border-slate-100 dark:border-[#1F1F35]/50">
                <div className="h-3 w-28 bg-slate-200 dark:bg-[#1F1F35] rounded" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-[#1F1F35] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : signals.length === 0 && !isLoading ? (
        <div className="text-center py-20 px-5 bg-slate-50 dark:bg-[#131324]/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#202038]">
          <ChartLine size={48} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-slate-600 dark:text-slate-400 font-semibold mb-2 text-base">
            No Signals Found
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-md mx-auto">
            {hasActiveFilters
              ? "Try adjusting your filter settings above"
              : "IQ Strategies Alerts will appear here automatically when alerts are triggered"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {signals?.map((signal, index) => (
            <SignalCard
              key={signal?._id}
              signal={signal}
              ref={index === signals.length - 1 ? lastSignalRef : null}
              onClick={() => handleSignalClick(signal)}
            />
          ))}
        </div>
      )}

      {/* ── Loading more indicator ── */}
      {isFetching && page > 1 && !data?.data && (
        <div className="flex justify-center items-center gap-2 py-6">
          <Loader2 size={18} className="animate-spin text-blue-500" />
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Loading more signals…
          </span>
        </div>
      )}

      {/* ── End of list indicator ── */}
      {!isFetching && page >= totalPages && signals.length > 0 && (
        <div className="flex justify-center items-center py-6">
          <span className="text-[11px] text-slate-400 dark:text-slate-600 font-medium tracking-wide">
            — All signals loaded —
          </span>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selectedSignal && (
        <SignalDetailModal
          signal={selectedSignal}
          onClose={() => setSelectedSignal(null)}
        />
      )}
    </div>
  );
};

export default StudentTradingSignals;
