import React from "react";
import { Clock, ChartLine, Copy } from "lucide-react";
import { toast } from "sonner";
import signalConfig from "./signalConfig";
import { formatTimeframe, formatTimeAgo } from "./signalUtils";

const SignalCard = React.forwardRef(({ signal, onClick }, ref) => {
  const config = signalConfig[signal.signalType] || signalConfig.OTHER;

  return (
    <div
      ref={ref}
      onClick={onClick}
      /* read/unread border styling commented out */
      /* style={{
        border: signal.isRead ? `1px solid ${config.bg}25` : `2px solid ${config.bg}50`,
        boxShadow: signal.isRead ? "0 1px 3px rgba(0,0,0,0.02)" : `0 4px 16px ${config.bg}15`,
      }} */
      className="relative rounded-2xl p-4.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col h-full border border-slate-200 dark:border-[#1F1F35]"
    >
      {/* Unread dot — commented out */}
      {/* {!signal.isRead && (
        <div style={{ background: config.bg }} className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full" />
      )} */}

      {/* ── Header: Strategy Name (primary) + Signal Type ── */}
      <div className="flex items-start gap-2.5 mb-3">
        <div className="flex-1 min-w-0">
          {/* Strategy name — primary highlighted element */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-blue-400 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 dark:border-blue-500/25 px-2.5 py-0.5 rounded-lg truncate leading-tight">
              <ChartLine size={13} className="flex-shrink-0" />
              {signal.strategyName || signal.webhookConfig?.name || "—"}
            </span>
          </div>

          {/* Symbol + Signal Type + Timeframe */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
              {signal.symbol || "—"}
            </span>
            {signal.signalType !== "OTHER" && (
              <span
                style={{ background: config.bgLight, color: config.text }}
                className="px-2 py-0.5 rounded-md text-[10px] font-extrabold flex-shrink-0"
              >
                {config.label}
              </span>
            )}
            {(signal.exchange || signal.market || signal.timeframe) && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {signal.exchange || ""}
                {signal.market ? ` • ${signal.market}` : ""}
                {signal.timeframe ? ` • ${formatTimeframe(signal.timeframe)}` : ""}
              </span>
            )}
          </div>
        </div>
      </div>
      {signal.chartImageUrl && (
        <div className="mb-3 rounded-xl overflow-hidden border border-slate-100 dark:border-[#1F1F35]/50 relative">
          <img
            src={signal.chartImageUrl}
            alt={`${signal.symbol || "Chart"}`}
            className="w-full h-[100px] object-cover object-right"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </div>
      )}
      {/* ── Structured Price Levels ── */}
      {(() => {
        const customVars = signal.customVariables || {};

        // Resolve entry price
        let entry = signal.entryPrice;
        if (entry == null) {
          entry = parseFloat(
            signal.processedPayload?.entryPrice ||
            signal.processedPayload?.price ||
            signal.rawPayload?.price ||
            signal.rawPayload?.close
          ) || null;
        }
        if (entry == null && signal.alertMessage) {
          const m = signal.alertMessage.match(/Price:\s*([0-9.]+)/);
          if (m) entry = parseFloat(m[1]) || null;
        }

        const sl = signal.stopLoss;

        // Build TP levels from signal.takeProfit + customVariables
        const tps = [];
        if (signal.takeProfit != null) tps.push({ num: 1, val: signal.takeProfit });
        Object.entries(customVars).forEach(([key, val]) => {
          const norm = key.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (norm.startsWith("tp") && /^\d+$/.test(norm.slice(2))) {
            const num = parseInt(norm.slice(2), 10);
            if (!tps.some((t) => t.num === num)) tps.push({ num, val });
          }
        });
        tps.sort((a, b) => a.num - b.num);

        const fmt = (v) => {
          if (v == null) return "N/A";
          const n = typeof v === "number" ? v : parseFloat(v);
          return isNaN(n) ? String(v) : n.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 5 });
        };

        const copyVal = (label, v) => {
          const raw = v == null ? "" : String(v);
          navigator.clipboard.writeText(raw);
          toast.success(`${label} copied!`);
        };

        if (entry == null && sl == null && tps.length === 0) return null;

        return (
          <div className="mb-3 space-y-1.5">
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
            {tps.map((tp) => (
              <div
                key={tp.num}
                className="group/row flex justify-between items-center px-1 py-0.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-[#1A1A2E] transition-colors"
                onClick={(e) => { e.stopPropagation(); copyVal(`Exit ${tp.num}`, tp.val); }}
                title="Click to copy"
              >
                <span className="text-[12px] text-slate-600 dark:text-white font-medium">Exit {tp.num}</span>
                <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="text-[10px]">🎯</span> {fmt(tp.val)}
                  <Copy size={10} className="text-slate-400 dark:text-white/50" />
                </span>
              </div>
            ))}
          </div>
        );
      })()}

      {/* ── Confirmations ── */}
      {(() => {
        const customVars = signal.customVariables || {};
        const confirmations = [];
        Object.entries(customVars).forEach(([key, val]) => {
          // Skip TP keys
          const norm = key.toLowerCase().replace(/[^a-z0-9]/g, "");
          if (norm.startsWith("tp") && /^\d+$/.test(norm.slice(2))) return;

          const strVal = String(val).trim().toLowerCase();
          const isTruthy = ["true", "yes", "1", "✅", "☑", "✔"].includes(strVal) || strVal.includes("✅") || strVal.includes("☑");
          const isFalsy = ["false", "no", "0", "❌", "✖", "✗"].includes(strVal) || strVal.includes("❌") || strVal.includes("✗");

          if (isTruthy || isFalsy) {
            const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
            confirmations.push({ label, passed: isTruthy });
          }
        });

        if (confirmations.length === 0) return null;

        return (
          <div className="mt-auto mb-0">
            <div className="text-[10px] text-slate-400 dark:text-white font-semibold mb-1.5 uppercase tracking-wider px-1">
              Confirmations
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 px-1">
              {confirmations.map((item) => (
                <span key={item.label} className="text-[12px] text-slate-600 dark:text-white font-medium flex items-center gap-1">
                  {item.label}: {item.passed ? "✅" : "❌"}
                </span>
              ))}
            </div>
          </div>
        );
      })()}
      {/* ── Chart Thumbnail ── */}


      {/* ── Footer: Source + Time ── */}
      <div className="flex justify-between items-center pt-2.5 mt-auto border-t border-slate-100 dark:border-[#1F1F35]/50">
        <span className="text-[10px] text-slate-400 dark:text-white/70 truncate max-w-[160px]">
          {signal.webhookConfig?.name ? `Strategy : ${signal.webhookConfig.name}` : ""}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-white/70 whitespace-nowrap">
          <Clock size={10} />
          {formatTimeAgo(signal.createdAt)}
        </span>
      </div>
    </div>
  );
});

SignalCard.displayName = "SignalCard";

export default SignalCard;
