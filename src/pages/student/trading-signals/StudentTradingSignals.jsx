import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  useGetClientTvSignalsQuery,
  useMarkSignalReadMutation,
  useGetUnreadCountQuery,
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
  const observer = useRef();
  const saveTimerRef = useRef(null);

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

  // ── Persist filters to localStorage + database (debounced) ──────
  useEffect(() => {
    saveFilters(exclusionFilters); // localStorage (instant)

    // Debounce the API save to avoid excessive calls
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      savePrefs(exclusionFilters);
    }, 1000);

    return () => clearTimeout(saveTimerRef.current);
  }, [exclusionFilters, savePrefs]);

  const { data, isLoading, isFetching } = useGetClientTvSignalsQuery(
    {
      page,
      limit: 12,
      search,
      excludedSymbols: exclusionFilters.excludedSymbols,
      excludedSignalTypes: exclusionFilters.excludedSignalTypes,
      excludedStrategies: exclusionFilters.excludedStrategies,
      excludedTimeframes: exclusionFilters.excludedTimeframes,
    },
    { pollingInterval: 30000 }
  );
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000,
  });
  const { data: filterOptions } = useGetFilterOptionsQuery();
  const [markRead] = useMarkSignalReadMutation();

  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const unreadCount = unreadData?.unreadCount || 0;
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
  }, [exclusionFilters, search]);

  // ── IntersectionObserver — trigger next page ─────────────────────
  const lastSignalRef = useCallback(
    (node) => {
      if (isFetching || page >= totalPages) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetching, page, totalPages]
  );

  const handleSignalClick = async (signal) => {
    setSelectedSignal(signal);
    if (!signal.isRead) {
      try {
        await markRead(signal._id).unwrap();
      } catch {
        // Silent fail for read marking
      }
    }
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
  };

  const hasActiveFilters =
    exclusionFilters.excludedSymbols.length > 0 ||
    exclusionFilters.excludedSignalTypes.length > 0 ||
    exclusionFilters.excludedStrategies.length > 0 ||
    exclusionFilters.excludedTimeframes.length > 0;

  // Count total individual excluded filters
  const activeFilterCount =
    exclusionFilters.excludedSymbols.length +
    exclusionFilters.excludedSignalTypes.length +
    exclusionFilters.excludedStrategies.length +
    exclusionFilters.excludedTimeframes.length;

  // ── Signal type options (from signalConfig) ─────────────────────
  const signalTypeOptions = Object.keys(signalConfig)
    .filter((t) => t !== "OTHER")
    .map((t) => ({ value: t, label: t }));

  // ── Strategy options (from API) ─────────────────────────────────
  const strategyOptions = (options.strategies || []).map((s) => ({
    value: s.name,
    label: s.name,
  }));

  // Count total SELECTED filters across all categories
  const totalSymbols = instrumentCategories.flatMap((c) => c.instruments).length;
  const totalSignalTypes = signalTypeOptions.length;
  const totalTimeframes = TIMEFRAME_OPTIONS.length;
  const totalStrategies = strategyOptions.length;

  const totalSelected =
    (totalSymbols - exclusionFilters.excludedSymbols.length) +
    (totalSignalTypes - exclusionFilters.excludedSignalTypes.length) +
    (totalTimeframes - exclusionFilters.excludedTimeframes.length) +
    (totalStrategies - exclusionFilters.excludedStrategies.length);

  const totalAll = totalSymbols + totalSignalTypes + totalTimeframes + totalStrategies;

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
        <div className="flex gap-4 mb-5 flex-wrap p-4 bg-slate-50 dark:bg-[#131324] rounded-xl border border-slate-200 dark:border-[#202038] items-end">
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
          <FilterSelect
            label="Strategy"
            excludedValues={exclusionFilters.excludedStrategies}
            onExcludedChange={(v) => updateExclusion("excludedStrategies", v)}
            placeholder="All Strategies"
            options={strategyOptions}
          />
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 cursor-pointer font-bold text-xs transition-colors h-10"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      )}

      {/* ── Signal Cards ── */}
      {isFetching && page === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-slate-100 dark:bg-[#0F0F1A]/80 border border-slate-200 dark:border-[#1F1F35] rounded-2xl h-[180px] animate-pulse"
            />
          ))}
        </div>
      ) : signals.length === 0 && !isFetching ? (
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
          {signals.map((signal, index) => (
            <SignalCard
              key={signal._id}
              signal={signal}
              ref={index === signals.length - 1 ? lastSignalRef : null}
              onClick={() => handleSignalClick(signal)}
            />
          ))}
        </div>
      )}

      {/* ── Loading more indicator ── */}
      {isFetching && page > 1 && (
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
