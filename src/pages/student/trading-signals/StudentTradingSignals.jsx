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
      className="relative rounded-2xl p-4.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden"
    >
      {!signal.isRead && (
        <div style={{ background: config.bg }} className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full" />
      )}
      <div className="flex items-center gap-2.5 mb-3.5">
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
            {signal.exchange || ""} {signal.timeframe ? `• ${signal.timeframe}` : ""}
          </span>
        </div>
      </div>
      <div className="flex flex-col px-1 mb-2 mt-2">
        <PriceRow label="Entry" value={signal.entryPrice} colorClass="text-slate-800 dark:text-white" />
        <PriceRow label="Invalidation" value={signal.stopLoss} colorClass="text-red-500 dark:text-[#ff3b30]" />
        <PriceRow label="Exit 1" value={signal.takeProfit} colorClass="text-emerald-500 dark:text-[#00c853]" />
      </div>
      <div className="flex justify-between items-center pt-2.5 border-t border-slate-100 dark:border-[#1F1F35]/50">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[130px]">
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

const SignalDetailModal = ({ signal, onClose }) => {
  if (!signal) return null;
  const config = signalConfig[signal.signalType] || signalConfig.OTHER;
  const IconComponent = config.icon;

  return (
    <Dialog open={!!signal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div style={{ background: config.bgLight }} className="w-11 h-11 rounded-xl flex items-center justify-center">
              <IconComponent size={22} color={config.bg} />
            </div>
            <div>
              <DialogTitle className="margin-0 text-lg font-extrabold text-slate-900 dark:text-white">
                {signal.symbol || "Signal Detail"}
              </DialogTitle>
              <span style={{ background: config.bgLight, color: config.text }} className="px-2 py-0.5 rounded-md text-[10px] font-extrabold">
                {config.label}
              </span>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col px-1 mb-8 gap-1">
            <PriceRow label="Entry" value={signal.entryPrice} colorClass="text-slate-800 dark:text-white" />
            <PriceRow label="Invalidation" value={signal.stopLoss} colorClass="text-red-500 dark:text-[#ff3b30]" />
            <PriceRow label="Exit 1" value={signal.takeProfit} colorClass="text-emerald-500 dark:text-[#00c853]" />
          </div>
          <div className="flex flex-col px-1 gap-1.5">
            {signal.exchange && <InfoRow label="Exchange" value={signal.exchange} />}
            {signal.market && <InfoRow label="Market" value={signal.market} />}
            {signal.timeframe && <InfoRow label="Timeframe" value={signal.timeframe} />}
            {signal.strategyName && <InfoRow label="Strategy" value={signal.strategyName} />}
            {signal.webhookConfig?.name && <InfoRow label="Source" value={signal.webhookConfig.name} />}
            {signal.alertName && <InfoRow label="Alert Name" value={signal.alertName} />}
            <InfoRow label="Received" value={new Date(signal.createdAt).toLocaleString()} />
          </div>
          {signal.alertMessage && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-[#131324]/80 rounded-xl border border-slate-100 dark:border-[#1F1F35]/50">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">Alert Message</div>
              <p className="m-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{signal.alertMessage}</p>
            </div>
          )}
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
