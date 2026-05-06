import React, { useState, useCallback, useRef, useEffect } from "react";
import { useGetClientTvSignalsQuery } from "../../../store/api/client/clientTvSignalsApiSlice";
import { useGetAllEducatorsQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";
import { format } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Signal,
  Clock,
  User,
  ChevronDown,
  Filter,
  Zap,
  BarChart3,
  Activity,
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

const ACTION_COLORS = {
  BUY: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-500",
    badge: "bg-emerald-500",
    glow: "shadow-emerald-500/20",
  },
  SELL: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-500",
    badge: "bg-red-500",
    glow: "shadow-red-500/20",
  },
};

const CATEGORY_ICONS = {
  Crypto: "₿",
  Forex: "$",
  Indices: "📊",
  Commodities: "🥇",
};

const StrategyAlerts = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [category, setCategory] = useState("");
  const [educator, setEducator] = useState("");
  const [action, setAction] = useState("");
  const [signals, setSignals] = useState([]);
  const observer = useRef();

  const { data, isLoading, isFetching } = useGetClientTvSignalsQuery({
    page,
    limit,
    category,
    educator,
    action,
  });

  const { data: educatorsData } = useGetAllEducatorsQuery();

  const totalPages = data?.pagination?.totalPages || 1;

  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setSignals(data.data);
      } else {
        setSignals((prev) => {
          const newSignals = data.data.filter(
            (s) => !prev.some((p) => p._id === s._id)
          );
          return [...prev, ...newSignals];
        });
      }
    }
  }, [data, page]);

  useEffect(() => {
    setSignals([]);
    setPage(1);
  }, [category, educator, action]);

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

  const categories = ["Forex", "Crypto", "Indices", "Commodities"];

  const buyCount = signals.filter((s) => s.action === "BUY").length;
  const sellCount = signals.filter((s) => s.action === "SELL").length;

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
                Live trading signals from TradingView webhooks
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card rounded-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-purple-500/10">
              <Signal className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                Total Signals
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
                Buy Signals
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
                Sell Signals
              </p>
              <p className="text-xl font-bold text-red-500">{sellCount}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="py-1 px-2 flex overflow-auto bg-gray-100 dark:bg-gray-800 rounded-md gap-2 shadow-sm">
            {["", "BUY", "SELL"].map((a) => (
              <button
                key={a}
                onClick={() => setAction(a)}
                className={`px-3 py-1.5 flex items-center text-xs rounded-md font-medium transition-all ${action === a
                  ? "bg-primary text-white shadow-lg shadow-primary/50"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
              >
                {a === "" ? (
                  "All"
                ) : a === "BUY" ? (
                  <span className="flex items-center gap-1">
                    <TrendingUp size={14} /> Buy
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <TrendingDown size={14} /> Sell
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative">
            <Select
              value={category || ""}
              onValueChange={(val) => setCategory(val)}
            >
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Asset Class">
                  {category || "Asset Class"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_ICONS[cat]} {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {category && (
              <button
                type="button"
                onClick={() => setCategory("")}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✖
              </button>
            )}
          </div>

          <div className="relative">
            <Select
              value={educator || ""}
              onValueChange={(val) => setEducator(val)}
            >
              <SelectTrigger className="w-[190px] h-10">
                <SelectValue placeholder="Select Educator">
                  {educator
                    ? educatorsData?.data?.find((e) => e._id === educator)
                      ?.first_name || "Educator"
                    : "Select Educator"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {educatorsData?.data?.map((item) => (
                  <SelectItem key={item._id} value={item._id}>
                    {item.first_name} {item.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {educator && (
              <button
                type="button"
                onClick={() => setEducator("")}
                className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✖
              </button>
            )}
          </div>
        </div>
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
              Alerts will appear here when educators publish TradingView signals
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {signals.map((signal, index) => {
              const colors = ACTION_COLORS[signal.action] || ACTION_COLORS.BUY;
              const educatorInfo = signal.educatorId;
              const categoryInfo = signal.category;

              return (
                <div
                  key={signal._id}
                  ref={index === signals.length - 1 ? lastSignalRef : null}
                  className={`card rounded-2xl border overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colors.glow} border-gray-200 dark:border-gray-700`}
                >

                  <div
                    className={`flex items-center justify-between px-5 py-3 ${colors.bg} border-b ${colors.border}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 ${colors.badge}`}
                      >
                        {signal.action === "BUY" ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        {signal.action}
                      </span>
                      <span className="text-base font-bold text-gray-900 dark:text-white">
                        {signal.ticker}
                      </span>
                    </div>
                    {categoryInfo?.name && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {CATEGORY_ICONS[categoryInfo.name]}{" "}
                        {categoryInfo.name}
                      </span>
                    )}
                  </div>

                  <div className="px-5 py-4">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                          Price
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white font-mono">
                          {signal.price > 0 ? signal.price.toLocaleString() : "—"}
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-3">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-1">
                          Timeframe
                        </p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {signal.timeframe || "—"}
                        </p>
                      </div>
                    </div>

                    {signal.scanner && (
                      <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
                        <BarChart3 className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                          {signal.scanner}
                        </span>
                      </div>
                    )}

                    {signal.message && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                        {signal.message}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2">
                        {educatorInfo?.image ? (
                          <img
                            src={educatorInfo.image}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-orange-500 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {educatorInfo?.first_name || ""}{" "}
                          {educatorInfo?.last_name || ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[11px]">
                          {signal.createdAt
                            ? format(
                              new Date(signal.createdAt),
                              "MMM dd, hh:mm a"
                            )
                            : ""}
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
      </Container>
    </div>
  );
};

export default StrategyAlerts;
