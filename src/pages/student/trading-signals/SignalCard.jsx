import React from "react";
import { Clock, ChartLine } from "lucide-react";
import signalConfig from "./signalConfig";
import { formatTimeframe, formatTimeAgo } from "./signalUtils";

const SignalCard = React.forwardRef(({ signal, onClick }, ref) => {
  const config = signalConfig[signal.signalType] || signalConfig.OTHER;

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        border: signal.isRead ? `1px solid ${config.bg}25` : `2px solid ${config.bg}50`,
        boxShadow: signal.isRead ? "0 1px 3px rgba(0,0,0,0.02)" : `0 4px 16px ${config.bg}15`,
      }}
      className="relative rounded-2xl p-4.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg bg-white dark:bg-[#0F0F1A] text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col h-full"
    >
      {/* Unread dot */}
      {!signal.isRead && (
        <div style={{ background: config.bg }} className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full" />
      )}

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

      {/* ── Alert Message ── */}
      {signal.alertMessage && (
        <div className="mb-3 p-3 rounded-xl bg-slate-50 dark:bg-[#131324]/80 border border-slate-100 dark:border-[#1F1F35]/50">
          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">
            Alert Message
          </div>
          <p className="m-0 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {signal.alertMessage}
          </p>
        </div>
      )}
      {/* ── Chart Thumbnail ── */}
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

      {/* ── Footer: Source + Time ── */}
      <div className="flex justify-between items-center pt-2.5 mt-auto border-t border-slate-100 dark:border-[#1F1F35]/50">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[160px]">
          {signal.webhookConfig?.name ? `Strategy : ${signal.webhookConfig.name}` : ""}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
          <Clock size={10} />
          {formatTimeAgo(signal.createdAt)}
        </span>
      </div>
    </div>
  );
});

SignalCard.displayName = "SignalCard";

export default SignalCard;
