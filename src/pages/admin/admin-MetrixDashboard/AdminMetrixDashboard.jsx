import { useState, useMemo, useCallback } from "react";
import { useGetActiveCountsQuery, useGetRefundsQuery, useGetPlansListQuery, useLazyGetOrderReportQuery } from "../../../store/api/admin/adminMetricsApiSlice";
import { useSettings } from "../../../providers/SettingsProvider";
import CustomDatePicker from "../../../components/common/CustomDatePicker";


// Default date range — current month's 1st to last day
const _now = new Date();
const DEFAULT_START = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, "0")}-01`;
const DEFAULT_END = new Date(_now.getFullYear(), _now.getMonth() + 1, 0).toISOString().slice(0, 10);

//  TIER CLASSIFICATION  
function getTier(code) {
    if (!code) return "Other";
    const c = code.toLowerCase();
    if (c.startsWith("kr-") || c === "prime-kr" || c === "iq-sync-kr") return "Korean Market";
    if (c.includes("elite")) return "Elite";
    if (c.includes("ascendia")) return "Prime Ascendia";
    if (c.includes("prime")) return "Prime";
    if (c.includes("max")) return "Max";
    if (c.includes("sm") || c.includes("iqsm")) return "SM / Premium";
    if (c.includes("pro")) return "Pro";
    if (c.includes("atlas") || c.includes("agent") || c.includes("escapes")) return "Atlas / Agent";
    if (c.includes("basic")) return "Basic";
    if (c.includes("auto")) return "Auto";
    if (c.includes("affiliate")) return "Affiliate";
    if (c.includes("usevent") || c.includes("hotel") || c.includes("gift")) return "Events / Gifts";
    return "Other";
}

function isAffiliate(code) {
    return code && code.endsWith("-a") && !code.includes("atlas") && !code.includes("ascendia");
}

const TIER_COLORS = {
    "Elite": "#a855f7",
    "Prime Ascendia": "#ec4899",
    "Prime": "#3b82f6",
    "Max": "#f97316",
    "SM / Premium": "#eab308",
    "Pro": "#22d3ee",
    "Atlas / Agent": "#10b981",
    "Basic": "#64748b",
    "Auto": "#06b6d4",
    "Affiliate": "#84cc16",
    "Events / Gifts": "#94a3b8",
    "Korean Market": "#f43f5e",
    "Other": "#6b7280",
};

// STYLES — Dark/Light mode aware
const getStyles = (isDark) => ({
    bg: isDark ? "transparent" : "#f8f9fa",
    card: isDark ? "rgba(30, 30, 36, 0.65)" : "#ffffff",
    card2: isDark ? "rgba(38, 39, 47, 0.7)" : "#f3f4f6",
    cardBorder: isDark ? "rgba(212, 162, 78, 0.1)" : "rgba(0,0,0,0.08)",
    cardShadow: isDark ? "0 4px 24px rgba(0,0,0,0.25)" : "0 2px 12px rgba(0,0,0,0.06)",
    backdrop: isDark ? "blur(16px)" : "blur(8px)",
    amber: "#d4a24e",
    white: isDark ? "#f5f0eb" : "#1a1a1a",
    soft: isDark ? "#c4bdb5" : "#6b7280",
    gray: isDark ? "#6b6560" : "#9ca3af",
    green: "#22c55e",
    red: "#ef4444",
    blue: "#3b82f6",
    tableRowHover: isDark ? "rgba(212,162,78,0.04)" : "rgba(0,0,0,0.02)",
    barBg: isDark ? "#222" : "#e5e7eb",
});

const fmt = (n) => n >= 1000000 ? `$${(n / 1000000).toFixed(2)}M` : n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n.toFixed(2)}`;
const fmtN = (n) => n >= 1000 ? n.toLocaleString() : String(n);

// SHARED UI COMPONENTS
const MetricCard = ({ label, value, sub, color, small, S }) => (
    <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: small ? "14px 16px" : "20px 22px", border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: small ? 140 : 180, transition: "transform 0.2s, box-shadow 0.2s" }}>
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: S.amber, marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: small ? 22 : 28, fontWeight: 700, color: color || S.white }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: S.soft, marginTop: 4 }}>{sub}</div>}
    </div>
);

const TabBtn = ({ label, active, onClick, S }) => (
    <button onClick={onClick} style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? S.amber : S.soft, background: active ? "rgba(212,162,78,0.12)" : "transparent", border: active ? `1px solid rgba(212,162,78,0.3)` : "1px solid transparent", borderRadius: 8, padding: "8px 18px", cursor: "pointer", transition: "all 0.25s ease", backdropFilter: active ? S.backdrop : "none" }}>{label}</button>
);

const Badge = ({ text, color }) => (
    <span style={{ fontSize: 10, color, background: `${color}18`, padding: "3px 8px", borderRadius: 4, letterSpacing: 1 }}>{text}</span>
);

const BarRow = ({ label, value, max, color, sub, S }) => (
    <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 13, color: S.white }}>{label}</span>
            <span style={{ fontSize: 12, color: S.soft }}>{sub || fmtN(value)}</span>
        </div>
        <div style={{ height: 6, background: S.barBg, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min((value / max) * 100, 100)}%`, background: color || S.amber, borderRadius: 3, transition: "width 0.5s", boxShadow: `0 0 8px ${(color || S.amber)}44` }} />
        </div>
    </div>
);


// LOADING SPINNER
const LoadingSpinner = ({ S }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
        <div style={{ width: 48, height: 48, border: `3px solid ${S.gray}33`, borderTop: `3px solid #4007dbff`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ fontSize: 12, color: "#4007dbff", marginTop: 16, letterSpacing: 2 }}>LOADING DATA...</div>
    </div>
);

const ErrorBox = ({ message, onRetry, S }) => (
    <div style={{ background: S.card, backdropFilter: S.backdrop, border: `1px solid ${S.red}44`, borderRadius: 12, padding: 24, textAlign: "center", margin: "40px auto", maxWidth: 500, boxShadow: S.cardShadow }}>
        <div style={{ fontSize: 12, color: S.red, letterSpacing: 2, marginBottom: 8 }}>ERROR</div>
        <div style={{ fontSize: 14, color: S.soft, marginBottom: 16 }}>{message}</div>
        {onRetry && <button onClick={onRetry} style={{ fontSize: 13, color: "#0a0a0a", background: S.amber, border: "none", borderRadius: 8, padding: "8px 20px", cursor: "pointer", fontWeight: 600 }}>Retry</button>}
    </div>
);

// == MAIN ==
export default function AdminMetrixDashboard() {
    const { getThemeMode } = useSettings();
    const isDark = getThemeMode() === "dark";
    const S = useMemo(() => getStyles(isDark), [isDark]);

    const [view, setView] = useState("overview");
    const [refundMonth, setRefundMonth] = useState("all");
    const [startDate, setStartDate] = useState(DEFAULT_START);
    const [endDate, setEndDate] = useState(DEFAULT_END);

    // Order Report tab states and hook
    const [triggerGetOrderReport, { data: reportData, isFetching: reportFetching, error: reportError }] = useLazyGetOrderReportQuery();
    const [reportStartDate, setReportStartDate] = useState(DEFAULT_START);
    const [reportEndDate, setReportEndDate] = useState(DEFAULT_END);
    const [reportSearch, setReportSearch] = useState("");

    const parsedDownloadUrl = useMemo(() => {
        if (!reportData?.success || !reportData?.data) return null;
        const keys = Object.keys(reportData.data);
        const targetKey = keys.find(k => k.includes("privatefile.dhtml"));
        if (!targetKey) return null;
        
        const match = targetKey.match(/file=([^"'\s>\\&]+)/);
        if (match && match[1]) {
            return `https://shield.iqonic.life/privatefile.dhtml?file=${match[1]}`;
        }
        return null;
    }, [reportData]);

    const reportRows = useMemo(() => {
        if (!reportData?.success || !reportData?.data) return [];
        const keys = Object.keys(reportData.data);
        const hasHtml = keys.some(k => k.includes("privatefile.dhtml"));
        if (hasHtml) return [];
        
        return Object.entries(reportData.data).map(([distId, valueStr]) => {
            if (!valueStr || typeof valueStr !== "string") return null;
            const parts = valueStr.split("\t");
            return {
                distId,
                orderId: parts[0] || "",
                product: parts[1] || "",
                paymentDate: parts[2] || "",
                signupDate: parts[3] || "",
                amount: parts[4] || "",
                details: parts.slice(5).join(" | ") || ""
            };
        }).filter(Boolean);
    }, [reportData]);

    const filteredReportRows = useMemo(() => {
        if (!reportSearch.trim()) return reportRows;
        const q = reportSearch.toLowerCase();
        return reportRows.filter(r => 
            r.distId.toLowerCase().includes(q) ||
            r.orderId.toLowerCase().includes(q) ||
            r.product.toLowerCase().includes(q) ||
            r.paymentDate.toLowerCase().includes(q) ||
            r.signupDate.toLowerCase().includes(q) ||
            r.amount.toLowerCase().includes(q) ||
            r.details.toLowerCase().includes(q)
        );
    }, [reportRows, reportSearch]);

    const handleExportCSV = useCallback(() => {
        if (!reportRows || reportRows.length === 0) return;
        
        const headers = ["Distributor ID", "Order ID", "Product", "Payment Date", "Signup Date", "Amount", "Payment Details"];
        const csvRows = [
            headers.join(","),
            ...reportRows.map(row => [
                `"${row.distId}"`,
                `"${row.orderId}"`,
                `"${row.product}"`,
                `"${row.paymentDate}"`,
                `"${row.signupDate}"`,
                `"${row.amount}"`,
                `"${row.details.replace(/"/g, '""')}"`
            ].join(","))
        ];
        
        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Order_Report_${reportStartDate}_to_${reportEndDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [reportRows, reportStartDate, reportEndDate]);

    const dateParams = { startdate: startDate, enddate: endDate };
    const { data: activeData, isLoading: activeLoading, error: activeError, refetch: refetchActive } = useGetActiveCountsQuery(dateParams);
    const { data: refundData, isLoading: refundLoading, error: refundError, refetch: refetchRefunds } = useGetRefundsQuery(dateParams);
    const { data: plansData, isLoading: plansLoading, error: plansError, refetch: refetchPlans } = useGetPlansListQuery(dateParams);

    const isLoading = activeLoading || refundLoading || plansLoading;
    const hasError = activeError || refundError || plansError;

    // Parse active counts — backend now returns array: [{ product, count }, ...]
    const ACTIVE_COUNTS = useMemo(() => {
        if (!activeData?.success || !activeData?.data) return {};
        const counts = {};
        // Handle new array format from backend
        if (Array.isArray(activeData.data)) {
            activeData.data.forEach(item => {
                if (item?.product && item?.count != null) {
                    counts[item.product] = Number(item.count) || 0;
                }
            });
        } else {
            // Fallback: old object format (keys with trailing colons)
            for (const [rawKey, val] of Object.entries(activeData.data)) {
                const key = rawKey.replace(/:$/, "").trim();
                if (key !== "Actives" && key !== "Free Actives" && key !== "Date") {
                    counts[key] = parseInt(String(val).replace(/,/g, ''), 10) || 0;
                }
            }
        }
        return counts;
    }, [activeData]);

    // Total actives = sum of all product counts (backend already filters zero-count)
    const TOTAL_ACTIVES = useMemo(() => {
        return Object.values(ACTIVE_COUNTS).reduce((s, v) => s + (Number(v) || 0), 0);
    }, [ACTIVE_COUNTS]);

    // Free actives = sum of products starting with "free"
    const FREE_ACTIVES = useMemo(() => {
        return Object.entries(ACTIVE_COUNTS)
            .filter(([k]) => k.toLowerCase().startsWith('free '))
            .reduce((s, [, v]) => s + v, 0);
    }, [ACTIVE_COUNTS]);

    const PLANS = useMemo(() => (!plansData?.success || !plansData?.data) ? {} : plansData.data, [plansData]);

    const REFUNDS_RAW = useMemo(() => {
        if (!refundData?.success) return [];
        if (Array.isArray(refundData?.data)) return refundData.data;
        if (typeof refundData?.data === "object") {
            return Object.entries(refundData.data).map(([key, item]) => ({
                id: item?.distid || key, date: item?.refdate || item?.date || "", product: item?.product || "",
            }));
        }
        return [];
    }, [refundData]);

    const DATA_DATE = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

    const analytics = useMemo(() => {
        const packages = Object.entries(ACTIVE_COUNTS).map(([code, count]) => {
            const numCount = Number(count) || 0;
            const plan = PLANS[code];
            const recurring = plan ? parseFloat(plan.recurringprice) || 0 : 0;
            const upfront = plan ? parseFloat(plan.upfrontprice) || 0 : 0;
            const faststart = plan ? parseFloat(plan.faststart) || 0 : 0;
            const mrr = numCount * recurring;
            return { code, count: numCount, recurring, upfront, faststart, mrr, tier: getTier(code), name: plan?.productname || code, isAff: isAffiliate(code) };
        }).sort((a, b) => b.count - a.count);

        const totalMRR = packages.reduce((s, p) => s + p.mrr, 0);
        const arr = totalMRR * 12;
        const paidNonAffiliate = packages.filter(p => p.tier !== "Affiliate" && p.tier !== "Events / Gifts" && p.tier !== "Other" && p.tier !== "Korean Market");
        const coreActives = paidNonAffiliate.reduce((s, p) => s + p.count, 0);
        const coreMRR = paidNonAffiliate.reduce((s, p) => s + p.mrr, 0);

        const tierMap = {};
        packages.forEach(p => {
            if (!tierMap[p.tier]) tierMap[p.tier] = { count: 0, mrr: 0, packages: [] };
            tierMap[p.tier].count += p.count; tierMap[p.tier].mrr += p.mrr; tierMap[p.tier].packages.push(p);
        });
        const tiers = Object.entries(tierMap).map(([name, d]) => ({ name, ...d })).sort((a, b) => b.count - a.count);

        const affCount = packages.filter(p => p.isAff).reduce((s, p) => s + p.count, 0);
        const directCount = TOTAL_ACTIVES - affCount - (tierMap["Affiliate"]?.count || 0);
        const affMRR = packages.filter(p => p.isAff).reduce((s, p) => s + p.mrr, 0);

        const refunds = REFUNDS_RAW;
        const refundsByMonth = {};
        refunds.forEach(r => {
            if (!r.date) return;
            const d = new Date(r.date);
            if (isNaN(d.getTime())) return;
            const key = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
            if (!refundsByMonth[key]) refundsByMonth[key] = [];
            refundsByMonth[key].push(r);
        });

        const refundsByProduct = {};
        refunds.forEach(r => { if (r.product) refundsByProduct[r.product] = (refundsByProduct[r.product] || 0) + 1; });
        const topRefunded = Object.entries(refundsByProduct).sort((a, b) => b[1] - a[1]).slice(0, 15);

        const refundsByTier = {};
        refunds.forEach(r => { const t = getTier(r.product); refundsByTier[t] = (refundsByTier[t] || 0) + 1; });

        const top10 = packages.filter(p => p.count > 0).slice(0, 10);
        const top10MRR = [...packages].sort((a, b) => b.mrr - a.mrr).filter(p => p.mrr > 0).slice(0, 10);
        const arpu = TOTAL_ACTIVES > 0 ? totalMRR / TOTAL_ACTIVES : 0;
        const coreArpu = coreActives > 0 ? coreMRR / coreActives : 0;

        const vendorTiers = { premium: [], standard: [] };
        packages.filter(p => p.count > 0).forEach(p => {
            if (p.recurring > 100) vendorTiers.premium.push({ ...p, rate: 3, payment: p.count * 3 });
            else vendorTiers.standard.push({ ...p, rate: 1, payment: p.count * 1 });
        });
        vendorTiers.premium.sort((a, b) => b.payment - a.payment);
        vendorTiers.standard.sort((a, b) => b.payment - a.payment);
        const vendorPremiumTotal = vendorTiers.premium.reduce((s, p) => s + p.payment, 0);
        const vendorStandardTotal = vendorTiers.standard.reduce((s, p) => s + p.payment, 0);
        const vendorPremiumUsers = vendorTiers.premium.reduce((s, p) => s + p.count, 0);
        const vendorStandardUsers = vendorTiers.standard.reduce((s, p) => s + p.count, 0);
        const vendorTotal = vendorPremiumTotal + vendorStandardTotal;
        const monthKeys = Object.keys(refundsByMonth).sort((a, b) => new Date(a) - new Date(b));

        return { packages, totalMRR, arr, coreActives, coreMRR, tiers, tierMap, affCount, directCount, affMRR, refunds, refundsByMonth, monthKeys, refundsByProduct, topRefunded, refundsByTier, top10, top10MRR, arpu, coreArpu, vendorTiers, vendorPremiumTotal, vendorStandardTotal, vendorPremiumUsers, vendorStandardUsers, vendorTotal };
    }, [ACTIVE_COUNTS, PLANS, REFUNDS_RAW, TOTAL_ACTIVES]);

    const filteredRefunds = useMemo(() => {
        if (refundMonth === "all") return analytics.refunds;
        return analytics.refundsByMonth[refundMonth] || [];
    }, [refundMonth, analytics]);

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    if (isLoading) return (<div style={{ minHeight: 400 }}><LoadingSpinner S={S} /></div>);
    if (hasError) return (<div style={{ padding: 28 }}><ErrorBox S={S} message={activeError?.message || refundError?.message || plansError?.message || "Failed to load data"} onRetry={() => { refetchActive(); refetchRefunds(); refetchPlans(); }} /></div>);

    return (
        <div className="min-h-screen" style={{ background: S.bg }}>
            {/* Add Tailwind CSS via CDN */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6" style={{ color: S.white, padding: isMobile ? 12 : 28 }}>

            {/* HEADER */}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 4 }}>IQONIC / IQ SOCIAL</div>
                    <h1 style={{ fontSize: isMobile ? 22 : 30, fontWeight: 800, margin: 0, color: S.white }}>Platform Metrics Dashboard</h1>
                    <div style={{ fontSize: 13, color: S.gray, marginTop: 4 }}>Data snapshot: {DATA_DATE} | Range: {startDate} to {endDate}</div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <label style={{ fontSize: 14, color: S.amber, letterSpacing: 1 }}>FROM</label>
                        <div style={{ width: 180 }}>
                            <CustomDatePicker value={startDate} onChange={setStartDate} />
                        </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <label style={{ fontSize: 14, color: S.amber, letterSpacing: 1 }}>TO</label>
                        <div style={{ width: 180 }}>
                            <CustomDatePicker value={endDate} onChange={setEndDate} align="right" />
                        </div>
                    </div>
                </div>
            </div>

            {/* NAV TABS */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
                {["overview", "packages", "revenue", "tiers", "refunds", "affiliate", "vendor", "report"].map(v => (
                    <TabBtn S={S} key={v} label={v === "vendor" ? "Vendor Payment" : v === "report" ? "Order Report" : v.charAt(0).toUpperCase() + v.slice(1)} active={view === v} onClick={() => setView(v)} />
                ))}
            </div>

            {/*  OVERVIEW  */}
            {view === "overview" && (
                <div>
                    {/* KPIs */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                        <MetricCard S={S} label="Total Actives" value={fmtN(TOTAL_ACTIVES)} sub="All active subscriptions" color={S.green} />
                        <MetricCard S={S} label="Free Actives" value={fmtN(FREE_ACTIVES)} sub="0% of base" color={S.gray} />
                        <MetricCard S={S} label="Paid Actives" value={fmtN(TOTAL_ACTIVES - FREE_ACTIVES)} sub="100% paid" color={S.amber} />
                        <MetricCard S={S} label="Est. MRR" value={fmt(analytics.totalMRR)} sub={`ARR: ${fmt(analytics.arr)}`} color={S.green} />
                    </div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                        <MetricCard S={S} label="Core MRR" value={fmt(analytics.coreMRR)} sub={`${fmtN(analytics.coreActives)} core subscribers`} color={S.blue} small />
                        <MetricCard S={S} label="ARPU (All)" value={`$${analytics.arpu.toFixed(2)}`} sub="Monthly per user" color={S.soft} small />
                        <MetricCard S={S} label="ARPU (Core)" value={`$${analytics.coreArpu.toFixed(2)}`} sub="Excl. affiliate, events, KR" color={S.amber} small />
                        <MetricCard S={S} label="Unique Packages" value={Object.keys(ACTIVE_COUNTS).length} sub="Active plan codes" color={S.soft} small />
                        <MetricCard S={S} label="Refunds (2mo)" value={analytics.refunds.length} sub={`${startDate} to ${endDate}`} color={S.red} small />
                    </div>

                    {/* TIER DONUT + TOP 10 */}
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        {/* Tier Distribution */}
                        <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: 300 }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>TIER DISTRIBUTION</div>
                            {analytics.tiers.map(t => (
                                <BarRow S={S} key={t.name} label={t.name} value={t.count} max={analytics.tiers[0].count} color={TIER_COLORS[t.name]} sub={`${t.count} (${TOTAL_ACTIVES > 0 ? ((t.count / TOTAL_ACTIVES) * 100).toFixed(1) : "0.0"}%)`} />
                            ))}
                        </div>

                        {/* Top 10 Packages */}
                        <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: 300 }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>TOP 10 PACKAGES BY SUBSCRIBERS</div>
                            {analytics.top10.map(p => (
                                <BarRow S={S} key={p.code} label={p.name || p.code} value={p.count} max={analytics.top10[0].count} color={TIER_COLORS[p.tier]} sub={`${fmtN(p.count)} subs`} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/*  PACKAGES  */}
            {view === "packages" && (
                <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>ALL ACTIVE PACKAGES ({Object.entries(ACTIVE_COUNTS).filter(([, v]) => v > 0).length} with subscribers)</div>
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${S.cardBorder}` }}>
                                    {["Package", "Friendly Name", "Tier", "Actives", "% Share", "Recurring", "MRR", "Upfront", "FastStart"].map(h => (
                                        <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 10, letterSpacing: 1, color: S.amber, textTransform: "uppercase" }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.packages.filter(p => p.count > 0).map(p => (
                                    <tr key={p.code} style={{ borderBottom: `1px solid ${S.gray}15` }}>
                                        <td style={{ padding: "8px 12px", fontSize: 12, color: S.white }}>{p.code}</td>
                                        <td style={{ padding: "8px 12px", color: S.soft }}>{p.name}</td>
                                        <td style={{ padding: "8px 12px" }}><Badge text={p.tier} color={TIER_COLORS[p.tier]} /></td>
                                        <td style={{ padding: "8px 12px", fontWeight: 600 }}>{fmtN(p.count)}</td>
                                        <td style={{ padding: "8px 12px", color: S.soft }}>{((p.count / TOTAL_ACTIVES) * 100).toFixed(1)}%</td>
                                        <td style={{ padding: "8px 12px", color: S.green }}>${p.recurring}</td>
                                        <td style={{ padding: "8px 12px", color: S.green, fontWeight: 600 }}>{fmt(p.mrr)}</td>
                                        <td style={{ padding: "8px 12px", color: S.soft }}>${p.upfront}</td>
                                        <td style={{ padding: "8px 12px", color: S.amber }}>${p.faststart}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/*  REVENUE  */}
            {view === "revenue" && (
                <div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                        <MetricCard S={S} label="Estimated MRR" value={fmt(analytics.totalMRR)} sub="Based on recurring × actives" color={S.green} />
                        <MetricCard S={S} label="Estimated ARR" value={fmt(analytics.arr)} sub="MRR × 12" color={S.green} />
                        <MetricCard S={S} label="ARPU (All)" value={`$${analytics.arpu.toFixed(2)}`} sub="Total MRR / total actives" />
                        <MetricCard S={S} label="ARPU (Core)" value={`$${analytics.coreArpu.toFixed(2)}`} sub="Core MRR / core actives" color={S.amber} />
                    </div>

                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: 300 }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>TOP 10 PACKAGES BY MRR</div>
                            {analytics.top10MRR.map(p => (
                                <BarRow S={S} key={p.code} label={p.name || p.code} value={p.mrr} max={analytics.top10MRR[0].mrr} color={TIER_COLORS[p.tier]} sub={fmt(p.mrr)} />
                            ))}
                        </div>

                        <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: 300 }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>MRR BY TIER</div>
                            {analytics.tiers.filter(t => t.mrr > 0).sort((a, b) => b.mrr - a.mrr).map(t => (
                                <BarRow S={S} key={t.name} label={t.name} value={t.mrr} max={analytics.tiers.sort((a, b) => b.mrr - a.mrr)[0].mrr} color={TIER_COLORS[t.name]} sub={fmt(t.mrr)} />
                            ))}
                        </div>
                    </div>

                    {/* Revenue concentration */}
                    <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, marginTop: 20 }}>
                        <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>REVENUE CONCENTRATION</div>
                        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                            {(() => {
                                const sorted = [...analytics.packages].sort((a, b) => b.mrr - a.mrr).filter(p => p.mrr > 0);
                                let cumulative = 0;
                                const top5mrr = sorted.slice(0, 5).reduce((s, p) => s + p.mrr, 0);
                                const top10mrr = sorted.slice(0, 10).reduce((s, p) => s + p.mrr, 0);
                                return [
                                    { label: "Top 5 Packages", pct: analytics.totalMRR > 0 ? ((top5mrr / analytics.totalMRR) * 100).toFixed(1) : "0.0", value: fmt(top5mrr) },
                                    { label: "Top 10 Packages", pct: analytics.totalMRR > 0 ? ((top10mrr / analytics.totalMRR) * 100).toFixed(1) : "0.0", value: fmt(top10mrr) },
                                    { label: "IQ Elite (all)", pct: analytics.totalMRR > 0 ? (((analytics.tierMap["Elite"]?.mrr || 0) / analytics.totalMRR) * 100).toFixed(1) : "0.0", value: fmt(analytics.tierMap["Elite"]?.mrr || 0) },
                                ].map(d => (
                                    <div key={d.label} style={{ flex: 1, minWidth: 200, padding: 16, background: S.card2, backdropFilter: S.backdrop, borderRadius: 10 }}>
                                        <div style={{ fontSize: 10, color: S.amber, letterSpacing: 1, marginBottom: 6 }}>{d.label}</div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: S.white }}>{d.pct}%</div>
                                        <div style={{ fontSize: 12, color: S.soft }}>{d.value} of MRR</div>
                                    </div>
                                ));
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/*  TIERS  */}
            {view === "tiers" && (
                <div>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>TIER DEEP DIVE</div>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
                        {analytics.tiers.map(t => (
                            <div key={t.name} style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 18, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, borderLeft: `3px solid ${TIER_COLORS[t.name]}` }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                                    <div style={{ fontSize: 16, fontWeight: 700, color: S.white }}>{t.name}</div>
                                    <Badge text={`${TOTAL_ACTIVES > 0 ? ((t.count / TOTAL_ACTIVES) * 100).toFixed(1) : "0.0"}%`} color={TIER_COLORS[t.name]} />
                                </div>
                                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 10, color: S.gray }}>ACTIVES</div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: S.white }}>{fmtN(t.count)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 10, color: S.gray }}>MRR</div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: S.green }}>{fmt(t.mrr)}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 10, color: S.gray }}>AVG ARPU</div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: S.amber }}>{t.count > 0 ? `$${(t.mrr / t.count).toFixed(0)}` : "$0"}</div>
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: S.soft }}>
                                    {t.packages.filter(p => p.count > 0).sort((a, b) => b.count - a.count).slice(0, 5).map(p => `${p.code} (${p.count})`).join(", ")}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/*  REFUNDS  */}
            {view === "refunds" && (
                <div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                        <MetricCard S={S} label="Total Refunds" value={analytics.refunds.length} sub={`${startDate} to ${endDate}`} color={S.red} small />
                        {analytics.monthKeys.map(mk => (
                            <MetricCard S={S} key={mk} label={mk} value={(analytics.refundsByMonth[mk] || []).length} sub={`${analytics.refunds.length > 0 ? (((analytics.refundsByMonth[mk] || []).length / analytics.refunds.length) * 100).toFixed(0) : 0}%`} color={S.red} small />
                        ))}
                        <MetricCard S={S} label="Refund Rate" value={`${TOTAL_ACTIVES > 0 ? ((analytics.refunds.length / TOTAL_ACTIVES) * 100).toFixed(1) : "0.0"}%`} sub="vs current actives" color={S.red} small />
                    </div>

                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
                        {/* By Product */}
                        <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: 300 }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>TOP REFUNDED PRODUCTS</div>
                            {analytics.topRefunded.map(([code, cnt]) => (
                                <BarRow S={S} key={code} label={code} value={cnt} max={analytics.topRefunded[0][1]} color={S.red} sub={`${cnt} refunds`} />
                            ))}
                        </div>

                        {/* By Tier */}
                        <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: 300 }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>REFUNDS BY TIER</div>
                            {Object.entries(analytics.refundsByTier).sort((a, b) => b[1] - a[1]).map(([tier, cnt]) => (
                                <BarRow S={S} key={tier} label={tier} value={cnt} max={Object.values(analytics.refundsByTier).sort((a, b) => b - a)[0]} color={TIER_COLORS[tier]} sub={`${cnt} (${((cnt / analytics.refunds.length) * 100).toFixed(1)}%)`} />
                            ))}
                        </div>
                    </div>

                    {/* Monthly filter & detail */}
                    <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                            {["all", ...analytics.monthKeys].map(m => (
                                <TabBtn S={S} key={m} label={m === "all" ? "All Months" : m} active={refundMonth === m} onClick={() => setRefundMonth(m)} />
                            ))}
                        </div>
                        <div style={{ fontSize: 10, color: S.gray, marginBottom: 8 }}>Showing {filteredRefunds.length} refunds</div>
                        <div style={{ maxHeight: 400, overflowY: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                <thead>
                                    <tr style={{ borderBottom: `1px solid ${S.cardBorder}` }}>
                                        {["Date", "Product", "Tier"].map(h => (
                                            <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, color: S.amber, letterSpacing: 1 }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRefunds.slice(0, 100).map((r, i) => (
                                        <tr key={i} style={{ borderBottom: `1px solid ${S.gray}10` }}>
                                            <td style={{ padding: "6px 10px", color: S.soft }}>{r.date}</td>
                                            <td style={{ padding: "6px 10px", color: S.white }}>{r.product}</td>
                                            <td style={{ padding: "6px 10px" }}><Badge text={getTier(r.product)} color={TIER_COLORS[getTier(r.product)]} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/*  AFFILIATE  */}
            {view === "affiliate" && (
                <div>
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                        <MetricCard S={S} label="Affiliate Subs (kit)" value={fmtN(ACTIVE_COUNTS["affiliate-marketing-kit"] || 0)} sub="$15/mo recurring" color={S.amber} />
                        <MetricCard S={S} label="Affiliate-tier Plans" value={fmtN(analytics.affCount)} sub="Plans ending in -a" color={S.blue} />
                        <MetricCard S={S} label="Direct Plans" value={fmtN(analytics.directCount)} sub="Non-affiliate, non-kit" color={S.green} />
                        <MetricCard S={S} label="Affiliate MRR" value={fmt(analytics.affMRR)} sub="From -a suffix plans" color={S.amber} />
                    </div>

                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: 300 }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>AFFILIATE (-A) PACKAGES</div>
                            {analytics.packages.filter(p => p.isAff && p.count > 0).sort((a, b) => b.count - a.count).map(p => (
                                <BarRow S={S} key={p.code} label={p.code} value={p.count} max={analytics.packages.filter(p2 => p2.isAff && p2.count > 0).sort((a, b) => b.count - a.count)[0]?.count || 1} color={S.amber} sub={`${p.count} subs, ${fmt(p.mrr)}/mo`} />
                            ))}
                        </div>

                        <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: 300 }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>DIRECT VS AFFILIATE COMPARISON</div>
                            {(() => {
                                const affKit = ACTIVE_COUNTS["affiliate-marketing-kit"] || 0;
                                const affPlans = analytics.affCount;
                                const direct = TOTAL_ACTIVES - affKit - affPlans;
                                const data = [
                                    { label: "Direct subscribers", count: direct, color: S.green },
                                    { label: "Affiliate-tier plans (-a)", count: affPlans, color: S.amber },
                                    { label: "Affiliate kit ($15)", count: affKit, color: S.blue },
                                ];
                                return data.map(d => (
                                    <div key={d.label} style={{ marginBottom: 16 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                            <span style={{ color: S.white, fontSize: 14 }}>{d.label}</span>
                                            <span style={{ color: d.color, fontWeight: 600 }}>{fmtN(d.count)} ({TOTAL_ACTIVES > 0 ? ((d.count / TOTAL_ACTIVES) * 100).toFixed(1) : "0.0"}%)</span>
                                        </div>
                                        <div style={{ height: 10, background: S.barBg, borderRadius: 5, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${TOTAL_ACTIVES > 0 ? (d.count / TOTAL_ACTIVES) * 100 : 0}%`, background: d.color, borderRadius: 5 }} />
                                        </div>
                                    </div>
                                ));
                            })()}

                            <div style={{ marginTop: 24, padding: 16, background: S.card2, backdropFilter: S.backdrop, borderRadius: 10 }}>
                                <div style={{ fontSize: 10, color: S.amber, letterSpacing: 1, marginBottom: 8 }}>FASTSTART COMMISSIONS (POTENTIAL)</div>
                                <div style={{ fontSize: 13, color: S.soft }}>
                                    {(() => {
                                        let totalFS = 0;
                                        analytics.packages.forEach(p => {
                                            if (p.isAff && p.count > 0) totalFS += p.count * p.faststart;
                                        });
                                        const affKitFS = (ACTIVE_COUNTS["affiliate-marketing-kit"] || 0) * 0; // affiliate kit has $0 faststart
                                        return `Estimated FastStart paid on affiliate plans: ${fmt(totalFS)}`;
                                    })()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/*  VENDOR PAYMENT  */}
            {view === "vendor" && (
                <div>
                    {/* KPIs */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                        <MetricCard S={S} label="Total Owed to BBR" value={`$${fmtN(analytics.vendorTotal)}`} sub="Monthly vendor payment" color={S.green} />
                        <MetricCard S={S} label="Premium Users ($3)" value={fmtN(analytics.vendorPremiumUsers)} sub={`Recurring > $100 = $${fmtN(analytics.vendorPremiumTotal)}`} color={S.amber} />
                        <MetricCard S={S} label="Standard Users ($1)" value={fmtN(analytics.vendorStandardUsers)} sub={`Recurring <= $100 = $${fmtN(analytics.vendorStandardTotal)}`} color={S.blue} />
                        <MetricCard S={S} label="Effective Rate" value={`$${TOTAL_ACTIVES > 0 ? (analytics.vendorTotal / TOTAL_ACTIVES).toFixed(2) : "0.00"}`} sub="Blended per-user rate" color={S.soft} />
                    </div>

                    {/* Visual split */}
                    <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, marginBottom: 20 }}>
                        <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>PAYMENT BREAKDOWN</div>
                        <div style={{ display: "flex", gap: 4, height: 40, borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
                            <div style={{ width: `${analytics.vendorTotal > 0 ? (analytics.vendorPremiumTotal / analytics.vendorTotal) * 100 : 50}%`, background: S.amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#0a0a0a", minWidth: 60 }}>
                                ${fmtN(analytics.vendorPremiumTotal)}
                            </div>
                            <div style={{ width: `${analytics.vendorTotal > 0 ? (analytics.vendorStandardTotal / analytics.vendorTotal) * 100 : 50}%`, background: S.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: S.white, minWidth: 60 }}>
                                ${fmtN(analytics.vendorStandardTotal)}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: S.amber }} />
                                <span style={{ color: S.soft }}>$3/user (recurring &gt; $100): {fmtN(analytics.vendorPremiumUsers)} users = <span style={{ color: S.green, fontWeight: 600 }}>${fmtN(analytics.vendorPremiumTotal)}</span></span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <div style={{ width: 10, height: 10, borderRadius: 2, background: S.blue }} />
                                <span style={{ color: S.soft }}>$1/user (recurring &lt;= $100): {fmtN(analytics.vendorStandardUsers)} users = <span style={{ color: S.green, fontWeight: 600 }}>${fmtN(analytics.vendorStandardTotal)}</span></span>
                            </div>
                        </div>
                    </div>

                    {/* Annualized */}
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
                        <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: 200 }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 6 }}>MONTHLY</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: S.green }}>${fmtN(analytics.vendorTotal)}</div>
                        </div>
                        <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: 200 }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 6 }}>QUARTERLY</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: S.green }}>${fmtN(analytics.vendorTotal * 3)}</div>
                        </div>
                        <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: 200 }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 6 }}>ANNUAL</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: S.green }}>${fmtN(analytics.vendorTotal * 12)}</div>
                        </div>
                        <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: 200 }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 6 }}>% OF THEIR MRR</div>
                            <div style={{ fontSize: 28, fontWeight: 700, color: S.white }}>{analytics.totalMRR > 0 ? ((analytics.vendorTotal / analytics.totalMRR) * 100).toFixed(2) : "0.00"}%</div>
                            <div style={{ fontSize: 12, color: S.soft, marginTop: 4 }}>We cost them this % of revenue</div>
                        </div>
                    </div>

                    {/* Detail tables */}
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                        {/* $3 tier */}
                        <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: 340 }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 4 }}>$3/USER PACKAGES (RECURRING &gt; $100)</div>
                            <div style={{ fontSize: 11, color: S.gray, marginBottom: 14 }}>{analytics.vendorTiers.premium.length} packages, {fmtN(analytics.vendorPremiumUsers)} users</div>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${S.cardBorder}` }}>
                                            {["Package", "Actives", "Recurring", "Rate", "Payment"].map(h => (
                                                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, color: S.amber, letterSpacing: 1 }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.vendorTiers.premium.map(p => (
                                            <tr key={p.code} style={{ borderBottom: `1px solid ${S.gray}10` }}>
                                                <td style={{ padding: "6px 10px", color: S.white }}>{p.code}</td>
                                                <td style={{ padding: "6px 10px", fontWeight: 600 }}>{fmtN(p.count)}</td>
                                                <td style={{ padding: "6px 10px", color: S.soft }}>${p.recurring}</td>
                                                <td style={{ padding: "6px 10px", color: S.amber }}>$3</td>
                                                <td style={{ padding: "6px 10px", color: S.green, fontWeight: 600 }}>${fmtN(p.payment)}</td>
                                            </tr>
                                        ))}
                                        <tr style={{ borderTop: `2px solid ${S.amber}44` }}>
                                            <td style={{ padding: "8px 10px", fontWeight: 700, color: S.amber }}>SUBTOTAL</td>
                                            <td style={{ padding: "8px 10px", fontWeight: 700 }}>{fmtN(analytics.vendorPremiumUsers)}</td>
                                            <td style={{ padding: "8px 10px" }}></td>
                                            <td style={{ padding: "8px 10px" }}></td>
                                            <td style={{ padding: "8px 10px", fontWeight: 700, color: S.green }}>${fmtN(analytics.vendorPremiumTotal)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* $1 tier */}
                        <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 20, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow, flex: 1, minWidth: 340 }}>
                            <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 4 }}>$1/USER PACKAGES (RECURRING &lt; $100)</div>
                            <div style={{ fontSize: 11, color: S.gray, marginBottom: 14 }}>{analytics.vendorTiers.standard.length} packages, {fmtN(analytics.vendorStandardUsers)} users</div>
                            <div style={{ overflowX: "auto" }}>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                                    <thead>
                                        <tr style={{ borderBottom: `1px solid ${S.cardBorder}` }}>
                                            {["Package", "Actives", "Recurring", "Rate", "Payment"].map(h => (
                                                <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, color: S.amber, letterSpacing: 1 }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.vendorTiers.standard.map(p => (
                                            <tr key={p.code} style={{ borderBottom: `1px solid ${S.gray}10` }}>
                                                <td style={{ padding: "6px 10px", color: S.white }}>{p.code}</td>
                                                <td style={{ padding: "6px 10px", fontWeight: 600 }}>{fmtN(p.count)}</td>
                                                <td style={{ padding: "6px 10px", color: S.soft }}>${p.recurring}</td>
                                                <td style={{ padding: "6px 10px", color: S.blue }}>$1</td>
                                                <td style={{ padding: "6px 10px", color: S.green, fontWeight: 600 }}>${fmtN(p.payment)}</td>
                                            </tr>
                                        ))}
                                        <tr style={{ borderTop: `2px solid ${S.amber}44` }}>
                                            <td style={{ padding: "8px 10px", fontWeight: 700, color: S.amber }}>SUBTOTAL</td>
                                            <td style={{ padding: "8px 10px", fontWeight: 700 }}>{fmtN(analytics.vendorStandardUsers)}</td>
                                            <td style={{ padding: "8px 10px" }}></td>
                                            <td style={{ padding: "8px 10px" }}></td>
                                            <td style={{ padding: "8px 10px", fontWeight: 700, color: S.green }}>${fmtN(analytics.vendorStandardTotal)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Grand total callout */}
                    <div style={{ background: "linear-gradient(135deg, #1a2a1a, #161616)", borderRadius: 10, padding: 24, border: `1px solid ${S.green}33`, marginTop: 20, textAlign: "center" }}>
                        <div style={{ fontSize: 10, letterSpacing: 3, color: S.amber, marginBottom: 8 }}>TOTAL VENDOR PAYMENT DUE</div>
                        <div style={{ fontSize: 44, fontWeight: 700, color: S.green }}>${fmtN(analytics.vendorTotal)}</div>
                        <div style={{ fontSize: 14, color: S.soft, marginTop: 8 }}>
                            {fmtN(analytics.vendorPremiumUsers)} users × $3 + {fmtN(analytics.vendorStandardUsers)} users × $1 | As of {DATA_DATE}
                        </div>
                    </div>
                </div>
            )}

            {/*  REPORT  */}
            {view === "report" && (
                <div style={{ background: S.card, backdropFilter: S.backdrop, borderRadius: 12, padding: 24, border: `1px solid ${S.cardBorder}`, boxShadow: S.cardShadow }}>
                    <div style={{ fontSize: 10, letterSpacing: 2, color: S.amber, marginBottom: 16 }}>ORDER REPORT GENERATOR</div>
                    
                    <p style={{ fontSize: 14, color: S.soft, marginBottom: 24, lineHeight: "1.6" }}>
                        Generate and view the order report for the selected date range. You can search the records locally and export them directly to a CSV file.
                    </p>

                    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 24 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <label style={{ fontSize: 14, color: S.amber, letterSpacing: 1 }}>FROM</label>
                            <div style={{ width: 180 }}>
                                <CustomDatePicker value={reportStartDate} onChange={setReportStartDate} />
                            </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <label style={{ fontSize: 14, color: S.amber, letterSpacing: 1 }}>TO</label>
                            <div style={{ width: 180 }}>
                                <CustomDatePicker value={reportEndDate} onChange={setReportEndDate} align="right" />
                            </div>
                        </div>
                        
                        <button
                            onClick={() => triggerGetOrderReport({ fromdate: reportStartDate, todate: reportEndDate })}
                            disabled={reportFetching}
                            style={{
                                fontSize: 13,
                                color: "#0a0a0a",
                                background: S.amber,
                                border: "none",
                                borderRadius: 8,
                                padding: "10px 24px",
                                cursor: reportFetching ? "not-allowed" : "pointer",
                                fontWeight: 600,
                                transition: "all 0.2s",
                                opacity: reportFetching ? 0.7 : 1,
                                height: 38,
                                display: "flex",
                                alignItems: "center",
                                gap: 8
                            }}
                        >
                            {reportFetching ? "Generating Report..." : "Generate Order Report"}
                        </button>
                    </div>

                    {reportError && (
                        <div style={{ marginTop: 16 }}>
                            <ErrorBox S={S} message={reportError?.message || "Failed to generate report"} />
                        </div>
                    )}

                    {reportData && !reportFetching && (
                        <div style={{ marginTop: 24 }}>
                            {/* Fallback to HTML link */}
                            {parsedDownloadUrl && (
                                <div style={{ padding: 20, background: S.card2, borderRadius: 8, border: `1px solid ${S.cardBorder}`, marginBottom: 20 }}>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
                                        <div style={{ fontSize: 14, color: S.green, fontWeight: 500 }}>✓ Link generated successfully!</div>
                                        <button
                                            onClick={() => window.open(parsedDownloadUrl, "_blank")}
                                            style={{
                                                fontSize: 14,
                                                color: "#ffffff",
                                                background: S.green,
                                                border: "none",
                                                borderRadius: 8,
                                                padding: "12px 28px",
                                                cursor: "pointer",
                                                fontWeight: 600,
                                                transition: "background 0.2s",
                                                boxShadow: `0 4px 12px ${S.green}33`
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "#16a34a"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = S.green}
                                        >
                                            Click Here For Downloadable Spreadsheet Version
                                        </button>
                                        <span style={{ fontSize: 11, color: S.gray, marginTop: 8 }}>
                                            Target URL: {parsedDownloadUrl}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Direct JSON rows rendering */}
                            {reportRows.length > 0 ? (
                                <div>
                                    {/* Action Bar */}
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
                                        <div style={{ fontSize: 13, color: S.soft }}>
                                            Found <strong style={{ color: S.white }}>{fmtN(reportRows.length)}</strong> orders.
                                            {filteredReportRows.length !== reportRows.length && (
                                                <span> (Filtered to <strong style={{ color: S.white }}>{fmtN(filteredReportRows.length)}</strong>)</span>
                                            )}
                                        </div>
                                        
                                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                            <input
                                                type="text"
                                                placeholder="Search orders..."
                                                value={reportSearch}
                                                onChange={(e) => setReportSearch(e.target.value)}
                                                style={{
                                                    background: S.card2,
                                                    border: `1px solid ${S.cardBorder}`,
                                                    borderRadius: 8,
                                                    padding: "8px 14px",
                                                    fontSize: 13,
                                                    color: S.white,
                                                    outline: "none",
                                                    width: 220
                                                }}
                                            />
                                            <button
                                                onClick={handleExportCSV}
                                                style={{
                                                    fontSize: 13,
                                                    color: "#ffffff",
                                                    background: S.green,
                                                    border: "none",
                                                    borderRadius: 8,
                                                    padding: "8px 18px",
                                                    cursor: "pointer",
                                                    fontWeight: 600,
                                                    transition: "background 0.2s"
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = "#16a34a"}
                                                onMouseLeave={(e) => e.currentTarget.style.background = S.green}
                                            >
                                                Export to CSV
                                            </button>
                                        </div>
                                    </div>

                                    {/* Table View */}
                                    <div style={{ overflowX: "auto", border: `1px solid ${S.cardBorder}`, borderRadius: 8, maxHeight: 500 }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                            <thead style={{ background: S.card2, position: "sticky", top: 0, zIndex: 1 }}>
                                                <tr style={{ borderBottom: `1px solid ${S.cardBorder}` }}>
                                                    {["Distributor ID", "Order ID", "Product", "Payment Date", "Signup Date", "Amount", "Payment Details"].map(h => (
                                                        <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 10, letterSpacing: 1, color: S.amber, textTransform: "uppercase" }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredReportRows.length > 0 ? (
                                                    filteredReportRows.map((row, i) => (
                                                        <tr key={i} style={{ borderBottom: `1px solid ${S.gray}15`, background: i % 2 === 0 ? "transparent" : `${S.gray}05` }}>
                                                            <td style={{ padding: "8px 12px", fontSize: 12, color: S.white }}>{row.distId}</td>
                                                            <td style={{ padding: "8px 12px", color: S.soft }}>{row.orderId}</td>
                                                            <td style={{ padding: "8px 12px" }}>
                                                                <Badge text={row.product} color={TIER_COLORS[getTier(row.product)] || S.amber} />
                                                            </td>
                                                            <td style={{ padding: "8px 12px", color: S.soft }}>{row.paymentDate}</td>
                                                            <td style={{ padding: "8px 12px", color: S.soft }}>{row.signupDate}</td>
                                                            <td style={{ padding: "8px 12px", color: S.green, fontWeight: 600 }}>{row.amount}</td>
                                                            <td style={{ padding: "8px 12px", color: S.soft, fontSize: 12 }}>{row.details}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} style={{ textAlign: "center", padding: 24, color: S.soft }}>
                                                            No orders match the search criteria.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                !parsedDownloadUrl && (
                                    <div style={{ textAlign: "center", padding: 24, color: S.soft }}>
                                        No order data returned for this date range.
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* FOOTER */}

            </div>
        </div>
    );
}
