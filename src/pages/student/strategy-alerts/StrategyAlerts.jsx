import React, { useState, useCallback, useRef, useEffect } from "react";
import { useGetClientTvSignalsQuery } from "../../../store/api/client/clientTvSignalsApiSlice";
import { format } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Signal,
  Clock,
  ChevronDown,
  Filter,
  Zap,
  BarChart3,
  Activity,
  ChartLine,
  Copy,
  X,
} from "lucide-react";
import { Container } from "@/components/container";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "../../../components/ui/loader";
import { toast } from "sonner";
import signalConfig from "../trading-signals/signalConfig";
import { formatTimeframe, formatTimeAgo, formatPrice } from "../trading-signals/signalUtils";

// ── Signal type color mapping ──────────────────────────────────────────
const getSignalColors = (signalType) => {
  const colorMap = {
    BUY: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-500", badge: "bg-emerald-500", glow: "shadow-emerald-500/20" },
    SELL: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-500", badge: "bg-red-500", glow: "shadow-red-500/20" },
    LONG: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-500", badge: "bg-blue-500", glow: "shadow-blue-500/20" },
    SHORT: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-500", badge: "bg-orange-500", glow: "shadow-orange-500/20" },
    CLOSE: { bg: "bg-gray-500/10", border: "border-gray-500/30", text: "text-gray-500", badge: "bg-gray-500", glow: "shadow-gray-500/20" },
    INFO: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-500", badge: "bg-purple-500", glow: "shadow-purple-500/20" },
  };
  return colorMap[signalType] || { bg: "bg-slate-500/10", border: "border-slate-500/30", text: "text-slate-500", badge: "bg-slate-500", glow: "shadow-slate-500/20" };
};

const getSignalIcon = (signalType) => {
  if (["BUY", "LONG"].includes(signalType)) return TrendingUp;
  if (["SELL", "SHORT"].includes(signalType)) return TrendingDown;
  return Activity;
};

const StrategyAlerts = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [signalTypeFilter, setSignalTypeFilter] = useState("");
  const [signals, setSignals] = useState([]);
  const observer = useRef();

  const { data, isLoading, isFetching } = useGetClientTvSignalsQuery({
    page,
    limit,
    ...(signalTypeFilter ? { excludedSignalTypes: [] } : {}),
  });

  const totalPages = data?.pagination?.totalPages || 1;

  useEffect(() => {
    if (data?.data) {
      // Client-side filter for signal type if set
      const filtered = signalTypeFilter
        ? data.data.filter((s) => s.signalType === signalTypeFilter)
        : data.data;

      if (page === 1) {
        setSignals(filtered);
      } else {
        setSignals((prev) => {
          const newSignals = filtered.filter(
            (s) => !prev.some((p) => p._id === s._id)
          );
          return [...prev, ...newSignals];
        });
      }
    }
  }, [data, page, signalTypeFilter]);

  useEffect(() => {
    setSignals([]);
    setPage(1);
  }, [signalTypeFilter]);

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

  // ── Stats from loaded signals ────────────────────────────────────
  const buyCount = signals.filter((s) => ["BUY", "LONG"].includes(s.signalType)).length;
  const sellCount = signals.filter((s) => ["SELL", "SHORT"].includes(s.signalType)).length;

  // ── Copy helper ──────────────────────────────────────────────────
  const copyValue = (label, value, e) => {
    e?.stopPropagation();
    if (value != null) {
      navigator.clipboard.writeText(String(value));
      toast.success(`${label} copied!`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      <Container width="fluid" className="mx-auto px-5">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-orange-500 shadow-lg shadow-purple-500/25">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Strategy Alerts
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Live trading alerts from IQ Strategies
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-purple-500/10">
              <Signal className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                Total Alerts
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {data?.pagination?.total || 0}
              </p>
            </div>
          </div>

          <div className="card rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                Buy / Long
              </p>
              <p className="text-xl font-bold text-emerald-500">{buyCount}</p>
            </div>
          </div>

          <div className="card rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-red-500/10">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                Sell / Short
              </p>
              <p className="text-xl font-bold text-red-500">{sellCount}</p>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="py-1 px-2 flex overflow-auto bg-gray-100 dark:bg-gray-800 rounded-md gap-2 shadow-sm">
            {["", "BUY", "SELL", "LONG", "SHORT"].map((type) => (
              <button
                key={type}
                onClick={() => setSignalTypeFilter(type)}
                className={`px-3 py-1.5 flex items-center text-xs rounded-md font-medium transition-all cursor-pointer ${signalTypeFilter === type
                  ? "bg-primary text-white shadow-lg shadow-primary/50"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                {type === "" ? (
                  "All"
                ) : ["BUY", "LONG"].includes(type) ? (
                  <span className="flex items-center gap-1">
                    <TrendingUp size={14} /> {type}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <TrendingDown size={14} /> {type}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Signal Cards ── */}
        {isLoading && page === 1 ? (
          <Loader />
        ) : signals.length === 0 && !isLoading && !isFetching ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Activity className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              No strategy alerts yet
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Alerts will appear here when IQ Strategies alerts are triggered
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {signals.map((signal, index) => {
              const colors = getSignalColors(signal.signalType);
              const SignalIcon = getSignalIcon(signal.signalType);
              const config = signalConfig[signal.signalType] || signalConfig.OTHER;

              // ── Build TP levels from takeProfits array + customVariables ──
              const tps = [];
              if (signal.takeProfits?.length > 0) {
                signal.takeProfits.forEach((tp) => {
                  tps.push({ num: tp.level, val: tp.price });
                });
              }
              // Also check customVariables for tp1, tp2, etc.
              const customVars = signal.customVariables || {};
              Object.entries(customVars).forEach(([key, val]) => {
                const norm = key.toLowerCase().replace(/[^a-z0-9]/g, "");
                if (norm.startsWith("tp") && /^\d+$/.test(norm.slice(2))) {
                  const num = parseInt(norm.slice(2), 10);
                  if (!tps.some((t) => t.num === num)) tps.push({ num, val });
                }
              });
              tps.sort((a, b) => a.num - b.num);

              // ── Build confirmations dynamically ──
              // Prefer structured signal.confirmations (new format),
              // fall back to customVariables parsing (old format).
              const confirmations = [];
              const sigConfs = signal?.confirmations;
              if (sigConfs && typeof sigConfs === "object" && Object.keys(sigConfs).length > 0) {
                // New format: read from signal.confirmations
                Object.entries(sigConfs).forEach(([key, val]) => {
                  if (typeof val === "boolean") {
                    const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                    confirmations.push({ label, passed: val });
                  }
                });
              } else {
                // Legacy fallback: parse boolean-like values from customVariables
                Object.entries(customVars).forEach(([key, val]) => {
                  const norm = key.toLowerCase().replace(/[^a-z0-9]/g, "");
                  if (norm.startsWith("tp") && /^\d+$/.test(norm.slice(2))) return;
                  const strVal = String(val).trim().toLowerCase();
                  const isTruthy = ["true", "yes", "1", "✅", "☑", "✔"].includes(strVal) || strVal.includes("✅");
                  const isFalsy = ["false", "no", "0", "❌", "✖", "✗"].includes(strVal) || strVal.includes("❌");
                  if (isTruthy || isFalsy) {
                    const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                    confirmations.push({ label, passed: isTruthy });
                  }
                });
              }

              return (
                <div
                  key={signal._id}
                  ref={index === signals.length - 1 ? lastSignalRef : null}
                  className={`card rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colors.glow} border-gray-200 dark:border-gray-700`}
                >
                  {/* ── Card Header: Signal Type + Symbol ── */}
                  <div
                    className={`flex items-center justify-between px-5 py-3 ${colors.bg} border-b ${colors.border}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 ${colors.badge}`}
                      >
                        <SignalIcon size={14} />
                        {signal.signalType || "OTHER"}
                      </span>
                      <span className="text-base font-bold text-gray-900 dark:text-white">
                        {signal.symbol || "—"}
                      </span>
                    </div>
                    {signal.exchange && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {signal.exchange}
                      </span>
                    )}
                  </div>

                  <div className="px-5 py-4">
                    {/* ── Chart Image Thumbnail ── */}
                    {signal?.chartImageUrl && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/50 relative">
                        <img
                          src={signal?.chartImageUrl}
                          alt={`${signal?.symbol || "Chart"}`}
                          className="w-full h-[220px] object-cover object-right"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                      </div>
                    )}

                    {/* ── Price + Timeframe Grid ── */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                          Entry Price
                        </p>
                        <p
                          className="text-lg font-bold text-gray-900 dark:text-white font-mono cursor-pointer hover:text-blue-500 transition-colors"
                          onClick={(e) => copyValue("Entry", signal.entryPrice, e)}
                          title="Click to copy"
                        >
                          {signal.entryPrice ? formatPrice(signal.entryPrice) : "—"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                          Time Frame
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {signal.timeframe ? formatTimeframe(signal.timeframe) : "—"}
                        </p>
                      </div>
                    </div>

                    {/* ── Stop Loss ── */}
                    {signal.stopLoss != null && (
                      <div
                        className="flex items-center justify-between mb-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 cursor-pointer hover:bg-red-100 dark:hover:bg-red-500/15 transition-colors"
                        onClick={(e) => copyValue("Invalidation", signal.stopLoss, e)}
                        title="Click to copy"
                      >
                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                          ❌ Invalidation (SL)
                        </span>
                        <span className="text-sm font-bold text-red-700 dark:text-red-400 font-mono flex items-center gap-1">
                          {formatPrice(signal.stopLoss)}
                          <Copy size={10} className="text-red-400/50" />
                        </span>
                      </div>
                    )}

                    {/* ── Take Profit Levels ── */}
                    {tps.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {tps.map((tp) => (
                          <div
                            key={tp.num}
                            className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-500/5 cursor-pointer transition-colors"
                            onClick={(e) => copyValue(`Exit ${tp.num}`, tp.val, e)}
                            title="Click to copy"
                          >
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                              🎯 Exit {tp.num}
                            </span>
                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                              {formatPrice(tp.val)}
                              <Copy size={10} className="text-emerald-400/50" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Strategy Badge ── */}
                    {(signal.strategyName || signal.webhookConfig?.name) && (
                      <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
                        <ChartLine className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 truncate">
                          {signal.strategyName || signal.webhookConfig?.name}
                        </span>
                      </div>
                    )}

                    {/* ── Confirmations ── */}
                    {confirmations.length > 0 && (
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 px-1">
                        {confirmations.map((item) => (
                          <span key={item.label} className="text-[11px] text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1">
                            {item.label}: {item.passed ? "✅" : "❌"}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* ── Footer: Time ── */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      {signal.session && (() => {
                        const formatted = signal.session
                          .split(",")
                          .map((s) => {
                            const trimmed = s.trim();
                            if (!trimmed) return "";
                            const capitalized = trimmed
                              .split(" ")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                              .join(" ");
                            return capitalized.toLowerCase().endsWith("session") ? capitalized : `${capitalized} session`;
                          })
                          .filter(Boolean)
                          .join(", ");
                        return (
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                            {formatted}
                          </span>
                        );
                      })()}
                      <div className="flex items-center gap-1 text-gray-400 ml-auto">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[11px]">
                          {signal.createdAt ? formatTimeAgo(signal.createdAt) : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {isFetching && page > 1 && (
          <div className="flex justify-center py-6">
            <Loader />
          </div>
        )}

        {/* ── End of list ── */}
        {!isFetching && page >= totalPages && signals.length > 0 && (
          <div className="flex justify-center items-center py-6">
            <span className="text-[11px] text-gray-400 dark:text-gray-600 font-medium tracking-wide">
              — All alerts loaded —
            </span>
          </div>
        )}
      </Container>
    </div>
  );
};

export default StrategyAlerts;
