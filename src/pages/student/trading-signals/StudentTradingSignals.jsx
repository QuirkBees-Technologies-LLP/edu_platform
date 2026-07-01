import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetClientTvSignalsQuery,
  useGetFilterOptionsQuery,
  useGetFilterPreferencesQuery,
  useSaveFilterPreferencesMutation,
} from "../../../store/api/client/clientTvSignalsApiSlice";
import {
  Search,
  Filter,
  Loader2,
  ChartLine,
  X,
  BellRing,
} from "lucide-react";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";


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
        excludedBullseyeTypes: Array.isArray(parsed.excludedBullseyeTypes) ? parsed.excludedBullseyeTypes : [],
        excludedDefyTypes: Array.isArray(parsed.excludedDefyTypes) ? parsed.excludedDefyTypes : [],
        excludedSessions: Array.isArray(parsed.excludedSessions) ? parsed.excludedSessions : [],
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
    excludedBullseyeTypes: [],
    excludedDefyTypes: [],
    excludedSessions: [],
  };
};

const saveFilters = (filters) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // Storage full or unavailable — ignore
  }
};

// ── Hardcoded time frame options ─────────────────────────────────────
const TIMEFRAME_OPTIONS = [
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

// Pattern Type & Execution Type options are now fetched from the API
// (options.bullseyePatterns and options.defyModes) so that disabling
// a strategy on the admin side automatically hides its sub-filters.

const areArraysEqual = (a1, a2) => {
  const arr1 = a1 || [];
  const arr2 = a2 || [];
  if (arr1.length !== arr2.length) return false;
  return arr1.every((v) => arr2.includes(v));
};

const areFiltersEqual = (f1, f2) => {
  if (!f1 || !f2) return false;
  const keys = ["excludedSymbols", "excludedSignalTypes", "excludedStrategies", "excludedTimeframes", "excludedBullseyeTypes", "excludedDefyTypes", "excludedSessions"];
  return keys.every((key) => areArraysEqual(f1[key], f2[key]));
};

// ── Student Trading Signals Page ────────────────────────────────────

const StudentTradingSignals = () => {
  const navigate = useNavigate();
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
  const lastSavedPrefsRef = useRef(null);

  // ── Load saved preferences from API (overrides localStorage) ────
  const { data: savedPrefs } = useGetFilterPreferencesQuery();
  const [savePrefs] = useSaveFilterPreferencesMutation();

  useEffect(() => {
    if (savedPrefs?.data && !filtersInitialized) {
      const apiPrefs = savedPrefs.data;
      const hasApiData =
        (apiPrefs.excludedSymbols?.length > 0) ||
        (apiPrefs.excludedSignalTypes?.length > 0) ||
        (apiPrefs.excludedStrategies?.length > 0) ||
        (apiPrefs.excludedTimeframes?.length > 0) ||
        (apiPrefs.excludedBullseyeTypes?.length > 0) ||
        (apiPrefs.excludedDefyTypes?.length > 0) ||
        (apiPrefs.excludedSessions?.length > 0);

      const currentPrefs = {
        excludedSymbols: Array.isArray(apiPrefs.excludedSymbols) ? apiPrefs.excludedSymbols : [],
        excludedSignalTypes: Array.isArray(apiPrefs.excludedSignalTypes) ? apiPrefs.excludedSignalTypes : [],
        excludedStrategies: Array.isArray(apiPrefs.excludedStrategies) ? apiPrefs.excludedStrategies : [],
        excludedTimeframes: Array.isArray(apiPrefs.excludedTimeframes) ? apiPrefs.excludedTimeframes : [],
        excludedBullseyeTypes: Array.isArray(apiPrefs.excludedBullseyeTypes) ? apiPrefs.excludedBullseyeTypes : [],
        excludedDefyTypes: Array.isArray(apiPrefs.excludedDefyTypes) ? apiPrefs.excludedDefyTypes : [],
        excludedSessions: Array.isArray(apiPrefs.excludedSessions) ? apiPrefs.excludedSessions : [],
      };

      if (hasApiData) {
        setExclusionFilters(currentPrefs);
        lastSavedPrefsRef.current = currentPrefs;
      } else {
        lastSavedPrefsRef.current = exclusionFilters; // default from localStorage
      }
      setFiltersInitialized(true);
    }
  }, [savedPrefs, filtersInitialized, exclusionFilters]);

  // ── Persist exclusion filters to localStorage + DB (debounced) ───
  useEffect(() => {
    if (!filtersInitialized) return;

    // Skip saving if the filters haven't actually changed since last load/save
    const hasChanged = !areFiltersEqual(exclusionFilters, lastSavedPrefsRef.current);
    if (!hasChanged) return;

    saveFilters(exclusionFilters); // localStorage (instant)

    // Debounce the API save to avoid excessive calls
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      savePrefs(exclusionFilters);
      lastSavedPrefsRef.current = exclusionFilters;
    }, 1000);

    return () => clearTimeout(saveTimerRef.current);
  }, [exclusionFilters, filtersInitialized, savePrefs]);

  // ── BUG #9 fix: Flush pending saves before page unload ──────────
  useEffect(() => {
    const flushPendingSaves = () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        savePrefs(exclusionFilters);
        saveTimerRef.current = null;
      }
    };
    window.addEventListener("beforeunload", flushPendingSaves);
    return () => window.removeEventListener("beforeunload", flushPendingSaves);
  }, [exclusionFilters, savePrefs]);

  // KNOWN LIMITATION: Polling re-fetches the current page, not page 1.
  // When the user has scrolled past page 1, new signals added since initial
  // load won't appear at the top until a filter/search change resets to page 1.
  // This is an acceptable trade-off — a full fix would require a separate
  // page-1 subscription or WebSocket-based push updates.
  const { data, isLoading, isFetching } = useGetClientTvSignalsQuery(
    {
      page,
      limit: 12,
      search,
      excludedSymbols: exclusionFilters.excludedSymbols,
      excludedSignalTypes: exclusionFilters.excludedSignalTypes,
      excludedStrategies: exclusionFilters.excludedStrategies,
      excludedTimeframes: exclusionFilters.excludedTimeframes,
      excludedBullseyeTypes: exclusionFilters.excludedBullseyeTypes,
      excludedDefyTypes: exclusionFilters.excludedDefyTypes,
      excludedSessions: exclusionFilters.excludedSessions,
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
  }, [exclusionFilters, search]);

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
    const clearedExclusions = {
      excludedSymbols: [],
      excludedSignalTypes: [],
      excludedStrategies: [],
      excludedTimeframes: [],
      excludedBullseyeTypes: [],
      excludedDefyTypes: [],
      excludedSessions: [],
    };
    setExclusionFilters(clearedExclusions);
    setSearch("");

    // Immediately save cleared state (skip debounce to prevent stale reload)
    clearTimeout(saveTimerRef.current);
    savePrefs(clearedExclusions);
    lastSavedPrefsRef.current = clearedExclusions;
  };

  // ── Derive dynamic sub-filter options from API ──────────────────────
  const patternTypeOptions = options.bullseyePatterns || [];
  const executionModeOptions = options.defyModes || [];
  const tradingSessionOptions = options.sessions || [];

  // ── Strategy options (from API) ─────────────────────────────────
  const strategyOptions = (options.strategies || []).map((s) => ({
    value: s?.name || "",
    label: s?.name || "",
  }));

  // ── Derive which sub-filters are active ─────────────────────────────
  // A sub-filter is active only if its parent strategy exists in the
  // API-returned strategies (admin-enabled) AND isn't user-excluded
  const bullseyeExistsInApi = strategyOptions.some(
    (s) => s.value.toLowerCase() === "bullseye"
  );
  const defyExistsInApi = strategyOptions.some(
    (s) => s.value.toLowerCase() === "defy"
  );
  const isBullseyeActive = bullseyeExistsInApi && !exclusionFilters.excludedStrategies.some(
    (s) => s.toLowerCase() === "bullseye"
  );
  const isDefyActive = defyExistsInApi && !exclusionFilters.excludedStrategies.some(
    (s) => s.toLowerCase() === "defy"
  );

  const hasActiveFilters =
    (exclusionFilters.excludedSymbols || []).length > 0 ||
    (exclusionFilters.excludedSignalTypes || []).length > 0 ||
    (exclusionFilters.excludedStrategies || []).length > 0 ||
    (exclusionFilters.excludedTimeframes || []).length > 0 ||
    (isBullseyeActive && (exclusionFilters.excludedBullseyeTypes || []).length > 0) ||
    (isDefyActive && (exclusionFilters.excludedDefyTypes || []).length > 0) ||
    (exclusionFilters.excludedSessions || []).length > 0;

  // ── Signal type options (from signalConfig) ─────────────────────
  const signalTypeOptions = Object.keys(signalConfig)
    .filter((t) => t !== "OTHER")
    .map((t) => ({ value: t, label: t }));

  // ── Base filter totals ───────────────────────────────────────────
  const totalSymbols = instrumentCategories.flatMap((c) => c.instruments).length;
  const totalSignalTypes = signalTypeOptions.length;
  const totalTimeframes = TIMEFRAME_OPTIONS.length;
  const totalStrategies = strategyOptions.length;

  // Sub-filter counts (only counted when their parent strategy is active)
  const patternTypeSelectedCount = isBullseyeActive
    ? Math.max(0, patternTypeOptions.length - (exclusionFilters.excludedBullseyeTypes || []).filter((v) => patternTypeOptions.some((o) => o.value === v)).length)
    : 0;
  const executionModeSelectedCount = isDefyActive
    ? Math.max(0, executionModeOptions.length - (exclusionFilters.excludedDefyTypes || []).filter((v) => executionModeOptions.some((o) => o.value === v)).length)
    : 0;
  const subFilterTotal = (isBullseyeActive ? patternTypeOptions.length : 0)
    + (isDefyActive ? executionModeOptions.length : 0);

  const totalSessions = tradingSessionOptions.length;

  const strategySelectedCount = Math.max(0, totalStrategies - (exclusionFilters.excludedStrategies?.length ?? 0));

  const totalSelected =
    Math.max(0, totalSymbols - (exclusionFilters.excludedSymbols?.length ?? 0)) +
    Math.max(0, totalSignalTypes - (exclusionFilters.excludedSignalTypes?.length ?? 0)) +
    Math.max(0, totalTimeframes - (exclusionFilters.excludedTimeframes?.length ?? 0)) +
    strategySelectedCount +
    patternTypeSelectedCount +
    executionModeSelectedCount +
    Math.max(0, totalSessions - (exclusionFilters.excludedSessions || []).filter((v) => tradingSessionOptions.some((o) => o.value === v)).length);

  const totalAll =
    totalSymbols + totalSignalTypes + totalTimeframes + totalStrategies +
    subFilterTotal + totalSessions;


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
                placeholder="Search alerts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-none outline-none bg-transparent text-xs w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>
            {/* Manage Notifications */}
            <button
              type="button"
              onClick={() => navigate("/profile?tab=alerts")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors"
            >
              <BellRing size={14} />
              Manage Alert Notifications
            </button>

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
          {/* ── Exclusion Filters ───────────────────────────────── */}
          <div className="flex gap-2.5 items-end flex-nowrap">
            <FilterSelect
              label="Strategy"
              excludedValues={exclusionFilters.excludedStrategies}
              onExcludedChange={(v) => updateExclusion("excludedStrategies", v)}
              placeholder="All Strategies"
              options={strategyOptions}
            />
            <FilterSelect
              label="Alert Type"
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
              label="Time Frame"
              excludedValues={exclusionFilters.excludedTimeframes}
              onExcludedChange={(v) => updateExclusion("excludedTimeframes", v)}
              placeholder="All Time Frames"
              options={TIMEFRAME_OPTIONS}
            />
            {/* ── Conditional: Pattern Type — visible when Bullseye is selected ── */}
            {isBullseyeActive && patternTypeOptions.length > 0 && (
              <FilterSelect
                label="Pattern Type"
                excludedValues={exclusionFilters.excludedBullseyeTypes}
                onExcludedChange={(v) => updateExclusion("excludedBullseyeTypes", v)}
                placeholder="All Patterns"
                options={patternTypeOptions}
              />
            )}
            {/* ── Conditional: Execution Type — visible when Defy is selected ── */}
            {isDefyActive && executionModeOptions.length > 0 && (
              <FilterSelect
                label="Execution Type"
                excludedValues={exclusionFilters.excludedDefyTypes}
                onExcludedChange={(v) => updateExclusion("excludedDefyTypes", v)}
                placeholder="All Types"
                options={executionModeOptions}
              />
            )}
            {/* ── Trading Session filter ── */}
            {tradingSessionOptions.length > 0 && (
              <FilterSelect
                label="Trading Session"
                excludedValues={exclusionFilters.excludedSessions}
                onExcludedChange={(v) => updateExclusion("excludedSessions", v)}
                placeholder="All Sessions"
                options={tradingSessionOptions}
              />
            )}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                title="Clear All"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 cursor-pointer transition-colors shrink-0"
              >
                <X size={16} />
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
      ) : signals.length === 0 && !isFetching ? (
        <div className="text-center py-20 px-5 bg-slate-50 dark:bg-[#131324]/20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#202038]">
          <ChartLine size={48} className="text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-slate-600 dark:text-slate-400 font-semibold mb-2 text-base">
            No Alerts Found
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-md mx-auto mb-4">
            {search
              ? `No alerts match "${search}". Try a different search term.`
              : hasActiveFilters
                ? "Your current filters are excluding all alerts. Try adjusting your filter settings or clearing them."
                : "IQ Strategies Alerts will appear here automatically when alerts are triggered."}
          </p>
          {(hasActiveFilters || search) && (
            <button
              onClick={() => {
                clearFilters();
                setSearch("");
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 cursor-pointer font-semibold text-xs transition-colors"
            >
              <X size={14} /> Clear All Filters
            </button>
          )}
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

      {/* ── Loading more indicator (infinite scroll) ── */}
      {isFetching && page > 1 && (
        <div className="flex justify-center items-center gap-3 py-8">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Loading more alerts…
          </span>
        </div>
      )}

      {/* ── End of list indicator ── */}
      {!isFetching && page >= totalPages && signals.length > 0 && (
        <div className="flex justify-center items-center py-6">
          <span className="text-[11px] text-slate-400 dark:text-slate-600 font-medium tracking-wide">
            — All alerts loaded —
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
