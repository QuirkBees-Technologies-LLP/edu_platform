import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
  Target,
  ShieldAlert,
} from "lucide-react";

// ── Signal Type Config ──────────────────────────────────────────────
const signalConfig = {
  BUY: { bg: "#10b981", bgLight: "#10b98115", text: "#10b981", icon: TrendingUp, label: "BUY" },
  SELL: { bg: "#ef4444", bgLight: "#ef444415", text: "#ef4444", icon: TrendingDown, label: "SELL" },
  // LONG:           { bg: "#3b82f6", bgLight: "#3b82f615", text: "#3b82f6", icon: ArrowUpRight,  label: "LONG" },
  // SHORT:          { bg: "#f97316", bgLight: "#f9731615", text: "#f97316", icon: ArrowDownRight, label: "SHORT" },
  // CLOSE:          { bg: "#6b7280", bgLight: "#6b728015", text: "#6b7280", icon: Minus,         label: "CLOSE" },
  // INFO:           { bg: "#8b5cf6", bgLight: "#8b5cf615", text: "#8b5cf6", icon: Info,          label: "INFO" },
  OTHER:          { bg: "#64748b", bgLight: "#64748b15", text: "#64748b", icon: Activity,      label: "OTHER" },
  // SL_HIT:         { bg: "#ef4444", bgLight: "#ef444415", text: "#ef4444", icon: ShieldAlert,   label: "SL HIT" },
  // TP1_HIT:        { bg: "#10b981", bgLight: "#10b98115", text: "#10b981", icon: Target,        label: "TP1 HIT" },
  // TP2_HIT:        { bg: "#10b981", bgLight: "#10b98115", text: "#10b981", icon: Target,        label: "TP2 HIT" },
  // TP3_HIT:        { bg: "#10b981", bgLight: "#10b98115", text: "#10b981", icon: Target,        label: "TP3 HIT" },
  // TP4_HIT:        { bg: "#10b981", bgLight: "#10b98115", text: "#10b981", icon: Target,        label: "TP4 HIT" },
  // BREAKEVEN_EXIT: { bg: "#f59e0b", bgLight: "#f59e0b15", text: "#f59e0b", icon: Minus,         label: "BE EXIT" },
};

export default signalConfig;
