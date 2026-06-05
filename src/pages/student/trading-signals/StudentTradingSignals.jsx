import React, { useState, useEffect, useCallback } from "react";
import {
  useGetClientTvSignalsQuery,
  useMarkSignalReadMutation,
  useGetUnreadCountQuery,
  useGetFilterOptionsQuery,
} from "../../../store/api/client/clientTvSignalsApiSlice";
import { toast } from "sonner";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  X,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
  ChartLine,
  Target,
  ShieldAlert,
  Crosshair,
  Copy,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogBody,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";

// ── Signal Type Config ──────────────────────────────────────────────
const signalConfig = {
  BUY: { bg: "#10b981", bgLight: "#10b98115", text: "#10b981", icon: TrendingUp, label: "BUY" },
  SELL: { bg: "#ef4444", bgLight: "#ef444415", text: "#ef4444", icon: TrendingDown, label: "SELL" },
  LONG: { bg: "#3b82f6", bgLight: "#3b82f615", text: "#3b82f6", icon: ArrowUpRight, label: "LONG" },
  SHORT: { bg: "#f97316", bgLight: "#f9731615", text: "#f97316", icon: ArrowDownRight, label: "SHORT" },
  CLOSE: { bg: "#6b7280", bgLight: "#6b728015", text: "#6b7280", icon: Minus, label: "CLOSE" },
  INFO: { bg: "#8b5cf6", bgLight: "#8b5cf615", text: "#8b5cf6", icon: Info, label: "INFO" },
  OTHER: { bg: "#64748b", bgLight: "#64748b15", text: "#64748b", icon: Activity, label: "OTHER" },
  SL_HIT: { bg: "#ef4444", bgLight: "#ef444415", text: "#ef4444", icon: ShieldAlert, label: "SL HIT" },
  TP1_HIT: { bg: "#10b981", bgLight: "#10b98115", text: "#10b981", icon: Target, label: "TP1 HIT" },
  TP2_HIT: { bg: "#10b981", bgLight: "#10b98115", text: "#10b981", icon: Target, label: "TP2 HIT" },
  TP3_HIT: { bg: "#10b981", bgLight: "#10b98115", text: "#10b981", icon: Target, label: "TP3 HIT" },
  TP4_HIT: { bg: "#10b981", bgLight: "#10b98115", text: "#10b981", icon: Target, label: "TP4 HIT" },
  BREAKEVEN_EXIT: { bg: "#f59e0b", bgLight: "#f59e0b15", text: "#f59e0b", icon: Minus, label: "BE EXIT" },
};

// ── Student Trading Signals Page ────────────────────────────────────

const StudentTradingSignals = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    symbol: "",
    signalType: "",
    strategy: "",
    timeframe: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState(null);

  const { data, isLoading, isFetching } = useGetClientTvSignalsQuery(filters, {
    pollingInterval: 30000, // Poll every 30s
  });
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000,
  });
  const { data: filterOptions } = useGetFilterOptionsQuery();
  const [markRead] = useMarkSignalReadMutation();

  const signals = data?.data || [];
  const pagination = data?.pagination;
  const unreadCount = unreadData?.unreadCount || 0;
  const options = filterOptions?.data || {};

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
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
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
      {/* Header */}
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
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${hasActiveFilters
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

      {/* Filter Bar */}
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

      {/* Signal Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-slate-100 dark:bg-[#0F0F1A]/80 border border-slate-200 dark:border-[#1F1F35] rounded-2xl h-[180px] animate-pulse"
            />
          ))}
        </div>
      ) : signals.length === 0 ? (
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
          {signals.map((signal) => (
            <SignalCard
              key={signal._id}
              signal={signal}
              onClick={() => handleSignalClick(signal)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
            disabled={filters.page <= 1}
            className={`flex items-center p-2 rounded-xl border border-slate-200 dark:border-[#1F1F35] bg-white dark:bg-[#0F0F1A] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#131324] cursor-pointer transition-colors ${filters.page <= 1 ? "opacity-30 cursor-not-allowed" : "opacity-100"
              }`}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            disabled={filters.page >= pagination.totalPages}
            className={`flex items-center p-2 rounded-xl border border-slate-200 dark:border-[#1F1F35] bg-white dark:bg-[#0F0F1A] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#131324] cursor-pointer transition-colors ${filters.page >= pagination.totalPages ? "opacity-30 cursor-not-allowed" : "opacity-100"
              }`}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {selectedSignal && (
        <SignalDetailModal
          signal={selectedSignal}
          onClose={() => setSelectedSignal(null)}
        />
      )}
    </div>
  );
};

const SignalCard = ({ signal, onClick }) => {
  const config = signalConfig[signal.signalType] || signalConfig.OTHER;
  const IconComponent = config.icon;

  return (
    <div
      onClick={onClick}
      style={{
        border: signal.isRead ? `1px solid ${config.bg}25` : `2px solid ${config.bg}50`,
        boxShadow: signal.isRead ? "0 1px 3px rgba(0,0,0,0.02)" : `0 4px 16px ${config.bg}15`,
      }}
      className="relative rounded-2xl p-4.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col h-full"
    >
      {!signal.isRead && (
        <div style={{ background: config.bg }} className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full" />
      )}

      {/* ── Header: Symbol + Type ── */}
      <div className="flex items-center gap-2.5 mb-3">
        <div style={{ background: config.bgLight }} className="w-9.5 h-9.5 rounded-xl flex items-center justify-center flex-shrink-0">
          <IconComponent size={18} color={config.bg} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              {signal.symbol || "—"}
            </span>
            <span style={{ background: config.bgLight, color: config.text }} className="px-2 py-0.5 rounded-md text-[10px] font-extrabold flex-shrink-0">
              {config.label}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
            {signal.exchange || ""}{signal.market ? ` • ${signal.market}` : ""}{signal.timeframe ? ` • ${signal.timeframe}` : ""}
          </span>
        </div>
      </div>

      {/* ── Alert Message (full) ── */}
      {signal.alertMessage && (
        <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-[#131324]/80 border border-slate-100 dark:border-[#1F1F35]/50">
          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">Alert Message</div>
          <p className="m-0 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {signal.alertMessage}
          </p>
        </div>
      )}

      {/* ── Footer: Source + Time ── */}
      <div className="flex justify-between items-center pt-2.5 mt-auto border-t border-slate-100 dark:border-[#1F1F35]/50">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[160px]">
          {signal.strategyName || signal.webhookConfig?.name || ""}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
          <Clock size={10} />
          {formatTimeAgo(signal.createdAt)}
        </span>
      </div>
    </div>
  );
};

const PriceRow = ({ label, value, colorClass }) => {
  const handleCopy = (e) => {
    e.stopPropagation();
    if (value != null) {
      navigator.clipboard.writeText(formatPrice(value).toString());
      toast.success(`${label} copied!`);
    }
  };

  return (
    <div className="flex justify-between items-center py-2.5">
      <span className="text-[14px] text-[#8e9bae] font-medium">{label}</span>
      <div 
        className={`flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity ${colorClass}`}
        onClick={handleCopy}
        title={`Click to copy ${label}`}
      >
        {value != null && <Copy size={14} className="stroke-[2.5]" />}
        <span className="text-[14px] font-bold">
          {value != null ? formatPrice(value) : "N/A"}
        </span>
      </div>
    </div>
  );
};

const PriceBlock = ({ label, value, colorClass, bgClass, icon: Icon }) => {
  const handleCopy = (e) => {
    e.stopPropagation();
    if (value != null) {
      navigator.clipboard.writeText(formatPrice(value).toString());
      toast.success(`${label} copied!`);
    }
  };

  return (
    <div 
      onClick={handleCopy}
      className={`group flex-1 flex flex-col p-4 rounded-xl border border-slate-100 dark:border-[#1F1F35]/50 hover:border-slate-200 dark:hover:border-slate-800 transition-all cursor-pointer select-none ${bgClass}`}
      title={`Click to copy ${label}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
        {Icon && <Icon size={12} className="text-slate-400 dark:text-slate-500" />}
      </div>
      <div className="flex items-baseline justify-between">
        <span className={`text-[15px] font-black tracking-tight ${colorClass}`}>
          {value != null ? formatPrice(value) : "—"}
        </span>
        {value != null && (
          <Copy size={12} className="text-slate-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5" />
        )}
      </div>
    </div>
  );
};

const MetaItem = ({ label, value, colSpan = 1 }) => (
  <div className={`flex flex-col gap-0.5 ${colSpan === 2 ? 'col-span-2' : ''}`}>
    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
    <span className="text-[12px] font-black text-slate-700 dark:text-slate-200 truncate">{value || "—"}</span>
  </div>
);

const SignalDetailModal = ({ signal, onClose }) => {
  const [showRaw, setShowRaw] = useState(false);
  if (!signal) return null;
  const config = signalConfig[signal.signalType] || signalConfig.OTHER;
  const IconComponent = config.icon;

  const customVars = signal.customVariables || {};
  const processedExtra = signal.processedPayload || {};

  const formatKey = (key) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Extract exit levels from customVariables
  const tpLevels = [];
  if (signal.takeProfit != null) {
    tpLevels.push({ label: "TP 1", value: signal.takeProfit });
  }

  const tpKeys = ["tp2", "tp3", "tp4", "takeprofit2", "takeprofit3", "takeprofit4", "take_profit2", "take_profit3", "take_profit4"];
  Object.entries(customVars).forEach(([key, val]) => {
    const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (tpKeys.includes(normKey) || (normKey.startsWith("tp") && /^\d+$/.test(normKey.slice(2)))) {
      const num = parseInt(normKey.replace(/\D/g, ""), 10);
      if (num > 1) {
        tpLevels.push({ label: `TP ${num}`, value: val, key });
      }
    }
  });

  tpLevels.sort((a, b) => {
    const numA = parseInt(a.label.replace(/\D/g, ""), 10);
    const numB = parseInt(b.label.replace(/\D/g, ""), 10);
    return numA - numB;
  });

  // Extract context/market indicators to display as premium badges
  const badgeKeys = [
    "session", "trend", "adx", "strength", "volume_delta", "volume",
    "poc", "rrr", "lot_size", "pnl", "supertrend", "signal_strength"
  ];
  const marketBadges = [];
  const otherVars = {};

  Object.entries(customVars).forEach(([key, val]) => {
    const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    const isTp = tpLevels.some(tp => tp.key === key);
    if (isTp) return;

    if (badgeKeys.some(bk => normKey.includes(bk.replace(/_/g, "")))) {
      marketBadges.push({ key, label: formatKey(key), value: String(val) });
    } else {
      otherVars[key] = val;
    }
  });

  const knownKeys = new Set([
    "symbol", "exchange", "market", "strategyName", "alertName", "alertMessage",
    "signalType", "entryPrice", "stopLoss", "takeProfit", "timeframe",
    "alertTimestamp", "tvTimestamp", "customVariables",
  ]);

  const extraProcessed = {};
  for (const [k, v] of Object.entries(processedExtra)) {
    if (!knownKeys.has(k) && v != null && v !== "") {
      extraProcessed[k] = v;
    }
  }

  return (
    <Dialog open={!!signal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[650px] max-h-[85vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-[#1F1F35]/50">
          <div className="flex items-center gap-3">
            <div style={{ background: config.bgLight }} className="w-11 h-11 rounded-xl flex items-center justify-center">
              <IconComponent size={22} color={config.bg} />
            </div>
            <div>
              <DialogTitle className="margin-0 text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                {signal.symbol || "Signal Detail"}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <span style={{ background: config.bgLight, color: config.text }} className="px-2 py-0.5 rounded-md text-[10px] font-extrabold">
                  {config.label}
                </span>
                {signal.timeframe && (
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/40 px-1.5 py-0.5 rounded">
                    {signal.timeframe}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>
        <DialogBody className="px-6 py-5">
          {/* Core Price Levels Grid */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <PriceBlock 
              label="Entry Target" 
              value={signal.entryPrice} 
              colorClass="text-slate-800 dark:text-white"
              bgClass="bg-slate-50/70 dark:bg-[#121222]/40"
              icon={Crosshair}
            />
            <PriceBlock 
              label="Stop Loss (Invalidation)" 
              value={signal.stopLoss} 
              colorClass="text-red-500 dark:text-[#ff3b30]"
              bgClass="bg-red-50/30 dark:bg-[#ef4444]/5"
              icon={ShieldAlert}
            />
          </div>

          {/* TP Target exits */}
          {tpLevels.length > 0 && (
            <div className="mb-5">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-2.5 uppercase tracking-wider px-1">Take Profit Targets</div>
              <div className="grid grid-cols-2 gap-2">
                {tpLevels.map((tp, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      if (tp.value != null) {
                        navigator.clipboard.writeText(formatPrice(tp.value).toString());
                        toast.success(`${tp.label} copied!`);
                      }
                    }}
                    className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/30 dark:bg-[#10b981]/5 border border-emerald-100/30 dark:border-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-800/50 transition-all cursor-pointer group"
                    title={`Click to copy ${tp.label}`}
                  >
                    <div className="flex items-center gap-2">
                      <Target size={12} className="text-emerald-500" />
                      <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400">{tp.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-black text-emerald-600 dark:text-emerald-400">
                        {tp.value != null ? formatPrice(tp.value) : "—"}
                      </span>
                      {tp.value != null && (
                        <Copy size={10} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Intelligence badges */}
          {marketBadges.length > 0 && (
            <div className="mb-5">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-2.5 uppercase tracking-wider px-1">Market Indicators</div>
              <div className="flex flex-wrap gap-1.5 px-0.5">
                {marketBadges.map((badge, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-slate-50 dark:bg-[#131324]/60 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-[#1F1F35]/50"
                  >
                    <span className="text-slate-400 dark:text-slate-500 font-semibold">{badge.label}:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-black">{badge.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alert Message terminal block */}
          {signal.alertMessage && (
            <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 dark:border-[#202038]">
              <div className="flex justify-between items-center px-4 py-2 bg-slate-100/80 dark:bg-[#161626]/80 border-b border-slate-200 dark:border-[#202038] select-none">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400 dark:bg-[#ff5f56]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-[#ffbd2e]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 dark:bg-[#27c93f]" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">TradingView Alert Message</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(signal.alertMessage);
                    toast.success("Alert message copied!");
                  }}
                  className="p-1 hover:bg-slate-255 dark:hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Copy message"
                >
                  <Copy size={12} />
                </button>
              </div>
              <div className="p-4 bg-slate-50/40 dark:bg-[#0E0E18]">
                <p className="m-0 text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap select-all">
                  {signal.alertMessage}
                </p>
              </div>
            </div>
          )}

          {/* Other Variables */}
          {Object.keys(otherVars).length > 0 && (
            <div className="mb-5">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-2 uppercase tracking-wider px-1">Other Variables</div>
              <div className="bg-slate-50/30 dark:bg-[#0E0E18]/50 rounded-xl border border-slate-100 dark:border-[#1F1F35]/50 px-4 py-1">
                {Object.entries(otherVars).map(([key, val]) => (
                  <InfoRow key={key} label={formatKey(key)} value={typeof val === "object" ? JSON.stringify(val) : String(val)} />
                ))}
              </div>
            </div>
          )}

          {/* Extra Processed Fields */}
          {Object.keys(extraProcessed).length > 0 && (
            <div className="mb-5">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-2 uppercase tracking-wider px-1">Extra Fields</div>
              <div className="bg-slate-50/30 dark:bg-[#0E0E18]/50 rounded-xl border border-slate-100 dark:border-[#1F1F35]/50 px-4 py-1">
                {Object.entries(extraProcessed).map(([key, val]) => (
                  <InfoRow key={key} label={formatKey(key)} value={typeof val === "object" ? JSON.stringify(val) : String(val)} />
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Raw JSON payload */}
          {signal.rawPayload && (
            <div className="mb-5">
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="flex items-center gap-1.5 w-full text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1 py-1.5 hover:bg-slate-100 dark:hover:bg-[#18182A] rounded-lg transition-colors cursor-pointer justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <Activity size={10} />
                  <span>Raw JSON Payload</span>
                </div>
                <span className="text-[10px]">{showRaw ? "Collapse [-]" : "Expand [+]"}</span>
              </button>
              {showRaw && (
                <div className="relative mt-2 overflow-hidden rounded-xl border border-slate-200 dark:border-[#202038]">
                  <div className="flex justify-between items-center px-4 py-1.5 bg-slate-100/50 dark:bg-[#161626]/50 border-b border-slate-200 dark:border-[#202038]">
                    <span className="text-[9px] font-mono text-slate-400">payload.json</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(signal.rawPayload, null, 2));
                        toast.success("Raw JSON copied!");
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Copy JSON"
                    >
                      <Copy size={11} />
                    </button>
                  </div>
                  <div className="p-3.5 bg-[#08080E] text-slate-300 overflow-x-auto max-h-[200px]">
                    <pre className="m-0 text-[11px] leading-normal font-mono text-emerald-400/90 whitespace-pre-wrap break-all">
                      {JSON.stringify(signal.rawPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Standard Metadata Grid */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1F1F35]/50">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-slate-50/30 dark:bg-[#0E0E18]/50 p-4 rounded-xl border border-slate-100/40 dark:border-[#1F1F35]/30">
              {signal.exchange && <MetaItem label="Exchange" value={signal.exchange} />}
              {signal.market && <MetaItem label="Market" value={signal.market} />}
              {signal.timeframe && <MetaItem label="Timeframe" value={signal.timeframe} />}
              {signal.strategyName && <MetaItem label="Strategy" value={signal.strategyName} />}
              {signal.webhookConfig?.name && <MetaItem label="Webhook Config" value={signal.webhookConfig.name} />}
              {signal.alertName && <MetaItem label="Alert Name" value={signal.alertName} />}
              <MetaItem label="Received" value={new Date(signal.createdAt).toLocaleString()} colSpan={2} />
            </div>
          </div>

        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

const FilterSelect = ({ label, value, onChange, options, placeholder }) => (
  <div className="flex flex-col gap-1.5 relative">
    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</label>
    <Select value={value || "ALL"} onValueChange={(val) => onChange(val === "ALL" ? "" : val)}>
      <SelectTrigger className="w-[160px] h-10 bg-white dark:bg-[#0F0F1A] border border-slate-200 dark:border-[#202038]">
        <SelectValue placeholder={placeholder}>
          {value ? options.find(o => o.value === value)?.label : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value || "ALL"} value={opt.value || "ALL"}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);



const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-[14px] text-[#8e9bae] font-medium">{label}</span>
    <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{value}</span>
  </div>
);

// ── Utilities ───────────────────────────────────────────────────────

function formatPrice(value) {
  if (value == null) return "—";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toFixed(4);
}

function formatTimeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default StudentTradingSignals;
