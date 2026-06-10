import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  useGetClientTvSignalsQuery,
  useMarkSignalReadMutation,
  useGetUnreadCountQuery,
  useGetFilterOptionsQuery,
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

// ── Student Trading Signals Page ────────────────────────────────────

const StudentTradingSignals = () => {
  // ── Separate page state so filters reset never conflict ──────────
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    limit: 12,
    symbol: "",
    signalType: "",
    strategy: "",
    timeframe: "",
    search: "",
  });
  const [signals, setSignals] = useState([]); // accumulated list
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState(null);
  const observer = useRef();

  const { data, isLoading, isFetching } = useGetClientTvSignalsQuery(
    { ...filters, page },
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
  }, [data, page]);

  // ── Reset list when any filter changes ───────────────────────────
  useEffect(() => {
    setSignals([]);
    setPage(1);
  }, [
    filters.symbol,
    filters.signalType,
    filters.strategy,
    filters.timeframe,
    filters.search,
  ]);

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

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      limit: 12,
      symbol: "",
      signalType: "",
      strategy: "",
      timeframe: "",
      search: "",
    });
  };

  const hasActiveFilters =
    filters.symbol || filters.signalType || filters.strategy || filters.timeframe;

  return (
    <div className="container-fluid pb-5">
      {/* ── Header ── */}
      <Toolbar className="mb-5">
        <ToolbarHeading>
          <div className="flex items-center gap-2.5">
            <ChartLine size={24} className="text-blue-500" />
            <ToolbarPageTitle text="Trading Signals" />
            {unreadCount > 0 && (
              <span className="badge badge-sm badge-outline badge-danger animate-pulse">
                {unreadCount} new
              </span>
            )}
          </div>
          <ToolbarDescription>
            Real-time alerts from TradingView strategies
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
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="border-none outline-none bg-transparent text-xs w-full text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                hasActiveFilters
                  ? "border-blue-500 bg-blue-500/10 text-blue-500"
                  : "border-slate-200 dark:border-[#202038] bg-slate-50 dark:bg-[#131324] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1C1C30]"
              }`}
            >
              <Filter size={14} />
              Filters
              {hasActiveFilters && (
                <span className="bg-blue-500 text-white rounded-full w-4.5 h-4.5 flex items-center justify-center text-[10px]">
                  {[filters.symbol, filters.signalType, filters.strategy, filters.timeframe].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </ToolbarActions>
      </Toolbar>

      {/* ── Filter Bar ── */}
      {showFilters && (
        <div className="flex gap-4 mb-5 flex-wrap p-4 bg-slate-50 dark:bg-[#131324] rounded-xl border border-slate-200 dark:border-[#202038] items-end">
          <FilterSelect
            label="Signal Type"
            value={filters.signalType}
            onChange={(v) => updateFilter("signalType", v)}
            placeholder="All Types"
            options={[
              { value: "", label: "All Types" },
              ...Object.keys(signalConfig).map((t) => ({ value: t, label: t })),
            ]}
          />
          <FilterSelect
            label="Symbol"
            value={filters.symbol}
            onChange={(v) => updateFilter("symbol", v)}
            placeholder="All Symbols"
            options={[
              { value: "", label: "All Symbols" },
              ...(options.symbols || []).map((s) => ({ value: s, label: s })),
            ]}
          />
          <FilterSelect
            label="Timeframe"
            value={filters.timeframe}
            onChange={(v) => updateFilter("timeframe", v)}
            placeholder="All Timeframes"
            options={[
              { value: "", label: "All Timeframes" },
              ...(options.timeframes || []).map((t) => ({ value: t, label: t })),
            ]}
          />
          <FilterSelect
            label="Strategy"
            value={filters.strategy}
            onChange={(v) => updateFilter("strategy", v)}
            placeholder="All Strategies"
            options={[
              { value: "", label: "All Strategies" },
              ...(options.strategies || []).map((s) => ({
                value: s.name,
                label: s.name,
              })),
            ]}
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
      {isLoading && page === 1 ? (
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
              : "Trading signals will appear here automatically when alerts are triggered"}
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
