import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useGetClientTvSignalsQuery,
  useGetFilterOptionsQuery,
  useGetFilterPreferencesQuery,
  useSaveFilterPreferencesMutation,
} from "../../../store/api/client/clientTvSignalsApiSlice";
import { useAuthContext } from "@/auth";
import { useTourStep } from "@/hooks/useTourStep";

import {
  Search,
  Filter,
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
import { toast } from "sonner";


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

// ── Strategy metadata from centralized config ───────────────────────
import {
  ALL_FILTER_TIMEFRAME_OPTIONS,
  DB_NAME_TO_STRATEGY_KEY,
  STRATEGIES_MAP,
} from "@/config/strategyConfig";

// Derived from centralized config — used by strategy restriction logic
const TIMEFRAME_OPTIONS = ALL_FILTER_TIMEFRAME_OPTIONS;
const DB_NAME_TO_RESTRICTION_KEY = DB_NAME_TO_STRATEGY_KEY;

const KILLSHOT_CONFIG = STRATEGIES_MAP.killshot
  ? {
    symbols: STRATEGIES_MAP.killshot.pairs,
    timeframes: STRATEGIES_MAP.killshot.timeframes.map((tf) => {
      const m = tf.match(/^M(\d+)$/); if (m) return { value: `${m[1]}m`, label: `${m[1]}m` };
      const h = tf.match(/^H(\d+)$/); if (h) return { value: `${h[1]}H`, label: `${h[1]}H` };
      return { value: tf, label: tf };
    }),
  }
  : { symbols: [], timeframes: [] };

const KILLSHOT_RESTRICTION = {
  restrictsSymbols: true,
  allowedSymbols: KILLSHOT_CONFIG.symbols,
  restrictsTimeframes: true,
  allowedTimeframes: KILLSHOT_CONFIG.timeframes,
};

const areArraysEqual = (a1, a2) => {
  const arr1 = a1 || [];
  const arr2 = a2 || [];
  if (arr1.length !== arr2.length) return false;
  return arr1.every((v) => arr2.includes(v));
};

const areFiltersEqual = (f1, f2) => {
  if (!f1 || !f2) return false;
  const keys = ["excludedSymbols", "excludedSignalTypes", "excludedStrategies", "excludedTimeframes", "excludedSessions"];
  return keys.every((key) => areArraysEqual(f1[key], f2[key]));
};

// ── Student Trading Signals Page ────────────────────────────────────

const StudentTradingSignals = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuthContext();
  // ── Separate page state so filters reset never conflict ──────────
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [exclusionFilters, setExclusionFilters] = useState(loadSavedFilters);
  const [filtersInitialized, setFiltersInitialized] = useState(false);
  const [signals, setSignals] = useState([]); // accumulated list
  const [showFilters, setShowFilters] = useState(true);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // track first load vs polling
  const observer = useRef();
  const saveTimerRef = useRef(null);
  const lastSavedPrefsRef = useRef(null);
  const exclusionFiltersRef = useRef(exclusionFilters); // track latest for unmount flush

  // ── Load saved preferences from API (fallback when localStorage is empty) ──
  const { data: savedPrefs } = useGetFilterPreferencesQuery();
  const [savePrefs] = useSaveFilterPreferencesMutation();


  useEffect(() => {
    if (!filtersInitialized && savedPrefs?.data) {
      // localStorage saves instantly on every change, so it's always the most
      // current source. Only fall back to API when localStorage is empty
      // (new browser / cleared storage / cross-device sync).
      const hasLocalStorage = !!localStorage.getItem(STORAGE_KEY);

      if (hasLocalStorage) {
        // Trust localStorage — it was already loaded into state via loadSavedFilters()
        lastSavedPrefsRef.current = exclusionFilters;
        setFiltersInitialized(true);
        return;
      }

      // No localStorage — use API data as fallback
      const apiPrefs = savedPrefs.data;
      const currentPrefs = {
        excludedSymbols: Array.isArray(apiPrefs.excludedSymbols) ? apiPrefs.excludedSymbols : [],
        excludedSignalTypes: Array.isArray(apiPrefs.excludedSignalTypes) ? apiPrefs.excludedSignalTypes : [],
        excludedStrategies: Array.isArray(apiPrefs.excludedStrategies) ? apiPrefs.excludedStrategies : [],
        excludedTimeframes: Array.isArray(apiPrefs.excludedTimeframes) ? apiPrefs.excludedTimeframes : [],
        excludedSessions: Array.isArray(apiPrefs.excludedSessions) ? apiPrefs.excludedSessions : [],
      };

      const hasApiData =
        (apiPrefs.excludedSymbols?.length > 0) ||
        (apiPrefs.excludedSignalTypes?.length > 0) ||
        (apiPrefs.excludedStrategies?.length > 0) ||
        (apiPrefs.excludedTimeframes?.length > 0) ||
        (apiPrefs.excludedSessions?.length > 0);

      if (hasApiData) {
        setExclusionFilters(currentPrefs);
        saveFilters(currentPrefs); // sync to localStorage
        lastSavedPrefsRef.current = currentPrefs;
      } else {
        lastSavedPrefsRef.current = exclusionFilters;
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

  // ── Flush pending API save on SPA navigation (component unmount) ──
  // Uses a ref to avoid stale closure — always saves the latest filters.
  useEffect(() => {
    exclusionFiltersRef.current = exclusionFilters;
  }, [exclusionFilters]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        savePrefs(exclusionFiltersRef.current);
        saveTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savePrefs]);

  // KNOWN LIMITATION: Polling re-fetches the current page, not page 1.
  // When the user has scrolled past page 1, new signals added since initial
  // load won't appear at the top until a filter/search change resets to page 1.
  // This is an acceptable trade-off — a full fix would require a separate
  // page-1 subscription or WebSocket-based push updates.

  const { data: rawSignalsData, isLoading, isFetching } = useGetClientTvSignalsQuery(
    {
      page,
      limit: 12,
      search,
      excludedSymbols: exclusionFilters.excludedSymbols,
      excludedSignalTypes: exclusionFilters.excludedSignalTypes,
      excludedStrategies: exclusionFilters.excludedStrategies,
      excludedTimeframes: exclusionFilters.excludedTimeframes,
      excludedSessions: exclusionFilters.excludedSessions,
    },
    { pollingInterval: 30000 }
  );

  const lastSignalsDataRef = useRef(rawSignalsData);
  useEffect(() => {
    if (rawSignalsData?.data) {
      lastSignalsDataRef.current = rawSignalsData;
    }
  }, [rawSignalsData]);
  const data = rawSignalsData?.data ? rawSignalsData : (lastSignalsDataRef.current || rawSignalsData);

  // ── Mark initial load complete once data arrives ─────────────────
  useEffect(() => {
    if (!isLoading && data?.data && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isLoading, data, isInitialLoad]);

  const { data: rawFilterOptions, isLoading: isLoadingFilters, isFetching: isFetchingFilters } = useGetFilterOptionsQuery();
  const lastFilterOptionsRef = useRef(rawFilterOptions);
  useEffect(() => {
    if (rawFilterOptions?.data) {
      lastFilterOptionsRef.current = rawFilterOptions;
    }
  }, [rawFilterOptions]);
  const filterOptions = rawFilterOptions?.data ? rawFilterOptions : (lastFilterOptionsRef.current || rawFilterOptions);

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const options = filterOptions?.data || {};

  // ── Accumulate signals — replace on page 1, append on subsequent ─
  useEffect(() => {
    if (data?.data) {
      const validSignals = data.data.filter((s) => Boolean(s?.chartImageUrl));
      if (page === 1) {
        setSignals(validSignals);
      } else {
        setSignals((prev) => {
          const incoming = validSignals.filter(
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
      excludedSessions: [],
    };
    setExclusionFilters(clearedExclusions);
    setSearch("");

    // Immediately save cleared state to both localStorage + API (skip debounce)
    saveFilters(clearedExclusions);
    clearTimeout(saveTimerRef.current);
    savePrefs(clearedExclusions);
    lastSavedPrefsRef.current = clearedExclusions;
  };

  // ── Derive session options from API ─────────────────────────────
  const rawTradingSessionOptions = options.sessions || [];

  // ── Strategy options (from API) ─────────────────────────────────
  const rawStrategyOptions = useMemo(() =>
    (options.strategies || []).map((s) => ({
      value: s?.name || "",
      label: s?.name || "",
    })),
    [options.strategies]
  );

  // -- Strategy-scoped filter restriction ---------------------------------------------------------
  // Uses API strategyRestrictions for any single active strategy restriction.
  // Killshot/Bullseye -> restrict Symbol+Timeframe. DEFY/React -> no restriction.
  const activeStrategyNames = useMemo(() => {
    return rawStrategyOptions
      .filter((s) => !exclusionFilters.excludedStrategies.some(
        (ex) => ex.toLowerCase() === s.value.toLowerCase()
      ))
      .map((s) => s.value);
  }, [rawStrategyOptions, exclusionFilters.excludedStrategies]);



  const singleActiveStrategyKey = useMemo(() => {
    if (activeStrategyNames.length !== 1) return null;
    return DB_NAME_TO_RESTRICTION_KEY[activeStrategyNames[0]?.toLowerCase()] || null;
  }, [activeStrategyNames]);

  const activeStrategyRestriction = useMemo(() => {
    if (singleActiveStrategyKey === "killshot") return KILLSHOT_RESTRICTION;
    return null;
  }, [singleActiveStrategyKey]);

  const rawIsOnlyKillshot = singleActiveStrategyKey === "killshot";

  const rawEffectiveCategories = useMemo(() => {
    if (!activeStrategyRestriction?.restrictsSymbols) return instrumentCategories;
    const allowedPairs = activeStrategyRestriction.allowedSymbols || [];
    if (!allowedPairs.length) return instrumentCategories;
    const allowedSet = new Set(allowedPairs.map((p) => p.toUpperCase()));
    return instrumentCategories
      .map((cat) => ({
        ...cat,
        instruments: cat.instruments.filter((inst) =>
          allowedSet.has(inst.symbol.replace(/\//g, "").toUpperCase()) ||
          allowedSet.has(inst.symbol.toUpperCase())
        ),
      }))
      .filter((cat) => cat.instruments.length > 0);
  }, [activeStrategyRestriction]);

  const rawEffectiveTimeframes = useMemo(() => {
    if (!activeStrategyRestriction?.restrictsTimeframes) return TIMEFRAME_OPTIONS;
    // allowedTimeframes already in frontend format (1m/5m/1H) from API strategyRestrictions
    if (activeStrategyRestriction.allowedTimeframes?.length) {
      const allowedValues = new Set(
        activeStrategyRestriction.allowedTimeframes.map((t) => t.value)
      );
      return TIMEFRAME_OPTIONS.filter((opt) => allowedValues.has(opt.value));
    }
    return TIMEFRAME_OPTIONS;
  }, [activeStrategyRestriction]);

  // ── Preserve existing filter options while API request is in progress ──
  // Prevents UI flicker or dropdown state resetting during loading/fetching transitions.
  const isTransitionLoading = (isLoading || isFetching || isLoadingFilters || isFetchingFilters) && !isInitialLoad;

  const preservedOptionsRef = useRef({
    categories: instrumentCategories,
    timeframes: TIMEFRAME_OPTIONS,
    strategies: [],
    sessions: [],
    isOnlyKillshot: false,
  });

  if (!isTransitionLoading) {
    if (rawEffectiveCategories.length > 0) preservedOptionsRef.current.categories = rawEffectiveCategories;
    if (rawEffectiveTimeframes.length > 0) preservedOptionsRef.current.timeframes = rawEffectiveTimeframes;
    if (rawStrategyOptions.length > 0) preservedOptionsRef.current.strategies = rawStrategyOptions;
    if (rawTradingSessionOptions.length > 0) preservedOptionsRef.current.sessions = rawTradingSessionOptions;
    preservedOptionsRef.current.isOnlyKillshot = rawIsOnlyKillshot;
  }

  const effectiveCategories = isTransitionLoading && preservedOptionsRef.current.categories.length > 0
    ? preservedOptionsRef.current.categories
    : rawEffectiveCategories;

  const effectiveTimeframes = isTransitionLoading && preservedOptionsRef.current.timeframes.length > 0
    ? preservedOptionsRef.current.timeframes
    : rawEffectiveTimeframes;

  const strategyOptions = isTransitionLoading && preservedOptionsRef.current.strategies.length > 0
    ? preservedOptionsRef.current.strategies
    : rawStrategyOptions;

  const tradingSessionOptions = isTransitionLoading && preservedOptionsRef.current.sessions.length > 0
    ? preservedOptionsRef.current.sessions
    : rawTradingSessionOptions;

  const isOnlyKillshot = isTransitionLoading
    ? preservedOptionsRef.current.isOnlyKillshot
    : rawIsOnlyKillshot;

  const hasActiveFilters =
    (exclusionFilters.excludedSymbols || []).length > 0 ||
    (exclusionFilters.excludedSignalTypes || []).length > 0 ||
    (exclusionFilters.excludedStrategies || []).length > 0 ||
    (exclusionFilters.excludedTimeframes || []).length > 0 ||
    (exclusionFilters.excludedSessions || []).length > 0;

  // ── Signal type options (from signalConfig) ─────────────────────
  const signalTypeOptions = Object.keys(signalConfig)
    .filter((t) => t !== "OTHER")
    .map((t) => ({ value: t, label: t }));

  // ── Base filter totals (use effective values for strategy-scoped restriction) ──
  const totalSymbols = (effectiveCategories || []).flatMap((c) => c?.instruments || []).length;
  const totalSignalTypes = signalTypeOptions.length;
  const totalTimeframes = effectiveTimeframes?.length || 0;
  const totalStrategies = strategyOptions.length;
  const totalSessions = tradingSessionOptions.length;

  const strategySelectedCount = Math.max(0, totalStrategies - (exclusionFilters.excludedStrategies?.length ?? 0));
  const sessionSelectedCount = Math.max(0, totalSessions - (exclusionFilters.excludedSessions || []).filter((v) => tradingSessionOptions.some((o) => o.value === v)).length);

  const totalSelected =
    Math.max(0, totalSymbols - (exclusionFilters.excludedSymbols?.length ?? 0)) +
    Math.max(0, totalSignalTypes - (exclusionFilters.excludedSignalTypes?.length ?? 0)) +
    Math.max(0, totalTimeframes - (exclusionFilters.excludedTimeframes?.length ?? 0)) +
    strategySelectedCount +
    sessionSelectedCount;

  const totalAll =
    totalSymbols + totalSignalTypes + totalTimeframes + totalStrategies + totalSessions;

  useTourStep({
    shouldStart: location?.state?.continueTour === true,
    isReady: !isTransitionLoading && !isInitialLoad && !isLoading && !isFetchingFilters,
    getSteps: () => {
      const steps = [];
      const heading = document.querySelector('.tour-signals-heading');
      if (heading) steps.push({ element: heading, title: 'IQ Strategies Alerts', intro: 'Here you can see real-time alerts from Iqonic strategies.', position: 'bottom' });
      
      const filterBar = document.querySelector('.tour-signals-filters');
      if (filterBar) steps.push({ element: filterBar, title: 'Filter Alerts', intro: 'Use these filters to find exactly what you are looking for by Strategy, Symbol, Time Frame, and more.', position: 'bottom' });
      
      const firstCard = document.querySelector('.tour-signals-card');
      if (firstCard) steps.push({ element: firstCard, title: 'Signal Card', intro: 'Each card displays detailed signal information including Entry, Exit targets, and Confirmations.', position: 'right' });
      
      return steps;
    },
    onDone: () => navigate('/iq-social', { state: { continueTour: true } }),
    delay: 1000,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      {/* ── Header ── */}
      <Toolbar className="mb-5 tour-signals-heading">
        <ToolbarHeading>
          <div className="flex items-center gap-2.5">
            <ChartLine size={24} className="text-blue-500" />
            <ToolbarPageTitle text="IQ Strategies Alerts" />
          </div>
          <ToolbarDescription>
            Real-time alerts from Iqonic strategies
          </ToolbarDescription>
        </ToolbarHeading>

        <ToolbarActions>
          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#131324] border border-slate-200 dark:border-[#202038] rounded-xl px-3 py-2 min-w-0 flex-1 sm:flex-none sm:min-w-[200px] shadow-sm">
              <Search size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors whitespace-nowrap"
            >
              <BellRing size={14} className="shrink-0" />
              <span className="hidden sm:inline">Manage Alert Notifications</span>
              <span className="sm:hidden">Alerts</span>
            </button>


            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${hasActiveFilters
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
        <div className="relative flex flex-col gap-4 mb-5 p-4 bg-slate-50 dark:bg-[#131324] rounded-xl border border-slate-200 dark:border-[#202038] tour-signals-filters">
          {/* ── Exclusion Filters ───────────────────────────────── */}
          <div className="flex gap-4 items-end pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end flex-1 min-w-0">
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
                categories={effectiveCategories}
                flat={isOnlyKillshot}
              />
              <FilterSelect
                label="Time Frame"
                excludedValues={exclusionFilters.excludedTimeframes}
                onExcludedChange={(v) => updateExclusion("excludedTimeframes", v)}
                placeholder="All Time Frames"
                options={effectiveTimeframes}
              />
              {tradingSessionOptions.length > 0 && (
                <FilterSelect
                  label="Trading Session"
                  excludedValues={exclusionFilters.excludedSessions}
                  onExcludedChange={(v) => updateExclusion("excludedSessions", v)}
                  placeholder="All Sessions"
                  options={tradingSessionOptions}
                />
              )}
            </div>

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
      {isInitialLoad && (isLoading || isFetching) ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals?.map((signal, index) => (
            <div key={signal?._id} className={index === 0 ? "tour-signals-card" : ""}>
              <SignalCard
                signal={signal}
                ref={index === signals.length - 1 ? lastSignalRef : null}
                onClick={() => handleSignalClick(signal)}
              />
            </div>
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
