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

// ── Alert Type Config ──────────────────────────────────────────────
const signalConfig = {
  BUY:  { bg: "#10b981", bgLight: "#10b98115", text: "#10b981", icon: TrendingUp,   label: "BUY" },
  SELL: { bg: "#ef4444", bgLight: "#ef444415", text: "#ef4444", icon: TrendingDown, label: "SELL" },
  OTHER: { bg: "#64748b", bgLight: "#64748b15", text: "#64748b", icon: Activity,    label: "OTHER" },
};

export default signalConfig;
