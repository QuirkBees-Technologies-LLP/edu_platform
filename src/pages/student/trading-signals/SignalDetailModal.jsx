import React, { useState } from "react";
import { toast } from "sonner";
import {
  Activity,
  Copy,
  Target,
  ShieldAlert,
  Crosshair,
  ImageOff,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogBody,
} from "@/components/ui/dialog";
import signalConfig from "./signalConfig";
import { formatTimeframe, formatPrice } from "./signalUtils";

// ── Small presentational sub-components ────────────────────────────

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
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {label}
        </span>
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
  <div className={`flex flex-col gap-0.5 ${colSpan === 2 ? "col-span-2" : ""}`}>
    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
      {label}
    </span>
    <span className="text-[12px] font-black text-slate-700 dark:text-slate-200 truncate">
      {value || "—"}
    </span>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-[14px] text-[#8e9bae] font-medium">{label}</span>
    <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{value}</span>
  </div>
);

// ── SignalDetailModal ───────────────────────────────────────────────

const SignalDetailModal = ({ signal, onClose }) => {
  const [showRaw, setShowRaw] = useState(false);
  if (!signal) return null;

  const config = signalConfig[signal.signalType] || signalConfig.OTHER;
  const IconComponent = config.icon;

  const customVars = signal.customVariables || {};
  const processedExtra = signal.processedPayload || {};

  const formatKey = (key) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // ── Build TP levels from takeProfits array + customVariables ────────
  const tpLevels = [];
  if (signal.takeProfits?.length > 0) {
    signal.takeProfits.forEach((tp) => {
      tpLevels.push({ label: `TP ${tp.level}`, value: tp.price });
    });
  }
  const tpKeys = [
    "tp1", "tp2", "tp3", "tp4",
    "takeprofit1", "takeprofit2", "takeprofit3", "takeprofit4",
    "take_profit1", "take_profit2", "take_profit3", "take_profit4",
  ];
  Object.entries(customVars).forEach(([key, val]) => {
    const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (
      tpKeys.includes(normKey) ||
      (normKey.startsWith("tp") && /^\d+$/.test(normKey.slice(2)))
    ) {
      const num = parseInt(normKey.replace(/\D/g, ""), 10);
      // Skip if TP already added from signal.takeProfits
      const alreadyExists = tpLevels.some(
        (tp) => tp.label === `TP ${num}`
      );
      if (!alreadyExists) {
        tpLevels.push({ label: `TP ${num}`, value: val, key });
      }
    }
  });
  tpLevels.sort((a, b) => {
    return parseInt(a.label.replace(/\D/g, ""), 10) - parseInt(b.label.replace(/\D/g, ""), 10);
  });

  // ── Separate confirmations (boolean ✅/❌) from numeric vars ───────
  const confirmations = [];
  const otherVars = {};
  Object.entries(customVars).forEach(([key, val]) => {
    const isTp = tpLevels.some((tp) => tp.key === key);
    if (isTp) return;

    const strVal = String(val).trim().toLowerCase();
    // Detect boolean-like values (✅/❌, true/false, yes/no, 1/0, emojis)
    const isTruthy = ["true", "yes", "1", "✅", "☑", "✔"].includes(strVal) || strVal.includes("✅") || strVal.includes("☑");
    const isFalsy = ["false", "no", "0", "❌", "✖", "✗"].includes(strVal) || strVal.includes("❌") || strVal.includes("✗");

    if (isTruthy || isFalsy) {
      confirmations.push({ key, label: formatKey(key), passed: isTruthy });
    } else {
      otherVars[key] = val;
    }
  });

  // ── Extra processed fields (not in known set) ─────────────────────
  const knownKeys = new Set([
    "symbol", "exchange", "market", "strategyName", "alertName", "alertMessage",
    "signalType", "entryPrice", "stopLoss", "takeProfit", "timeframe",
    "alertTimestamp", "tvTimestamp", "customVariables",
  ]);
  const extraProcessed = {};
  for (const [k, v] of Object.entries(processedExtra)) {
    if (!knownKeys.has(k) && v != null && v !== "") extraProcessed[k] = v;
  }

  return (
    <Dialog open={!!signal} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[650px] max-h-[85vh] overflow-y-auto p-0">
        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-[#1F1F35]/50">
          <div className="flex items-center gap-3">
            <div
              style={{ background: config.bgLight }}
              className="w-11 h-11 rounded-xl flex items-center justify-center"
            >
              <IconComponent size={22} color={config.bg} />
            </div>
            <div>
              <DialogTitle className="margin-0 text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                {signal.symbol || "Signal Detail"}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1">
                {signal.signalType !== "OTHER" && (
                  <span
                    style={{ background: config.bgLight, color: config.text }}
                    className="px-2 py-0.5 rounded-md text-[10px] font-extrabold"
                  >
                    {config.label}
                  </span>
                )}
                {signal.timeframe && (
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/40 px-1.5 py-0.5 rounded">
                    {formatTimeframe(signal.timeframe)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="px-6 py-5">
          {/* ── Chart Screenshot Section — only shown when URL exists ── */}
          {signal.chartImageUrl && (
            <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 dark:border-[#1F1F35]/70 shadow-sm">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-100/80 dark:bg-[#161626]/80 border-b border-slate-200 dark:border-[#202038]">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Chart at Alert Time
                </span>
                <a
                  href={signal.chartImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Open full size ↗
                </a>
              </div>
              <img
                src={signal.chartImageUrl}
                alt={`${signal.symbol || "Chart"} at alert time`}
                className="w-full h-auto block bg-[#0a0a14]"
                loading="lazy"
                style={{ maxHeight: "360px", objectFit: "contain" }}
              />
            </div>
          )}

          {/* Core Price Levels */}
          {(() => {
            // Resolve entry price: prefer entryPrice, fallback to price from payload or alert message
            let resolvedEntry = signal.entryPrice;
            if (resolvedEntry == null) {
              resolvedEntry = parseFloat(
                signal.processedPayload?.entryPrice ||
                signal.processedPayload?.price ||
                signal.rawPayload?.price ||
                signal.rawPayload?.close
              ) || null;
            }
            if (resolvedEntry == null && signal.alertMessage) {
              const pinMatch = signal.alertMessage.match(/📍\s*([0-9.]+)/);
              if (pinMatch) resolvedEntry = parseFloat(pinMatch[1]) || null;
            }
            return (
              <div className="grid grid-cols-2 gap-3 mb-5">
                <PriceBlock
                  label="Entry"
                  value={resolvedEntry}
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
            );
          })()}

          {/* TP Targets */}
          {tpLevels.length > 0 && (
            <div className="mb-5">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-2.5 uppercase tracking-wider px-1">
                🎯 Target Levels
              </div>
              <div className="grid grid-cols-3 gap-2">
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
                      <span className="text-[12px] font-bold text-slate-600 dark:text-slate-400">
                        {tp.label}
                      </span>
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

          {/* Confirmations */}
          {confirmations.length > 0 && (
            <div className="mb-5">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-2.5 uppercase tracking-wider px-1">
                Confirmations
              </div>
              <div className="bg-slate-50/30 dark:bg-[#0E0E18]/50 rounded-xl border border-slate-100 dark:border-[#1F1F35]/50 px-4 py-1">
                {confirmations.map((item, idx) => (
                  <div
                    key={item.key}
                    className={`flex justify-between items-center py-2.5 ${
                      idx < confirmations.length - 1
                        ? "border-b border-slate-100 dark:border-[#1F1F35]/30"
                        : ""
                    }`}
                  >
                    <span className="text-[13px] text-slate-600 dark:text-slate-300 font-medium">
                      {item.label}
                    </span>
                    {item.passed ? (
                      <span className="text-[16px]">✅</span>
                    ) : (
                      <span className="text-[16px]">❌</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alert Message — commented out
          {signal.alertMessage && (
            <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 dark:border-[#202038]">
              <div className="flex justify-between items-center px-4 py-2 bg-slate-100/80 dark:bg-[#161626]/80 border-b border-slate-200 dark:border-[#202038] select-none">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  TradingView Alert Message
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(signal.alertMessage);
                    toast.success("Alert message copied!");
                  }}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
          */}

          {/* Other Variables */}
          {Object.keys(otherVars).length > 0 && (
            <div className="mb-5">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-2 uppercase tracking-wider px-1">
                Other Variables
              </div>
              <div className="bg-slate-50/30 dark:bg-[#0E0E18]/50 rounded-xl border border-slate-100 dark:border-[#1F1F35]/50 px-4 py-1">
                {Object.entries(otherVars).map(([key, val]) => (
                  <InfoRow
                    key={key}
                    label={formatKey(key)}
                    value={typeof val === "object" ? JSON.stringify(val) : String(val)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Extra Processed Fields */}
          {Object.keys(extraProcessed).length > 0 && (
            <div className="mb-5">
              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-2 uppercase tracking-wider px-1">
                Extra Fields
              </div>
              <div className="bg-slate-50/30 dark:bg-[#0E0E18]/50 rounded-xl border border-slate-100 dark:border-[#1F1F35]/50 px-4 py-1">
                {Object.entries(extraProcessed).map(([key, val]) => (
                  <InfoRow
                    key={key}
                    label={formatKey(key)}
                    value={typeof val === "object" ? JSON.stringify(val) : String(val)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Collapsible Raw JSON */}
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

          {/* Standard Metadata Grid — commented out
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1F1F35]/50">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-slate-50/30 dark:bg-[#0E0E18]/50 p-4 rounded-xl border border-slate-100/40 dark:border-[#1F1F35]/30">
              {signal.exchange && <MetaItem label="Exchange" value={signal.exchange} />}
              {signal.market && <MetaItem label="Market" value={signal.market} />}
              {signal.timeframe && (
                <MetaItem label="Timeframe" value={formatTimeframe(signal.timeframe)} />
              )}
              {signal.strategyName && <MetaItem label="Strategy" value={signal.strategyName} />}
              {signal.webhookConfig?.name && (
                <MetaItem label="Webhook Config" value={signal.webhookConfig.name} />
              )}
              {signal.alertName && <MetaItem label="Alert Name" value={signal.alertName} />}
              <MetaItem
                label="Received"
                value={new Date(signal.createdAt).toLocaleString()}
                colSpan={2}
              />
            </div>
          </div>
          */}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default SignalDetailModal;
