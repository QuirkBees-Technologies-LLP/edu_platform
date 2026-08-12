import React, { useState } from "react";
import { Clock, ChartLine, Copy, Globe, Zap } from "lucide-react";
import { toast } from "sonner";
import signalConfig from "./signalConfig";
import { formatTimeframe, formatTimeAgo, formatAlertTime, getRelativeTime } from "./signalUtils";
import SymbolIcon from "./symbolIcons";

const SignalCard = React.forwardRef(({ signal, onClick }, ref) => {
  const config = signalConfig?.[signal?.signalType] || signalConfig?.OTHER || {};
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className="relative rounded-2xl p-4.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col h-full border border-slate-200 dark:border-[#1F1F35]"
    >
      {/* ── Header: Strategy Name (primary) + Signal Type ── */}
      <div className="flex items-start gap-1 mb-2">
        <div className="flex-1 min-w-0">
          {/* Strategy name — primary highlighted element */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-blue-400 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 dark:border-blue-500/25 px-2.5 py-0.5 rounded-lg truncate leading-tight">
              <ChartLine size={13} className="flex-shrink-0" />
              {signal?.strategyName || signal?.webhookConfig?.name || "—"}
            </span>
          </div>

          {/* Strategy name — primary pill badge */}
          {(signal?.strategyName || signal?.webhookConfig?.name) && (
            <div className="flex items-center mb-2 min-w-0 text-blue-500 dark:text-blue-300">
              <span className="inline-flex items-center gap-1.5 h-6 max-w-full px-2 rounded-lg text-[11px] font-extrabold uppercase tracking-wide text-blue-700 dark:text-blue-200 bg-blue-200/40 dark:bg-blue-500/20 backdrop-blur-md border border-violet-300/50 dark:border-violet-400/25 leading-none shadow-sm">
                <ChartLine size={11} className="text-blue-500 dark:text-blue-300 flex-shrink-0" />
                <span className="truncate">{signal?.strategyName || signal?.webhookConfig?.name}</span>
              </span>
            </div>
          )}

          {/* Symbol + Signal Type + Timeframe */}
          <div className="flex items-center gap-2 flex-nowrap overflow-x-auto scrollbar-hide">
            {/* Symbol — icon + glass effect */}
            <span className="inline-flex items-center gap-1.5 h-7 text-[12px] font-black text-violet-700 dark:text-violet-200 bg-violet-200/40 dark:bg-violet-500/20 backdrop-blur-md border border-violet-300/50 dark:border-violet-400/25 px-2 rounded-lg tracking-tight truncate leading-none shadow-sm">
              <SymbolIcon symbol={signal?.symbol} size={22} />
              {signal?.symbol || "—"}
            </span>

            {/* Signal Type badge — colorful with border & icon */}
            {signal?.signalType && signal?.signalType !== "OTHER" && (
              <span
                style={{
                  background: config?.bgLight || "#64748b15",
                  color: config?.text || "#64748b",
                  borderColor: (config?.text || "#64748b") + "40",
                }}
                className="inline-flex items-center gap-1 h-7 px-2 rounded-md text-[11px] font-extrabold flex-shrink-0 border leading-none"
              >
                {config?.icon && <config.icon size={11} />}
                {config?.label || ""}
              </span>
            )}

            {/* Timeframe pill */}
            {signal?.timeframe && (
              <span className="inline-flex items-center gap-1.5 h-7 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 px-2 rounded-lg flex-shrink-0 tracking-wide uppercase">
                <Clock size={10} className="text-indigo-400 dark:text-indigo-400" />
                {formatTimeframe(signal?.timeframe)}
              </span>
            )}
          </div>

          {/* Session label - smaller, below headers, not highlighted */}
          {signal?.session && (() => {
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
              <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 px-0.5">
                {formatted}
              </div>
            );
          })()}
        </div>
      </div>
      <div className="-mx-4.5 mb-1 overflow-hidden border-y border-slate-100 dark:border-[#1F1F35]/50 relative h-[220px]">
        {(signal?.chartImageThumbUrl || signal?.chartImageUrl) ? (
          <>
            {/* Skeleton loader — visible until image loads */}
            {!imageLoaded && (
              <>
                <style>{`
                  @keyframes skeletonSweep {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                  }
                `}</style>
                <div className="absolute inset-0 bg-slate-100 dark:bg-[#141422] z-5 overflow-hidden">
                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 z-5 overflow-hidden">
                    <div
                      className="absolute inset-0"
                      style={{
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.35) 55%, transparent 100%)",
                        animation: "skeletonSweep 1.6s ease-in-out infinite",
                      }}
                    />
                  </div>

                  {/* Skeleton block */}
                  <div className="p-3 h-full">
                    <div className="h-full w-full rounded-lg bg-slate-200/90 dark:bg-slate-700/40" />
                  </div>
                </div>
              </>
            )}
            <img
              src={signal?.chartImageThumbUrl || signal?.chartImageUrl}
              alt={`${signal?.symbol || "Chart"}`}
              className={`w-full h-[220px] object-cover object-right transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              width={640}
              height={400}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </>
        ) : (
          /* No chart image — show skeleton placeholder to keep card height consistent */
          <>
            <style>{`
              @keyframes skeletonSweep {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>
            <div className="absolute inset-0 bg-slate-100 dark:bg-[#141422] overflow-hidden">
              <div className="absolute inset-0 overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.08) 55%, transparent 100%)",
                    animation: "skeletonSweep 2.4s ease-in-out infinite",
                  }}
                />
              </div>
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-2 opacity-40">
                  <ChartLine size={28} className="text-slate-400 dark:text-slate-600" />
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-600 tracking-wide">Chart loading…</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      {/* ── Structured Price Levels ── */}
      {(() => {
        const customVars = signal?.customVariables || {};

        // Resolve entry price
        let entry = signal?.entryPrice ?? null;
        if (entry == null) {
          const raw =
            signal?.processedPayload?.entryPrice ||
            signal?.processedPayload?.price ||
            signal?.rawPayload?.price ||
            signal?.rawPayload?.close;
          if (raw != null) {
            const parsed = parseFloat(raw);
            entry = isNaN(parsed) ? null : parsed;
          }
        }
        if (entry == null && signal?.alertMessage) {
          try {
            const m = signal.alertMessage.match(/Price:\s*([0-9.]+)/);
            if (m?.[1]) {
              const parsed = parseFloat(m[1]);
              entry = isNaN(parsed) ? null : parsed;
            }
          } catch (_) {
            // ignore regex errors
          }
        }

        const sl = signal?.stopLoss ?? null;

        // Build TP levels from signal.takeProfits array + customVariables
        const tps = [];
        if (Array.isArray(signal?.takeProfits) && signal.takeProfits.length > 0) {
          signal.takeProfits.forEach((tp) => {
            if (tp?.level != null && tp?.price != null) {
              tps.push({ num: tp.level, val: tp.price });
            }
          });
        }
        if (customVars && typeof customVars === "object") {
          Object.entries(customVars).forEach(([key, val]) => {
            try {
              const norm = key.toLowerCase().replace(/[^a-z0-9]/g, "");
              if (norm.startsWith("tp") && /^\d+$/.test(norm.slice(2))) {
                const num = parseInt(norm.slice(2), 10);
                if (!isNaN(num) && !tps.some((t) => t.num === num)) {
                  tps.push({ num, val });
                }
              }
            } catch (_) {
              // skip malformed keys
            }
          });
        }
        tps.sort((a, b) => (a?.num ?? 0) - (b?.num ?? 0));

        const fmt = (v) => {
          if (v == null) return "N/A";
          const n = typeof v === "number" ? v : parseFloat(v);
          return isNaN(n) ? String(v) : n.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 5 });
        };

        const copyVal = (label, v) => {
          try {
            const raw = v == null ? "" : String(v);
            navigator?.clipboard?.writeText?.(raw);
            toast?.success?.(`${label} copied!`);
          } catch (_) {
            // clipboard may not be available
          }
        };

        if (entry == null && sl == null && tps.length === 0) return null;

        return (
          <div className="mb-1 space-y-1.5">
            {/* Entry */}
            {entry != null && (
              <div
                className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
                onClick={(e) => { e.stopPropagation(); copyVal("Entry", entry); }}
                title="Click to copy"
              >
                <span className="text-[12px] text-slate-600 dark:text-white font-medium">Entry</span>
                <span className="text-[12px] font-bold text-slate-700 dark:text-white flex items-center gap-1">
                  <span className="text-[10px]">📍</span> {fmt(entry)}
                  <Copy size={10} className="text-slate-400 dark:text-white/50" />
                </span>
              </div>
            )}
            {/* Invalidation (SL) */}
            {sl != null && (
              <div
                className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
                onClick={(e) => { e.stopPropagation(); copyVal("Invalidation", sl); }}
                title="Click to copy"
              >
                <span className="text-[12px] text-slate-600 dark:text-white font-medium">Invalidation</span>
                <span className="text-[12px] font-bold text-red-500 dark:text-red-400 flex items-center gap-1">
                  <span className="text-[10px]">❌</span> {fmt(sl)}
                  <Copy size={10} className="text-slate-400 dark:text-white/50" />
                </span>
              </div>
            )}
            {/* Exit levels (TPs) */}
            {tps.map((tp, i) => (
              <div
                key={tp?.num ?? i}
                className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
                onClick={(e) => { e.stopPropagation(); copyVal(`Exit ${tp?.num ?? ""}`, tp?.val); }}
                title="Click to copy"
              >
                <span className="text-[12px] text-slate-600 dark:text-white font-medium">Exit {tp?.num ?? ""}</span>
                <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="text-[10px]">🎯</span> {fmt(tp?.val)}
                  <Copy size={10} className="text-slate-400 dark:text-white/50" />
                </span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── Confirmations ── */}
      {(() => {
        const confs = signal?.confirmations;
        if (!confs || typeof confs !== "object") return null;

        const items = Object.entries(confs)
          .filter(([, val]) => typeof val === "boolean")
          .map(([key, val]) => ({
            key,
            label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            passed: val,
          }));

        if (items.length === 0) return null;

        return (
          <div className="mt-auto mb-0">
            <div className="text-[10px] text-slate-400 dark:text-white font-semibold uppercase tracking-wider px-1">
              Confirmations
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 px-1">
              {items.map((item) => (
                <span key={item.key} className="text-[12px] text-slate-600 dark:text-white font-medium flex items-center gap-1">
                  {item.label}: {item.passed ? "✅" : "❌"}
                </span>
              ))}
            </div>
          </div>
        );
      })()}
      {/* ── Chart Thumbnail ── */}


      {/* ── Footer: Source + Time ── */}
      <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-[#1F1F35]">
        <span className="text-[12px] text-slate-500 dark:text-white/80 font-semibold truncate max-w-[180px]">
          {signal?.webhookConfig?.name ? `${signal.webhookConfig.name}` : ""}
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-white/80 font-semibold whitespace-nowrap">
          {(() => {
            const ts = signal?.alertTimestamp || signal?.createdAt;
            const rel = ts ? getRelativeTime(ts) : null;
            const exact = signal?.alertTimestamp
              ? formatAlertTime(signal.alertTimestamp)
              : (signal?.createdAt ? formatTimeAgo(signal.createdAt) : "—");
            return rel ? `${rel} · ${exact}` : exact;
          })()}
        </span>
      </div>
    </div>
  );
});

SignalCard.displayName = "SignalCard";

export default SignalCard;
